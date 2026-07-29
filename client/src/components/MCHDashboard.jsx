import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Activity, AlertCircle, Plus, CalendarClock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MCHDashboard = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    lastMenstrualPeriod: '',
    bloodGroup: 'O+',
    highRiskFactors: ''
  });

  useEffect(() => {
    const fetchMCH = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');
        const response = await fetch(`${API_URL}/mch`);
        const data = await response.json();
        
        if (data.length > 0) {
          const formatted = data.map(record => {
            const eddDate = new Date(record.estimatedDeliveryDate);
            return {
              id: record._id,
              name: record.patientId?.name || t('dashboard.unknown'),
              age: record.patientId?.age || '-',
              lmp: new Date(record.lastMenstrualPeriod).toLocaleDateString(),
              edd: eddDate.toLocaleDateString(),
              trimester: record.ancVisits?.length > 0 ? record.ancVisits[record.ancVisits.length - 1].trimester : 1,
              risk: record.highRisk ? 'High Risk' : 'Normal',
              factors: record.highRiskFactors || [],
              visits: record.ancVisits?.length || 0
            };
          });
          setPatients(formatted);
        } else {
          // Fallback mocks if DB has no MCH patients yet
          setPatients([
            { id: 1, name: 'Suman Devi', age: 24, lmp: '2025-10-15', edd: '2026-07-22', trimester: 3, risk: 'High Risk', factors: ['Gestational Diabetes'], visits: 5 },
            { id: 2, name: 'Radha Ben', age: 28, lmp: '2026-02-10', edd: '2026-11-17', trimester: 2, risk: 'Normal', factors: [], visits: 2 },
            { id: 3, name: 'Lakshmi Patel', age: 22, lmp: '2026-05-01', edd: '2027-02-05', trimester: 1, risk: 'Normal', factors: [], visits: 1 }
          ]);
        }
        // Also fetch all patients for the dropdown
        const triageRes = await fetch(`${API_URL}/triage`);
        const triageData = await triageRes.json();
        setAllPatients(Array.isArray(triageData) ? triageData : []);
      } catch (err) {
        console.error('Error fetching MCH:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMCH();
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Baby className="w-8 h-8 text-pink-500" /> 
            {t('dashboard.mch_title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.mch_subtitle')}</p>
        </div>
        <button onClick={() => setShowRegisterModal(true)} className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('dashboard.register_pregnancy')}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-pink-500">
          <p className="text-xs text-slate-500 font-bold uppercase">{t('dashboard.total_active')}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
          <p className="text-xs text-slate-500 font-bold uppercase">{t('dashboard.high_risk')}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
          <p className="text-xs text-slate-500 font-bold uppercase">{t('dashboard.trimester_3')}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">45</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500 font-bold uppercase">{t('dashboard.anc_uptodate')}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">89%</p>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-900 dark:text-white">{t('dashboard.active_pregnancies')}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">{t('dashboard.loading_mch')}</div>
          ) : (
            patients.map(p => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 text-pink-500 rounded-full flex items-center justify-center font-bold text-lg">
                    {p.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.name} <span className="text-xs font-normal text-slate-500">({p.age} {t('dashboard.yo')})</span></h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex gap-3">
                      <span><strong className="text-slate-700 dark:text-slate-300">{t('dashboard.edd')}</strong> {p.edd}</span>
                      <span><strong className="text-slate-700 dark:text-slate-300">{t('dashboard.anc_visits')}</strong> {p.visits}/8</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">{t('dashboard.trimester')}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{t('dashboard.t_prefix')}{p.trimester}</span>
                  </div>
                  
                  <div className="w-28 text-center">
                    {p.risk === 'High Risk' ? (
                      <span className="flex items-center gap-1 text-xs text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> {t('dashboard.high_risk')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t('dashboard.normal')}
                      </span>
                    )}
                    {p.factors.length > 0 && <span className="block mt-1 text-[9px] text-rose-400">{p.factors.join(', ')}</span>}
                  </div>

                  <button className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white p-2.5 rounded-xl transition-colors">
                    <CalendarClock className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Baby className="w-5 h-5 text-pink-500" /> Register Pregnancy
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Select Patient</label>
                <select 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  value={formData.patientId}
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                >
                  <option value="">-- Select Patient --</option>
                  {allPatients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.age}y)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Last Menstrual Period (LMP)</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  value={formData.lastMenstrualPeriod}
                  onChange={e => setFormData({...formData, lastMenstrualPeriod: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Blood Group</label>
                <select 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  value={formData.bloodGroup}
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                >
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">High Risk Factors (Comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hypertension, Anemia"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                  value={formData.highRiskFactors}
                  onChange={e => setFormData({...formData, highRiskFactors: e.target.value})}
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
              <button onClick={() => setShowRegisterModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">Cancel</button>
              <button 
                onClick={async () => {
                  if(!formData.patientId || !formData.lastMenstrualPeriod) return alert('Patient and LMP are required');
                  try {
                    const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');
                    const res = await fetch(`${API_URL}/mch`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...formData,
                        highRiskFactors: formData.highRiskFactors.split(',').map(s => s.trim()).filter(Boolean)
                      })
                    });
                    if(res.ok) {
                      setShowRegisterModal(false);
                      window.location.reload();
                    } else alert('Failed to register pregnancy');
                  } catch(e) { console.error(e); }
                }}
                className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all"
              >
                Register
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MCHDashboard;
