import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Send, Bot, User, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const AITriageFlow = ({ onPatientAdded }) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState('chat'); // 'chat' | 'vitals' | 'analyzing' | 'complete'
  
  // Chat State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I am the AI Triage Assistant. Could you please describe what symptoms you are experiencing today?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Patient Context (accumulated)
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    language: 'en'
  });

  // Vitals State
  const [vitals, setVitals] = useState({
    heartRate: '',
    bloodPressureSys: '',
    bloodPressureDia: '',
    spO2: ''
  });

  // Final AI Result
  const [aiResult, setAiResult] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitr-server.onrender.com/api');

  // --- Voice Input ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = patientData.language === 'gu' ? 'gu-IN' : patientData.language === 'hi' ? 'hi-IN' : 'en-US'; 
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  // --- Chat Step ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newHistory = [...messages, { role: 'user', content: userMessage }];
    setMessages(newHistory);
    setInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory, currentInput: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      if (data.isComplete) {
        // AI has enough info, transition to vitals
        setTimeout(() => setStage('vitals'), 2000);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- Vitals Step ---
  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    setStage('analyzing');

    try {
      // Extract all symptoms from chat history
      const symptomsLog = messages.filter(m => m.role === 'user').map(m => m.content);

      const payload = {
        name: patientData.name || 'Unknown Patient',
        age: Number(patientData.age) || 30,
        gender: patientData.gender,
        language: patientData.language,
        vitals: {
          heartRate: Number(vitals.heartRate),
          bloodPressureSys: Number(vitals.bloodPressureSys),
          bloodPressureDia: Number(vitals.bloodPressureDia),
          spO2: Number(vitals.spO2),
        },
        symptoms: symptomsLog,
        history: messages
      };

      const res = await fetch(`${API_URL}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      setAiResult(data.aiAnalysis);
      onPatientAdded?.(data.patient);
      setStage('complete');
    } catch (err) {
      console.error(err);
      alert('Failed to analyze data');
      setStage('vitals');
    }
  };

  const resetFlow = () => {
    setStage('chat');
    setMessages([{ role: 'assistant', content: 'Hello. I am the AI Triage Assistant. Could you please describe what symptoms you are experiencing today?' }]);
    setAiResult(null);
    setVitals({ heartRate: '', bloodPressureSys: '', bloodPressureDia: '', spO2: '' });
    setPatientData({ name: '', age: '', gender: 'Male', language: 'en' });
  };

  return (
    <div className="glass-panel overflow-hidden flex flex-col h-[650px]">
      {/* Progress Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-[var(--color-primary)]" />
          AI Triage Assistant
        </h2>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stage === 'chat' ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-700 text-slate-300'}`}>1. Symptoms</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stage === 'vitals' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}>2. Vitals</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stage === 'complete' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>3. AI Report</span>
        </div>
      </div>

      {/* Stage 1: Chat */}
      {stage === 'chat' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-400">Ask the patient about their symptoms. The AI will prompt for necessary details.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Patient Name" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white" />
              <input type="number" placeholder="Age" value={patientData.age} onChange={e => setPatientData({...patientData, age: e.target.value})} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white w-20" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white rounded-br-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm p-3 text-slate-400 text-sm animate-pulse">
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button type="button" onClick={startListening} className={`p-3 rounded-xl transition-colors ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              <Mic className="w-5 h-5" />
            </button>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type patient response..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
            <button type="submit" disabled={!input.trim() || chatLoading} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white p-3 rounded-xl">
              <Send className="w-5 h-5" />
            </button>
          </form>
          <button onClick={() => setStage('vitals')} className="mt-4 text-sm text-[var(--color-primary)] hover:underline self-center">Skip to Vitals</button>
        </div>
      )}

      {/* Stage 2: Vitals */}
      {stage === 'vitals' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Activity className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Nurse Action Required</h3>
              <p className="text-sm text-amber-400/80">AI has collected sufficient symptom history. Please record current vitals for risk analysis.</p>
            </div>
          </div>
          
          <form onSubmit={handleVitalsSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Heart Rate (BPM)</label>
                <input required type="number" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">SpO2 (%)</label>
                <input required type="number" value={vitals.spO2} onChange={e => setVitals({...vitals, spO2: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Systolic BP (mmHg)</label>
                <input required type="number" value={vitals.bloodPressureSys} onChange={e => setVitals({...vitals, bloodPressureSys: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Diastolic BP (mmHg)</label>
                <input required type="number" value={vitals.bloodPressureDia} onChange={e => setVitals({...vitals, bloodPressureDia: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all">
              Run AI Risk Analysis
            </button>
          </form>
        </div>
      )}

      {/* Stage 3: Analyzing */}
      {stage === 'analyzing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <h3 className="text-xl font-semibold text-white">AI is analyzing clinical data...</h3>
          <p className="text-slate-400 text-center max-w-md">Combining reported symptoms with non-invasive vitals to predict risk levels and generate clinical summaries.</p>
        </div>
      )}

      {/* Stage 4: Complete (JSON Result Display) */}
      {stage === 'complete' && aiResult && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className={`p-4 rounded-xl border flex gap-4 items-start ${
            aiResult.risk_level === 'Emergency' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' :
            aiResult.risk_level === 'High Risk' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' :
            aiResult.risk_level === 'Moderate Risk' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
          }`}>
            <AlertCircle className="w-8 h-8 shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold uppercase">{aiResult.risk_level} (Score: {aiResult.risk_score}/100)</h3>
              <p className="mt-1 font-medium">{aiResult.recommendation}</p>
              <p className="mt-2 text-sm opacity-80 border-t border-current pt-2"><strong>AI Reason:</strong> {aiResult.explanation || aiResult.doctor_summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <h4 className="text-slate-400 text-sm mb-2">Extracted Symptoms</h4>
              <ul className="list-disc list-inside text-white text-sm">
                {(aiResult.symptoms || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <h4 className="text-slate-400 text-sm mb-2">Possible Risks</h4>
              <ul className="list-disc list-inside text-rose-400 text-sm">
                {(aiResult.possible_risks || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border-l-4 border-indigo-500">
            <h4 className="text-slate-400 text-sm mb-1">Doctor Summary</h4>
            <p className="text-white text-sm">{aiResult.doctor_summary}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={resetFlow} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Start New Triage
            </button>
            <button onClick={() => window.location.href='/app/doctor'} className="flex-1 bg-[var(--color-primary)] hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITriageFlow;
