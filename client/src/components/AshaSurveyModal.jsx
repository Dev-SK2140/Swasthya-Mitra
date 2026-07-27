import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, Users, HeartPulse, CheckCircle2 } from 'lucide-react';

const AshaSurveyModal = ({ isOpen, onClose }) => {
  const [district, setDistrict] = useState('Rajkot Rural');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Gather data from form (simplified for this demo)
    const households = e.target.elements[1].value;
    const pregnantWomen = e.target.elements[2].value;

    try {
      await fetch(`${API_URL}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          village: district, 
          familyHeadName: 'Survey Aggregation', 
          familySize: parseInt(households),
          notes: `Pregnant Women Logged: ${pregnantWomen}`,
          submittedBy: 'ASHA Worker' 
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
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
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">ASHA Worker Rural Health Survey</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Field Visits & Disease Outbreak Monitoring (Gujarat PHC Hub)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* District Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Select Health Sub-Center / District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="Rajkot Rural">Rajkot PHC Unit #4</option>
                <option value="Ahmedabad Rural">Ahmedabad Sanand Health Sub-Center</option>
                <option value="Surat Rural">Surat Mandvi PHC Ward</option>
                <option value="Vadodara Rural">Vadodara Dabhoi Center</option>
              </select>
            </div>

            {/* Live Endemic Risk Status */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Endemic Outbreak Watch
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Dengue & Malaria Season
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                12 household fever cases reported in Sub-Center this week. Vector control fogging initiated.
              </p>
            </div>

            {/* Survey Form Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Households Surveyed</span>
                <input type="number" defaultValue={28} className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white focus:outline-none mt-1" />
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Pregnant Women Logged</span>
                <input type="number" defaultValue={6} className="w-full bg-transparent text-lg font-bold text-emerald-400 focus:outline-none mt-1" />
              </div>
            </div>

            {submitted && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2 font-bold animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> Survey Logged Successfully to Gujarat PHC Portal!
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg"
              >
                Submit ASHA Report
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AshaSurveyModal;
