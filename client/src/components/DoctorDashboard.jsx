import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import PatientTimelineModal from './PatientTimelineModal';
import ReferralModal from './ReferralModal';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [patientToRefer, setPatientToRefer] = useState(null);

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-btuu.onrender.com/api';

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

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-slate-400 italic">Loading dashboard...</div>;
  }

  const getBadgeClass = (level) => {
    switch (level) {
      case 'High Risk': return 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse';
      case 'Elevated': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{t('dashboard.title')}</h2>
      
      {patients.length === 0 ? (
        <p className="text-slate-400">{t('dashboard.no_patients')}</p>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {patients.map(p => (
            <motion.div 
              key={p._id} 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-panel flex flex-col transition-shadow hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium">{p.name}, {p.age} {p.gender[0]}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeClass(p.riskLevel)}`}>
                  {p.riskLevel}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">{t('dashboard.vitals')}</p>
                <div className="flex gap-4 font-medium bg-slate-900/50 p-3 rounded-lg">
                  <div><span className="text-slate-500 text-xs block">HR</span>{p.vitals?.heartRate}</div>
                  <div><span className="text-slate-500 text-xs block">BP</span>{p.vitals?.bloodPressureSys}/{p.vitals?.bloodPressureDia}</div>
                  <div><span className="text-slate-500 text-xs block">SpO2</span>{p.vitals?.spO2}%</div>
                </div>
              </div>

              {p.symptoms && p.symptoms.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">{t('dashboard.symptoms')}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.symptoms.map((sym, idx) => (
                      <span key={idx} className="bg-white/10 px-3 py-1 rounded-full text-xs">{sym}</span>
                    ))}
                  </div>
                </div>
              )}

              {p.flaggedConditions && p.flaggedConditions.length > 0 && (
                <div className="mb-4 mt-2">
                  <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <span>⚠️</span> {t('dashboard.flags')} {p.flaggedConditions.join(', ')}
                  </p>
                </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                <span className="text-xs text-slate-500">{t('dashboard.arrived')} {new Date(p.createdAt).toLocaleTimeString()}</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setPatientToRefer(p);
                      setIsReferralOpen(true);
                    }}
                    className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 py-2.5 rounded-xl font-medium transition-colors border border-amber-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={16} />
                    Refer
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsTimelineOpen(true);
                    }}
                    className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-[var(--color-primary)]/20 text-sm"
                  >
                    {t('dashboard.consult')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedPatient && (
        <PatientTimelineModal 
          isOpen={isTimelineOpen} 
          onClose={() => setIsTimelineOpen(false)} 
          patient={selectedPatient} 
        />
      )}

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        patient={patientToRefer}
      />
    </div>
  );
};

export default DoctorDashboard;
