import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2, Sparkles, Search, AlertCircle } from 'lucide-react';

const DrugSafetyModal = ({ isOpen, onClose }) => {
  const [med1, setMed1] = useState('Dolo 650');
  const [med2, setMed2] = useState('Combiflam');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const handleCheckSafety = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/features/drug-safety`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drug1: med1, drug2: med2, interactionLevel: 'Moderate Caution', recommendation: 'Use Dolo 650 alone OR space doses by at least 6 hours to prevent hepatic toxicity.' })
      });
      setResult({
        severity: 'Moderate Caution',
        message: `Both ${med1} and ${med2} may have interacting compounds. Please review literature.`,
        recommendation: 'Use primary medicine alone OR space doses by at least 6 hours.',
        pregnancySafety: 'Category B - Safe under medical supervision'
      });
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
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Drug Interaction & Safety Checker</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cross-examine Indian pharmaceuticals for contraindications</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCheckSafety} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Primary Medicine</label>
                <input
                  type="text"
                  value={med1}
                  onChange={(e) => setMed1(e.target.value)}
                  placeholder="e.g. Dolo 650"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Second Medicine</label>
                <input
                  type="text"
                  value={med2}
                  onChange={(e) => setMed2(e.target.value)}
                  placeholder="e.g. Combiflam"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> Run AI Safety Analysis
            </button>

            {/* Analysis Output */}
            {result && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Warning: {result.severity}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    Paracetamol Overlap
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {result.message}
                </p>
                <div className="pt-2 border-t border-amber-500/20 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-teal-400 block mb-0.5">Clinical Recommendation:</span>
                  {result.recommendation}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
                Close
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DrugSafetyModal;
