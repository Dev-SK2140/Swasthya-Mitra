import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Phone, Mic, MicOff, VideoOff, MessageSquare, Send, X, Users, Calendar, Check } from 'lucide-react';
import { io } from 'socket.io-client';

const INDIAN_CONSULTANTS = [
  { id: 1, name: 'Dr. Rajesh Kumar', qualification: 'MD General Medicine (AIIMS)', hospital: 'Civil Hospital Ahmedabad', specialty: 'General Medicine & Triage', status: 'Online 🟢', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'Dr. Priya Sharma', qualification: 'MD Pediatrics', hospital: 'District Hospital Rajkot', specialty: 'Maternal & Child Health', status: 'Online 🟢', avatar: 'https://images.unsplash.com/photo-1594824813571-212529503b57?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Dr. Jayesh Patel', qualification: 'DM Cardiology', hospital: 'Government Medical College Surat', specialty: 'Cardiology & Emergency Care', status: 'Busy 🟡', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' }
];

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const TelemedicineChat = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(INDIAN_CONSULTANTS[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: 'e-Sanjeevani National Teleconsultation Network (Govt. of India) - End-to-End Encrypted.' }
  ]);
  const [input, setInput] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  
  // Booking State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const ROOM_ID = 'telemed-room-1';
  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://swasthya-mitra-o4st.onrender.com');

  useEffect(() => {
    // Connect Socket
    socketRef.current = io(API_URL);
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Connected to Telemedicine Socket:', socket.id);
      socket.emit('join-room', ROOM_ID);
    });

    socket.on('user-joined', async (userId) => {
      console.log('👤 Another user joined:', userId);
      // We are the initiator (the one who was already in the room)
      if (isVideoActive) {
        initiateCall();
      }
    });

    socket.on('newMessage', async (message) => {
      if (message.senderId !== socket.id) {
        // Advanced Language Integration: Auto-translate incoming messages
        const currentLang = localStorage.getItem('i18nextLng') || 'en';
        let displayText = message.text;
        
        if (currentLang !== 'en') {
           try {
             const res = await fetch(`${API_URL}/ai/translate`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ 
                 text: message.text, 
                 targetLanguage: currentLang === 'hi' ? 'Hindi' : currentLang === 'gu' ? 'Gujarati' : 'English' 
               })
             });
             const data = await res.json();
             if (data.success && data.translation) {
                displayText = data.translation;
             }
           } catch (e) {
             console.error("Live translation error:", e);
           }
        }
        
        setMessages(prev => [...prev, { id: Date.now(), sender: 'other', text: displayText, originalText: message.text }]);
      }
    });

    // WebRTC Signaling Handlers
    socket.on('offer', async (data) => {
      if (!isVideoActive) return; // Ignore if we aren't active
      console.log('📥 Received offer');
      try {
        if (!peerConnectionRef.current) createPeerConnection();
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('answer', { roomId: ROOM_ID, answer });
      } catch (err) {
        console.error('Error handling offer', err);
      }
    });

    socket.on('answer', async (data) => {
      console.log('📥 Received answer');
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Error handling answer', err);
      }
    });

    socket.on('ice-candidate', async (data) => {
      try {
        if (peerConnectionRef.current && data.candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error('Error adding ice candidate', err);
      }
    });

    return () => {
      socket.disconnect();
      endCall();
    };
  }, [API_URL, isVideoActive]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { roomId: ROOM_ID, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('🎥 Received remote track');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('WebRTC State:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const initiateCall = async () => {
    try {
      console.log('📤 Initiating call (creating offer)...');
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', { roomId: ROOM_ID, offer });
    } catch (err) {
      console.error('Error initiating call', err);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsVideoActive(true);
      
      // We emit a dummy event or rely on 'user-joined' to trigger signaling
      // Or we can just initiate immediately if someone is already there (handled by user-joined mostly)
      // Let's force an initiate just in case we joined second
      setTimeout(() => {
         initiateCall();
      }, 1000);

    } catch (err) {
      console.error("Failed to get local stream", err);
      alert('Camera access denied or unavailable.');
    }
  };

  const endCall = () => {
    setIsVideoActive(false);
    setIsConnected(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  // Handle Mute / Cam Off
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = !isMuted);
      streamRef.current.getVideoTracks().forEach(t => t.enabled = !isCamOff);
    }
  }, [isMuted, isCamOff]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const text = input.trim();
    const msgObj = { id: Date.now(), sender: 'me', senderId: socketRef.current?.id, text, roomId: ROOM_ID };
    
    setMessages(prev => [...prev, msgObj]);
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', msgObj);
    }
    setInput('');
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: user.name || 'Unknown Patient',
          patientEmail: user.email,
          doctorId: selectedDoctor.id.toString(),
          doctorName: selectedDoctor.name,
          date: bookingDate,
          time: bookingTime
        })
      });
      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalOpen(false);
          setBookingSuccess(false);
          setBookingDate('');
          setBookingTime('');
        }, 2000);
      } else {
        alert('Failed to book appointment');
      }
    } catch (err) {
      console.error(err);
      alert('Error booking appointment');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* Video Panel */}
      <div className={`transition-all duration-500 ease-in-out ${isVideoActive ? 'lg:w-2/3 h-[500px] lg:h-[600px]' : 'hidden'}`}>
        <div className="w-full h-full glass-panel bg-slate-950 border border-slate-300 dark:border-slate-700 p-0 overflow-hidden relative flex flex-col rounded-2xl shadow-2xl">
          {/* Main Remote Video Container */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover ${isConnected ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            {/* Fallback avatar if not connected or loading */}
            {!isConnected && (
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <img 
                    src={selectedDoctor.avatar} 
                    alt={selectedDoctor.name} 
                    className="w-full h-full object-cover object-top filter brightness-50 absolute inset-0 blur-sm" 
                  />
                  <div className="relative z-10 flex flex-col items-center bg-black/50 p-6 rounded-2xl border border-white/10">
                     <Users className="w-12 h-12 text-teal-400 mb-4 animate-pulse" />
                     <p className="text-white font-medium">Waiting for {selectedDoctor.name} to join...</p>
                     <p className="text-slate-400 text-xs mt-2 text-center max-w-[200px]">
                       Share the same URL with another device to test WebRTC Peer-to-Peer calling.
                     </p>
                  </div>
               </div>
            )}
            
            {/* Self PIP Camera View (Actual Webcam) */}
            <div className="absolute bottom-4 right-4 w-36 h-48 bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-end p-0">
              {isCamOff ? (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-500">
                  <VideoOff className="w-6 h-6" />
                </div>
              ) : (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}
              <span className="absolute bottom-2 left-2 z-10 text-[9px] bg-black/60 text-emerald-400 px-1.5 py-0.5 rounded font-mono">You</span>
            </div>
            
            {/* Doctor Info Badge Header */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2 shadow-lg">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
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
              onClick={endCall} 
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all transform hover:scale-105"
              title="End Tele-Consultation"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat & Doctor Directory Panel */}
      <div className={`flex flex-col glass-panel p-0 overflow-hidden border border-slate-300/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl h-[600px] ${isVideoActive ? 'lg:w-1/3' : 'w-full max-w-5xl mx-auto'}`}>
        
        {/* Doctor Selection Header */}
        <div className="bg-white/90 dark:bg-slate-800/90 border-b border-slate-300 dark:border-slate-700 p-4 backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl border border-[var(--color-primary)]/20">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">e-Sanjeevani Teleconsultation</h2>
                <p className="text-[10px] text-teal-400 font-semibold">District Medical Hub (Govt. of India)</p>
              </div>
            </div>

            {!isVideoActive && (
              <button 
                onClick={startVideo}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <Video className="w-4 h-4" /> Start Video Call
              </button>
            )}
          </div>

          {/* Indian Consultant Doctor Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {INDIAN_CONSULTANTS.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between h-full ${
                  selectedDoctor.id === doc.id
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50'
                    : 'bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="text-left flex-1"
                >
                  <div className={`font-bold text-sm truncate ${selectedDoctor.id === doc.id ? 'text-[var(--color-primary)]' : 'text-slate-900 dark:text-white'}`}>{doc.name}</div>
                  <div className="text-[10px] text-teal-400 truncate mb-1">{doc.specialty}</div>
                  <div className="text-[10px] text-slate-500">{doc.hospital}</div>
                </button>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-700 dark:text-slate-300">{doc.status}</span>
                  <button 
                    onClick={() => { setSelectedDoctor(doc); setBookingModalOpen(true); }}
                    className="text-[10px] flex items-center gap-1 font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 px-2 py-1 rounded"
                  >
                    <Calendar className="w-3 h-3" /> Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.sender === 'system' ? (
                <div className="bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] px-3.5 py-1 rounded-full border border-slate-700/60 font-mono text-center">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-md relative group ${
                  msg.sender === 'me' 
                    ? 'bg-[var(--color-primary)] text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 rounded-bl-none'
                }`}>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block mb-1 font-bold">
                    {msg.sender === 'me' ? 'You' : 'Participant'}
                  </span>
                  {msg.text}
                  {msg.originalText && msg.originalText !== msg.text && (
                    <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-lg w-max max-w-xs z-50 shadow-xl opacity-90">
                      Original: {msg.originalText}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message Room...`} 
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button 
              type="submit" 
              disabled={!input.trim()} 
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]disabled:opacity-50 text-white px-4 rounded-xl transition-all shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-primary)]" /> Book Appointment
                </h3>
                <button onClick={() => setBookingModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your appointment with {selectedDoctor.name} has been scheduled.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookAppointment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Doctor</label>
                      <div className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        {selectedDoctor.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-[var(--color-primary)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Time Slot</label>
                      <select 
                        required
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-[var(--color-primary)] focus:outline-none"
                      >
                        <option value="">Select Time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:15 PM">04:15 PM</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 rounded-xl mt-4 transition-all">
                      Confirm Booking
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TelemedicineChat;
