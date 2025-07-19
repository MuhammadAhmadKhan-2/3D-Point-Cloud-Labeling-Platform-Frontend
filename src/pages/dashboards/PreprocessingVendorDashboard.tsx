import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const PreprocessingVendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated blurred background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 via-transparent to-teal-600/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
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

      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-gray-800/80 border border-blue-500/20 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Settings className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">Preprocessing Vendor Dashboard</h1>
                  <p className="text-blue-300">Welcome, {user?.name || 'User'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="backdrop-blur-sm bg-gray-700/50 border border-blue-500/10 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Data Processing</h3>
                <p className="text-gray-300">Process raw point cloud data</p>
              </div>
              <div className="backdrop-blur-sm bg-gray-700/50 border border-blue-500/10 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Optimization</h3>
                <p className="text-gray-300">Optimize data for performance</p>
              </div>
              <div className="backdrop-blur-sm bg-gray-700/50 border border-blue-500/10 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                <p className="text-gray-300">View processing analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreprocessingVendorDashboard;
