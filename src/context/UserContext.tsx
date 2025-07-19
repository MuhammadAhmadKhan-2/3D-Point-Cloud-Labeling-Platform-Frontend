import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApiService } from '../services/adminApi';

export interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'CLIENT' | 'QA_QC_VENDOR' | 'PREPROCESSING_VENDOR';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  company?: string;
  phone?: string;
  department?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  users: User[];
  pendingUsers: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  fetchPendingUsers: () => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Map backend status to frontend status enum
  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDING';
      case 'approved': return 'ACTIVE';
      case 'rejected': return 'INACTIVE'; // or 'SUSPENDED' if you prefer
      default: return status.toUpperCase();
    }
  };

  // Add helper function
  function mapRoleToUserType(role: string) {
    switch (role) {
      case 'client': return 'CLIENT';
      case 'qa-qc-vendor': return 'QA_QC_VENDOR';
      case 'preprocessing-vendor': return 'PREPROCESSING_VENDOR';
      default: return role.toUpperCase();
    }
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApiService.getAllUsers();
      if (res && res.success && res.data && Array.isArray(res.data.users)) {
        const mappedUsers = res.data.users.map((user: any) => ({
          ...user,
          _id: user._id || user.id,
          userType: mapRoleToUserType(user.role),
          status: normalizeStatus(user.status)
        }));
        setUsers(mappedUsers);
        // Derive pending users from the overall user list as a fallback in case the dedicated
        // pending endpoint fails or is not available.
        setPendingUsers(mappedUsers.filter((u: User) => u.status === 'PENDING'));
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching pending users...');
      const res = await adminApiService.getPendingUsers();
      console.log('Pending users response:', res);
      if (res && res.success && res.data && Array.isArray(res.data.users)) {
        const mappedUsers = res.data.users.map((user: any) => ({
          ...user,
          _id: user._id || user.id,
          userType: mapRoleToUserType(user.role),
          status: normalizeStatus(user.status)
        }));
        console.log('Mapped pending users:', mappedUsers);
        setPendingUsers(mappedUsers);
      } else {
        console.log('No pending users found or invalid response format');
        setPendingUsers([]);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    await adminApiService.approveUser(userId);
    await fetchPendingUsers();
    await fetchUsers();
  };

  const rejectUser = async (userId: string) => {
    await adminApiService.rejectUser(userId);
    await fetchPendingUsers();
    await fetchUsers();
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
      await fetchPendingUsers();
      // If the pending users list is still empty, derive it from the full user list
      setPendingUsers((prev) => {
        if (prev.length === 0 && users.length > 0) {
          return users.filter((u) => u.status === 'PENDING');
        }
        return prev;
      });
    };
    init();
  }, []);

  return (
    <UserContext.Provider value={{ users, pendingUsers, loading, fetchUsers, fetchPendingUsers, approveUser, rejectUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
