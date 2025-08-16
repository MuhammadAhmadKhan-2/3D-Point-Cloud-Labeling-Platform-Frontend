import axios from 'axios';

interface PresignedUrlResponse {
  success: boolean;
  url: string;
  key: string;
  expiresIn: number;
}

/**
 * Get a presigned URL from the backend
 */
export const getPresignedUrl = async (filename: string, fileType: string): Promise<PresignedUrlResponse> => {
  const response = await axios.post('/api/generate-presigned-url', {
    filename,
    fileType
  });
  return response.data;
};

/**
 * Upload a file directly to S3 using a presigned URL
 */
export const uploadToS3 = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    // Step 1: Get presigned URL from backend
    const { url, key } = await getPresignedUrl(file.name, file.type);
    
    // Step 2: Upload file directly to S3 using the presigned URL
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    // Step 3: Generate and return the public URL for the uploaded file
    const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME || 'mern-s3-uploads';
    const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Upload multiple files to S3 in batches
 */
export const batchUploadToS3 = async (
  files: File[],
  batchSize: number = 10,
  onProgress?: (overallProgress: number) => void,
  onFileComplete?: (fileUrl: string, index: number) => void
): Promise<string[]> => {
  const fileUrls: string[] = [];
  const totalFiles = files.length;
  let completedFiles = 0;
  
  // Process files in batches
  for (let i = 0; i < totalFiles; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    // Upload batch in parallel
    const batchPromises = batch.map(async (file, batchIndex) => {
      const fileIndex = i + batchIndex;
      
      try {
        const fileUrl = await uploadToS3(file, (fileProgress) => {
          // Calculate overall progress
          if (onProgress) {
            const overallProgress = Math.round(
              ((completedFiles * 100) + (batch.length * fileProgress / 100)) / totalFiles
            );
            onProgress(overallProgress);
          }
        });
        
        fileUrls[fileIndex] = fileUrl;
        completedFiles++;
        
        if (onFileComplete) {
          onFileComplete(fileUrl, fileIndex);
        }
        
        return fileUrl;
      } catch (error) {
        console.error(`Error uploading file ${fileIndex}:`, error);
        throw error;
      }
    });
    
    // Wait for current batch to complete before starting next batch
    await Promise.all(batchPromises);
    
    // Update overall progress after batch completes
    if (onProgress) {
      const overallProgress = Math.round((completedFiles * 100) / totalFiles);
      onProgress(overallProgress);
    }
  }
  
  return fileUrls;
};