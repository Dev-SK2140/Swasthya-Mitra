import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, Pill, Siren, FileText, MessageSquare, Mic, ShieldCheck, CreditCard, MapPin, ShieldAlert, Navigation } from 'lucide-react';
import PatientTimelineModal from './PatientTimelineModal';
import ReferralModal from './ReferralModal';
import PrescriptionModal from './PrescriptionModal';
import EmergencyAlertModal from './EmergencyAlertModal';
import ReportScannerModal from './ReportScannerModal';
import SMSAlertModal from './SMSAlertModal';
import VoiceIntakeModal from './VoiceIntakeModal';
import VaccinationTrackerModal from './VaccinationTrackerModal';
import AbhaCardModal from './AbhaCardModal';
import AshaSurveyModal from './AshaSurveyModal';
import DrugSafetyModal from './DrugSafetyModal';
import AmbulanceTrackerModal from './AmbulanceTrackerModal';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [patientToRefer, setPatientToRefer] = useState(null);

  // New Modals State
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [patientToPrescribe, setPatientToPrescribe] = useState(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [patientForEmergency, setPatientForEmergency] = useState(null);
  const [isReportScannerOpen, setIsReportScannerOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);
  const [patientForSMS, setPatientForSMS] = useState(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVaccineOpen, setIsVaccineOpen] = useState(false);
  const [isAbhaOpen, setIsAbhaOpen] = useState(false);
  const [patientForAbha, setPatientForAbha] = useState(null);
  const [isAshaOpen, setIsAshaOpen] = useState(false);
  const [isDrugSafetyOpen, setIsDrugSafetyOpen] = useState(false);
  const [isAmbulanceOpen, setIsAmbulanceOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/triage`);
      const data = await res.json();
      if (Array.isArray(data)) {
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
    return <div className="text-center p-8 text-slate-500 dark:text-slate-400 italic">{t('dashboard.loading')}</div>;
  }

  const getBadgeClass = (level) => {
    switch (level) {
      case 'High Risk': return 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse';
      case 'Elevated': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-[var(--color-secondary)]/20 text-teal-700 dark:text-[var(--color-secondary)] border border-[var(--color-secondary)]/30';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{t('dashboard.title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.doctor_subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDrugSafetyOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <ShieldAlert className="w-4 h-4" /> {t('dashboard.drug_safety')}
          </button>
          <button
            onClick={() => setIsAmbulanceOpen(true)}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Navigation className="w-4 h-4" /> {t('dashboard.ambulance')}
          </button>
          <button
            onClick={() => setIsAshaOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <MapPin className="w-4 h-4" /> {t('dashboard.asha_survey')}
          </button>
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="flex items-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Mic className="w-4 h-4" /> {t('dashboard.voice_triage')}
          </button>
          <button
            onClick={() => setIsVaccineOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> {t('dashboard.vaccines')}
          </button>
          <button
            onClick={() => setIsReportScannerOpen(true)}
            className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <FileText className="w-4 h-4" /> {t('dashboard.scan_lab')}
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
            {t('dashboard.live_queue')}{patients.length}{t('dashboard.patients_count')}
          </span>
        </div>
      </div>

      {patients.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">{t('dashboard.no_patients')}</p>
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
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('dashboard.vitals')}</p>
                <div className="flex gap-4 font-medium bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg">
                  <div><span className="text-slate-500 text-xs block">HR</span>{p.vitals?.heartRate}</div>
                  <div><span className="text-slate-500 text-xs block">BP</span>{p.vitals?.bloodPressureSys}/{p.vitals?.bloodPressureDia}</div>
                  <div><span className="text-slate-500 text-xs block">SpO2</span>{p.vitals?.spO2}%</div>
                </div>
              </div>

              {p.symptoms && p.symptoms.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('dashboard.symptoms')}</p>
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
                    <AlertTriangle className="w-4 h-4" /> {t('dashboard.flags')} {p.flaggedConditions.join(', ')}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-slate-300/50 dark:border-slate-700/50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{t('dashboard.arrived')} {new Date(p.createdAt).toLocaleTimeString()}</span>

                  <div className="flex gap-1.5">
                    {/* Digital ABHA Card */}
                    <button
                      onClick={() => {
                        setPatientForAbha(p);
                        setIsAbhaOpen(true);
                      }}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2 py-1 rounded-lg transition-colors"
                      title="Digital ABHA Health Card"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> ABHA
                    </button>

                    {/* SMS / WhatsApp Reminder */}
                    <button
                      onClick={() => {
                        setPatientForSMS(p);
                        setIsSMSOpen(true);
                      }}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-lg transition-colors"
                      title="Send WhatsApp / SMS Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> SMS
                    </button>

                    {/* Red Alert Broadcast Trigger Button */}
                    <button
                      onClick={() => {
                        setPatientForEmergency(p);
                        setIsEmergencyOpen(true);
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Siren className="w-3.5 h-3.5" /> Alert
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setPatientToPrescribe(p);
                      setIsRxOpen(true);
                    }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-xl font-medium transition-colors border border-emerald-500/20 flex items-center justify-center gap-1 text-xs"
                  >
                    <Pill size={14} />
                    AI Rx
                  </button>
                  <button
                    onClick={() => {
                      setPatientToRefer(p);
                      setIsReferralOpen(true);
                    }}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 py-2 rounded-xl font-medium transition-colors border border-amber-500/20 flex items-center justify-center gap-1 text-xs"
                  >
                    <Send size={14} />
                    Refer
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsTimelineOpen(true);
                    }}
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-2 rounded-xl font-medium transition-colors shadow-lg shadow-[var(--color-primary)]/20 text-xs"
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

      <PrescriptionModal
        isOpen={isRxOpen}
        onClose={() => setIsRxOpen(false)}
        patient={patientToPrescribe}
      />

      <EmergencyAlertModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        patient={patientForEmergency}
      />

      <ReportScannerModal
        isOpen={isReportScannerOpen}
        onClose={() => setIsReportScannerOpen(false)}
      />

      <SMSAlertModal
        isOpen={isSMSOpen}
        onClose={() => setIsSMSOpen(false)}
        patient={patientForSMS}
      />

      <VoiceIntakeModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <VaccinationTrackerModal
        isOpen={isVaccineOpen}
        onClose={() => setIsVaccineOpen(false)}
      />

      <AbhaCardModal
        isOpen={isAbhaOpen}
        onClose={() => setIsAbhaOpen(false)}
        patient={patientForAbha}
      />

      <AshaSurveyModal
        isOpen={isAshaOpen}
        onClose={() => setIsAshaOpen(false)}
      />

      <DrugSafetyModal
        isOpen={isDrugSafetyOpen}
        onClose={() => setIsDrugSafetyOpen(false)}
      />

      <AmbulanceTrackerModal
        isOpen={isAmbulanceOpen}
        onClose={() => setIsAmbulanceOpen(false)}
      />
    </div>
  );
};

export default DoctorDashboard;
