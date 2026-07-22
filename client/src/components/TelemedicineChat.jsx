import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, Mic, MicOff, VideoOff, MessageSquare, Send, X } from 'lucide-react';

const TelemedicineChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: 'Secure Telemedicine channel established. End-to-end encrypted.' },
    { id: 2, sender: 'other', text: 'Hello, this is Dr. Sharma from the District Hospital. Can you share the vitals for Ramesh?' }
  ]);
  const [input, setInput] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: input.trim() }]);
    setInput('');

    // Mock auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'other', 
        text: 'Received. Please administer IV fluids and keep the patient in observation. I will be on standby.' 
      }]);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* Video Panel */}
      <div className={`transition-all duration-500 ease-in-out ${isVideoActive ? 'lg:w-2/3 h-64 lg:h-auto' : 'hidden'}`}>
        <div className="w-full h-full glass-panel bg-slate-900 border border-slate-700 p-0 overflow-hidden relative flex flex-col rounded-2xl">
          {/* Main Video (Mock) */}
          <div className="flex-1 bg-slate-800 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>
            {isCamOff && <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">Camera Disabled</div>}
            
            {/* Self PIP */}
            <div className="absolute bottom-4 right-4 w-32 h-40 bg-slate-700 rounded-xl border-2 border-slate-600 shadow-xl overflow-hidden">
               <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-xs text-slate-400">Your Camera</div>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              Live: Dr. Sharma (District Hospital)
            </div>
          </div>

          {/* Video Controls */}
          <div className="bg-slate-900 p-4 flex justify-center gap-4">
            <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full ${isMuted ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsCamOff(!isCamOff)} className={`p-3 rounded-full ${isCamOff ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
              {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsVideoActive(false)} className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]">
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`flex flex-col glass-panel p-0 overflow-hidden border border-slate-700 bg-slate-900/40 rounded-2xl h-[600px] ${isVideoActive ? 'lg:w-1/3' : 'w-full max-w-4xl mx-auto'}`}>
        
        {/* Chat Header */}
        <div className="bg-slate-800/80 border-b border-slate-700 p-4 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center border border-[var(--color-primary)]/30">
              <Phone className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">Specialist Consult</h2>
              <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--color-secondary)] rounded-full"></span> Online
              </p>
            </div>
          </div>
          
          {!isVideoActive && (
            <button 
              onClick={() => setIsVideoActive(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(5,150,105,0.4)]"
            >
              <Video className="w-4 h-4" /> Start Video
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.sender === 'system' ? (
                <div className="bg-slate-800/50 text-slate-400 text-xs px-4 py-1.5 rounded-full border border-slate-700/50">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-[75%] rounded-2xl p-3 text-sm shadow-md ${
                  msg.sender === 'me' 
                    ? 'bg-[var(--color-primary)] text-white rounded-br-sm' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a secure message..." 
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            <button type="submit" disabled={!input.trim()} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)] disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default TelemedicineChat;
