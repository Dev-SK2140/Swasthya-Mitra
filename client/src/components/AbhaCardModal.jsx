import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Download, ShieldCheck, CreditCard } from 'lucide-react';

const AbhaCardModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  const abhaNumber = patient.abhaId || `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const abhaAddress = `${patient.name.toLowerCase().replace(/\s+/g, '')}@abdm`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Digital ABHA Health Card</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ayushman Bharat Digital Mission (Govt of India)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* ABHA Card Graphic Preview */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 border-2 border-teal-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Header inside Card */}
              <div className="flex justify-between items-start border-b border-teal-500/20 pb-3 mb-4">
                <div>
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest">Ayushman Bharat Health Account</div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white tracking-wide">ABHA CARD</h4>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> PM-JAY Active
                  </span>
                </div>
              </div>

              {/* Patient Info inside Card */}
              <div className="flex justify-between items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Patient Name</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{patient.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Age / Sex</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{patient.age} Yrs / {patient.gender}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Blood Group</span>
                      <span className="text-xs font-bold text-rose-400">O +ve</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-mono">ABHA Number</span>
                    <span className="text-xs font-mono font-black text-teal-300 tracking-wider">{abhaNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-mono">ABHA Address</span>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">{abhaAddress}</span>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
                  <QrCode className="w-20 h-20 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-600 font-bold mt-1 uppercase">Scan at PHC</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                <span>National Health Authority</span>
                <span>Govt of India 🇮🇳</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
              Close
            </button>
            <button 
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Download / Print ABHA Card
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AbhaCardModal;
