import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { apiService } from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
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
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Mail className="w-8 h-8 text-green-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4 tracking-wide">Check Your Email</h1>
            <p className="text-blue-300 text-sm mb-8 text-center">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
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
  }

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
            <span className="text-2xl font-bold text-white tracking-wide">Forgot Password</span>
          </div>
          <div className="text-blue-300 text-sm mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label className="block text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-lg mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
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

export default ForgotPasswordPage;
