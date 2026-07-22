import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Send, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReferralModal = ({ isOpen, onClose, patient }) => {
  const { t } = useTranslation();
  const [destination, setDestination] = useState('CHC');
  const [hospitalName, setHospitalName] = useState('');
  const [reason, setReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !patient) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-800 border border-[var(--color-primary)]/30 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(7,169,176,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Refer Patient</h3>
                <p className="text-sm text-slate-400">Generate Official Referral Letter</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Patient Info Summary */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-2">Patient Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Name</p>
                  <p className="text-white font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Age/Gender</p>
                  <p className="text-white font-medium">{patient.age} / {patient.gender}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs">Primary Symptom</p>
                  <p className="text-white font-medium">{patient.symptoms}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Refer To Level</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDestination('CHC')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${destination === 'CHC' ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  >
                    CHC
                  </button>
                  <button 
                    onClick={() => setDestination('District Hospital')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${destination === 'District Hospital' ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  >
                    District Hospital
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Hospital Name</label>
                <input 
                  type="text" 
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Civil Hospital, Ahmedabad"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Reason for Referral</label>
                <textarea 
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe why patient needs advanced care..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] resize-none"
                ></textarea>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-slate-800/50 flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !hospitalName || !reason}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Activity size={18} />
                  </motion.div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Generate Referral Letter
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReferralModal;
