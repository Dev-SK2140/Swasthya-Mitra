import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, TrendingUp, Users, Activity, MapPin, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Responsive, WidthProvider } from "react-grid-layout";
import BedManagement from './BedManagement';
import './AdminDashboard.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout configuration for the dashboard
  const defaultLayout = [
    { i: "card-users", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "card-critical", x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "card-beds", x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "card-phcs", x: 3, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "chart-disease", x: 0, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "chart-district", x: 2, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "bed-management", x: 0, y: 3, w: 4, h: 3, minW: 2, minH: 2 },
  ];

  const getSavedLayout = () => {
    const saved = localStorage.getItem('adminDashboardLayout');
    return saved ? JSON.parse(saved) : { lg: defaultLayout };
  };

  const [layouts, setLayouts] = useState(getSavedLayout());

  const onLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
    localStorage.setItem('adminDashboardLayout', JSON.stringify(layouts));
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/triage`);
        const data = await res.json();
        if(Array.isArray(data)) {
          setPatients(data);
        }
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  // Dynamic Data Calculation
  const totalPatients = patients.length;
  const criticalCases = patients.filter(p => p.riskLevel === 'High Risk' || p.riskLevel === 'Emergency').length;
  
  // Aggregate mock trend data with real data to show a dynamic chart
  const diseaseData = [
    { name: 'Jan', Dengue: 4000, Malaria: 2400, Typhoid: 2400 },
    { name: 'Feb', Dengue: 3000, Malaria: 1398, Typhoid: 2210 },
    { name: 'Mar', Dengue: 2000, Malaria: 9800, Typhoid: 2290 },
    { name: 'Apr', Dengue: 2780, Malaria: 3908, Typhoid: 2000 },
    { name: 'May', Dengue: 1890, Malaria: 4800, Typhoid: 2181 },
    { name: 'Current', Dengue: 2390 + (patients.filter(p => p.symptoms?.includes('fever')).length * 10), Malaria: 3800, Typhoid: 2500 },
  ];

  const districtData = [
    { name: 'Ahmedabad', cases: 1400 + totalPatients },
    { name: 'Surat', cases: 1200 },
    { name: 'Vadodara', cases: 900 },
    { name: 'Rajkot', cases: 850 },
    { name: 'Bhavnagar', cases: 600 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
            <Building className="text-slate-300" /> Admin & Health Officer Portal
          </h2>
          <p className="text-slate-400 text-sm mt-1">Drag and drop cards to organize your dashboard</p>
        </div>
        <div className="flex gap-4 items-center">
          <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-primary)]">
            <option>Ahmedabad District</option>
            <option>Surat District</option>
            <option>Vadodara District</option>
            <option>Rajkot District</option>
          </select>
          <button 
            onClick={() => setLayouts({ lg: defaultLayout })}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg"
          >
            Reset Layout
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={140}
        onLayoutChange={onLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".drag-handle"
      >
        <div key="card-users" className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title="Drag to move"></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-400 text-sm mb-1">Total Patients (Live)</div>
            <div className="text-3xl font-bold text-white mb-2">{totalPatients}</div>
            <div className="text-xs text-[var(--color-secondary)] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Updated in real-time</div>
          </div>
        </div>
        
        <div key="card-critical" className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title="Drag to move"></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Activity className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-400 text-sm mb-1">Critical Cases (Live)</div>
            <div className="text-3xl font-bold text-rose-400 mb-2">{criticalCases}</div>
            <div className="text-xs text-rose-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Needs attention</div>
          </div>
        </div>

        <div key="card-beds" className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title="Drag to move"></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Building className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-400 text-sm mb-1">Bed Occupancy</div>
            <div className="text-3xl font-bold text-white mb-2">86%</div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '86%' }}></div>
            </div>
          </div>
        </div>

        <div key="card-phcs" className="glass-panel p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title="Drag to move"></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <MapPin className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-400 text-sm mb-1">Active PHCs</div>
            <div className="text-3xl font-bold text-blue-400 mb-2">24 / 24</div>
            <div className="text-xs text-[var(--color-secondary)] flex items-center gap-1">All systems operational</div>
          </div>
        </div>

        <div key="chart-disease" className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex flex-col">
          <div className="drag-handle flex-1 absolute inset-0 cursor-grab active:cursor-grabbing z-0" title="Drag to move"></div>
          <h3 className="text-lg font-bold text-white mb-4 relative z-10 pointer-events-none">Disease Trends (Gujarat)</h3>
          <div className="flex-1 w-full relative z-10 pointer-events-none">
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
        
        <div key="chart-district" className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex flex-col">
          <div className="drag-handle flex-1 absolute inset-0 cursor-grab active:cursor-grabbing z-0" title="Drag to move"></div>
          <h3 className="text-lg font-bold text-white mb-4 relative z-10 pointer-events-none">High-Risk Cases by District</h3>
          <div className="flex-1 w-full relative z-10 pointer-events-none">
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

        <div key="bed-management" className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-auto">
          <div className="drag-handle h-8 w-full cursor-grab active:cursor-grabbing absolute top-0 left-0 bg-slate-700/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 text-xs text-white">Drag to move</div>
          <div className="mt-4 relative z-0">
            <BedManagement />
          </div>
        </div>
      </ResponsiveGridLayout>

    </motion.div>
  );
};

export default AdminDashboard;
