// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ClientDashboard from './pages/dashboards/ClientDashboard';
import QAQCVendorDashboard from './pages/dashboards/QAQCVendorDashboard';
import PreprocessingVendorDashboard from './pages/dashboards/PreprocessingVendorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/dashboard/qa-qc-vendor" element={<QAQCVendorDashboard />} />
          <Route path="/dashboard/preprocessing-vendor" element={<PreprocessingVendorDashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
