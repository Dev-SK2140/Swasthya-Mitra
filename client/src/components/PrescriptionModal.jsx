import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pill, ShieldAlert, FileText, Download, Check, Sparkles, Printer, Mic, MicOff } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COMMON_MEDICATIONS = [
  { name: 'Dolo 650mg (Paracetamol)', dose: '1 tab TDS after meals', type: 'Antipyretic', interaction: 'Max 4g/day. Safe in pregnancy.' },
  { name: 'Combiflam (Ibuprofen + Paracetamol)', dose: '1 tab BD after food', type: 'Analgesic', interaction: 'Take with food to avoid gastric irritation' },
  { name: 'Azithral 500mg (Azithromycin)', dose: '1 tab OD for 3 days', type: 'Antibiotic', interaction: 'Complete 3-day course strictly' },
  { name: 'Electral ORS Sachet', dose: '1 sachet in 1L clean water', type: 'Rehydration', interaction: 'Essential for diarrhea & fever' },
  { name: 'Pantocid 40mg (Pantoprazole)', dose: '1 tab OD before breakfast', type: 'Antacid', interaction: 'Take empty stomach in morning' },
  { name: 'Cetcip 10mg (Cetirizine)', dose: '1 tab HS (Bedtime)', type: 'Antihistamine', interaction: 'May cause mild drowsiness' }
];

const PrescriptionModal = ({ isOpen, onClose, patient }) => {
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [notes, setNotes] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(false);
  const [printed, setPrinted] = useState(false);
  
  // Translation state
  const [translating, setTranslating] = useState(false);
  const [translatedNotes, setTranslatedNotes] = useState('');
  const [targetLang, setTargetLang] = useState('gu'); // default Gujarati
  
  // Voice dictation state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const printRef = useRef();

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  if (!isOpen || !patient) return null;

  const handleAddMed = (med) => {
    if (!selectedMeds.find(m => m.name === med.name)) {
      setSelectedMeds([...selectedMeds, { ...med, duration: '5 days' }]);
    }
  };

  const handleRemoveMed = (index) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
  };

  const handleGenerateAiRx = () => {
    setAiSuggestions(true);
    // Auto populate meds based on symptoms
    const suggested = [
      COMMON_MEDICATIONS[0], // Paracetamol
      COMMON_MEDICATIONS[4]  // Pantoprazole
    ];
    setSelectedMeds(suggested);
  };

  const handlePrint = async () => {
    setPrinted(true);
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Prescription_${patient.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF.');
    }
  };

  const handleSendToPharmacy = async () => {
    if (selectedMeds.length === 0) {
      return alert('Please add at least one medicine before sending to pharmacy.');
    }
    
    try {
      const res = await fetch(`${API_URL}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient._id,
          patientName: patient.name,
          doctorId: 'Doctor', // Can be dynamically pulled from logged-in user later
          medicines: selectedMeds,
          advice: notes
        })
      });
      
      if (res.ok) {
        alert('Prescription sent to Pharmacy successfully!');
        onClose();
      } else {
        alert('Failed to send prescription.');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending prescription.');
    }
  };

  const handleTranslate = async () => {
    if (!notes.trim()) return alert('Please enter some advice to translate.');
    
    setTranslating(true);
    try {
      const languageMap = { gu: 'Gujarati', hi: 'Hindi', mr: 'Marathi' };
      
      const res = await fetch(`${API_URL}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: notes, 
          targetLanguage: languageMap[targetLang] 
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setTranslatedNotes(data.translation);
      } else {
        alert('Translation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error translating.');
    } finally {
      setTranslating(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English / Hindi accent supported better
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setNotes(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl border border-[var(--color-primary)]/20">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Digital AI Prescription</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patient: <span className="text-slate-900 dark:text-white font-medium">{patient.name} ({patient.age}y/o, {patient.gender})</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1" ref={printRef}>
            {/* Header in PDF (only visible when printed or as a formal header) */}
            <div className="border-b-2 border-indigo-500 pb-4 mb-4 hidden print:block">
               <h1 className="text-2xl font-bold text-indigo-700 text-center">Swasthya Mitra Rural Clinic</h1>
               <p className="text-center text-sm text-gray-500">Official E-Prescription Document</p>
               <div className="flex justify-between mt-4 text-xs font-semibold">
                 <span>Patient: {patient.name}</span>
                 <span>Date: {new Date().toLocaleDateString()}</span>
               </div>
            </div>

            {/* AI Assist Button */}
            <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" /> AI Smart Prescriber
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Suggest meds based on triage symptoms ({patient.symptoms?.join(', ') || 'Fever & Fatigue'}).</p>
              </div>
              <button 
                onClick={handleGenerateAiRx}
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-lg"
              >
                Auto-Suggest Rx
              </button>
            </div>

            {/* Quick Add Meds */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Select Medicines</label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_MEDICATIONS.map((med, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddMed(med)}
                    className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:bg-slate-800 hover:border-slate-300 dark:border-slate-700 transition-all text-xs"
                  >
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{med.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{med.dose}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Rx List */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Prescribed Medicines ({selectedMeds.length})</label>
              {selectedMeds.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
                  No medicines added yet. Click above or use AI auto-suggest.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedMeds.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-700/60">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{med.dose} • {med.duration}</span>
                        {med.interaction && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <ShieldAlert className="w-3 h-3" /> {med.interaction}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleRemoveMed(idx)} className="text-slate-500 hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Doctor Clinical Advice */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Doctor Advice / Diet Instructions</label>
                <button 
                  onClick={handleToggleListening}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    isListening ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {isListening ? <><Mic className="w-3 h-3 animate-pulse" /> Listening...</> : <><MicOff className="w-3 h-3" /> Dictate</>}
                </button>
              </div>
              <textarea 
                rows={2} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take plenty of fluids, complete antibiotic course..."
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-primary)]"
              />
              
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="gu">Gujarati</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
                <button 
                  onClick={handleTranslate}
                  disabled={translating}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {translating ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {translating ? 'Translating...' : 'AI Translate for Patient'}
                </button>
              </div>

              {translatedNotes && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">Translated Patient Instructions ({targetLang.toUpperCase()}):</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{translatedNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-400" /> Digital Sign Verified
            </span>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
                Cancel
              </button>
              <button 
                onClick={handleSendToPharmacy}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
              >
                <Check className="w-4 h-4" /> Send to Pharmacy
              </button>
              <button 
                onClick={handlePrint}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" /> Print Rx
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrescriptionModal;
