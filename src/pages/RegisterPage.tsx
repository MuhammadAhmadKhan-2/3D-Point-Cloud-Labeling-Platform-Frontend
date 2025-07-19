import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type UserType = 'client' | 'qa-qc-vendor' | 'preprocessing-vendor';

const USER_TYPES = [
  { key: 'client' as UserType, label: 'Client', icon: <User className="w-5 h-5 mr-2" /> },
  { key: 'qa-qc-vendor' as UserType, label: 'QA/QC Vendor', icon: <CheckCircle className="w-5 h-5 mr-2" /> },
  { key: 'preprocessing-vendor' as UserType, label: 'Preprocessing Vendor', icon: <Settings className="w-5 h-5 mr-2" /> },
];

const RegisterPage: React.FC = () => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRegistrationSuccess(false);
    setRegistrationMessage('');

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        name,
        email,
        password,
        confirmPassword,
        role: selectedUserType
      });

      if (response.success) {
        setRegistrationSuccess(true);
        setRegistrationMessage(
          response.message || 
          'Registration successful! Your account is pending admin approval. You will receive an email notification once approved.'
        );
        
        // Navigate to login page after showing success message
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated blurred background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 via-transparent to-teal-600/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Glassmorphism card */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4">
        <div className="backdrop-blur-xl bg-gray-800/80 border border-blue-500/20 rounded-2xl shadow-2xl p-10 flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
            <span className="text-2xl font-bold text-white tracking-wide">Register</span>
          </div>
          <div className="text-blue-300 text-sm mb-6 text-center">
            Secure AI-powered registration for the Enterprise Point Cloud Platform
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {registrationSuccess && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center">
              {registrationMessage}
            </div>
          )}

          {!registrationSuccess && (
            <>
              {/* User Type Selection */}
              <div className="flex justify-center mb-6 space-x-2 w-full">
                {USER_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedUserType(type.key)}
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-200 border-2 focus:outline-none w-1/3 justify-center text-sm shadow-sm ${
                      selectedUserType === type.key
                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white border-blue-400 shadow-lg scale-105'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-blue-700 hover:text-white hover:border-blue-400'
                    }`}
                    disabled={loading}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleRegister} className="space-y-4 w-full">
                <div>
                  <label className="block text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-lg mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Registering...' : `Register as ${USER_TYPES.find(t => t.key === selectedUserType)?.label}`}
                </button>
              </form>
            </>
          )}

          <div className="mt-5 text-center">
            <span className="text-gray-400">Your request will be processed by admin. Please wait for approval.</span>
          </div>
          <div className="mt-2 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <Link
              to="/login"
              className="text-blue-400 hover:underline font-semibold"
            >
              Login
            </Link>
          </div>
        </div>
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
    </div>
  );
};

export default RegisterPage;