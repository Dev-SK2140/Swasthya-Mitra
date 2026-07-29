import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Pill, Search, CheckCircle2, AlertCircle, RefreshCw, ClipboardList, ShieldAlert, CalendarClock, ArrowRightLeft, ShoppingCart, History, Lock, RotateCcw, TrendingUp } from 'lucide-react';
import { FeatureHub } from './FeatureHub';

const PharmacyDashboard = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rxLoading, setRxLoading] = useState(true);
  const [pmbjpSearch, setPmbjpSearch] = useState('');
  
  const PMBJP_DB = [
    { brand: 'Dolo 650', generic: 'Paracetamol 650mg', price: '₹10', vs: '₹34' },
    { brand: 'Augmentin 625', generic: 'Amoxicillin + Clavulanic Acid', price: '₹45', vs: '₹160' },
    { brand: 'Pan 40', generic: 'Pantoprazole 40mg', price: '₹12', vs: '₹95' },
    { brand: 'Calpol', generic: 'Paracetamol Syrup', price: '₹15', vs: '₹40' }
  ];

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/inventory`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInventory(data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setRxLoading(true);
      const res = await fetch(`${API_URL}/prescriptions`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPrescriptions(data);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setRxLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchPrescriptions();
    const interval = setInterval(fetchPrescriptions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDispense = async (id) => {
    try {
      const res = await fetch(`${API_URL}/prescriptions/${id}/dispense`, {
        method: 'PUT'
      });
      if (res.ok) {
        setPrescriptions(prescriptions.map(rx => rx._id === id ? { ...rx, status: 'Dispensed' } : rx));
      }
    } catch (err) {
      console.error('Failed to dispense:', err);
    }
  };

  const handleOrderStock = async (id, quantity = 100) => {
    try {
      const res = await fetch(`${API_URL}/inventory/${id}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderQuantity: quantity })
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setInventory(inventory.map(item => item._id === id ? updatedItem : item));
      }
    } catch (err) {
      console.error('Failed to order stock:', err);
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rx._id?.includes(searchQuery)
  );

  const criticalStock = inventory.filter(item => item.quantity <= item.threshold / 2);
  const lowStock = inventory.filter(item => item.quantity <= item.threshold && item.quantity > item.threshold / 2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-[var(--color-primary)] bg-clip-text text-transparent flex items-center gap-2">
            <Pill className="text-blue-400" /> {t('dashboard.pharmacy_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('dashboard.pharmacy_subtitle')}</p>
        </div>
        <button 
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('dashboard.sync_inventory')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prescriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder={t('dashboard.search_rx_placeholder')}
              className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {rxLoading && prescriptions.length === 0 ? (
              <div className="text-center p-8 text-slate-500">{t('dashboard.loading')}</div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No prescriptions found.</div>
            ) : filteredPrescriptions.map((rx, i) => (
              <motion.div key={rx._id || i} whileHover={{ scale: 1.01 }} className="glass-panel bg-slate-800/40 p-5 rounded-xl border border-slate-300/50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded" title={rx._id}>RX-{rx._id?.slice(-4).toUpperCase()}</span>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">{rx.patientName}</h3>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('dashboard.prescribed_by')} {rx.doctorId || 'Doctor'}</div>
                  
                  <div className="space-y-2">
                    {rx.medicines && rx.medicines.map((med, idx) => {
                      const medNameMatch = med.name.split(' ')[0];
                      const inStock = inventory.some(item => item.name.includes(medNameMatch) && item.quantity > 0);
                      
                      return (
                        <div key={idx} className="flex items-start justify-between gap-2 text-sm text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'} shrink-0`}></div>
                            <span><strong className="block">{med.name}</strong><span className="text-xs text-slate-500">{med.dose} • {med.duration}</span></span>
                          </div>
                          {!loading && (
                            <span className={`text-xs font-bold ${inStock ? 'text-emerald-500' : 'text-red-500'}`}>
                              {inStock ? t('dashboard.in_stock') : t('dashboard.out_of_stock')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex flex-col justify-end items-start sm:items-end gap-3 min-w-[120px]">
                  {rx.status === 'Pending' ? (
                    <button onClick={() => handleDispense(rx._id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {t('dashboard.dispense')}
                    </button>
                  ) : (
                    <div className="text-teal-700 dark:text-[var(--color-secondary)] text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {t('dashboard.dispensed')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Inventory & Jan Aushadhi Generic Substitutes */}
        <div className="space-y-4">
          
          <div className="glass-panel p-5 bg-white/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 rounded-xl">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-amber-400 w-5 h-5" /> {t('dashboard.live_inventory')}
            </h3>
            
            {loading ? (
              <div className="text-sm text-slate-500 animate-pulse text-center p-4">{t('dashboard.loading_inventory')}</div>
            ) : inventory.length === 0 ? (
              <div className="text-sm text-slate-500 text-center p-4">{t('dashboard.no_inventory')}</div>
            ) : (
              <div className="space-y-3">
                {criticalStock.map(item => (
                  <div key={item._id} className="flex justify-between items-center p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-500/30">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-xs font-semibold text-red-500 flex items-center gap-1">
                        {t('dashboard.critical')} {item.quantity} {item.unit} {t('dashboard.left')} <span className="text-slate-400 font-normal ml-2">{t('dashboard.exp')} {new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleOrderStock(item._id, item.threshold * 2)} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors font-bold whitespace-nowrap">{t('dashboard.auto_reorder')}</button>
                  </div>
                ))}

                {lowStock.map(item => (
                  <div key={item._id} className="flex justify-between items-center p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-500/30">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                        {t('dashboard.low_stock')} {item.quantity} {item.unit} <span className="text-slate-400 font-normal ml-2">{t('dashboard.thr')} {item.threshold}</span>
                      </div>
                    </div>
                    <button onClick={() => handleOrderStock(item._id, 50)} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors font-bold whitespace-nowrap">{t('dashboard.order')}</button>
                  </div>
                ))}
                
                {criticalStock.length === 0 && lowStock.length === 0 && (
                   <div className="text-sm text-emerald-500 font-medium text-center p-4 border border-emerald-500/20 rounded-lg bg-emerald-500/5">
                     {t('dashboard.stock_sufficient')}
                   </div>
                )}
              </div>
            )}
          </div>

          {/* PMBJP Jan Aushadhi Generic Substitutes */}
          <div className="glass-panel p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                🇮🇳 {t('dashboard.pmbjp_finder')}
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {t('dashboard.savings_80')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('dashboard.pmbjp_desc')}
            </p>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search brand medicine..."
                value={pmbjpSearch}
                onChange={e => setPmbjpSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>
            <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-1">
              {PMBJP_DB.filter(med => med.brand.toLowerCase().includes(pmbjpSearch.toLowerCase())).map((med, idx) => (
                <div key={idx} className="p-2 bg-slate-50/10 dark:bg-slate-900/80 rounded-lg border border-slate-200/20 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold block">Brand: {med.brand}</span>
                    <span className="text-emerald-400 font-semibold">Jan Aushadhi: {med.generic}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{med.price} (vs {med.vs})</span>
                </div>
              ))}
              {PMBJP_DB.filter(med => med.brand.toLowerCase().includes(pmbjpSearch.toLowerCase())).length === 0 && (
                <div className="text-center text-slate-500 py-2">No substitutes found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Hub - 10 Workable Features */}
      <FeatureHub title="Pharmacy Management Systems" features={pharmacyFeatures} />

    </motion.div>
  );
};

export default PharmacyDashboard;
