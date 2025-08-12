// Service for fetching serial data from backend API (AWS S3 URLs)
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface BackendSerial {
  _id: string;
  serialNumber: string;
  pcdFileA: string; // S3 URL for preprocessing company
  pcdFileB: string; // S3 URL for refinement company
  frames: BackendFrame[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendFrame {
  frameNumber: number;
  images: {
    front?: string;
    back?: string;
    'front-left'?: string;
    'front-right'?: string;
    'back-left'?: string;
    'back-right'?: string;
  };
  // Added these properties based on how they're used in getSerialAssets
  frontImage?: string;
  backImage?: string;
  frontLeftImage?: string;
  frontRightImage?: string;
  backLeftImage?: string;
  backRightImage?: string;
}

export interface SerialAssets {
  pointCloudUrl: string;
  images: {
    front: string;
    back: string;
    'front-right': string;
    'front-left': string;
    'back-right': string;
    'back-left': string;
  };
  exists: boolean;
  company: string;
}

class SerialDataService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Fetch all serials from backend
   */
  async fetchSerials(): Promise<BackendSerial[]> {
    try {
      console.log('[fetchSerials] Fetching serials from backend...');
      const response = await axios.get(`${API_BASE_URL}/serials`, {
        headers: this.getAuthHeaders(),
      });
      
      const serials = response.data.data.serials;
      console.log('[fetchSerials] Backend response:', {
        totalSerials: serials.length,
        firstSerial: serials[0] ? {
          serialNumber: serials[0].serialNumber,
          hasFrames: !!serials[0].frames,
          framesLength: serials[0].frames?.length || 0,
          hasPcdFileA: !!serials[0].pcdFileA,
          hasPcdFileB: !!serials[0].pcdFileB,
          pcdFileA: serials[0].pcdFileA,
          pcdFileB: serials[0].pcdFileB,
          keys: Object.keys(serials[0])
        } : null
      });
      
      return serials;
    } catch (error) {
      console.error('Error fetching serials:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific serial by ID
   */
  async fetchSerialById(serialId: string): Promise<BackendSerial> {
    try {
      const response = await axios.get(`${API_BASE_URL}/serials/${serialId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching serial:', error);
      throw error;
    }
  }

  /**
   * Get assets for a specific serial, stage, and frame
   */
  getSerialAssets(
    serial: BackendSerial,
    stage: "preprocessing" | "refinement",
    frameNumber: number = 1
  ): SerialAssets {
    // Determine company based on stage
    const company = stage === "preprocessing" ? "Original Source Factory Corporation" : "Metabread Co., Ltd.";
    
    // Get the correct point cloud file based on stage
    const pointCloudUrl = stage === "preprocessing" ? serial.pcdFileA : serial.pcdFileB;
    
    // Get frame data (frameNumber is 1-based, but array is 0-based)
    const frameIndex = Math.max(0, Math.min(frameNumber - 1, serial.frames.length - 1));
    const frame = serial.frames[frameIndex];
    
    if (!frame) {
      console.warn(`Frame ${frameNumber} not found for serial ${serial.serialNumber}`);
      return {
        pointCloudUrl: pointCloudUrl || '',
        images: {
          front: '',
          back: '',
          "front-right": '',
          "front-left": '',
          "back-right": '',
          "back-left": '',
        },
        exists: false,
        company,
      };
    }

    return {
      pointCloudUrl: pointCloudUrl || '',
      images: {
        front: frame.frontImage || frame.images?.front || '',
        back: frame.backImage || frame.images?.back || '',
        "front-right": frame.frontRightImage || frame.images?.['front-right'] || '',
        "front-left": frame.frontLeftImage || frame.images?.['front-left'] || '',
        "back-right": frame.backRightImage || frame.images?.['back-right'] || '',
        "back-left": frame.backLeftImage || frame.images?.['back-left'] || '',
      },
      exists: true,
      company,
    };
  }
  
  /**
   * Get assets for both companies for comparison view
   */
  getDualCompanyAssets(
    serial: BackendSerial,
    frameNumber: number = 1
  ): {
    originalSource: SerialAssets;
    kr: SerialAssets;
  } {
    // Debug logging to understand the actual data structure
    console.log(`[getDualCompanyAssets] Serial ${serial.serialNumber}:`, {
      framesLength: serial.frames?.length || 0,
      requestedFrame: frameNumber,
      pcdFileA: serial.pcdFileA,
      pcdFileB: serial.pcdFileB,
      pcdFileAType: typeof serial.pcdFileA,
      pcdFileBType: typeof serial.pcdFileB,
      firstFrame: serial.frames?.[0],
      frameAtIndex0: serial.frames?.[0]?.frameNumber,
      frameAtIndex1: serial.frames?.[1]?.frameNumber,
      allFrameNumbers: serial.frames?.map(f => f.frameNumber).slice(0, 5) // Show first 5 frame numbers
    });

    const emptyImages = {
      front: '',
      back: '',
      "front-right": '',
      "front-left": '',
      "back-right": '',
      "back-left": '',
    };

    // Extract URL from pcdFileA and pcdFileB if they are objects
    const pcdFileAUrl = typeof serial.pcdFileA === 'object' && serial.pcdFileA !== null 
      ? (serial.pcdFileA as any).url || (serial.pcdFileA as any).path || String(serial.pcdFileA)
      : String(serial.pcdFileA || '');
      
    const pcdFileBUrl = typeof serial.pcdFileB === 'object' && serial.pcdFileB !== null 
      ? (serial.pcdFileB as any).url || (serial.pcdFileB as any).path || String(serial.pcdFileB)
      : String(serial.pcdFileB || '');

    console.log(`[getDualCompanyAssets] Extracted URLs:`, {
      pcdFileAUrl,
      pcdFileBUrl
    });

    // Always return point cloud URLs even if frames don't exist
    const baseResult = {
      originalSource: {
        pointCloudUrl: pcdFileAUrl,
        images: emptyImages,
        exists: !!pcdFileAUrl,
        company: "Original Source Factory Corporation",
      },
      kr: {
        pointCloudUrl: pcdFileBUrl,
        images: emptyImages,
        exists: !!pcdFileBUrl,
        company: "Metabread Co., Ltd.",
      },
    };

    // Check if frames array exists and has data
    if (!serial.frames || serial.frames.length === 0) {
      console.warn(`No frames found for serial ${serial.serialNumber}. Using point cloud files only.`);
      return baseResult;
    }

    // Find frame by frameNumber property instead of array index
    let frame = serial.frames.find(f => f.frameNumber === frameNumber);
    
    // If not found by frameNumber, try to find the first available frame
    if (!frame && serial.frames.length > 0) {
      frame = serial.frames[0]; // Use the first available frame
      console.log(`[getDualCompanyAssets] Frame ${frameNumber} not found, using first available frame: ${frame.frameNumber}`);
    }
    
    if (!frame) {
      console.warn(`Frame ${frameNumber} not found for serial ${serial.serialNumber}. Available frames: ${serial.frames.length}. Using point cloud files only.`);
      return baseResult;
    }

    console.log(`[getDualCompanyAssets] Found frame:`, frame);

    const getImages = (frame: BackendFrame) => ({
      front: frame.frontImage || frame.images?.front || '',
      back: frame.backImage || frame.images?.back || '',
      "front-right": frame.frontRightImage || frame.images?.['front-right'] || '',
      "front-left": frame.frontLeftImage || frame.images?.['front-left'] || '',
      "back-right": frame.backRightImage || frame.images?.['back-right'] || '',
      "back-left": frame.backLeftImage || frame.images?.['back-left'] || '',
    });

    const result = {
      originalSource: {
        pointCloudUrl: pcdFileAUrl,
        images: getImages(frame),
        exists: !!pcdFileAUrl,
        company: "Original Source Factory Corporation",
      },
      kr: {
        pointCloudUrl: pcdFileBUrl,
        images: getImages(frame),
        exists: !!pcdFileBUrl,
        company: "Metabread Co., Ltd.",
      },
    };

    console.log(`[getDualCompanyAssets] Final result:`, result);
    return result;
  }

  /**
   * Get all available serials as options for dropdowns
   */
  async getSerialOptions(): Promise<Array<{ id: string; serialNumber: string; }>> {
    try {
      const serials = await this.fetchSerials();
      return serials.map(serial => ({
        id: serial._id,
        serialNumber: serial.serialNumber,
      }));
    } catch (error) {
      console.error('Error fetching serial options:', error);
      return [];
    }
  }

  /**
   * Generate frame data for a serial (30 frames with status)
   */
  generateFrameData(serialNumber: string) {
    const frames = [];
    for (let i = 1; i <= 30; i++) {
      frames.push({
        id: i,
        timestamp: `${serialNumber}-frame-${i.toString().padStart(3, "0")}`,
        status: i <= 20 ? "labeled" : i <= 25 ? "reviewing" : "pending",
      });
    }
    return frames;
  }

  /**
   * Check if an image URL exists and is accessible
   */
  async checkImageExists(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get file size information for a URL
   */
  async checkFileSize(url: string): Promise<{ exists: boolean; size: number; sizeMB: string }> {
    if (!url) return { exists: false, size: 0, sizeMB: "0" };
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return { exists: false, size: 0, sizeMB: "0" };
      }

      const contentLength = response.headers.get("content-length");
      const size = contentLength ? parseInt(contentLength) : 0;
      const sizeMB = (size / 1024 / 1024).toFixed(1);

      return { exists: true, size, sizeMB };
    } catch {
      return { exists: false, size: 0, sizeMB: "0" };
    }
  }
}

export const serialDataService = new SerialDataService();