import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building, TrendingUp, Users, Activity, MapPin, Download, ShieldCheck, PieChart, AlertTriangle, MessageSquare, ClipboardCheck, Briefcase, FileText } from 'lucide-react';
import { FeatureHub } from './FeatureHub';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import BedManagement from './BedManagement';
import './AdminDashboard.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    patients: { total: 0, highRisk: 0 },
    mch: { total: 0, highRisk: 0 },
    beds: { total: 0, occupied: 0, critical: 0 },
    referrals: { active: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Layout configuration for the dashboard
  const defaultLayout = [
    { i: "card-users", x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "card-critical", x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "card-beds", x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "card-phcs", x: 3, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
    { i: "chart-disease", x: 0, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "chart-district", x: 2, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "referrals-list", x: 0, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "bed-management", x: 2, y: 3, w: 2, h: 2, minW: 2, minH: 2 },
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
        
        // Fetch Real Analytics from DB
        const analyticsRes = await fetch(`${API_URL}/features/analytics`);
        const analyticsData = await analyticsRes.json();
        setStats(analyticsData);

        const referralsRes = await fetch(`${API_URL}/referrals`);
        const referralsData = await referralsRes.json();
        setReferrals(Array.isArray(referralsData) ? referralsData : []);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s instead of 10s to reduce load
    return () => clearInterval(interval);
  }, []);

  const adminFeatures = [
    { title: "Performance Metrics", description: "View hospital-wide KPI and performance data.", icon: TrendingUp, colorClass: "from-blue-500 to-cyan-500" },
    { title: "User Management", description: "Manage roles, access, and accounts for all staff.", icon: Users, colorClass: "from-indigo-500 to-blue-600" },
    { title: "Financial Overview", description: "View revenue, billing, and insurance claims.", icon: PieChart, colorClass: "from-teal-500 to-emerald-600" },
    { title: "Live Bed Map", description: "Monitor bed occupancy across all wards in real-time.", icon: Building, colorClass: "from-amber-500 to-orange-500" },
    { title: "Ambulance Dispatch", description: "Track and dispatch emergency fleet vehicles.", icon: Activity, colorClass: "from-red-500 to-rose-600" },
    { title: "Outbreak Heatmap", description: "Monitor epidemiological data across the district.", icon: MapPin, colorClass: "from-purple-500 to-fuchsia-600" },
    { title: "Inventory Alerts", description: "Check pharmacy and blood bank stock shortages.", icon: AlertTriangle, colorClass: "from-rose-400 to-pink-500" },
    { title: "Grievance Portal", description: "Review and respond to patient feedback/complaints.", icon: MessageSquare, colorClass: "from-cyan-500 to-blue-500" },
    { title: "Audit Logs", description: "View system-wide security and access audit logs.", icon: ClipboardCheck, colorClass: "from-emerald-500 to-green-600" },
    { title: "Staff Roster", description: "Manage duty hours and attendance of hospital staff.", icon: Briefcase, colorClass: "from-violet-500 to-purple-500" },
  ];

  const handleExportPDF = () => {
    window.print();
  };

  // Dynamic Data Calculation
  const totalPatients = stats.patients?.total || patients.length;
  const criticalCases = stats.patients?.highRisk || patients.filter(p => p.riskLevel === 'High Risk' || p.riskLevel === 'Emergency').length;
  
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
            <Building className="text-slate-600 dark:text-slate-300" /> {t('dashboard.admin_portal')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('dashboard.admin_subtitle')}</p>
        </div>
        <div className="flex gap-4 items-center">
          <select className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-[var(--color-primary)]">
            <option>{t('dashboard.dist_ahmedabad')}</option>
            <option>{t('dashboard.dist_surat')}</option>
            <option>{t('dashboard.dist_vadodara')}</option>
            <option>{t('dashboard.dist_rajkot')}</option>
          </select>
          <button 
            onClick={() => setLayouts({ lg: defaultLayout })}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg"
          >
            {t('dashboard.reset_layout')}
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg"
          >
            <Download className="w-4 h-4" /> {t('dashboard.export_pdf')}
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
        <div key="card-users" className="glass-panel p-5 bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title={t('dashboard.drag_to_move')}></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">{t('dashboard.total_patients')}</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{totalPatients}</div>
            <div className="text-xs text-teal-700 dark:text-[var(--color-secondary)] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {t('dashboard.updated_realtime')}</div>
          </div>
        </div>
        
        <div key="card-critical" className="glass-panel p-5 bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title={t('dashboard.drag_to_move')}></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Activity className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">{t('dashboard.critical_cases')}</div>
            <div className="text-3xl font-bold text-rose-400 mb-2">{criticalCases}</div>
            <div className="text-xs text-rose-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {t('dashboard.needs_attention')}</div>
          </div>
        </div>

        <div key="card-beds" className="glass-panel p-5 bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title={t('dashboard.drag_to_move')}></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Building className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">{t('dashboard.bed_occupancy')}</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {stats.beds?.total > 0 ? Math.round((stats.beds.occupied / stats.beds.total) * 100) : 0}%
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${stats.beds?.total > 0 ? (stats.beds.occupied / stats.beds.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div key="card-phcs" className="glass-panel p-5 bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 rounded-xl relative overflow-hidden group flex flex-col justify-center">
          <div className="drag-handle absolute inset-0 cursor-grab active:cursor-grabbing z-0" title={t('dashboard.drag_to_move')}></div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <MapPin className="w-24 h-24" />
          </div>
          <div className="relative z-10 pointer-events-none">
            <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">{t('dashboard.active_referrals')}</div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">{stats.referrals?.active || 0}</div>
            <div className="text-xs text-teal-700 dark:text-[var(--color-secondary)] flex items-center gap-1">{t('dashboard.ambulances_transfers')}</div>
          </div>
        </div>

        <div key="chart-disease" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col">
          <div className="drag-handle flex-1 absolute inset-0 cursor-grab active:cursor-grabbing z-0" title={t('dashboard.drag_to_move')}></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 relative z-10 pointer-events-none">{t('dashboard.disease_trends')}</h3>
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
        
        <div key="chart-district" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col">
          <div className="drag-handle flex-1 absolute inset-0 cursor-grab active:cursor-grabbing z-0" title={t('dashboard.drag_to_move')}></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 relative z-10 pointer-events-none">{t('dashboard.high_risk_cases')}</h3>
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

        <div key="referrals-list" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 rounded-2xl p-6 overflow-auto relative">
          <div className="drag-handle h-8 w-full cursor-grab active:cursor-grabbing absolute top-0 left-0 bg-slate-700/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 text-xs text-slate-900 dark:text-white">{t('dashboard.drag_to_move')}</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active Emergencies & Referrals</h3>
          <div className="space-y-3">
            {referrals.length === 0 ? (
              <p className="text-sm text-slate-500">No active referrals.</p>
            ) : referrals.map(ref => (
              <div key={ref._id} className={`p-3 rounded-xl border ${ref.priority === 'Critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${ref.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {ref.priority} • {ref.type}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(ref.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{ref.patientName || 'Unknown Patient'}</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">To: {ref.toFacility}</div>
                <div className="text-xs text-slate-500 mt-1">{ref.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div key="bed-management" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 rounded-2xl p-6 overflow-auto">
          <div className="drag-handle h-8 w-full cursor-grab active:cursor-grabbing absolute top-0 left-0 bg-slate-700/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 text-xs text-slate-900 dark:text-white">{t('dashboard.drag_to_move')}</div>
          <div className="mt-4 relative z-0">
            <BedManagement />
          </div>
        </div>
      </ResponsiveGridLayout>

      {/* Feature Hub - 10 Workable Features */}
      <FeatureHub title="Administrative & Management Features" features={adminFeatures} />

    </motion.div>
  );
};

export default AdminDashboard;
