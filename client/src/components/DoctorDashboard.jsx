import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await fetch('https://swasthya-mitra-btuu.onrender.com/api/triage');
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
      default: return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{t('dashboard.title')}</h2>
      
      {patients.length === 0 ? (
        <p className="text-slate-400">{t('dashboard.no_patients')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(p => (
            <div key={p._id} className="glass-panel flex flex-col hover:-translate-y-1 transition-transform">
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
              
              <div className="mt-auto pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                {t('dashboard.arrived')} {new Date(p.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
