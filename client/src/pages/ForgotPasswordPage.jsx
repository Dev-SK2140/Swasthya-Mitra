import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-btuu.onrender.com/api';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if(res.ok) setStep(2);
      else alert('User not found');
    } catch(err) { alert('Error'); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      if(res.ok) {
        alert('Password reset successful. Please login.');
        window.location.href = '/login';
      } else alert('Invalid OTP');
    } catch(err) { alert('Error'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="text-center text-3xl font-extrabold text-white">Reset Password</h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-800/60 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-white/10">
          
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <p className="text-slate-400 text-sm text-center">Enter your email to receive an OTP.</p>
              <div>
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <button type="submit" className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-indigo-700 transition-colors">
                Send OTP
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleReset}>
              <p className="text-[var(--color-secondary)] text-sm text-center bg-[var(--color-secondary)]/10 py-2 rounded">OTP sent to your email! (Check server console if testing locally)</p>
              <div>
                <label className="block text-sm font-medium text-slate-300">Enter OTP</label>
                <input required type="text" value={otp} onChange={e => setOtp(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] text-center tracking-widest text-xl" placeholder="123456" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">New Password</label>
                <div className="relative mt-1">
                  <input required type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Reset Password
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm text-slate-400">
            Remember your password? <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)]">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPasswordPage;
