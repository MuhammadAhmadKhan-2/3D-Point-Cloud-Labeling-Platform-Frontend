import { useState, useEffect } from 'react';
import { apiService, User } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = apiService.getCurrentUser();
      const authenticated = apiService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
    userType: string;
  }) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      // If error is due to pending/rejected, show correct message
      throw new Error(response.message);
    } catch (error: any) {
      // Do not set user/isAuthenticated if pending/rejected
      throw error;
    }
  };

  // NOTE: userData must include 'role', not 'userType'.
const register = async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }) => {
    try {
      // Forward 'role' to apiService for backend compatibility
      const response = await apiService.register(userData);
      // Always show pending message, do NOT set user or isAuthenticated
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };
};
