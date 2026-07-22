import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Pill, Activity, Stethoscope } from 'lucide-react';

const PatientTimelineModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  const mockHistory = [
    { date: 'Today', type: 'triage', desc: `Triage complete. Risk: ${patient.riskLevel}`, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/20' },
    { date: '1 Month Ago', type: 'visit', desc: 'Follow-up for Hypertension. Prescribed Amlodipine 5mg.', icon: Stethoscope, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/20' },
    { date: '6 Months Ago', type: 'pharmacy', desc: 'Refilled prescription: Metformin 500mg.', icon: Pill, color: 'text-[var(--color-secondary)]', bg: 'bg-[var(--color-secondary)]/20' },
    { date: '1 Year Ago', type: 'visit', desc: 'Initial registration. Baseline vitals recorded.', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/20' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <div>
              <h3 className="font-semibold text-white text-lg">{patient.name}'s History</h3>
              <p className="text-xs text-slate-400">UUID: {patient._id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="relative border-l-2 border-slate-700 ml-3 space-y-8">
              {mockHistory.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="relative pl-6"
                  >
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${item.bg} flex items-center justify-center border-4 border-slate-900`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--color-primary)]">{item.date}</span>
                      <p className="text-slate-300 mt-1 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
            <button onClick={onClose} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Close Record
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PatientTimelineModal;
