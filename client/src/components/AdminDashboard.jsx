import React from 'react';
import { motion } from 'framer-motion';
import { Building, TrendingUp, Users, Activity, MapPin, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BedManagement from './BedManagement';

const AdminDashboard = () => {
  const handleExportPDF = () => {
    window.print();
  };

  const diseaseData = [
    { name: 'Jan', Dengue: 4000, Malaria: 2400, Typhoid: 2400 },
    { name: 'Feb', Dengue: 3000, Malaria: 1398, Typhoid: 2210 },
    { name: 'Mar', Dengue: 2000, Malaria: 9800, Typhoid: 2290 },
    { name: 'Apr', Dengue: 2780, Malaria: 3908, Typhoid: 2000 },
    { name: 'May', Dengue: 1890, Malaria: 4800, Typhoid: 2181 },
    { name: 'Jun', Dengue: 2390, Malaria: 3800, Typhoid: 2500 },
  ];

  const districtData = [
    { name: 'Ahmedabad', cases: 1400 },
    { name: 'Surat', cases: 1200 },
    { name: 'Vadodara', cases: 900 },
    { name: 'Rajkot', cases: 850 },
    { name: 'Bhavnagar', cases: 600 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
            <Building className="text-slate-300" /> Admin & Health Officer Portal
          </h2>
          <p className="text-slate-400 text-sm mt-1">High-level district analytics and facility management</p>
        </div>
        <div className="flex gap-4 items-center">
          <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-primary)]">
            <option>Ahmedabad District</option>
            <option>Surat District</option>
            <option>Vadodara District</option>
            <option>Rajkot District</option>
          </select>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <Users className="w-24 h-24" />
          </div>
          <div className="text-slate-400 text-sm mb-1">Total Patients (Today)</div>
          <div className="text-3xl font-bold text-white mb-2">1,284</div>
          <div className="text-xs text-[var(--color-secondary)] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% from yesterday</div>
        </div>
        
        <div className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <Activity className="w-24 h-24" />
          </div>
          <div className="text-slate-400 text-sm mb-1">Critical Cases</div>
          <div className="text-3xl font-bold text-rose-400 mb-2">42</div>
          <div className="text-xs text-rose-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5% from yesterday</div>
        </div>

        <div className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <Building className="w-24 h-24" />
          </div>
          <div className="text-slate-400 text-sm mb-1">Bed Occupancy</div>
          <div className="text-3xl font-bold text-white mb-2">86%</div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '86%' }}></div>
          </div>
        </div>

        <div className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <MapPin className="w-24 h-24" />
          </div>
          <div className="text-slate-400 text-sm mb-1">Active PHCs</div>
          <div className="text-3xl font-bold text-blue-400 mb-2">24 / 24</div>
          <div className="text-xs text-[var(--color-secondary)] flex items-center gap-1">All systems operational</div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Disease Trends (Gujarat)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                <Line type="monotone" dataKey="Dengue" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Malaria" stroke="#07a9b0" strokeWidth={2} />
                <Line type="monotone" dataKey="Typhoid" stroke="#82d8a5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">High-Risk Cases by District</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="cases" fill="#82d8a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <BedManagement />

    </motion.div>
  );
};

export default AdminDashboard;
