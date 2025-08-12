// Enterprise-grade data loading utilities for point cloud and image data
import { serialDataService, type BackendSerial } from '../services/serialDataService';

export interface PointCloudData {
  vertices: Float32Array
  colors?: Float32Array
  normals?: Float32Array
  pointCount: number
  company?: string // Add company identifier
}

export interface SerialAssets {
  pointCloudUrl: string
  images: {
    front: string;
    back: string;
    "front-right": string;
    "front-left": string;
    "back-right": string;
    "back-left": string;
  };
  exists: boolean;
  company: string; // Add company identifier
}

/**
 * Generate file paths for point cloud and image data from backend serial data
 */
export const getSerialAssets = async (
  stage: "preprocessing" | "refinement",
  serialNumber: string,
  company?: string,
  frameNumber: number = 1,
): Promise<SerialAssets> => {
  try {
    // Fetch serials from backend
    const serials = await serialDataService.fetchSerials();
    const serial = serials.find(s => s.serialNumber === serialNumber);
    
    if (!serial) {
      throw new Error(`Serial ${serialNumber} not found`);
    }

    // Use the service to get assets for the specified company/stage and frame
    return serialDataService.getSerialAssets(serial, stage, frameNumber);
  } catch (error) {
    console.error(`Error getting serial assets for ${serialNumber}:`, error);
    // Return empty assets as fallback
    return {
      pointCloudUrl: '',
      images: {
        front: '',
        back: '',
        "front-right": '',
        "front-left": '',
        "back-right": '',
        "back-left": '',
      },
      exists: false,
      company: company || 'Unknown',
    };
  }
}

/**
 * Get assets for both companies for comparison view
 */
export const getDualCompanyAssets = async (
  serialNumber: string,
  frameNumber: number = 1,
): Promise<{
  originalSource: SerialAssets
  kr: SerialAssets
}> => {
  try {
    console.log(`[dataLoader.getDualCompanyAssets] Fetching for serial: ${serialNumber}, frame: ${frameNumber}`);
    
    // Fetch serials from backend
    const serials = await serialDataService.fetchSerials();
    const serial = serials.find(s => s.serialNumber === serialNumber);
    
    if (!serial) {
      console.error(`[dataLoader.getDualCompanyAssets] Serial ${serialNumber} not found in backend data`);
      throw new Error(`Serial ${serialNumber} not found`);
    }

    console.log(`[dataLoader.getDualCompanyAssets] Found serial:`, {
      serialNumber: serial.serialNumber,
      framesCount: serial.frames?.length || 0,
      pcdFileA: serial.pcdFileA,
      pcdFileB: serial.pcdFileB
    });

    const dualAssets = serialDataService.getDualCompanyAssets(serial, frameNumber);
    
    console.log(`[dataLoader.getDualCompanyAssets] Result:`, dualAssets);
    
    return dualAssets;
  } catch (error) {
    console.error(`[dataLoader.getDualCompanyAssets] Error getting dual company assets for ${serialNumber}:`, error);
    // Return empty assets as fallback
    const emptyAssets: SerialAssets = {
      pointCloudUrl: '',
      images: {
        front: '',
        back: '',
        "front-right": '',
        "front-left": '',
        "back-right": '',
        "back-left": '',
      },
      exists: false,
      company: 'Unknown',
    };
    
    return {
      originalSource: { ...emptyAssets, company: 'Original Source Factory Corporation' },
      kr: { ...emptyAssets, company: 'Metabread Co., Ltd.' },
    };
  }
}

/**
 * Load PCD point cloud data with company identification
 */
export const loadPointCloudData = async (
  url: string,
  company?: string,
  onProgress?: (progress: number) => void,
): Promise<PointCloudData | null> => {
  try {
    console.log(`Loading point cloud: ${url} (Company: ${company})`)

    if (!url) {
      console.warn(`No point cloud URL provided for company: ${company}`)
      return null
    }

    // Convert S3 URL to backend proxy URL
    let fetchUrl = url;
    let s3Key = '';
    if (url.includes('amazonaws.com') || url.includes('s3.')) {
      // Extract the S3 key from the URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part.includes('s3.') || part.includes('amazonaws.com'));
      if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
        // Get the S3 key - handle both encoded and non-encoded URLs
        s3Key = urlParts.slice(bucketIndex + 2).join('/');
        // Decode if it's already encoded
        try {
          const decoded = decodeURIComponent(s3Key);
          if (decoded !== s3Key) {
            s3Key = decoded;
            console.log(`[loadPointCloudData] S3 key was URL encoded, decoded to: ${s3Key}`);
          }
        } catch (e) {
          console.log(`[loadPointCloudData] S3 key decode failed, using as-is: ${s3Key}`);
        }
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        // Use the authenticated endpoint first
        fetchUrl = `${API_BASE_URL}/files/s3/${s3Key}`;
        console.log(`[loadPointCloudData] Original S3 URL: ${url}`);
        console.log(`[loadPointCloudData] Extracted S3 key: ${s3Key}`);
        console.log(`[loadPointCloudData] Backend proxy URL: ${fetchUrl}`);
      }
    }

    // Add debugging to check if URL is valid
    console.log(`[loadPointCloudData] Attempting to fetch: ${fetchUrl}`);

    // Add authentication headers
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(`[loadPointCloudData] Using auth token: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`[loadPointCloudData] No authentication token found in localStorage`);
    }

    // Helper function to attempt fetch with error handling
    const attemptFetch = async (url: string, options: RequestInit) => {
      try {
        const response = await fetch(url, options);
        
        // Check content type to determine if it's a direct file stream or JSON response
        const contentType = response.headers.get('Content-Type');
        console.log(`[loadPointCloudData] Response Content-Type: ${contentType}`);
        
        if (response.ok) {
          // If content type is not JSON, it's likely a direct file stream
          if (contentType && !contentType.includes('application/json')) {
            console.log('[loadPointCloudData] Received direct file stream from backend');
            return { success: true, response, isDirectStream: true };
          }
          return { success: true, response };
        }
        
        let errorDetails = '';
        let signedUrlData = null;
        
        // Only try to parse as JSON if the content type is JSON
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorDetails = errorData.message || errorData.error || 'Unknown error';
            
            // Check if backend returned a signed URL as fallback
            if (errorData.signedUrl && errorData.success) {
              console.log('[loadPointCloudData] Backend provided signed URL fallback');
              signedUrlData = errorData;
            }
          } catch (parseError) {
            console.error('[loadPointCloudData] Failed to parse JSON response:', parseError);
            errorDetails = `HTTP ${response.status}`;
          }
        } else {
          errorDetails = `HTTP ${response.status}`;
        }
        
        return { 
          success: false, 
          response, 
          errorDetails,
          status: response.status,
          signedUrlData
        };
      } catch (networkError) {
        console.error(`[loadPointCloudData] Network error:`, networkError);
        return { 
          success: false, 
          response: null, 
          errorDetails: 'Network error',
          status: 0 
        };
      }
    };
    
    // Helper function to fetch using signed URL
    const fetchWithSignedUrl = async (key: string): Promise<Response> => {
      console.log(`[loadPointCloudData] Requesting signed URL for key: ${key}`);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const signedUrlEndpoint = `${API_BASE_URL}/files/s3-signed/${key}`;
      
      const signedUrlResponse = await fetch(signedUrlEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });
      
      if (!signedUrlResponse.ok) {
        throw new Error(`Failed to get signed URL: ${signedUrlResponse.status}`);
      }
      
      const signedUrlData = await signedUrlResponse.json();
      if (!signedUrlData.success || !signedUrlData.signedUrl) {
        throw new Error('Invalid signed URL response');
      }
      
      console.log(`[loadPointCloudData] Using signed URL, expires in ${signedUrlData.expiresIn}s`);
      
      // Fetch directly from S3 using signed URL
      return fetch(signedUrlData.signedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
    };

    // Try authenticated endpoint first
    let result = await attemptFetch(fetchUrl, { 
      headers,
      method: 'GET',
      credentials: 'include'
    });
    
    // If authentication failed and we have an S3 key, try public endpoint
    if (!result.success && (result.status === 401 || result.status === 403) && s3Key) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const publicUrl = `${API_BASE_URL}/files/public/s3/${s3Key}`;
      console.log(`[loadPointCloudData] Auth failed, trying public endpoint: ${publicUrl}`);
      
      result = await attemptFetch(publicUrl, { 
        method: 'GET',
        credentials: 'include'
      });
    }
    
    let response: Response;
    
    if (!result.success) {
      // Check if we have a signed URL fallback or if the response is already the file content
    if (result.response && result.isDirectStream) {
      // The backend is already streaming the file content directly
      console.log(`[loadPointCloudData] Backend is streaming file content directly`);
      response = result.response;
      console.log(`[loadPointCloudData] Successfully received streamed content`);
    } else if (result.signedUrlData && s3Key) {
      console.log(`[loadPointCloudData] Using signed URL fallback`);
      try {
        response = await fetch(result.signedUrlData.signedUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/octet-stream'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Signed URL fetch failed: ${response.status}`);
        }
        
        console.log(`[loadPointCloudData] Successfully fetched using signed URL`);
      } catch (signedUrlError) {
        console.error(`[loadPointCloudData] Signed URL fallback failed:`, signedUrlError);
        
        // Try requesting a new signed URL as last resort
        try {
          response = await fetchWithSignedUrl(s3Key);
          if (!response.ok) {
            throw new Error(`New signed URL fetch failed: ${response.status}`);
          }
          console.log(`[loadPointCloudData] Successfully fetched using new signed URL`);
        } catch (newSignedUrlError) {
          console.error(`[loadPointCloudData] New signed URL request failed:`, newSignedUrlError);
          return null;
        }
      }
      } else {
        // No signed URL fallback available, log errors and return null
        if (result.status === 401) {
          console.error(`[loadPointCloudData] Authentication failed - invalid or missing token`);
          console.error(`[loadPointCloudData] Error details: ${result.errorDetails}`);
        } else if (result.status === 403) {
          console.error(`[loadPointCloudData] Access forbidden - this could be:`);
          console.error(`[loadPointCloudData] 1. User account not approved`);
          console.error(`[loadPointCloudData] 2. S3 access denied (AWS credentials/permissions)`);
          console.error(`[loadPointCloudData] 3. File permissions issue`);
          console.error(`[loadPointCloudData] Error details: ${result.errorDetails}`);
          // Attempt to request a fresh signed URL as a fallback
          if (s3Key) {
            console.log(`[loadPointCloudData] Attempting fresh signed URL fallback after 403`);
            try {
              response = await fetchWithSignedUrl(s3Key);
              if (!response.ok) {
                throw new Error(`Fresh signed URL fetch failed: ${response.status}`);
              }
              console.log(`[loadPointCloudData] Successfully fetched using fresh signed URL`);
            } catch (freshErr) {
              console.error(`[loadPointCloudData] Fresh signed URL attempt failed:`, freshErr);
              // Give up only after this fails
              console.warn(`Point cloud file request failed: ${fetchUrl} (Status: ${result.status})`);
              return null;
            }
          }
        } else if (result.status === 404) {
          console.error(`[loadPointCloudData] File not found in S3`);
          console.error(`[loadPointCloudData] Error details: ${result.errorDetails}`);
        } else {
          console.error(`[loadPointCloudData] HTTP ${result.status} error: ${result.errorDetails}`);
        }
        
        if (!response) {
          console.warn(`Point cloud file request failed: ${fetchUrl} (Status: ${result.status})`);
          return null;
        }
      }
    } else {
      response = result.response!;
    }

    console.log(`[loadPointCloudData] Successfully fetched ${url}, parsing data...`);

    const contentLength = response.headers.get("content-length")
    const totalSize = contentLength ? Number.parseInt(contentLength) : 0

    if (totalSize > 100 * 1024 * 1024) {
      // 100MB threshold
      console.warn(
        `Large file detected (${(totalSize / 1024 / 1024).toFixed(1)}MB). Consider using a smaller file or streaming.`,
      )

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn("Large file loading timeout - falling back to generated data")
          resolve(null)
        }, 30000)
      })

      const loadPromise = response.text().then((text) => {
        console.log(`[loadPointCloudData] Large PCD file content length: ${text.length} characters`);
        console.log(`[loadPointCloudData] First 500 characters of large PCD file:`, text.substring(0, 500));
        const data = parsePCDData(text)
        console.log(`[loadPointCloudData] Parsed large file for ${company}: ${data.pointCount} points`);
        return { ...data, company }
      })

      const result = await Promise.race([loadPromise, timeoutPromise])
      return result
    }

    const text = await response.text()
    console.log(`[loadPointCloudData] PCD file content length: ${text.length} characters`);
    console.log(`[loadPointCloudData] First 500 characters of PCD file:`, text.substring(0, 500));
    const data = parsePCDData(text)
    console.log(`[loadPointCloudData] Successfully parsed ${company}: ${data.pointCount} points`);
    return { ...data, company }
  } catch (error) {
    console.error(`Failed to load point cloud: ${url}`, error)
    return null
  }
}

/**
 * Load point cloud data from both companies for comparison
 */
export const loadDualCompanyPointClouds = async (
  serialNumber: string,
  frameNumber: number = 1,
  onProgress?: (company: string, progress: number) => void,
): Promise<{
  originalSource: PointCloudData | null
  kr: PointCloudData | null
}> => {
  console.log(`[loadDualCompanyPointClouds] Starting load for serial: ${serialNumber}, frame: ${frameNumber}`);
  
  const assets = await getDualCompanyAssets(serialNumber, frameNumber)

  console.log(`[loadDualCompanyPointClouds] Assets received:`, {
    originalSourceUrl: assets.originalSource.pointCloudUrl,
    krUrl: assets.kr.pointCloudUrl,
    originalSourceExists: assets.originalSource.exists,
    krExists: assets.kr.exists
  });

  const [originalSourceData, krData] = await Promise.all([
    loadPointCloudData(assets.originalSource.pointCloudUrl, "Original Source Factory Corporation", (progress) =>
      onProgress?.("Original Source Factory Corporation", progress),
    ),
    loadPointCloudData(assets.kr.pointCloudUrl, "Metabread Co., Ltd.", (progress) => onProgress?.("Metabread Co., Ltd.", progress)),
  ])

  console.log(`[loadDualCompanyPointClouds] Load results:`, {
    originalSourceData: originalSourceData ? `${originalSourceData.pointCount} points` : 'null',
    krData: krData ? `${krData.pointCount} points` : 'null'
  });

  return {
    originalSource: originalSourceData,
    kr: krData,
  }
}

const parsePCDData = (pcdText: string): PointCloudData => {
  const lines = pcdText.split("\n")
  let vertexCount = 0
  let headerEnd = 0
  let hasColors = false
  let hasNormals = false
  let fields: string[] = []

  // Parse PCD header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("POINTS")) {
      vertexCount = Number.parseInt(line.split(" ")[1])
    } else if (line.startsWith("FIELDS")) {
      fields = line.split(" ").slice(1)
      hasColors = fields.includes("rgb") || (fields.includes("r") && fields.includes("g") && fields.includes("b"))
      hasNormals = fields.includes("normal_x") || fields.includes("nx")
    } else if (line.startsWith("DATA")) {
      headerEnd = i + 1
      break
    }
  }

  // Parse vertex data
  const vertices = new Float32Array(vertexCount * 3)
  const colors = hasColors ? new Float32Array(vertexCount * 3) : undefined
  const normals = hasNormals ? new Float32Array(vertexCount * 3) : undefined

  for (let i = 0; i < vertexCount; i++) {
    const line = lines[headerEnd + i]
    if (!line) continue

    const values = line.trim().split(/\s+/).map(Number)

    // Position (x, y, z) - typically first 3 values
    vertices[i * 3] = values[0]
    vertices[i * 3 + 1] = values[1]
    vertices[i * 3 + 2] = values[2]

    // Colors (if available) - handle both RGB and separate r,g,b fields
    if (colors && values.length >= 6) {
      if (fields.includes("rgb")) {
        // Handle packed RGB format
        const rgb = values[3]
        colors[i * 3] = ((rgb >> 16) & 0xFF) / 255 // R
        colors[i * 3 + 1] = ((rgb >> 8) & 0xFF) / 255 // G
        colors[i * 3 + 2] = (rgb & 0xFF) / 255 // B
      } else {
        // Handle separate r,g,b fields
        colors[i * 3] = values[3] / 255 // R
        colors[i * 3 + 1] = values[4] / 255 // G
        colors[i * 3 + 2] = values[5] / 255 // B
      }
    }

    // Normals (if available)
    if (normals && values.length >= 9) {
      const normalOffset = hasColors ? 6 : 3
      normals[i * 3] = values[normalOffset]
      normals[i * 3 + 1] = values[normalOffset + 1]
      normals[i * 3 + 2] = values[normalOffset + 2]
    }
  }

  return {
    vertices,
    colors,
    normals,
    pointCount: vertexCount,
  }
}

export const checkImageExists = async (url: string): Promise<boolean> => {
  return await serialDataService.checkImageExists(url);
}

export const checkFileSize = async (url: string): Promise<{ exists: boolean; size: number; sizeMB: string }> => {
  return await serialDataService.checkFileSize(url);
}

export const preloadSerialAssets = async (
  stage: "preprocessing" | "refinement",
  serialNumber: string,
  company?: string,
): Promise<void> => {
  const assets = await getSerialAssets(stage, serialNumber, company)

  // Preload all 6 images
  Object.values(assets.images).forEach((url) => {
    if (url) { // Only preload if URL exists
      const img = new Image();
      img.src = url;
    }
  });
}

export const validateDataIntegrity = async (
  stage: "preprocessing" | "refinement",
  serialNumbers: string[],
): Promise<{
  pointCloudFiles: number
  imageFiles: number
  missingFiles: string[]
}> => {
  const missingFiles: string[] = []
  let pointCloudFiles = 0
  let imageFiles = 0

  for (const serialNumber of serialNumbers) {
    const assets = await getSerialAssets(stage, serialNumber)

    // Check point cloud file
    if (assets.pointCloudUrl) {
      try {
        const pcResponse = await fetch(assets.pointCloudUrl, { method: "HEAD" })
        if (pcResponse.ok) {
          pointCloudFiles++
        } else {
          missingFiles.push(assets.pointCloudUrl)
        }
      } catch {
        missingFiles.push(assets.pointCloudUrl)
      }
    } else {
      missingFiles.push(`Point cloud file for ${serialNumber}`)
    }

    // Check all 6 image files
    for (const [key, url] of Object.entries(assets.images)) {
      if (url) {
        try {
          const imgResponse = await fetch(url, { method: "HEAD" });
          if (imgResponse.ok) {
            imageFiles++;
          } else {
            missingFiles.push(url);
          }
        } catch {
          missingFiles.push(url);
        }
      } else {
        missingFiles.push(`${key} image for ${serialNumber}`)
      }
    }
  }

  return {
    pointCloudFiles,
    imageFiles,
    missingFiles,
  }
}

export const generateFrameData = (serialNumber: string) => {
  return serialDataService.generateFrameData(serialNumber);
}
