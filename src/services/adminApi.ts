import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  userType: 'CLIENT' | 'QA_QC_VENDOR' | 'PREPROCESSING_VENDOR';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class AdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async getPendingUsers(): Promise<ApiResponse<{ users: AdminUser[] }>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users/pending`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('getPendingUsers error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllUsers(): Promise<ApiResponse<{ users: AdminUser[] }>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('getAllUsers error:', error.response?.data || error.message);
      throw error;
    }
  }

  async approveUser(userId: string): Promise<ApiResponse<{ user: AdminUser }>> {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/approve`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async rejectUser(userId: string): Promise<ApiResponse> {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/reject`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<{ user: AdminUser }>> {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, userData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async updateUserStatus(userId: string, status: string): Promise<ApiResponse<{ user: AdminUser }>> {
    const response = await axios.patch(`${API_BASE_URL}/admin/users/${userId}/status`, { status }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}

export const adminApiService = new AdminApiService();
