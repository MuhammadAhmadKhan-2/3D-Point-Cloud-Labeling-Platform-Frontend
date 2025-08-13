// Utility functions for handling image URLs with proper encoding

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const S3_BUCKET_NAME = 'mern-s3-uploads';
const S3_REGION = 'ap-northeast-2';

/**
 * Get properly encoded URL for an S3 image key
 * This function fetches a properly encoded URL from the backend to handle spaces and special characters
 */
export const getEncodedImageUrl = async (key: string): Promise<string> => {
  try {
    // Get authentication token if available
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/files/encode-url`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.encodedUrl;

  } catch (error) {
    console.error(`[getEncodedImageUrl] Error getting encoded URL for key: ${key}`, error);
    
    // Fallback: try to encode the URL directly on the client side
    // This is less reliable than the backend approach but provides a fallback
    try {
      // Check if the URL already follows the S3 format from the database
      if (key.includes('s3.ap-northeast-2.amazonaws.com/mern-s3-uploads/')) {
        // URL is already in the expected format, just encode any spaces in the path
        const urlParts = key.split('/');
        const bucketIndex = urlParts.findIndex(part => part.includes('s3.') || part.includes('amazonaws.com'));
        
        if (bucketIndex !== -1 && bucketIndex + 2 < urlParts.length) {
          // Extract the path after the bucket name
          const pathParts = urlParts.slice(bucketIndex + 2);
          // Encode each part individually to handle spaces properly
          const encodedPathParts = pathParts.map(part => encodeURIComponent(part));
          // Reconstruct the URL
          const fallbackUrl = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${encodedPathParts.join('/')}`;
          
          console.warn(`[getEncodedImageUrl] Using fallback URL encoding for S3 URL: ${fallbackUrl}`);
          return fallbackUrl;
        }
      }
      
      // Default fallback for other URL formats
      const encodedKey = key
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/');
      const fallbackUrl = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${encodedKey}`;

      console.warn(`[getEncodedImageUrl] Using fallback URL encoding: ${fallbackUrl}`);
      return fallbackUrl;
    } catch (fallbackError) {
      console.error(`[getEncodedImageUrl] Fallback encoding failed:`, fallbackError);
      throw error; // Re-throw the original error
    }
  }
};

/**
 * Process an array of image keys to get encoded URLs for all of them
 */
export const getEncodedImageUrls = async (keys: string[]): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  
  // Process keys in parallel with Promise.all
  await Promise.all(
    keys.map(async (key) => {
      try {
        result[key] = await getEncodedImageUrl(key);
      } catch (error) {
        console.error(`[getEncodedImageUrls] Failed to encode key: ${key}`, error);
        // Set empty string for failed URLs
        result[key] = '';
      }
    })
  );
  
  return result;
};