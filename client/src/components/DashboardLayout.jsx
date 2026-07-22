import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const DashboardLayout = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">S</div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">{t('app_title')}</h1>
            <p className="text-xs text-slate-400">{t('app_subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 items-center">
          <LanguageSelector />
          <Link to="/app/intake" className="text-sm md:text-base px-4 py-2 rounded-lg font-medium transition-all bg-slate-800 border border-slate-700 text-slate-200 hover:bg-indigo-600/20 hover:border-indigo-500/50">
            {t('nav.intake')}
          </Link>
          <Link to="/app/doctor" className="text-sm md:text-base px-4 py-2 rounded-lg font-medium transition-all bg-slate-800 border border-slate-700 text-slate-200 hover:bg-indigo-600/20 hover:border-indigo-500/50">
            {t('nav.dashboard')}
          </Link>
          <Link to="/" className="text-sm md:text-base px-4 py-2 rounded-lg font-medium transition-all bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20">
            Logout
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-slate-800/30 backdrop-blur-sm rounded-3xl -z-10 border border-white/5"></div>
        <div className="p-4 md:p-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
