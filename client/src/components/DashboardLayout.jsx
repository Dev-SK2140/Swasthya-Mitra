import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Menu, X, Activity, User, TestTube, Pill, Users, Building, ChevronDown, Video, WifiOff, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';
import ThemeToggle from './ThemeToggle';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import MedicalCross3D from './MedicalCross3D';


const ALL_ROLES = ['Doctor', 'Nurse', 'Lab', 'Pharmacy', 'Receptionist', 'Admin', 'Patient'];

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrolledDown(true);
        setIsMobileMenuOpen(false); // auto-close mobile menu on scroll down
      } else {
        setIsScrolledDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  const TopBarItems = ({ mobile }) => (
    <>
      {storedUser.email && (
        <div className={`flex items-center gap-2 bg-white dark:bg-slate-800/80 p-1 pr-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-default ${mobile ? 'w-full mb-2 justify-center' : 'shrink-0'}`}>
          {storedUser.picture ? (
            <img src={storedUser.picture} alt="Profile" className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-slate-800">
              {(storedUser.name || storedUser.email)[0].toUpperCase()}
            </div>
          )}
          <div className="text-left flex flex-col justify-center">
            <span className="font-semibold text-slate-800 dark:text-slate-100 leading-none text-xs truncate max-w-[110px]">
              {storedUser.name ? storedUser.name.split(' (')[0] : 'User'}
            </span>
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[110px] mt-0.5">
              {storedUser.email}
            </span>
          </div>
        </div>
      )}

      {/* Assigned Role Badge for Strict Privacy */}
      <div className={`flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-900 dark:text-white ${mobile ? 'w-full mb-2 justify-center' : ''}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">Portal:</span>
        <span className="font-bold text-[var(--color-primary)]">{storedUser.role || 'Doctor'}</span>
      </div>

      <div className={`flex items-center gap-2 ${mobile ? 'w-full justify-center mb-2' : ''}`}>
        <ThemeToggle />
        <LanguageSelector />
      </div>
    </>
  );

  const MenuLinks = ({ mobile }) => (
    <>
      {/* Role Based Navigation */}
      <div className={`flex items-center gap-2 ${mobile ? 'flex-col w-full mb-2' : 'flex-wrap justify-center w-full mb-2'}`}>
        {roleNavItems
          .filter(item => {
            const role = (storedUser.role || 'Doctor').toLowerCase();
            if (role === 'admin') return true;
            if (item.name.toLowerCase() === role) return true;
            if (item.name.toLowerCase() === 'reception' && role === 'receptionist') return true;
            if (role === 'patient') {
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
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === item.path 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              } ${mobile ? 'w-full text-center' : ''}`}
            >
              {item.name}
            </Link>
          ))
        }
      </div>

      <Link to="/app/telemedicine" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/30 text-teal-700 dark:text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 ${mobile ? 'w-full justify-center mt-2' : 'justify-center w-full'}`}>
        <Video className="w-4 h-4" /> Telemedicine
      </Link>

      <Link 
        to="/" 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }}
        className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-center ${mobile ? 'w-full mt-2 block' : 'w-full mt-2 block'}`}
      >
        Logout
      </Link>
    </>
  );

  const isMainDashboard = ['/app/doctor', '/app/patient', '/app/admin', '/app/nurse', '/app/reception', '/app/pharmacy', '/app/lab'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10">
      {/* 3D Canvas Background - Only on main dashboard pages */}
      {isMainDashboard && (
        <div className="fixed inset-0 z-[-1] opacity-30 dark:opacity-40 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="city" />
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
              <MedicalCross3D position={[-6, 4, -8]} scale={1} />
            </Float>
            <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
              <MedicalCross3D position={[6, -3, -10]} scale={0.8} />
            </Float>
            <Float speed={1} rotationIntensity={1.5} floatIntensity={1}>
              <MedicalCross3D position={[-2, -5, -12]} scale={1.2} />
            </Float>
            <Sparkles count={150} scale={20} size={5} speed={0.4} opacity={0.3} color="#82d8a5" />
          </Canvas>
        </div>
      )}

      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolledDown ? '-translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-slate-200 dark:border-[#07a9b0]/30 bg-white/60 dark:bg-[#1b2532]/80 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_rgba(7,169,176,0.15)]`}>
        <div className="flex items-center gap-4">
          <img src="/logo day theme.png" alt="App Logo" className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)] block dark:hidden transition-all duration-300" />
          <img src="/logo night theme.png" alt="App Logo" className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)] hidden dark:block transition-all duration-300" />
          <div className="hidden sm:block">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#82d8a5] whitespace-nowrap">સ્વાસ્થ્ય મિત્ર</h1>
              {!isOnline && (
                <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 whitespace-nowrap">
                  <WifiOff size={12} /> Offline Mode
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-[#d0b875] opacity-90 font-medium tracking-wide hidden xl:block whitespace-nowrap">Intelligent Rural Health Triage Platform</p>
          </div>
        </div>

        {/* Desktop TopBar */}
        <div className="hidden lg:flex flex-nowrap justify-end items-center gap-2 xl:gap-3 shrink-0">
          <TopBarItems mobile={false} />
          {/* Always show Menu Button for navigation links */}
          <button 
            className="text-slate-900 dark:text-white p-2 ml-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-xs font-bold uppercase tracking-wider">Menu</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="lg:hidden text-slate-900 dark:text-white p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Navigation Menu (Dropdown/Expandable) */}
      <AnimatePresence>
        {isMobileMenuOpen && !isScrolledDown && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 mb-6 sticky top-[100px] z-40"
          >
            <div className="p-4 flex flex-col gap-2">
              <div className="lg:hidden flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-2">
                <TopBarItems mobile={true} />
              </div>
              <MenuLinks mobile={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl -z-10 border border-slate-200 dark:border-white/5 shadow-2xl"></div>
        <div className="p-4 md:p-8 h-full flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-8 pt-4 border-t border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto border-t border-slate-200 dark:border-slate-800">
          Designed & Developed by <strong className="text-slate-900 dark:text-white">Shahid Khan</strong> from <strong className="text-[var(--color-primary)]">SyncHex Infosys</strong> (<a href="mailto:contact.synchex@gmail.com" className="text-teal-700 dark:text-[var(--color-secondary)] hover:underline">contact.synchex@gmail.com</a>)
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;
