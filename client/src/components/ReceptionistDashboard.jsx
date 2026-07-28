import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, UserPlus, Calendar, Phone, CheckCircle2 } from 'lucide-react';
import AITriageFlow from './AITriageFlow';

const ReceptionistDashboard = () => {
  const { t } = useTranslation();
  const [pmjayId, setPmjayId] = useState('');
  const [pmjayResult, setPmjayResult] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const handleVerifyPmjay = async () => {
    try {
      const res = await fetch(`${API_URL}/features/pmjay-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abhaId: pmjayId, rationCard: pmjayId })
      });
      const data = await res.json();
      setPmjayResult(data);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="text-orange-400" /> {t('dashboard.reception_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('dashboard.reception_subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* We reuse the existing PatientIntakeForm but wrap it nicely */}
          <div className="glass-panel bg-slate-800/40 p-0 overflow-hidden border border-slate-300/50 dark:border-slate-700/50 rounded-2xl">
            <div className="p-4 border-b border-slate-300/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
              <UserPlus className="text-teal-700 dark:text-[var(--color-secondary)] w-5 h-5" />
              <h3 className="font-medium text-slate-900 dark:text-white">{t('dashboard.new_patient_reg')}</h3>
            </div>
            <div className="p-6">
              <AITriageFlow onPatientAdded={() => {}} />
            </div>
          </div>
        </div>

          <div className="glass-panel p-5 bg-white/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl space-y-3">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-blue-400 w-5 h-5" /> {t('dashboard.opd_queue')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">42</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.tokens_issued')}</div>
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                <div className="text-3xl font-bold text-teal-700 dark:text-[var(--color-secondary)]">12</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.waiting_opd')}</div>
              </div>
            </div>
            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5">
              🎟️ {t('dashboard.print_opd')}
            </button>
          </div>

          {/* PM-JAY Ayushman Bharat Checker */}
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900 to-teal-950 border border-teal-500/30 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                🇮🇳 {t('dashboard.pmjay_coverage')}
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {t('dashboard.pmjay_5lakh')}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('dashboard.pmjay_desc')}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('dashboard.pmjay_placeholder')}
                value={pmjayId}
                onChange={(e) => setPmjayId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
              <button onClick={handleVerifyPmjay} className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold transition-all">
                {t('dashboard.verify')}
              </button>
            </div>
            {pmjayResult && (
              <div className={`mt-2 p-2 rounded-lg text-xs font-bold flex items-center gap-2 ${pmjayResult.eligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                <CheckCircle2 className="w-4 h-4" /> 
                {pmjayResult.message} 
                {pmjayResult.eligible && ` (Coverage: ₹${pmjayResult.coverageAmount})`}
              </div>
            )}
          </div>

          <div className="glass-panel p-5 bg-white/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="text-green-400 w-5 h-5" /> {t('dashboard.emergency_contacts')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-300/50 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-300">{t('dashboard.ambulance_108')}</span>
                <span className="text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">108</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-300/50 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-300">{t('dashboard.blood_bank')}</span>
                <span className="text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">Ext 402</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-300">{t('dashboard.doctor_oncall')}</span>
                <span className="text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">Ext 201</span>
              </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
};

export default ReceptionistDashboard;
