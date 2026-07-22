import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardLayout from './components/DashboardLayout';
import PatientIntakeForm from './components/PatientIntakeForm';
import DoctorDashboard from './components/DoctorDashboard';
import NurseDashboard from './components/NurseDashboard';
import LabDashboard from './components/LabDashboard';
import PharmacyDashboard from './components/PharmacyDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import AdminDashboard from './components/AdminDashboard';
import TelemedicineChat from './components/TelemedicineChat';
import './i18n';
import './index.css';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        
        <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="intake" element={<PageTransition><PatientIntakeForm /></PageTransition>} />
          <Route path="doctor" element={<PageTransition><DoctorDashboard /></PageTransition>} />
          <Route path="nurse" element={<PageTransition><NurseDashboard /></PageTransition>} />
          <Route path="lab" element={<PageTransition><LabDashboard /></PageTransition>} />
          <Route path="pharmacy" element={<PageTransition><PharmacyDashboard /></PageTransition>} />
          <Route path="reception" element={<PageTransition><ReceptionistDashboard /></PageTransition>} />
          <Route path="admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="telemedicine" element={<PageTransition><TelemedicineChat /></PageTransition>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
