import React, { useState } from 'react';
import { batchUploadToS3 } from '../utils/s3Upload';
import axios from 'axios';

interface FileUploaderProps {
  onUploadComplete?: (fileUrls: string[]) => void;
  serialNumber?: string;
  batchSize?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  serialNumber,
  batchSize = 10
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{url: string, name: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadedFiles([]);

    try {
      // Upload files directly to S3 in batches
      const fileUrls = await batchUploadToS3(
        files,
        batchSize,
        (overallProgress) => {
          setProgress(overallProgress);
        },
        (fileUrl, index) => {
          setUploadedFiles(prev => [
            ...prev,
            { url: fileUrl, name: files[index].name }
          ]);
        }
      );

      // Save file URLs to MongoDB
      await saveFilesToDatabase(fileUrls);

      if (onUploadComplete) {
        onUploadComplete(fileUrls);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const saveFilesToDatabase = async (fileUrls: string[]) => {
    try {
      // Send only the file URLs to the backend for storage in MongoDB
      const response = await axios.post('/api/serials/save-files', {
        serialNumber,
        fileUrls
      });
      
      return response.data;
    } catch (err) {
      console.error('Error saving files to database:', err);
      throw err;
    }
  };

  return (
    <div className="file-uploader">
      <h2>Upload Files</h2>
      
      <div className="upload-form">
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange} 
          disabled={uploading}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={uploading || files.length === 0}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
      
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}% Complete</div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Files ({uploadedFiles.length}/{files.length})</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                {file.name} - <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;