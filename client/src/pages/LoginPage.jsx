import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import MedicalCross3D from '../components/MedicalCross3D';
import logoImg from '../assets/logo.png';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);
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

  const handleQuickDemoLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 flex gap-2">
        <ThemeToggle />
        <LanguageSelector />
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#07a9b0]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#82d8a5]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 z-0 pointer-events-auto"
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
              resize: true,
            },
            modes: { grab: { distance: 200, links: { opacity: 0.5 } } }
          },
          particles: {
            color: { value: "#82d8a5" },
            links: { color: "#07a9b0", distance: 150, enable: true, opacity: 0.2, width: 1 },
            move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 1, straight: false },
            number: { density: { enable: true, area: 800 }, value: 60 },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
      />

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-10 opacity-70 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <MedicalCross3D position={[-4, 3, -4]} scale={0.8} />
          </Float>
          <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
            <MedicalCross3D position={[4, -3, -6]} scale={0.7} />
          </Float>
          <Sparkles count={100} scale={15} size={4} speed={0.4} opacity={0.2} color="#82d8a5" />
        </Canvas>
      </div>

      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 z-0 pointer-events-auto"
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" },
              resize: true,
            },
            modes: { grab: { distance: 200, links: { opacity: 0.5 } } }
          },
          particles: {
            color: { value: "#82d8a5" },
            links: { color: "#07a9b0", distance: 150, enable: true, opacity: 0.2, width: 1 },
            move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 1, straight: false },
            number: { density: { enable: true, area: 800 }, value: 60 },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-20 text-center flex flex-col items-center relative"
      >
        <img src={logoImg} alt="Logo" className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-full mb-4 shadow-[0_0_25px_rgba(130,216,165,0.4)] border-2 border-[#07a9b0]/50" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-white dark:to-[#82d8a5] bg-clip-text text-transparent mb-1">{t('auth.login_title', 'Welcome Back to Swasthya Mitra')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('auth.login_subtitle', 'Login to access the intelligent triage dashboard')}</p>

        {/* Quick Demo Login Chips */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          <button type="button" onClick={() => handleQuickDemoLogin('doctor@demo.com')} className="text-[11px] bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/30 px-2.5 py-1 rounded-full hover:bg-teal-500/20 transition-all font-semibold">⚡ Doctor</button>
          <button type="button" onClick={() => handleQuickDemoLogin('nurse@demo.com')} className="text-[11px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full hover:bg-indigo-500/20 transition-all font-semibold">⚡ Nurse</button>
          <button type="button" onClick={() => handleQuickDemoLogin('receptionist@demo.com')} className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full hover:bg-amber-500/20 transition-all font-semibold">⚡ Receptionist</button>
          <button type="button" onClick={() => handleQuickDemoLogin('patient@demo.com')} className="text-[11px] bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full hover:bg-purple-500/20 transition-all font-semibold">⚡ Patient</button>
          <button type="button" onClick={() => handleQuickDemoLogin('lab@demo.com')} className="text-[11px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full hover:bg-blue-500/20 transition-all font-semibold">⚡ Lab</button>
          <button type="button" onClick={() => handleQuickDemoLogin('pharmacy@demo.com')} className="text-[11px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full hover:bg-rose-500/20 transition-all font-semibold">⚡ Pharmacy</button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-20 relative"
      >
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-white/10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-300">{t('auth.email', 'Email Address')}</label>
              <div className="mt-1">
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-300">{t('auth.password', 'Password')}</label>
              <div className="relative mt-1">
                <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-[var(--color-primary)] hover:text-teal-700 dark:text-[var(--color-secondary)]">{t('auth.forgot_password', 'Forgot your password?')}</Link>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:ring-offset-slate-900 transition-colors">
                {t('auth.login_btn', 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300 dark:border-slate-700"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-medium">Or</span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-slate-700 dark:text-slate-400 font-medium">
              {t('auth.no_account', "Don't have an account?")} <Link to="/register" className="font-medium text-[var(--color-primary)] hover:text-teal-700 dark:text-[var(--color-secondary)]">{t('auth.register_here', 'Register now')}</Link>
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
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 font-medium z-10">
          Designed By <strong className="text-slate-900 dark:text-white">Shahid Khan</strong> from <strong className="text-teal-700 dark:text-[#07a9b0]">SyncHex Infosys</strong><br />
          <a href="mailto:contact.synchex@gmail.com" className="text-teal-700 dark:text-[#82d8a5] hover:underline text-[11px]">contact.synchex@gmail.com</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
