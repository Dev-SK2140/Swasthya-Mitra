import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, PhoneCall, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const AmbulanceTrackerModal = ({ isOpen, onClose }) => {
  const [dispatched, setDispatched] = useState(false);

  if (!isOpen) return null;

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const handleDispatch = async () => {
    try {
      await fetch(`${API_URL}/features/ambulance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: 'GJ-01-AX-108', type: 'Advanced Life Support (ALS)', eta: '8 Mins' })
      });
      setDispatched(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">108 EMRI Live Ambulance Dispatch</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Emergency Medical Response Institute (Gujarat Govt.)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* GPS Tracker Map Card */}
            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden text-left space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span> Live Dispatch: Unit GJ-01-AX-108
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Advanced Life Support (ALS)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Arrival (ETA)</span>
                  <span className="text-xl font-black text-rose-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 8 Mins
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Driver Contact</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-1">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> +91 98790 10800
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">ICU Equipment Onboard:</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Defibrillator, Oxygen Cylinder, Ventilator, Syringe Pump</span>
                </div>
              </div>
            </div>

            {dispatched && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2 font-bold animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> 108 Emergency Siren Alert Transmitted to Driver!
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase">EMRI 108 Gujarat Network</span>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
                  Close
                </button>
                <button
                  onClick={handleDispatch}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" /> Transmit Priority Route
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AmbulanceTrackerModal;
