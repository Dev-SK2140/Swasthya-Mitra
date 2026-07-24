import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';
import logoImg from '../assets/logo.png';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
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
        <img src={logoImg} alt="Logo" className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-full mb-6 shadow-[0_0_25px_rgba(130,216,165,0.4)] border-2 border-[#07a9b0]/50" />
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-[#82d8a5] bg-clip-text text-transparent mb-2">{t('login.title', 'Sign in to your account')}</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-slate-800/60 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-white/10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <div className="mt-1">
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-lg shadow-sm bg-slate-900/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative mt-1">
                <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-lg shadow-sm bg-slate-900/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)]">Forgot your password?</Link>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:ring-offset-slate-900 transition-colors">
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">Or</span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-slate-400">
              Don't have an account? <Link to="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)]">Register now</Link>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await fetch(`${API_URL}/auth/google`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      credential: credentialResponse.credential,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    throw new Error(data.message || "Google Login Failed");
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

export default LoginPage;
