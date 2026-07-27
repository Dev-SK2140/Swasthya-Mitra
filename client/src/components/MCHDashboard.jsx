import React, { useState, useEffect } from 'react';
import { Baby, Activity, AlertCircle, Plus, CalendarClock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MCHDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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
              name: record.patientId?.name || 'Unknown',
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
            Maternal & Child Health (MCH) Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor ANC visits, high-risk pregnancies, and vaccination schedules.</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Register Pregnancy
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-pink-500">
          <p className="text-xs text-slate-500 font-bold uppercase">Total Active</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
          <p className="text-xs text-slate-500 font-bold uppercase">High Risk</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
          <p className="text-xs text-slate-500 font-bold uppercase">3rd Trimester</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">45</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-xs text-slate-500 font-bold uppercase">ANC Up to Date</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">89%</p>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-900 dark:text-white">Active Pregnancies Tracking</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">Loading MCH Records...</div>
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
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.name} <span className="text-xs font-normal text-slate-500">({p.age} y/o)</span></h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex gap-3">
                      <span><strong className="text-slate-700 dark:text-slate-300">EDD:</strong> {p.edd}</span>
                      <span><strong className="text-slate-700 dark:text-slate-300">ANC Visits:</strong> {p.visits}/8</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
                    <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Trimester</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">T{p.trimester}</span>
                  </div>
                  
                  <div className="w-28 text-center">
                    {p.risk === 'High Risk' ? (
                      <span className="flex items-center gap-1 text-xs text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 font-bold">
                        <AlertCircle className="w-3.5 h-3.5" /> High Risk
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Normal
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
    </div>
  );
};

export default MCHDashboard;
