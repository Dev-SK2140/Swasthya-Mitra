import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Activity, Droplet, Thermometer, User, FileText, Pill, Calendar, Bell } from 'lucide-react';

const PatientDashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState({});
  const [vitals, setVitals] = useState({
    heartRate: 72,
    spO2: 98,
    bloodPressureSys: 120,
    bloodPressureDia: 80,
    temperature: 98.6
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);

    // Simulate IoT Vitals Streaming
    const interval = setInterval(() => {
      setVitals(prev => ({
        heartRate: prev.heartRate + (Math.random() * 4 - 2),
        spO2: Math.min(100, Math.max(90, prev.spO2 + (Math.random() * 2 - 1))),
        bloodPressureSys: prev.bloodPressureSys + (Math.random() * 4 - 2),
        bloodPressureDia: prev.bloodPressureDia + (Math.random() * 4 - 2),
        temperature: prev.temperature + (Math.random() * 0.2 - 0.1)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-3xl p-6 md:p-8 text-slate-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/40 shadow-inner">
              <User className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('dashboard.patient_welcome')}{user.name || 'Patient'}</h2>
              <p className="font-medium opacity-90">{t('dashboard.patient_subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => alert('You have no upcoming appointments.')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <Calendar className="w-4 h-4" /> {t('dashboard.appointments')}
            </button>
            <button onClick={() => alert('No new notifications.')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all hover:bg-slate-800">
              <Bell className="w-4 h-4" /> {t('dashboard.notifications')}
            </button>
          </div>
        </div>
      </div>

      {/* IoT Vitals Live Stream */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500 animate-pulse" /> {t('dashboard.live_vitals')}
          <span className="text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono tracking-wider animate-pulse ml-2">{t('dashboard.live_sync')}</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalsCard title={t('dashboard.heart_rate')} value={Math.round(vitals.heartRate)} unit="BPM" icon={Heart} color="text-rose-500" bg="bg-rose-500/10" border="border-rose-500/20" />
          <VitalsCard title={t('dashboard.spo2')} value={Math.round(vitals.spO2)} unit="%" icon={Droplet} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
          <VitalsCard title={t('dashboard.blood_pressure')} value={`${Math.round(vitals.bloodPressureSys)}/${Math.round(vitals.bloodPressureDia)}`} unit="mmHg" icon={Activity} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <VitalsCard title={t('dashboard.temperature')} value={vitals.temperature.toFixed(1)} unit="°F" icon={Thermometer} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
        </div>
      </div>

      {/* My Health Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-primary)]" /> {t('dashboard.recent_reports')}
          </h3>
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-slate-500">{t('dashboard.no_reports')}</p>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-700 dark:text-[var(--color-secondary)]" /> {t('dashboard.prescriptions')}
          </h3>
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <Pill className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-slate-500">{t('dashboard.no_prescriptions')}</p>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

const VitalsCard = ({ title, value, unit, icon: Icon, color, bg, border }) => (
  <div className={`glass-panel p-4 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
    <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 bg-current pointer-events-none"></div>
    <div className={`w-8 h-8 rounded-lg ${bg} ${border} flex items-center justify-center mb-4`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${color} font-mono tracking-tight`}>{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  </div>
);

export default PatientDashboard;
