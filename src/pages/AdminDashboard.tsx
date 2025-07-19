import React, { useState } from 'react';
import { UserProvider, useUserContext, User } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Settings, 
  BarChart3, 
  Shield,
  Menu,
  LogOut,
  User as LucideUser,
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  X,
  Check,
  AlertCircle,
  Bell
} from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
}

const AdminDashboardContent: React.FC = () => {
  const { users, pendingUsers, approveUser, rejectUser, loading } = useUserContext();
  // Fallback in case pendingUsers is empty but we have users with PENDING status
  const effectivePendingUsers = pendingUsers && pendingUsers.length > 0
    ? pendingUsers
    : users.filter((u) => u.status === 'PENDING');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    userType: 'CLIENT',
    status: 'ACTIVE',
    company: '',
    phone: '',
    department: '',
    notes: ''
  });

  // Remove all local fetchUsers, setUsers, setStats, and related logic

  // Remove local handleDeleteUser, handleCreateUser, handleUpdateUser, openEditModal, resetUserForm if not using context

  const handleLogout = async () => {
    try {
      await fetch('https://3-d-point-cloud-labeling-platform-b.vercel.app/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/admin');
    } catch (error) {
      navigate('/admin');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // In the Users Table, use users from context and filter by search/filterType/filterStatus
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || user.userType === filterType;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getUserTypeLabel = (type: string) => {
    const labels = {
      'CLIENT': 'Client',
      'QA_QC_VENDOR': 'QA/QC Vendor',
      'PREPROCESSING_VENDOR': 'Preprocessing Vendor'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'text-green-400 bg-green-400/20',
      'INACTIVE': 'text-gray-400 bg-gray-400/20',
      'PENDING': 'text-yellow-400 bg-yellow-400/20',
      'SUSPENDED': 'text-red-400 bg-red-400/20'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-400/20';
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'profile', label: 'Profile Settings', icon: LucideUser },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 via-transparent to-teal-600/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? <Check className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
            {notification.message}
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 backdrop-blur-xl bg-gray-800/80 border-r border-blue-500/20`}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
              {sidebarOpen && <span className="text-xl font-bold text-white">Admin Panel</span>}
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                        : 'text-gray-300 hover:bg-blue-500/20 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="backdrop-blur-xl bg-gray-800/60 border-b border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-blue-500/20 rounded-lg transition-all"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'profile' && 'Profile Settings'}
                  {activeTab === 'settings' && 'System Settings'}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-300 hover:text-white hover:bg-blue-500/20 rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                    <LucideUser className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">Admin Name</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-white">{users.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Users</p>
                        <p className="text-3xl font-bold text-white">{users.filter(u => u.status === 'ACTIVE').length}</p>
                      </div>
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Pending Users</p>
                        <p className="text-3xl font-bold text-white">{effectivePendingUsers.length}</p>
                      </div>
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Suspended</p>
                        <p className="text-3xl font-bold text-white">{users.filter(u => u.status === 'SUSPENDED').length}</p>
                      </div>
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <UserPlus className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">System initialized successfully</span>
                      <span className="text-gray-500 text-sm ml-auto">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Pending User Requests in User Management Table */}
                <div className="backdrop-blur-xl bg-yellow-900/40 border border-yellow-500/30 rounded-2xl overflow-hidden mb-6">
                  <div className="p-4 border-b border-yellow-500/20 flex items-center justify-between">
                    <span className="text-yellow-300 font-semibold text-lg">Pending User Requests</span>
                    {loading && <span className="text-yellow-200 text-sm ml-2">Loading...</span>}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-yellow-900/30">
                        <tr>
                          <th className="text-left p-3 text-yellow-200 font-semibold">Name</th>
                          <th className="text-left p-3 text-yellow-200 font-semibold">Email</th>
                          <th className="text-left p-3 text-yellow-200 font-semibold">Type</th>
                          <th className="text-left p-3 text-yellow-200 font-semibold">Requested</th>
                          <th className="text-left p-3 text-yellow-200 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {effectivePendingUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-yellow-100 text-center">No pending user requests</td>
                          </tr>
                        ) : (
                          effectivePendingUsers.map((user) => (
                            <tr key={user._id} className="border-t border-yellow-500/10 hover:bg-yellow-900/10">
                              <td className="p-3 text-yellow-100">{user.name}</td>
                              <td className="p-3 text-yellow-100">{user.email}</td>
                              <td className="p-3 text-yellow-100">{getUserTypeLabel(user.userType)}</td>
                              <td className="p-3 text-yellow-100">{new Date(user.createdAt).toLocaleDateString()}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => approveUser(user._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg mr-2 hover:bg-green-700 transition-all"
                                  disabled={loading}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectUser(user._id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                  disabled={loading}
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="CLIENT">Client</option>
                      <option value="QA_QC_VENDOR">QA/QC Vendor</option>
                      <option value="PREPROCESSING_VENDOR">Preprocessing Vendor</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 bg-gray-800/60 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                </div>

                {/* Users Table */}
                <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="text-left p-4 text-gray-300 font-semibold">Name</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Email</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Type</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Created</th>
                          <th className="text-left p-4 text-gray-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                            <td className="p-4 text-white">{user.name}</td>
                            <td className="p-4 text-gray-300">{user.email}</td>
                            <td className="p-4 text-gray-300">{getUserTypeLabel(user.userType)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowUserDetails(user)}
                                  className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setEditingUser(user); setUserForm({
                                    name: user.name,
                                    email: user.email,
                                    userType: user.userType,
                                    status: user.status,
                                    company: user.company || '',
                                    phone: user.phone || '',
                                    department: user.department || '',
                                    notes: user.notes || ''
                                  }); setShowEditUserModal(true); }}
                                  className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { if (confirm('Are you sure you want to delete this user?')) rejectUser(user._id); }}
                                  className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="text-white text-center p-8 bg-gray-800/60 rounded-2xl border border-blue-500/20">
                  <h3 className="text-xl font-bold mb-4">Profile Settings</h3>
                  <p>This is a demo. Profile editing is disabled.</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">System Settings</h3>
                <p className="text-gray-300">System settings panel coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-gray-800/90 border border-blue-500/20 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button
                onClick={() => { setShowAddUserModal(false); setUserForm({ name: '', email: '', userType: 'CLIENT', status: 'ACTIVE', company: '', phone: '', department: '', notes: '' }); }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (userForm.name && userForm.email) { setShowAddUserModal(false); setUserForm({ name: '', email: '', userType: 'CLIENT', status: 'ACTIVE', company: '', phone: '', department: '', notes: '' }); showNotification('success', 'User created successfully'); } else { showNotification('error', 'Please fill in all required fields.'); } }} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">User Type *</label>
                <select
                  value={userForm.userType}
                  onChange={(e) => setUserForm({ ...userForm, userType: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CLIENT">Client</option>
                  <option value="QA_QC_VENDOR">QA/QC Vendor</option>
                  <option value="PREPROCESSING_VENDOR">Preprocessing Vendor</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(false); setUserForm({ name: '', email: '', userType: 'CLIENT', status: 'ACTIVE', company: '', phone: '', department: '', notes: '' }); }}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-gray-800/90 border border-blue-500/20 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button
                onClick={() => { setShowEditUserModal(false); setEditingUser(null); setUserForm({ name: '', email: '', userType: 'CLIENT', status: 'ACTIVE', company: '', phone: '', department: '', notes: '' }); }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (userForm.name && userForm.email) { setShowEditUserModal(false); setEditingUser(null); setUserForm({ name: '', email: '', userType: 'CLIENT', status: 'ACTIVE', company: '', phone: '', department: '', notes: '' }); showNotification('success', 'User updated successfully'); } else { showNotification('error', 'Please fill in all required fields.'); } }} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">User Type *</label>
                <select
                  value={userForm.userType}
                  onChange={(e) => setUserForm({ ...userForm, userType: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CLIENT">Client</option>
                  <option value="QA_QC_VENDOR">QA/QC Vendor</option>
                  <option value="PREPROCESSING_VENDOR">Preprocessing Vendor</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Status</label>
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={userForm.company}
                  onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Notes</label>
                <textarea
                  value={userForm.notes}
                  onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditUserModal(false); setEditingUser(null); setUserForm({ name: '', email: '', userType: 'CLIENT', status: 'ACTIVE', company: '', phone: '', department: '', notes: '' }); }}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-gray-800/90 border border-blue-500/20 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserDetails(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <p className="text-white">{showUserDetails.name}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white">{showUserDetails.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">User Type</label>
                <p className="text-white">{getUserTypeLabel(showUserDetails.userType)}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showUserDetails.status)}`}>
                  {showUserDetails.status}
                </span>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Created</label>
                <p className="text-white">{new Date(showUserDetails.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Last Updated</label>
                <p className="text-white">{new Date(showUserDetails.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowUserDetails(null)}
              className="w-full mt-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => (
  <UserProvider>
    <AdminDashboardContent />
  </UserProvider>
);

export default AdminDashboard;
