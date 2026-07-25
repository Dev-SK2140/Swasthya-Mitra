import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, Mic, MicOff, VideoOff, MessageSquare, Send, X } from 'lucide-react';

const INDIAN_CONSULTANTS = [
  { id: 1, name: 'Dr. Rajesh Kumar', qualification: 'MD General Medicine (AIIMS)', hospital: 'Civil Hospital Ahmedabad', specialty: 'General Medicine & Triage', status: 'Online 🟢', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Dr. Priya Sharma', qualification: 'MD Pediatrics', hospital: 'District Hospital Rajkot', specialty: 'Maternal & Child Health', status: 'Online 🟢', avatar: 'https://images.unsplash.com/photo-1594824813571-212529503b57?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Dr. Jayesh Patel', qualification: 'DM Cardiology', hospital: 'Government Medical College Surat', specialty: 'Cardiology & Emergency Care', status: 'Busy 🟡', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' }
];

const TelemedicineChat = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(INDIAN_CONSULTANTS[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: 'e-Sanjeevani National Teleconsultation Network (Govt. of India) - End-to-End Encrypted.' },
    { id: 2, sender: 'other', text: 'નમસ્તે, હું Dr. Rajesh Kumar બોલું છું PHC Teleconsultation Hub થી. મરીજની વિટલ્સ મોકલો.' }
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
    const sentText = input.trim();
    setInput('');

    // Responsive Indian Doctor Reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'other', 
        text: `Received. I am reviewing the symptoms. Please administer IV fluids and keep the patient under observation. Calling via e-Sanjeevani line if vital stats drop.` 
      }]);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* Video Panel */}
      <div className={`transition-all duration-500 ease-in-out ${isVideoActive ? 'lg:w-2/3 h-72 lg:h-auto' : 'hidden'}`}>
        <div className="w-full h-full glass-panel bg-slate-900 border border-slate-700 p-0 overflow-hidden relative flex flex-col rounded-2xl shadow-2xl">
          {/* Main Indian Doctor Video Container */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
            {!isCamOff ? (
              <img 
                src={selectedDoctor.avatar} 
                alt={selectedDoctor.name} 
                className="w-full h-full object-cover object-top filter brightness-95" 
              />
            ) : (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                <VideoOff className="w-10 h-10 text-slate-600 mb-2" /> Camera Turned Off
              </div>
            )}
            
            {/* Self PIP Camera View */}
            <div className="absolute bottom-4 right-4 w-32 h-44 bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-end p-2">
              <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                PHC Local Cam
              </div>
              <span className="relative z-10 text-[9px] bg-black/60 text-emerald-400 px-1.5 py-0.5 rounded font-mono">LIVE HD</span>
            </div>
            
            {/* Doctor Info Badge Header */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <div>
                <div className="text-white font-bold">{selectedDoctor.name}</div>
                <div className="text-[10px] text-emerald-400">{selectedDoctor.hospital}</div>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-center items-center gap-4">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-3.5 rounded-full transition-all ${isMuted ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
              title="Mute Microphone"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsCamOff(!isCamOff)} 
              className={`p-3.5 rounded-full transition-all ${isCamOff ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
              title="Toggle Camera"
            >
              {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsVideoActive(false)} 
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all transform hover:scale-105"
              title="End Tele-Consultation"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat & Doctor Directory Panel */}
      <div className={`flex flex-col glass-panel p-0 overflow-hidden border border-slate-700/80 bg-slate-900/60 rounded-2xl h-[600px] ${isVideoActive ? 'lg:w-1/3' : 'w-full max-w-5xl mx-auto'}`}>
        
        {/* Doctor Selection Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 p-4 backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl border border-[var(--color-primary)]/20">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">e-Sanjeevani Teleconsultation</h2>
                <p className="text-[10px] text-teal-400 font-semibold">District Medical Hub (Govt. of India)</p>
              </div>
            </div>

            {!isVideoActive && (
              <button 
                onClick={() => setIsVideoActive(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <Video className="w-4 h-4" /> Start Video Call
              </button>
            )}
          </div>

          {/* Indian Consultant Doctor Selector */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {INDIAN_CONSULTANTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  selectedDoctor.id === doc.id
                    ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs truncate text-white">{doc.name}</div>
                <div className="text-[9px] text-teal-400 truncate">{doc.specialty}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.sender === 'system' ? (
                <div className="bg-slate-800/80 text-slate-300 text-[11px] px-3.5 py-1 rounded-full border border-slate-700/60 font-mono text-center">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                  msg.sender === 'me' 
                    ? 'bg-[var(--color-primary)] text-white rounded-br-none' 
                    : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                }`}>
                  <span className="text-[9px] text-slate-400 block mb-1 font-bold">
                    {msg.sender === 'me' ? 'PHC Worker' : selectedDoctor.name}
                  </span>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${selectedDoctor.name}...`} 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button 
              type="submit" 
              disabled={!input.trim()} 
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white px-4 rounded-xl transition-all shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default TelemedicineChat;
