import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';
import MedicalCross3D from '../components/MedicalCross3D';
import logoImg from '../assets/logo.png';

const LandingPage = () => {
  const { t } = useTranslation();

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col transition-colors">
      {/* 2D Interactive Particle Background */}
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
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <MedicalCross3D position={[-4, 2, -5]} scale={0.8} />
          </Float>
          <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
            <MedicalCross3D position={[5, -2, -8]} scale={0.6} />
          </Float>
          <Sparkles count={100} scale={15} size={4} speed={0.4} opacity={0.2} color="#82d8a5" />
        </Canvas>
      </div>

      <nav className="w-full px-8 py-4 flex justify-between items-center z-20 bg-transparent fixed top-0">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)]" />
          <div className="hidden sm:block">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#82d8a5] block">સ્વાસ્થ્ય મિત્ર</span>
            <p className="text-xs text-slate-600 dark:text-[#d0b875] opacity-90 font-medium tracking-wide">Intelligent Rural Health Triage Platform</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <LanguageSelector />
          <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors font-medium hidden md:block">Login</Link>
          <Link to="/register" className="bg-[var(--color-primary)] hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)] z-20 relative">Register</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 mt-20 z-10 relative pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl pointer-events-auto"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-indigo-100 dark:to-[var(--color-primary)] mb-6 leading-tight dark:drop-shadow-2xl">
            સ્વાસ્થ્ય મિત્ર
          </h1>
          <p className="text-xl md:text-3xl text-slate-700 dark:text-indigo-200/80 font-light mb-12 max-w-3xl mx-auto">
            Intelligent Rural Health Triage Platform
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[var(--color-primary)] text-white dark:bg-white dark:text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(7,169,176,0.3)] dark:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-lg transition-shadow"
              >
                Create Account
              </motion.button>
            </Link>
            <Link to="/app/intake">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/50 text-slate-800 dark:bg-indigo-900/40 dark:text-white border border-slate-300 dark:border-[var(--color-primary)]/50 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100/60 dark:hover:bg-indigo-800/60 transition-colors backdrop-blur-md shadow-sm"
              >
                View Live Demo
              </motion.button>
            </Link>
          </div>

          {/* Government of Gujarat Healthcare Schemes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-6xl mx-auto pointer-events-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-10 mb-20 text-left shadow-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-white/10 pb-4">Government of Gujarat Healthcare Schemes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <a href="https://magujarat.com/" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-700 transition-colors group shadow-sm">
                <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 group-hover:text-teal-800 dark:group-hover:text-teal-300">PM-JAY MA Vatsalya</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Health cover of up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization.</p>
              </a>

              <a href="https://gujhealth.gujarat.gov.in/chiranjeevi-yojana.htm" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-700 transition-colors group shadow-sm">
                <h3 className="text-lg font-bold text-pink-700 dark:text-pink-400 group-hover:text-pink-800 dark:group-hover:text-pink-300">Chiranjeevi Yojana</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Free institutional delivery for BPL and tribal women in private hospitals to reduce maternal/infant mortality.</p>
              </a>

              <a href="https://gujhealth.gujarat.gov.in/bal-sakha-yojana.htm" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-700 transition-colors group shadow-sm">
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300">Bal Sakha Yojana</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Free healthcare services for all infants born to BPL and tribal families by private pediatricians.</p>
              </a>

              <a href="https://gujhealth.gujarat.gov.in/school-health-program.htm" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-700 transition-colors group shadow-sm">
                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 group-hover:text-yellow-800 dark:group-hover:text-yellow-300">School Health Program (SHP)</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Health screening and free treatment for all children from newborn to 18 years in Gujarat.</p>
              </a>

              <a href="https://www.digitalgujarat.gov.in/" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-700 transition-colors group shadow-sm">
                <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 group-hover:text-orange-800 dark:group-hover:text-orange-300">Kasturba Poshan Sahay Yojana</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Nutritional assistance provided to poor pregnant women to reduce low birth weight.</p>
              </a>

              <a href="https://emri.in/gujarat/" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-700 transition-colors group shadow-sm">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 group-hover:text-red-800 dark:group-hover:text-red-300">108 EMRI Services</h3>
                <p className="text-sm text-slate-700 dark:text-slate-400 mt-1 font-medium">Free emergency medical, police, and fire response services operational 24x7 across the state.</p>
              </a>

            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
