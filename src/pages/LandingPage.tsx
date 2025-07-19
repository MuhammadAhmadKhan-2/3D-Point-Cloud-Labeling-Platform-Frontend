import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cloud, Database, Zap, Play, CheckCircle, Settings, User, ArrowRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const LandingPage: React.FC = () => {
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

      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
            <span className="text-xl font-bold text-white">Enterprise Point Cloud Platform</span>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin"
              className="px-6 py-2 bg-transparent border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition-all duration-200"
            >
              Admin
            </Link>
            <Link
              to="/login"
              className="px-6 py-2 bg-transparent border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
            >
              Register
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-20 px-6 max-w-6xl mx-auto">
          <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8 inline-block">
            <Shield className="w-6 h-6 text-blue-400 inline mr-2" />
            <span className="text-blue-300 font-medium">Enterprise Point Cloud Platform</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-wide">
            Metabread | Internal 3D Labeling Suite
          </h1>
          
          <p className="text-xl text-blue-200 mb-4 max-w-3xl mx-auto">
            Advanced AI-powered annotation platform with AWS cloud integration
          </p>
          
          <p className="text-lg text-blue-300 mb-12 max-w-2xl mx-auto">
            Proprietary enterprise solution for autonomous vehicle development
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-blue-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Cloud className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AWS Integration</h3>
              <p className="text-blue-200 mb-4">Scalable cloud infrastructure with S3 storage and EC2 processing</p>
            </div>

            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-teal-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Database className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Processing</h3>
              <p className="text-blue-200 mb-4">Live 3D annotation with instant validation and quality control</p>
            </div>

            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-yellow-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Assisted</h3>
              <p className="text-blue-200 mb-4">Machine learning algorithms for automated object detection</p>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-2xl text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Launch Platform
          </Link>

          <div className="flex justify-center items-center space-x-8 mt-8 text-sm text-blue-300">
            <span>Version 2.25</span>
            <span>•</span>
            <span>AWS US-East-1</span>
            <span>•</span>
            <span>Enterprise License</span>
          </div>
        </section>

        {/* Processing Stages Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Processing Workflows</h2>
            <p className="text-xl text-blue-200 mb-4">
              Choose between Preprocessing or Refinement workflows for your 3D point cloud annotation tasks
            </p>
            <p className="text-lg text-blue-300">
              Integrated with AWS cloud infrastructure for scalable processing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preprocessing Card */}
            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <Database className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-4">Preprocessing</h3>
              <p className="text-blue-200 text-center mb-6">Original Source Factory Corporation</p>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Core Functions:</h4>
                <div className="space-y-3">
                  {['Raw Labeling', 'Coarse Annotation', 'Initial Annotation', 'Baseline Labeling', 'Stage 1 Annotation'].map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                      <span className="text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-green-400 text-sm">AWS Integrated</span>
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center">
                Launch Preprocessing
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Refinement Card */}
            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-teal-500/20 rounded-full">
                  <Settings className="w-8 h-8 text-teal-400" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-4">Refinement</h3>
              <p className="text-blue-200 text-center mb-6">Metabread Co., Ltd.</p>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Core Functions:</h4>
                <div className="space-y-3">
                  {['3D Annotation', 'Precision Annotation', 'Quality Assurance & Control', 'Validation & Correction', 'Stage 2 Labeling'].map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                      <span className="text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-green-400 text-sm">AWS Integrated</span>
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 flex items-center justify-center">
                Launch Refinement
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex justify-center items-center space-x-8 mt-12 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-green-400">AWS US-East-1 Connected</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-blue-400">Real-time Processing</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              <span className="text-purple-400">Enterprise Security</span>
            </div>
          </div>
        </section>

        {/* User Types Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Platform Access</h2>
            <p className="text-xl text-blue-200">
              Secure role-based access for different user types
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-blue-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Client</h3>
              <p className="text-blue-200 mb-6">Access to project management, data uploads, and processing reports</p>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-green-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">QA/QC Vendor</h3>
              <p className="text-blue-200 mb-6">Quality assurance tools, validation workflows, and reporting systems</p>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
              >
                Apply Now
              </Link>
            </div>

            <div className="backdrop-blur-xl bg-gray-800/60 border border-blue-500/20 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300">
              <div className="p-4 bg-purple-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Preprocessing Vendor</h3>
              <p className="text-blue-200 mb-6">Advanced processing tools, optimization algorithms, and analytics</p>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
              >
                Join Platform
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-blue-500/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-bold text-white">Enterprise Platform</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Advanced AI-powered 3D point cloud annotation platform for autonomous vehicle development.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li><a href="#" className="hover:text-white transition-colors">3D Annotation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Quality Control</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Data Processing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">AWS Integration</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all">
                    <Github className="w-4 h-4 text-blue-400" />
                  </a>
                  <a href="#" className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all">
                    <Twitter className="w-4 h-4 text-blue-400" />
                  </a>
                  <a href="#" className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                  </a>
                  <a href="#" className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-500/20 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-blue-200 text-sm">
                © 2024 Metabread Co., Ltd. All rights reserved. Enterprise Point Cloud Platform.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-blue-200">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
