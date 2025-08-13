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
  async getFrameImages(serialNumber: string, frameNumber: number): Promise<{
    frame: number;
    images: {
      front: string;
      back: string;
      'front-right': string;
      'front-left': string;
      'back-right': string;
      'back-left': string;
    };
    hasImages: boolean;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/serials/images/${serialNumber}?frame=${frameNumber}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      
      const emptyImages = {
        front: '',
        back: '',
        'front-right': '',
        'front-left': '',
        'back-right': '',
        'back-left': '',
      };
      
      // Check if we have data and images in the response
      if (response.data && response.data.data) {
        return {
          frame: frameNumber,
          images: response.data.data.images || emptyImages,
          hasImages: response.data.data.hasImages || false
        };
      }
      
      return {
        frame: frameNumber,
        images: emptyImages,
        hasImages: false
      };
    } catch (error) {
      console.error(`Error fetching images for frame ${frameNumber}:`, error);
      // Return empty data on API call failure
      return {
        frame: frameNumber,
        images: {
          front: '',
          back: '',
          'front-right': '',
          'front-left': '',
          'back-right': '',
          'back-left': '',
        },
        hasImages: false
      };
    }
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async fetchSerials(): Promise<BackendSerial[]> {
    try {
      console.log('[fetchSerials] Fetching serials...');
      const response = await axios.get(`${API_BASE_URL}/serials`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.serials;
    } catch (error) {
      console.error('Error fetching serials:', error);
      throw error;
    }
  }

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

  async getSerialAssets(
    serial: BackendSerial,
    stage: 'preprocessing' | 'refinement',
    frameNumber = 1
  ): Promise<SerialAssets> {
    const company =
      stage === 'preprocessing'
        ? 'Original Source Factory Corporation'
        : 'Metabread Co., Ltd.';

    const pointCloudUrl =
      stage === 'preprocessing' ? serial.pcdFileA : serial.pcdFileB;

    const frameIndex = Math.max(
      0,
      Math.min(frameNumber - 1, serial.frames.length - 1)
    );
    const frame = serial.frames[frameIndex];

    if (!frame) {
      return {
        pointCloudUrl: pointCloudUrl || '',
        images: {
          front: '',
          back: '',
          'front-right': '',
          'front-left': '',
          'back-right': '',
          'back-left': '',
        },
        exists: false,
        company,
      };
    }

    const getProxyUrl = async (key: string) => {
      if (!key) return '';
      const { getEncodedImageUrl } = await import('../utils/imageUrlUtils');

      if (key.includes('s3.ap-northeast-2.amazonaws.com/mern-s3-uploads/')) {
        return await getEncodedImageUrl(key).catch(() => key);
      }

      if (key.includes('Original Source Factory Corporation') || key.includes(' ')) {
        return await getEncodedImageUrl(key).catch(() => key.replace(/\s+/g, '%20'));
      }

      return `${API_BASE_URL}/files/s3-signed/${encodeURIComponent(key)}`;
    };

    const getImages = async (frame: BackendFrame) => {
      const [front, back, frontRight, frontLeft, backRight, backLeft] =
        await Promise.all([
          getProxyUrl(frame.frontImage || frame.images?.front || ''),
          getProxyUrl(frame.backImage || frame.images?.back || ''),
          getProxyUrl(frame.frontRightImage || frame.images?.['front-right'] || ''),
          getProxyUrl(frame.frontLeftImage || frame.images?.['front-left'] || ''),
          getProxyUrl(frame.backRightImage || frame.images?.['back-right'] || ''),
          getProxyUrl(frame.backLeftImage || frame.images?.['back-left'] || ''),
        ]);

      return {
        front,
        back,
        'front-right': frontRight,
        'front-left': frontLeft,
        'back-right': backRight,
        'back-left': backLeft,
      };
    };

    const images = await getImages(frame);

    return {
      pointCloudUrl: pointCloudUrl || '',
      images,
      exists: true,
      company,
    };
  }

  async getDualCompanyAssets(
    serial: BackendSerial,
    frameNumber = 1
  ): Promise<{ originalSource: SerialAssets; kr: SerialAssets }> {
    const emptyImages = {
      front: '',
      back: '',
      'front-right': '',
      'front-left': '',
      'back-right': '',
      'back-left': '',
    };

    const pcdFileAUrl =
      typeof serial.pcdFileA === 'object' && serial.pcdFileA !== null
        ? (serial.pcdFileA as any).url || (serial.pcdFileA as any).path || String(serial.pcdFileA)
        : String(serial.pcdFileA || '');

    const pcdFileBUrl =
      typeof serial.pcdFileB === 'object' && serial.pcdFileB !== null
        ? (serial.pcdFileB as any).url || (serial.pcdFileB as any).path || String(serial.pcdFileB)
        : String(serial.pcdFileB || '');

    const baseResult = {
      originalSource: {
        pointCloudUrl: pcdFileAUrl,
        images: emptyImages,
        exists: !!pcdFileAUrl,
        company: 'Original Source Factory Corporation',
      },
      kr: {
        pointCloudUrl: pcdFileBUrl,
        images: emptyImages,
        exists: !!pcdFileBUrl,
        company: 'Metabread Co., Ltd.',
      },
    };

    if (!serial.frames || serial.frames.length === 0) {
      return baseResult;
    }

    let frame = serial.frames.find(f => f.frameNumber === frameNumber) || serial.frames[0];
    if (!frame) return baseResult;

    const getProxyUrl = async (key: string) => {
      if (!key) return '';
      const { getEncodedImageUrl } = await import('../utils/imageUrlUtils');

      if (key.includes('s3.ap-northeast-2.amazonaws.com/mern-s3-uploads/')) {
        return await getEncodedImageUrl(key).catch(() => key);
      }

      if (key.includes('Original Source Factory Corporation') || key.includes(' ')) {
        return await getEncodedImageUrl(key).catch(() => key.replace(/\s+/g, '%20'));
      }

      return `${API_BASE_URL}/files/s3-signed/${encodeURIComponent(key)}`;
    };

    const getImages = async (frame: BackendFrame) => {
      const [front, back, frontRight, frontLeft, backRight, backLeft] =
        await Promise.all([
          getProxyUrl(frame.frontImage || frame.images?.front || ''),
          getProxyUrl(frame.backImage || frame.images?.back || ''),
          getProxyUrl(frame.frontRightImage || frame.images?.['front-right'] || ''),
          getProxyUrl(frame.frontLeftImage || frame.images?.['front-left'] || ''),
          getProxyUrl(frame.backRightImage || frame.images?.['back-right'] || ''),
          getProxyUrl(frame.backLeftImage || frame.images?.['back-left'] || ''),
        ]);

      return {
        front,
        back,
        'front-right': frontRight,
        'front-left': frontLeft,
        'back-right': backRight,
        'back-left': backLeft,
      };
    };

    const images = await getImages(frame);

    return {
      originalSource: { ...baseResult.originalSource, images },
      kr: { ...baseResult.kr, images },
    };
  }

  async getSerialOptions(): Promise<Array<{ id: string; serialNumber: string }>> {
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

  generateFrameData(serialNumber: string) {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      timestamp: `${serialNumber}-frame-${(i + 1).toString().padStart(3, '0')}`,
      status: i < 20 ? 'labeled' : i < 25 ? 'reviewing' : 'pending',
    }));
  }

  async checkImageExists(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkFileSize(url: string): Promise<{ exists: boolean; size: number; sizeMB: string }> {
    if (!url) return { exists: false, size: 0, sizeMB: '0' };
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) return { exists: false, size: 0, sizeMB: '0' };

      const size = parseInt(response.headers.get('content-length') || '0', 10);
      return { exists: true, size, sizeMB: (size / 1024 / 1024).toFixed(1) };
    } catch {
      return { exists: false, size: 0, sizeMB: '0' };
    }
  }

  async getFrameImages(serialNumber: string, frameNumber: number): Promise<{
    frame: number;
    images: {
      front: string;
      back: string;
      'front-right': string;
      'front-left': string;
      'back-right': string;
      'back-left': string;
    };
    hasImages: boolean;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/serials/images/${serialNumber}?frame=${frameNumber}`,
        { headers: this.getAuthHeaders() }
      );

      if (response.data.success) {
        return response.data.data;
      }

      // Return empty data if API call fails
      return {
        frame: frameNumber,
        images: {
          front: '',
          back: '',
          'front-right': '',
          'front-left': '',
          'back-right': '',
          'back-left': '',
        },
        hasImages: false
      };
    } catch (error) {
      console.error(`Error fetching images for frame ${frameNumber}:`, error);
      // Return empty data on error
      return {
        frame: frameNumber,
        images: {
          front: '',
          back: '',
          'front-right': '',
          'front-left': '',
          'back-right': '',
          'back-left': '',
        },
        hasImages: false
      };
    }
  }
}

export const serialDataService = new SerialDataService();
