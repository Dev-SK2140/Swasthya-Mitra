import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from "@react-oauth/google";
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

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

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

      if (data.otp) {
        setOtp(data.otp);
      }

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
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)]">
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="relative mt-1">
                  <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-[var(--color-primary)] pr-12" />
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
              <div className="text-center mb-2 text-slate-300 text-xs">
                We sent a 6-digit verification code to <span className="font-bold text-white">{formData.email}</span>.
              </div>

              {otp && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl text-xs font-semibold text-center shadow-lg">
                  ⚡ Auto-filled Demo Code: <span className="font-mono text-base font-black tracking-widest text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-500/30 ml-1">{otp}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 text-center mb-1">Enter 6-Digit OTP</label>
                <input required type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} className="block w-full text-center tracking-widest text-2xl font-bold px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-emerald-400 focus:ring-2 focus:ring-[var(--color-primary)]" />
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
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await fetch(`${API_URL}/auth/google`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      credential: credentialResponse.credential
                    })
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    throw new Error(data.message);
                  }

                  localStorage.setItem("token", data.token);
                  localStorage.setItem("user", JSON.stringify(data.user));

                  navigate(`/app/${data.user.role.toLowerCase()}`);

                } catch (err) {
                  setError(err.message);
                }
              }}
              onError={() => {
                setError("Google Login Failed");
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
