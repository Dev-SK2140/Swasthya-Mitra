import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
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
import MapDashboard from './components/MapDashboard';
import MCHDashboard from './components/MCHDashboard';
import PatientDashboard from './components/PatientDashboard';
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

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      let userPath = '/app/doctor';
      if (userRole === 'nurse') userPath = '/app/nurse';
      else if (userRole === 'receptionist' || userRole === 'reception') userPath = '/app/reception';
      else if (userRole === 'lab') userPath = '/app/lab';
      else if (userRole === 'pharmacy') userPath = '/app/pharmacy';
      else if (userRole === 'admin') userPath = '/app/admin';
      else if (userRole === 'patient') userPath = '/app/patient';

      return <Navigate to={userPath} replace />;
    }
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
          <Route path="doctor" element={<RoleProtectedRoute allowedRoles={['Doctor']}><PageTransition><DoctorDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="nurse" element={<RoleProtectedRoute allowedRoles={['Nurse']}><PageTransition><NurseDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="reception" element={<RoleProtectedRoute allowedRoles={['Receptionist', 'Reception']}><PageTransition><ReceptionistDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="lab" element={<RoleProtectedRoute allowedRoles={['Lab']}><PageTransition><LabDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="pharmacy" element={<RoleProtectedRoute allowedRoles={['Pharmacy']}><PageTransition><PharmacyDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="admin" element={<RoleProtectedRoute allowedRoles={['Admin']}><PageTransition><AdminDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="patient" element={<RoleProtectedRoute allowedRoles={['Patient']}><PageTransition><PatientDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="map" element={<RoleProtectedRoute allowedRoles={['Admin', 'Doctor']}><PageTransition><MapDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="mch" element={<RoleProtectedRoute allowedRoles={['Nurse', 'Doctor']}><PageTransition><MCHDashboard /></PageTransition></RoleProtectedRoute>} />
          <Route path="intake" element={<RoleProtectedRoute allowedRoles={['Nurse', 'Receptionist', 'Doctor']}><PageTransition><PatientIntakeForm /></PageTransition></RoleProtectedRoute>} />
          <Route path="telemedicine" element={<PageTransition><TelemedicineChat /></PageTransition>} />
          
          {/* Catch-all for invalid /app/* routes, redirects to correct role dashboard */}
          <Route path="*" element={<RoleProtectedRoute allowedRoles={['NONE']}><div /></RoleProtectedRoute>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  );
};

export default App;
