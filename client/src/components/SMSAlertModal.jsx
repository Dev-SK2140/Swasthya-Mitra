import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, CheckCircle2, Smartphone } from 'lucide-react';

const SMSAlertModal = ({ isOpen, onClose, patient }) => {
  const [language, setLanguage] = useState('gu');
  const [msgType, setMsgType] = useState('followup');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  if (!isOpen || !patient) return null;

  const messages = {
    gu: {
      followup: `નમસ્તે ${patient.name}, સ્વાસ્થ્ય મિત્ર PHC ગુજરાત. તમારું ફોલો-અપ ચેકઅપ આવતીકાલે સવારે 10:00 વાગ્યે નિર્ધારિત છે. કૃપા કરીને તમારું કેસ કાર્ડ સાથે લાવો.`,
      prescription: `નમસ્તે ${patient.name}, તમારી દવાનું પ્રિસ્ક્રિપ્શન PHC ફાર્મસીમાંથી લેવા માટે તૈયાર છે.`
    },
    hi: {
      followup: `नमस्ते ${patient.name}, स्वास्थ्य मित्र PHC गुजरात। आपका फॉलो-अप चेकअप कल सुबह 10:00 बजे निर्धारित है। कृपया अपना केस कार्ड साथ लाएं।`,
      prescription: `नमस्ते ${patient.name}, आपकी दवा का पर्चा PHC फार्मेसी से लेने के लिए तैयार है।`
    },
    en: {
      followup: `Hello ${patient.name}, Swasthya Mitra PHC Gujarat. Your follow-up checkup is scheduled for tomorrow at 10:00 AM. Please bring your case card.`,
      prescription: `Hello ${patient.name}, your prescription is ready for pickup at the PHC Pharmacy.`
    }
  };

  const currentMsg = messages[language][msgType];

  const handleSend = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '1234567890', // Hardcoded mock number for demo
          message: currentMsg,
          type: 'whatsapp'
        })
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">WhatsApp & SMS Alert</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patient: <span className="text-slate-900 dark:text-white font-medium">{patient.name}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Select Language</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setLanguage('gu')} 
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${language === 'gu' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                >
                  ગુજરાતી (Gujarati)
                </button>
                <button 
                  onClick={() => setLanguage('hi')} 
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${language === 'hi' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                >
                  हिन्दी (Hindi)
                </button>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${language === 'en' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Message Template</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setMsgType('followup')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${msgType === 'followup' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                >
                  Follow-up Reminder
                </button>
                <button 
                  onClick={() => setMsgType('prescription')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${msgType === 'prescription' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                >
                  Rx Pickup Ready
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">Message Preview</span>
              <p className="text-xs text-emerald-300 leading-relaxed font-sans">{currentMsg}</p>
            </div>

            {sent && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs flex items-center justify-center gap-2 font-bold animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> Alert Sent Successfully via Email Fallback!
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
              Cancel
            </button>
            <button 
              disabled={sent || loading}
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5"
            >
              <Send className={`w-3.5 h-3.5 ${loading ? 'animate-pulse' : ''}`} /> {loading ? 'Sending...' : 'Send Notice'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SMSAlertModal;
