const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'CLIENT' | 'QA_QC_VENDOR' | 'PREPROCESSING_VENDOR';
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Fixed register method - only store token/user for approved users
  async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    const result = await this.handleResponse<AuthResponse>(response);
    
    // Only store token and user if registration is successful AND user is approved
    // For pending registrations, don't store anything in localStorage
    if (result.success && result.data?.token && result.data?.user?.status === 'ACTIVE') {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  }

  async login(credentials: {
    email: string;
    password: string;
    userType: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });

    const result = await this.handleResponse<AuthResponse>(response);
    
    // Only store token and user if login is successful and user is approved
    if (result.success && result.data?.token && result.data?.user?.status === 'ACTIVE') {
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email })
    });

    return this.handleResponse(response);
  }

  async resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    const result = await this.handleResponse(response);
    
    if (result.success) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    
    return result;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ user: User }>(response);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = this.getCurrentUser();
    
    // User is authenticated only if they have a token AND their status is ACTIVE
    return !!(token && user && user.status === 'ACTIVE');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      // Only return user if their status is ACTIVE
      return user.status === 'ACTIVE' ? user : null;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();
