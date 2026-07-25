import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Check, Calendar, AlertCircle } from 'lucide-react';

const IMMUNIZATION_SCHEDULE = [
  { vaccine: 'BCG (Tuberculosis)', dueAge: 'At Birth', status: 'Completed', date: '12 Jan 2026' },
  { name: 'OPV-0 (Oral Polio)', dueAge: 'At Birth', status: 'Completed', date: '12 Jan 2026' },
  { vaccine: 'Pentavalent-1 (DPT+HepB+Hib)', dueAge: '6 Weeks', status: 'Completed', date: '24 Feb 2026' },
  { vaccine: 'Rotavirus-1', dueAge: '6 Weeks', status: 'Completed', date: '24 Feb 2026' },
  { vaccine: 'Pentavalent-2', dueAge: '10 Weeks', status: 'Due Today', date: 'Due Now' },
  { vaccine: 'MR-1 (Measles & Rubella)', dueAge: '9 Months', status: 'Upcoming', date: 'Oct 2026' }
];

const VaccinationTrackerModal = ({ isOpen, onClose }) => {
  const [schedule, setSchedule] = useState(IMMUNIZATION_SCHEDULE);

  if (!isOpen) return null;

  const handleMarkGiven = (index) => {
    const updated = [...schedule];
    updated[index].status = 'Completed';
    updated[index].date = 'Today';
    setSchedule(updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Maternal & Child Immunization</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">National Immunization Schedule (Govt of India / PHC Gujarat)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            {schedule.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.vaccine || item.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" /> Target Age: {item.dueAge} • Date: {item.date}
                  </span>
                </div>

                <div>
                  {item.status === 'Completed' ? (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Given
                    </span>
                  ) : item.status === 'Due Today' ? (
                    <button
                      onClick={() => handleMarkGiven(idx)}
                      className="text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-full transition-all shadow-md flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" /> Mark Administered
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end">
            <button onClick={onClose} className="bg-white dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-5 py-2 rounded-xl text-xs">
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VaccinationTrackerModal;
