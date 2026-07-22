import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';
import logoImg from '../assets/logo.png';

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#1b2532] overflow-hidden relative flex flex-col">
      <nav className="w-full px-8 py-4 flex justify-between items-center z-20 border-b border-[#07a9b0]/20 bg-[#1b2532] fixed top-0 shadow-lg">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)]" />
          <div className="hidden sm:block">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-[#82d8a5] bg-clip-text text-transparent block">{t('app_title')}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <LanguageSelector />
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium hidden md:block">Login</Link>
          <Link to="/register" className="bg-[var(--color-primary)] hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">Register</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 mt-20 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-[var(--color-primary)] mb-6 leading-tight drop-shadow-2xl">
            {t('app_title')}
          </h1>
          <p className="text-xl md:text-3xl text-indigo-200/80 font-light mb-12 max-w-3xl mx-auto">
            {t('app_subtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transition-shadow"
              >
                Create Account
              </motion.button>
            </Link>
            <Link to="/app/intake">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-900/40 text-white border border-[var(--color-primary)]/50 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-800/60 transition-colors backdrop-blur-md"
              >
                View Live Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary)]/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--color-primary-hover)]/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-600/10 rounded-t-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default LandingPage;
