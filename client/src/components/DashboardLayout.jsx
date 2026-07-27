import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Menu, X, Activity, User, TestTube, Pill, Users, Building, ChevronDown, Video, WifiOff, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';
import ThemeToggle from './ThemeToggle';
import logoImg from '../assets/logo.png';

const ALL_ROLES = ['Doctor', 'Nurse', 'Lab', 'Pharmacy', 'Receptionist', 'Admin', 'Patient'];

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const roleNavItems = [
    { name: 'Doctor', path: '/app/doctor', tKey: 'doctor_dashboard' },
    { name: 'Nurse', path: '/app/nurse', tKey: 'nurse_dashboard' },
    { name: 'Reception', path: '/app/reception', tKey: 'reception_dashboard' },
    { name: 'Admin', path: '/app/admin', tKey: 'admin' },
    { name: 'Lab', path: '/app/lab', tKey: 'lab' },
    { name: 'Pharmacy', path: '/app/pharmacy', tKey: 'pharmacy' },
    { name: 'Intake', path: '/app/intake', tKey: 'intake' },
    { name: 'Map', path: '/app/map', tKey: 'map' },
    { name: 'MCH Tracker', path: '/app/mch', tKey: 'mch' },
    { name: 'Patient', path: '/app/patient', tKey: 'patient' }
  ];

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const NavLinks = ({ mobile }) => (
    <>
      {storedUser.email && (
        <div className={`flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs ${mobile ? 'w-full mb-2 justify-center' : ''}`}>
          {storedUser.picture ? (
            <img src={storedUser.picture} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-slate-900 dark:text-white flex items-center justify-center font-bold text-xs">
              {(storedUser.name || storedUser.email)[0].toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <span className="font-semibold text-slate-900 dark:text-white block leading-tight text-xs">{storedUser.name || 'User'}</span>
            <span className="text-[10px] text-[var(--color-secondary)] block leading-tight">{storedUser.email}</span>
          </div>
        </div>
      )}

      {/* Assigned Role Badge for Strict Privacy */}
      <div className={`flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-900 dark:text-white ${mobile ? 'w-full mb-2 justify-center' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">Portal:</span>
        <span className="font-bold text-[var(--color-primary)]">{storedUser.role || 'Doctor'}</span>
      </div>

      <ThemeToggle />
      <LanguageSelector />

      {/* Role Based Navigation */}
      <div className={`flex items-center gap-2 ${mobile ? 'flex-col w-full' : ''}`}>
        {roleNavItems
          .filter(item => {
            const role = (storedUser.role || 'Doctor').toLowerCase();
            if (role === 'admin') return true;
            if (item.name.toLowerCase() === role) return true;
            if (role === 'patient') {
              // Patient should only see Patient dashboard, and Telemedicine (handled separately)
              return item.name === 'Patient';
            }
            if (item.name === 'Intake' && ['doctor', 'nurse', 'reception', 'receptionist'].includes(role)) return true;
            if (item.name === 'Map' && ['doctor', 'admin'].includes(role)) return true;
            if (item.name === 'MCH Tracker' && ['doctor', 'nurse'].includes(role)) return true;
            return false;
          })
          .map((item, idx) => (
            <Link 
              key={idx}
              to={item.path} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === item.path 
                  ? 'bg-[var(--color-primary)] text-slate-900 dark:text-white' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              } ${mobile ? 'w-full text-center' : ''}`}
            >
              {t(`nav.${item.tKey}`) || item.name}
            </Link>
          ))
        }
      </div>

      <Link to="/app/telemedicine" className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 ${mobile ? 'w-full justify-center mt-2' : ''}`}>
        <Video className="w-4 h-4" /> {t('nav.telemedicine')}
      </Link>

      <Link 
        to="/" 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }}
        className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-center ${mobile ? 'w-full mt-2 block' : ''}`}
      >
        {t('nav.logout')}
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10">
      <header className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-slate-200 dark:border-[#07a9b0]/30 bg-white/60 dark:bg-[#1b2532]/80 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_rgba(7,169,176,0.15)]">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="App Logo" className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)]" />
          <div className="hidden sm:block">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#82d8a5] whitespace-nowrap">{t('app_title')}</h1>
              {!isOnline && (
                <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 whitespace-nowrap">
                  <WifiOff size={12} /> Offline Mode
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-[#d0b875] opacity-90 font-medium tracking-wide hidden xl:block whitespace-nowrap">{t('app_subtitle')}</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-wrap justify-end items-center gap-3 xl:gap-4">
          <NavLinks mobile={false} />
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="lg:hidden text-slate-900 dark:text-white p-2"
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
            className="lg:hidden overflow-hidden bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 mb-6"
          >
            <div className="p-4 flex flex-col gap-2">
              <NavLinks mobile={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl -z-10 border border-slate-200 dark:border-white/5 shadow-2xl"></div>
        <div className="p-4 md:p-8 h-full">
          <Outlet />
        </div>
      </main>

      <footer className="mt-8 pt-4 border-t border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto border-t border-slate-200 dark:border-slate-800">
          Designed & Developed by <strong className="text-slate-900 dark:text-white">Shahid Khan</strong> from <strong className="text-[var(--color-primary)]">SyncHex Infosys</strong> (<a href="mailto:contact.synchex@gmail.com" className="text-[var(--color-secondary)] hover:underline">contact.synchex@gmail.com</a>)
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;
