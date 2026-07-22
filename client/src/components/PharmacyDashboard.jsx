import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Search, CheckCircle2, AlertCircle } from 'lucide-react';

const PharmacyDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const prescriptions = [
    { id: 'RX-8842', patient: 'Ramesh Bhai', age: 45, doctor: 'Dr. Sharma', meds: ['Paracetamol 500mg (1-0-1)', 'Amoxicillin 250mg (1-1-1)'], status: 'Pending' },
    { id: 'RX-8843', patient: 'Sita Ben', age: 32, doctor: 'Dr. Patel', meds: ['Atorvastatin 20mg (0-0-1)'], status: 'Dispensed' },
    { id: 'RX-8844', patient: 'Amit Kumar', age: 28, doctor: 'Dr. Sharma', meds: ['Cetirizine 10mg (0-0-1)'], status: 'Pending' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-[var(--color-primary)] bg-clip-text text-transparent flex items-center gap-2">
            <Pill className="text-blue-400" /> Pharmacy Dispensary
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review prescriptions and manage inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prescriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Prescription ID or Patient Name..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {prescriptions.map((rx, i) => (
              <motion.div key={i} whileHover={{ scale: 1.01 }} className="glass-panel bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{rx.id}</span>
                    <h3 className="text-lg font-medium text-white">{rx.patient} <span className="text-sm text-slate-400 font-normal">({rx.age}y)</span></h3>
                  </div>
                  <div className="text-sm text-slate-400 mb-3">Prescribed by {rx.doctor}</div>
                  
                  <div className="space-y-2">
                    {rx.meds.map((med, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                        {med}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col justify-end items-start sm:items-end gap-3 min-w-[120px]">
                  {rx.status === 'Pending' ? (
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Dispense
                    </button>
                  ) : (
                    <div className="text-[var(--color-secondary)] text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Dispensed
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Inventory Alerts */}
        <div className="space-y-4">
          <div className="glass-panel p-5 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-amber-400 w-5 h-5" /> Low Inventory Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
                <div>
                  <div className="text-sm font-medium text-white">Amoxicillin 250mg</div>
                  <div className="text-xs text-red-400">Critical: 15 strips left</div>
                </div>
                <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors">Reorder</button>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-amber-500/20">
                <div>
                  <div className="text-sm font-medium text-white">Paracetamol 500mg</div>
                  <div className="text-xs text-amber-400">Low: 40 strips left</div>
                </div>
                <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors">Reorder</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PharmacyDashboard;
