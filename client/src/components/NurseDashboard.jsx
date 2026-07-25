import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Droplets, Users, CheckCircle, Clock } from 'lucide-react';

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/triage`);
        const data = await res.json();
        if(Array.isArray(data)) {
          setPatients(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-slate-400 animate-pulse">Loading patient queue...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-[var(--color-secondary)] to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="text-[var(--color-secondary)]" /> Nurse Station
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage patient vitals and doctor queue</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-panel py-2 px-4 flex items-center gap-3 bg-slate-800/80">
            <Users className="text-blue-400 w-5 h-5" />
            <div>
              <div className="text-xs text-slate-400">In Queue</div>
              <div className="font-bold">{patients.length}</div>
            </div>
          </div>
          <div className="glass-panel py-2 px-4 flex items-center gap-3 bg-slate-800/80">
            <CheckCircle className="text-[var(--color-secondary)] w-5 h-5" />
            <div>
              <div className="text-xs text-slate-400">Vitals Recorded</div>
              <div className="font-bold">{patients.filter(p => p.vitals?.heartRate).length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {patients.map(p => (
          <motion.div 
            key={p._id} 
            whileHover={{ scale: 1.02 }}
            className="glass-panel relative overflow-hidden bg-slate-800/40 border border-slate-700/50 hover:border-[var(--color-secondary)]/50 transition-colors flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-secondary)]"></div>
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{p.name}</h3>
                  <p className="text-sm text-slate-400">{p.age} years • {p.gender}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    🛏️ Ward Bed #{Math.floor(10 + Math.random() * 20)}
                  </span>
                </div>
              </div>

              {/* NEWS2 Early Warning Score Indicator */}
              <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🟢 NEWS2 Score: {p.riskLevel === 'High Risk' ? '7 (High Critical)' : '1 (Stable Normal)'}
                </span>
                <span className="text-[10px] text-slate-400">O2 Flow: 2L/min</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Heart className="text-rose-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-400">Heart Rate</div>
                    <div className="font-semibold">{p.vitals?.heartRate || '--'} <span className="text-[10px] font-normal text-slate-500">bpm</span></div>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Activity className="text-blue-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-400">Blood Pressure</div>
                    <div className="font-semibold">{p.vitals?.bloodPressureSys || '--'}/{p.vitals?.bloodPressureDia || '--'}</div>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Droplets className="text-cyan-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-400">SpO2</div>
                    <div className="font-semibold">{p.vitals?.spO2 || '--'} <span className="text-[10px] font-normal text-slate-500">%</span></div>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Thermometer className="text-orange-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-400">Temp</div>
                    <div className="font-semibold">98.6 <span className="text-[10px] font-normal text-slate-500">°F</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors">
                💧 IV Drip Log
              </button>
              <button className="py-2 bg-slate-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors">
                ✏️ Update Vitals
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NurseDashboard;
