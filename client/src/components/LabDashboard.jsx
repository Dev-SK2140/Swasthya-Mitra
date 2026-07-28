import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TestTube, FileText, Upload, AlertTriangle, Check, Search } from 'lucide-react';

const LabDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const fetchLabOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/lab`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLabOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLabOrders();
    const interval = setInterval(fetchLabOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteTest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/lab/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: 'Test completed via Lab Dashboard.' })
      });
      if (res.ok) {
        setLabOrders(labOrders.map(order => order._id === id ? { ...order, status: 'Completed' } : order));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingTests = labOrders.filter(order => order.status === 'Pending');
  const completedTests = labOrders.filter(order => order.status === 'Completed');
  const displayedTests = activeTab === 'pending' ? pendingTests : completedTests;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <TestTube className="text-purple-400" /> {t('dashboard.lab_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('dashboard.lab_subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-300/50 dark:border-slate-700/50 pb-px mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'pending' ? 'text-purple-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}
        >
          {t('dashboard.pending_reqs')}{pendingTests.length})
          {activeTab === 'pending' && <motion.div layoutId="labTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400" />}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-4 text-sm font-medium transition-colors relative ${activeTab === 'completed' ? 'text-purple-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}
        >
          {t('dashboard.completed_results')}
          {activeTab === 'completed' && <motion.div layoutId="labTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400" />}
        </button>
      </div>

      <div className="bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 rounded-2xl overflow-hidden glass-panel p-0">
        <div className="p-4 border-b border-slate-300/50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/30">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t('dashboard.search_patient_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[var(--color-primary-hover)] transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4 font-medium">{t('dashboard.req_id')}</th>
                <th className="p-4 font-medium">{t('dashboard.patient_details')}</th>
                <th className="p-4 font-medium">{t('dashboard.test_required')}</th>
                <th className="p-4 font-medium">{t('dashboard.referred_by')}</th>
                <th className="p-4 font-medium">{t('dashboard.priority')}</th>
                <th className="p-4 font-medium">{t('dashboard.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {displayedTests.map((test, i) => (
                <tr key={test._id || i} className="hover:bg-white/60 dark:bg-slate-800/60 transition-colors group">
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">REQ-{test._id?.slice(-4).toUpperCase()}</td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{test.patientName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(test.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-[var(--color-secondary)] font-medium">
                      <FileText className="w-4 h-4" /> {test.testName}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{test.doctorId}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${test.priority === 'High' || test.priority === 'Urgent' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {test.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    {test.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleCompleteTest(test._id)} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow">
                          <Check className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-500 font-medium text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Done</span>
                    )}
                  </td>
                </tr>
              ))}
              {displayedTests.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No {activeTab} lab orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LabDashboard;
