import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import logoImg from '../assets/logo.png';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Doctor' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitr-server.onrender.com/api');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate(`/app/${data.user.role.toLowerCase()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/app/doctor');
      } catch (err) {
        console.error("Login failed:", err);
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-4 right-4"><LanguageSelector /></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#07a9b0]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#82d8a5]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center flex flex-col items-center"
      >
        <img src={logoImg} alt="Logo" className="w-20 h-20 object-contain mb-4 drop-shadow-[0_0_15px_rgba(130,216,165,0.3)]" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#82d8a5] bg-clip-text text-transparent">{t('register.title', 'Create your account')}</h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-slate-800/60 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-white/10">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]">
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="relative mt-1">
                  <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="relative mt-1">
                  <input required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] pr-12" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="text-center mb-4 text-slate-300">
                We sent a 6-digit OTP to <span className="font-bold text-white">{formData.email}</span>. Please enter it below.
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 text-center">Enter OTP</label>
                <input required type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="mt-1 block w-full text-center tracking-widest text-2xl px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              
              <div className="text-center mt-4">
                {canResend ? (
                  <button type="button" onClick={handleSendOTP} className="text-[var(--color-primary)] hover:text-white transition-colors text-sm font-medium">
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-slate-500 text-sm">Resend OTP in {timer}s</span>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)]">Sign in</Link>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button onClick={() => loginGoogle()} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
