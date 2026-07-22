import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, FileText, Upload, AlertTriangle, Check, Search } from 'lucide-react';

const LabDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingTests = [
    { id: 'REQ-001', patient: 'Ramesh Bhai', age: 45, test: 'Complete Blood Count (CBC)', doctor: 'Dr. Sharma', priority: 'High', date: 'Just now' },
    { id: 'REQ-002', patient: 'Sita Ben', age: 32, test: 'Lipid Profile', doctor: 'Dr. Patel', priority: 'Normal', date: '10 mins ago' },
    { id: 'REQ-003', patient: 'Amit Kumar', age: 28, test: 'HbA1c', doctor: 'Dr. Sharma', priority: 'Normal', date: '1 hour ago' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <TestTube className="text-purple-400" /> Laboratory Interface
          </h2>
          <p className="text-slate-400 text-sm mt-1">Process test requests and upload results</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-700/50 pb-px mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'pending' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Pending Requests ({pendingTests.length})
          {activeTab === 'pending' && <motion.div layoutId="labTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400" />}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'completed' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Completed Results
          {activeTab === 'completed' && <motion.div layoutId="labTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400" />}
        </button>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden glass-panel p-0">
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/30">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patient or ID..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--color-primary-hover)] transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-medium">Request ID</th>
                <th className="p-4 font-medium">Patient Details</th>
                <th className="p-4 font-medium">Test Required</th>
                <th className="p-4 font-medium">Referred By</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {pendingTests.map((test, i) => (
                <tr key={i} className="hover:bg-slate-800/60 transition-colors group">
                  <td className="p-4 text-sm text-slate-300 font-mono">{test.id}</td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-white">{test.patient}</div>
                    <div className="text-xs text-slate-400">{test.age} yrs • {test.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                      <FileText className="w-4 h-4" /> {test.test}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{test.doctor}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${test.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-slate-700 text-slate-300'}`}>
                      {test.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="flex items-center gap-2 bg-[var(--color-primary-hover)] hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      <Upload className="w-4 h-4" /> Upload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LabDashboard;
