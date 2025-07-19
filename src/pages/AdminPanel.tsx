import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  Search, 
  Filter,
  Bell,
  Settings,
  BarChart3,
  Database,
  Shield,
  Menu,
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'CLIENT' | 'QA_QC_VENDOR' | 'PREPROCESSING_VENDOR';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
}

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  userType: 'CLIENT' | 'QA_QC_VENDOR' | 'PREPROCESSING_VENDOR';
  requestedAt: string;
  company?: string;
  message?: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);
  const [notifications, setNotifications] = useState(3);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  useEffect(() => {
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        userType: 'CLIENT',
        status: 'ACTIVE',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@qaqc.com',
        userType: 'QA_QC_VENDOR',
        status: 'ACTIVE',
        createdAt: '2024-01-10',
        lastLogin: '2024-01-19'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@preprocessing.com',
        userType: 'PREPROCESSING_VENDOR',
        status: 'SUSPENDED',
        createdAt: '2024-01-05',
        lastLogin: '2024-01-18'
      }
    ]);

    setPendingRequests([
      {
        id: '1',
        name: 'Alice Brown',
        email: 'alice@newclient.com',
        userType: 'CLIENT',
        requestedAt: '2024-01-20',
        company: 'New Client Corp',
        message: 'Looking to use your platform for our autonomous vehicle project'
      },
      {
        id: '2',
        name: 'Bob Wilson',
        email: 'bob@qaqc-new.com',
        userType: 'QA_QC_VENDOR',
        requestedAt: '2024-01-19',
        company: 'Quality Assurance Ltd',
        message: 'Experienced QA/QC vendor seeking platform access'
      }
    ]);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const handleApproveRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      // Add to users
      const newUser: User = {
        id: Date.now().toString(),
        name: request.name,
        email: request.email,
        userType: request.userType,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      
      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setNotifications(prev => Math.max(0, prev - 1));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    setNotifications(prev => Math.max(0, prev - 1));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || user.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'CLIENT': return 'Client';
      case 'QA_QC_VENDOR': return 'QA/QC Vendor';
      case 'PREPROCESSING_VENDOR': return 'Preprocessing Vendor';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-400/20';
      case 'INACTIVE': return 'text-gray-400 bg-gray-400/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/20';
      case 'SUSPENDED': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'pending', label: 'Pending Requests', icon: Clock, badge: notifications },
    { id: 'analytics', label: 'Analytics', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
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
                    {sidebarOpen && (
                      <>
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
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
                  {activeTab === 'pending' && 'Pending Requests'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-300 hover:text-white hover:bg-blue-500/20 rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {notifications}
                    </span>
                  )}
                </button>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
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
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Pending Requests</p>
                        <p className="text-3xl font-bold text-white">{pendingRequests.length}</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Suspended</p>
                        <p className="text-3xl font-bold text-white">{users.filter(u => u.status === 'SUSPENDED').length}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <UserPlus className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">New user registration request from Alice Brown</span>
                      <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <Check className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-300">User Jane Smith approved and activated</span>
                      <span className="text-gray-500 text-sm ml-auto">5 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
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
                      <option value="ALL">All Types</option>
                      <option value="CLIENT">Client</option>
                      <option value="QA_QC_VENDOR">QA/QC Vendor</option>
                      <option value="PREPROCESSING_VENDOR">Preprocessing Vendor</option>
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
                          <tr key={user.id} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                            <td className="p-4 text-white">{user.name}</td>
                            <td className="p-4 text-gray-300">{user.email}</td>
                            <td className="p-4 text-gray-300">{getUserTypeLabel(user.userType)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">{user.createdAt}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowUserDetails(user)}
                                  className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-red-400 hover:bg-red-500/20 rounded">
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

            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Registration Requests</h3>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{request.name}</h4>
                            <p className="text-gray-300">{request.email}</p>
                            <p className="text-blue-400 text-sm">{getUserTypeLabel(request.userType)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                        {request.company && (
                          <p className="text-gray-400 text-sm mb-2">Company: {request.company}</p>
                        )}
                        {request.message && (
                          <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">Requested: {request.requestedAt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Analytics Dashboard</h3>
                <p className="text-gray-300">Analytics features coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">System Settings</h3>
                <p className="text-gray-300">Settings panel coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-gray-800/90 border border-blue-500/20 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Add New User</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">User Type</label>
                <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="CLIENT">Client</option>
                  <option value="QA_QC_VENDOR">QA/QC Vendor</option>
                  <option value="PREPROCESSING_VENDOR">Preprocessing Vendor</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
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
            <h3 className="text-xl font-bold text-white mb-4">User Details</h3>
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
                <p className="text-white">{showUserDetails.createdAt}</p>
              </div>
              {showUserDetails.lastLogin && (
                <div>
                  <label className="text-gray-400 text-sm">Last Login</label>
                  <p className="text-white">{showUserDetails.lastLogin}</p>
                </div>
              )}
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

export default AdminPanel;
