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

        <div className="space-y-6">
          <div className="glass-panel p-5 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Calendar className="text-blue-400 w-5 h-5" /> Today's Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-white">42</div>
                <div className="text-xs text-slate-400 mt-1">Registered</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-[var(--color-secondary)]">12</div>
                <div className="text-xs text-slate-400 mt-1">Waiting</div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Phone className="text-green-400 w-5 h-5" /> Quick Contacts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-300">Ambulance</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">108</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span className="text-slate-300">Police</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">100</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Duty Doctor</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-1 rounded">Ext 201</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReceptionistDashboard;
