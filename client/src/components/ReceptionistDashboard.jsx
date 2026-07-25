import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Calendar, Phone } from 'lucide-react';
import AITriageFlow from './AITriageFlow';

const ReceptionistDashboard = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="text-orange-400" /> Reception & Intake
          </h2>
          <p className="text-slate-400 text-sm mt-1">Register new patients and manage appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* We reuse the existing PatientIntakeForm but wrap it nicely */}
          <div className="glass-panel bg-slate-800/40 p-0 overflow-hidden border border-slate-700/50 rounded-2xl">
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center gap-2">
              <UserPlus className="text-[var(--color-secondary)] w-5 h-5" />
              <h3 className="font-medium text-white">New Patient Registration</h3>
            </div>
            <div className="p-6">
              <AITriageFlow onPatientAdded={() => {}} />
            </div>
          </div>
        </div>

          <div className="glass-panel p-5 bg-slate-800/60 border border-slate-700/50 rounded-xl space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Calendar className="text-blue-400 w-5 h-5" /> Today's OPD Token Queue
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg text-center border border-slate-800">
                <div className="text-3xl font-bold text-white">42</div>
                <div className="text-xs text-slate-400 mt-1">Tokens Issued</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg text-center border border-slate-800">
                <div className="text-3xl font-bold text-[var(--color-secondary)]">12</div>
                <div className="text-xs text-slate-400 mt-1">Waiting OPD</div>
              </div>
            </div>
            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5">
              🎟️ Print OPD Token Slip
            </button>
          </div>

          {/* PM-JAY Ayushman Bharat Checker */}
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900 to-teal-950 border border-teal-500/30 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                🇮🇳 PM-JAY Health Coverage
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ₹5 Lakh Free
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Verify Ayushman Bharat Ration Card / ABHA Number for cashless government treatment.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Ration Card / ABHA ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
              <button className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold transition-all">
                Verify
              </button>
            </div>
          </div>

          <div className="glass-panel p-5 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Phone className="text-green-400 w-5 h-5" /> Emergency Contacts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-300">108 EMRI Ambulance</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">108</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-300">District Blood Bank</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">Ext 402</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Duty Doctor On-Call</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">Ext 201</span>
              </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
};

export default ReceptionistDashboard;
