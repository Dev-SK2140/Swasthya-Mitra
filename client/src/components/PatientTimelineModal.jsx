import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pill, Activity, Stethoscope } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

const PatientTimelineModal = ({ isOpen, onClose, patient }) => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [addingNote, setAddingNote] = React.useState(false);
  const [isOrderingLab, setIsOrderingLab] = React.useState(false);
  const [labTestName, setLabTestName] = React.useState('');

  React.useEffect(() => {
    if (isOpen && patient) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/patients/${patient._id}/history`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHistory(data.map(item => ({
              date: new Date(item.date).toLocaleDateString(),
              type: item.type.toLowerCase(),
              desc: item.notes || `Consultation by ${item.doctor}`,
              icon: item.type === 'Prescription' ? Pill : item.type === 'Lab Report' ? Activity : Stethoscope,
              color: 'text-[var(--color-primary)]',
              bg: 'bg-[var(--color-primary)]/20'
            })));
          } else {
            // Fallback for new patients without real history yet
            setHistory([
              { date: 'Today', type: 'triage', desc: `Triage complete. Risk: ${patient.riskLevel}`, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/20' }
            ]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`${API_URL}/patients/${patient._id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Consultation', doctor: 'Dr. Sharma', notes: noteText, status: 'Completed' })
      });
      if (res.ok) {
        const newRecord = await res.json();
        setHistory([{
          date: new Date(newRecord.date).toLocaleDateString(),
          type: newRecord.type.toLowerCase(),
          desc: newRecord.notes,
          icon: Stethoscope,
          color: 'text-[var(--color-primary)]',
          bg: 'bg-[var(--color-primary)]/20'
        }, ...history]);
        setNoteText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleOrderLab = async () => {
    if (!labTestName.trim()) return;
    setAddingNote(true);
    try {
      // 1. Send Lab Order
      await fetch(`${API_URL}/lab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient._id, patientName: patient.name, doctorId: 'Dr. Sharma', testName: labTestName, priority: 'Normal' })
      });
      // 2. Add History Note
      const res = await fetch(`${API_URL}/patients/${patient._id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Lab Report', doctor: 'Dr. Sharma', notes: `Ordered Lab Test: ${labTestName}`, status: 'Pending' })
      });
      if (res.ok) {
        const newRecord = await res.json();
        setHistory([{
          date: new Date(newRecord.date).toLocaleDateString(),
          type: newRecord.type.toLowerCase(),
          desc: newRecord.notes,
          icon: Activity,
          color: 'text-[var(--color-primary)]',
          bg: 'bg-[var(--color-primary)]/20'
        }, ...history]);
        setLabTestName('');
        setIsOrderingLab(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center border-b border-slate-300 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{patient.name}'s History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">UUID: {patient._id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            
            {patient.aiAnalysis && (
              <div className={`p-4 rounded-xl border ${
                patient.riskLevel === 'Emergency' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' :
                patient.riskLevel === 'High Risk' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' :
                patient.riskLevel === 'Moderate Risk' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
                'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
              }`}>
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> AI Triage Report ({patient.riskLevel})
                </h4>
                <div className="space-y-3 text-sm">
                  <div><strong className="text-slate-900 dark:text-white">Doctor Summary:</strong> {patient.aiAnalysis.doctorSummary}</div>
                  <div><strong className="text-slate-900 dark:text-white">AI Reason:</strong> {patient.aiAnalysis.explanation}</div>
                  <div><strong className="text-slate-900 dark:text-white">Possible Risks:</strong> {(patient.aiAnalysis.possibleRisks || []).join(', ')}</div>
                  <div><strong className="text-slate-900 dark:text-white">Recommendation:</strong> {patient.aiAnalysis.recommendation}</div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Patient History</h4>
              <div className="relative border-l-2 border-slate-300 dark:border-slate-700 ml-3 space-y-8">
                {loading ? (
                  <p className="text-xs text-slate-500 ml-4">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-slate-500 ml-4">No medical history found.</p>
                ) : history.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="relative pl-6"
                    >
                      <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${item.bg} flex items-center justify-center border-4 border-slate-900`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--color-primary)]">{item.date}</span>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 space-y-4">
            {!isOrderingLab ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a consultation note..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-[var(--color-primary)]"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button onClick={handleAddNote} disabled={addingNote} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {addingNote ? 'Saving...' : 'Add Note'}
                </button>
                <button onClick={() => setIsOrderingLab(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Order Lab
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={labTestName}
                  onChange={e => setLabTestName(e.target.value)}
                  placeholder="e.g. CBC, Lipid Profile, X-Ray"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  onKeyDown={e => e.key === 'Enter' && handleOrderLab()}
                />
                <button onClick={handleOrderLab} disabled={addingNote} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {addingNote ? 'Ordering...' : 'Submit Order'}
                </button>
                <button onClick={() => setIsOrderingLab(false)} className="bg-slate-500 hover:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PatientTimelineModal;
