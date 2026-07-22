import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Menu, X, Activity, User, TestTube, Pill, Users, Building, ChevronDown, Video, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';
import logoImg from '../assets/logo.png';

const ALL_ROLES = ['Doctor', 'Nurse', 'Lab', 'Pharmacy', 'Receptionist', 'Admin', 'Patient'];

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('Doctor');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // If we land on a specific route, update the demo role picker automatically
    if (location.pathname.includes('/doctor')) setCurrentRole('Doctor');
    else if (location.pathname.includes('/nurse')) setCurrentRole('Nurse');
    else if (location.pathname.includes('/lab')) setCurrentRole('Lab');
    else if (location.pathname.includes('/pharmacy')) setCurrentRole('Pharmacy');
    else if (location.pathname.includes('/reception')) setCurrentRole('Receptionist');
    else if (location.pathname.includes('/admin')) setCurrentRole('Admin');
    else if (location.pathname.includes('/intake')) setCurrentRole('Patient');
  }, [location]);

  const handleRoleSwitch = (role) => {
    setCurrentRole(role);
    setShowRoleSelector(false);
    setIsMobileMenuOpen(false);
    
    switch(role) {
      case 'Doctor': navigate('/app/doctor'); break;
      case 'Nurse': navigate('/app/nurse'); break;
      case 'Lab': navigate('/app/lab'); break;
      case 'Pharmacy': navigate('/app/pharmacy'); break;
      case 'Receptionist': navigate('/app/reception'); break;
      case 'Admin': navigate('/app/admin'); break;
      case 'Patient': navigate('/app/intake'); break;
      default: navigate('/app/doctor');
    }
  };

  const NavLinks = ({ mobile }) => (
    <>
      <LanguageSelector />
      
      {/* Demo Role Switcher */}
      <div className="relative">
        <button 
          onClick={() => setShowRoleSelector(!showRoleSelector)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 text-[#82d8a5] ${mobile ? 'w-full justify-between mt-4' : ''}`}
        >
          <span>Demo Role: {currentRole}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showRoleSelector && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute top-full mt-2 w-48 bg-[#1b2532] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ${mobile ? 'relative top-0 w-full' : 'right-0'}`}
            >
              {ALL_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-[#3ae1b7] transition-colors border-b border-white/5 last:border-0"
                >
                  {role} Dashboard
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link to="/app/telemedicine" className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 ${mobile ? 'w-full justify-center mt-2' : ''}`}>
        <Video className="w-4 h-4" /> Consult
      </Link>

      <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition-all bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-center ${mobile ? 'w-full mt-2 block' : ''}`}>
        Logout
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10">
      <header className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-[#07a9b0]/30 bg-[#1b2532] rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_rgba(7,169,176,0.15)]">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="App Logo" className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)]" />
          <div className="hidden sm:block">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-white to-[#82d8a5] bg-clip-text text-transparent">{t('app_title')}</h1>
              {!isOnline && (
                <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                  <WifiOff size={12} /> Offline Mode
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#d0b875] opacity-90 font-medium tracking-wide">{t('app_subtitle')}</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks mobile={false} />
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 mb-6"
          >
            <div className="p-4 flex flex-col gap-2">
              <NavLinks mobile={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-sm rounded-3xl -z-10 border border-white/5"></div>
        <div className="p-4 md:p-8 h-full">
          <Outlet />
        </div>
      </main>
      
      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;
