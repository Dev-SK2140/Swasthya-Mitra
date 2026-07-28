import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AIAssistant = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello Doctor. I am Swasthya Sahayak (સ્વાસ્થ્ય સહાયક). How can I assist you with triage or treatment protocols today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, currentInput: userMessage })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      
      if (ttsEnabled) {
        speakText(data.reply);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered a network error connecting to the AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    const langMap = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' };
    utterance.lang = langMap[currentLang] || 'hi-IN';
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    const langMap = { en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' };
    recognition.lang = langMap[currentLang] || 'hi-IN'; // Adapts to selected UI language

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full shadow-2xl flex items-center justify-center text-slate-900 dark:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all z-50 group"
          >
            <Bot className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {/* Notification dot */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">સ્વાસ્થ્ય સહાયક AI</h3>
                  <p className="text-[10px] text-indigo-100">Government Medical Assistant</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTtsEnabled(!ttsEnabled)} className={`p-1.5 rounded-lg transition-colors ${ttsEnabled ? 'bg-indigo-500/30 text-indigo-100' : 'text-white/50 hover:text-white'}`}>
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-slate-900 dark:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/30">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[var(--color-primary)] text-white rounded-br-sm' 
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2 text-[var(--color-primary)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Analyzing protocols...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-300/50 dark:border-slate-700/50">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1 pr-2 focus-within:border-[var(--color-primary)] transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a medical query..."
                  className="flex-1 bg-transparent border-none text-slate-900 dark:text-white text-sm px-3 py-2 focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-rose-500/20 text-rose-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[9px] text-slate-500">AI responses are for triage support only. Not diagnostic.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
