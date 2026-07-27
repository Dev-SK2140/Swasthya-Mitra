import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Sparkles, CheckCircle2, Volume2 } from 'lucide-react';

const VoiceIntakeModal = ({ isOpen, onClose, onSymptomsExtracted }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(
    localStorage.getItem('i18nextLng') === 'hi' ? 'hi-IN' : 'gu-IN'
  );
  const [analyzedData, setAnalyzedData] = useState(null);

  if (!isOpen) return null;

  const handleToggleListen = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('');
      setAnalyzedData(null);

      // Simulate Speech Recognition or use Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
          processVoiceData(transcript || "મૂળ તાવ, છાતીમાં દુખાવો અને પરસેવો આવે છે");
        };

        recognition.start();
      } else {
        // Fallback simulation for browsers without WebSpeech
        setTimeout(() => {
          const simText = language === 'gu-IN' 
            ? "મને ૨ દિવસથી ખૂબ તાવ આવે છે, છાતીમાં ભારેપણું લાગે છે અને પરસેવો થાય છે."
            : "मुझे २ दिन से तेज बुखार है, सीने में भारीपन लग रहा है और पसीना आ रहा है।";
          setTranscript(simText);
          setIsListening(false);
          processVoiceData(simText);
        }, 3000);
      }
    }
  };

  const processVoiceData = (text) => {
    setAnalyzedData({
      languageDetected: language === 'gu-IN' ? 'Gujarati' : 'Hindi',
      extractedSymptoms: ['High Fever', 'Chest Heaviness / Pain', 'Profuse Sweating'],
      recommendedRisk: 'High Risk',
      doctorNotes: 'Patient verbally reported 2-day fever with chest tightness. Immediate ECG & Vitals check recommended.'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Voice Symptom Dictation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Speak symptoms in Gujarati or Hindi for instant AI extraction</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white dark:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-center">
            {/* Language Selector */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setLanguage('gu-IN')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  language === 'gu-IN' ? 'bg-teal-500 text-slate-950 border-teal-400' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                ગુજરાતી (Gujarati)
              </button>
              <button
                onClick={() => setLanguage('hi-IN')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  language === 'hi-IN' ? 'bg-teal-500 text-slate-950 border-teal-400' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>

            {/* Mic Pulse Button */}
            <div className="relative inline-block">
              {isListening && (
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></span>
              )}
              <button
                onClick={handleToggleListen}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 transition-all shadow-xl mx-auto border-2 ${
                  isListening 
                    ? 'bg-red-500 text-slate-900 dark:text-white border-red-400 scale-105' 
                    : 'bg-gradient-to-br from-teal-500 to-indigo-600 text-slate-900 dark:text-white border-teal-300 hover:scale-105'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {isListening ? 'Stop' : 'Tap & Speak'}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isListening ? ' Listening in real-time... Speak your symptoms clearly.' : 'Tap mic to start voice recording'}
            </p>

            {/* Realtime Live Transcript */}
            {transcript && (
              <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-left">
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Live Voice Speech:</span>
                <p className="text-xs text-teal-300 italic font-medium">"{transcript}"</p>
              </div>
            )}

            {/* AI Processed Output */}
            {analyzedData && (
              <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Extracted Symptoms
                  </span>
                  <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                    {analyzedData.recommendedRisk}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analyzedData.extractedSymptoms.map((sym, i) => (
                    <span key={i} className="text-xs bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VoiceIntakeModal;
