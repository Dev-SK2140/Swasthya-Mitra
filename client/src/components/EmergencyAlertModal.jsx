import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Volume2, VolumeX, AlertTriangle, Send, CheckCircle2, X } from 'lucide-react';

const EmergencyAlertModal = ({ isOpen, onClose, patient }) => {
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen || !patient) return null;

  const handleTriggerAlert = () => {
    setBroadcasting(true);
    setTimeout(() => {
      setBroadcasting(false);
      setBroadcasted(true);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-900 border-2 border-red-500 rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.4)] relative"
        >
          {/* Top Red Bar */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 font-bold text-lg tracking-wider uppercase">
              <Siren className="w-6 h-6 animate-spin" /> Critical Red-Alert Broadcast
            </div>
            <button onClick={onClose} className="p-1 hover:bg-red-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-red-500/20 text-red-500 rounded-full flex items-center justify-center border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">{patient.name}</h3>
              <p className="text-sm text-red-400 font-semibold mt-1">
                Risk Classification: {patient.riskLevel || 'Emergency Case'}
              </p>
              <div className="mt-3 inline-flex gap-4 text-xs font-bold text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span>HR: {patient.vitals?.heartRate || 120} bpm</span>
                <span>BP: {patient.vitals?.bloodPressureSys || 160}/{patient.vitals?.bloodPressureDia || 100}</span>
                <span>SpO2: {patient.vitals?.spO2 || 91}%</span>
              </div>
            </div>

            {/* Status Feedback */}
            {broadcasted ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="w-6 h-6" /> Alert Broadcasted to CHC Emergency ICU & Ambulance Units!
              </div>
            ) : (
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Triggering this will broadcast an immediate high-priority audio & visual alarm to all doctors, nurses, and nearby 108 ambulance units.
              </p>
            )}

            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-xl border transition-colors flex items-center gap-2 text-xs font-semibold ${
                  soundEnabled 
                    ? 'bg-slate-800 text-white border-slate-700' 
                    : 'bg-slate-950 text-slate-500 border-slate-900'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
                {soundEnabled ? 'Alarm Sound: ON' : 'Alarm Sound: OFF'}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-slate-400 hover:text-white text-sm font-semibold">
              Cancel
            </button>
            <button
              disabled={broadcasting || broadcasted}
              onClick={handleTriggerAlert}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {broadcasting ? 'Broadcasting Siren...' : broadcasted ? 'Broadcast Sent' : 'BROADCAST EMERGENCY ALARM'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmergencyAlertModal;
