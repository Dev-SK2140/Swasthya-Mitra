import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Droplets, Users, CheckCircle, Clock, X, ClipboardList, Bed, Pill, BookOpen, Stethoscope, FilePlus, Bandage, FileSignature, ShieldCheck, Map } from 'lucide-react';
import { FeatureHub } from './FeatureHub';

const NurseDashboard = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({ heartRate: '', bloodPressureSys: '', bloodPressureDia: '', spO2: '', temp: '98.6' });

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/triage`);
        const data = await res.json();
        if(Array.isArray(data)) {
          setPatients(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const nurseFeatures = [
    { title: "Vitals Entry", description: "Quickly record patient vitals during rounds.", icon: Thermometer, colorClass: "from-blue-500 to-cyan-500" },
    { title: "Bed Management", description: "View and allocate ward beds dynamically.", icon: Bed, colorClass: "from-indigo-500 to-blue-600" },
    { title: "MAR System", description: "Medication Administration Record and tracking.", icon: Pill, colorClass: "from-teal-500 to-emerald-600" },
    { title: "Shift Handover", description: "Digital handover notes for incoming nursing staff.", icon: ClipboardList, colorClass: "from-amber-500 to-orange-500" },
    { title: "Sample Collection", description: "Track blood and fluid sample collections.", icon: Droplets, colorClass: "from-red-500 to-rose-600" },
    { title: "Ward Supply", description: "Request pharmacy or general supplies to the ward.", icon: BookOpen, colorClass: "from-purple-500 to-fuchsia-600" },
    { title: "Wound Care", description: "Upload images and logs for wound dressing changes.", icon: Bandage, colorClass: "from-rose-400 to-pink-500" },
    { title: "Discharge Summary", description: "Prepare preliminary discharge notes for doctor approval.", icon: FileSignature, colorClass: "from-cyan-500 to-blue-500" },
    { title: "Triage Questionnaire", description: "Run initial triage assessment for new admissions.", icon: Stethoscope, colorClass: "from-emerald-500 to-green-600" },
    { title: "Immunization Log", description: "Record newborn and child vaccinations.", icon: ShieldCheck, colorClass: "from-violet-500 to-purple-500" },
  ];

  const handleToggleIV = async (id) => {
    try {
      const res = await fetch(`${API_URL}/triage/${id}/iv`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setPatients(patients.map(p => p._id === id ? updated : p));
      }
    } catch (err) {
      console.error('Failed to toggle IV', err);
    }
  };

  const openVitalsModal = (patient) => {
    setSelectedPatient(patient);
    setVitalsForm({
      heartRate: patient.vitals?.heartRate || '',
      bloodPressureSys: patient.vitals?.bloodPressureSys || '',
      bloodPressureDia: patient.vitals?.bloodPressureDia || '',
      spO2: patient.vitals?.spO2 || '',
      temp: '98.6'
    });
    setIsVitalsModalOpen(true);
  };

  const handleUpdateVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const res = await fetch(`${API_URL}/triage/${selectedPatient._id}/vitals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vitals: vitalsForm })
      });
      if (res.ok) {
        const updated = await res.json();
        setPatients(patients.map(p => p._id === selectedPatient._id ? updated : p));
        setIsVitalsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update vitals', err);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500 dark:text-slate-400 animate-pulse">{t('dashboard.nurse_loading')}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-[var(--color-secondary)] to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="text-teal-700 dark:text-[var(--color-secondary)]" /> {t('dashboard.nurse_station')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('dashboard.nurse_subtitle')}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-panel py-2 px-4 flex items-center gap-3 bg-white/80 dark:bg-slate-800/80">
            <Users className="text-blue-400 w-5 h-5" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.in_queue')}</div>
              <div className="font-bold">{patients.length}</div>
            </div>
          </div>
          <div className="glass-panel py-2 px-4 flex items-center gap-3 bg-white/80 dark:bg-slate-800/80">
            <CheckCircle className="text-teal-700 dark:text-[var(--color-secondary)] w-5 h-5" />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.vitals_recorded')}</div>
              <div className="font-bold">{patients.filter(p => p.vitals?.heartRate).length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {patients.map(p => (
          <motion.div 
            key={p._id} 
            whileHover={{ scale: 1.02 }}
            className="glass-panel relative overflow-hidden bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50 hover:border-[var(--color-secondary)]/50 transition-colors flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-secondary)]"></div>
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{p.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{p.age} {t('dashboard.years')} • {p.gender}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    🛏️ {t('dashboard.ward_bed')}{Math.floor(10 + Math.random() * 20)}
                  </span>
                </div>
              </div>

              {/* NEWS2 Early Warning Score Indicator */}
              <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🟢 {t('dashboard.news2_score')}{p.riskLevel === 'High Risk' ? t('dashboard.high_critical') : t('dashboard.stable_normal')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.o2_flow')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Heart className="text-rose-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.heart_rate')}</div>
                    <div className="font-semibold">{p.vitals?.heartRate || '--'} <span className="text-[10px] font-normal text-slate-500">bpm</span></div>
                  </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Activity className="text-blue-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.blood_pressure')}</div>
                    <div className="font-semibold">{p.vitals?.bloodPressureSys || '--'}/{p.vitals?.bloodPressureDia || '--'}</div>
                  </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Droplets className="text-cyan-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.spo2')}</div>
                    <div className="font-semibold">{p.vitals?.spO2 || '--'} <span className="text-[10px] font-normal text-slate-500">%</span></div>
                  </div>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                  <Thermometer className="text-orange-400 w-5 h-5" />
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.temp')}</div>
                    <div className="font-semibold">98.6 <span className="text-[10px] font-normal text-slate-500">°F</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => handleToggleIV(p._id)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${p.ivDrip ? 'bg-teal-500/20 text-teal-400 border-teal-500/50' : 'bg-white dark:bg-slate-800 hover:bg-slate-700 text-teal-300 border-slate-300 dark:border-slate-700'}`}>
                💧 {p.ivDrip ? t('dashboard.iv_drip') + ' (Active)' : t('dashboard.iv_drip')}
              </button>
              <button 
                onClick={() => openVitalsModal(p)}
                className="py-2 bg-slate-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors">
                ✏️ {t('dashboard.update_vitals')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vitals Update Modal */}
      {isVitalsModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="text-teal-500 w-5 h-5" /> Update Vitals for {selectedPatient.name}
              </h3>
              <button onClick={() => setIsVitalsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateVitals} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Heart Rate (bpm)</label>
                  <input type="number" required value={vitalsForm.heartRate} onChange={e => setVitalsForm({...vitalsForm, heartRate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SpO2 (%)</label>
                  <input type="number" required value={vitalsForm.spO2} onChange={e => setVitalsForm({...vitalsForm, spO2: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">BP Systolic</label>
                  <input type="number" required value={vitalsForm.bloodPressureSys} onChange={e => setVitalsForm({...vitalsForm, bloodPressureSys: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">BP Diastolic</label>
                  <input type="number" required value={vitalsForm.bloodPressureDia} onChange={e => setVitalsForm({...vitalsForm, bloodPressureDia: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-teal-500 text-sm" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsVitalsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">Save Vitals</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Feature Hub - 10 Workable Features */}
      <FeatureHub title="Nurse Station Features" features={nurseFeatures} />

    </motion.div>
  );
};

export default NurseDashboard;
