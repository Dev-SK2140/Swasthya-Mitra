import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import LanguageSelector from '../components/LanguageSelector';
import MedicalCross3D from '../components/MedicalCross3D';
import logoImg from '../assets/logo.png';

const LandingPage = () => {
  const { t } = useTranslation();

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
}, []);

  return (
    <div className="min-h-screen bg-[#1b2532] overflow-hidden relative flex flex-col">
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

      <nav className="w-full px-8 py-4 flex justify-between items-center z-20 border-b border-[#07a9b0]/20 bg-[#1b2532]/80 backdrop-blur-md fixed top-0 shadow-lg">
        <div className="flex items-center gap-4">
          <img src={logoImg} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full shadow-[0_0_15px_rgba(130,216,165,0.3)]" />
          <div className="hidden sm:block">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-[#82d8a5] bg-clip-text text-transparent block">{t('app_title')}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <LanguageSelector />
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium hidden md:block">Login</Link>
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
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-[var(--color-primary)] mb-6 leading-tight drop-shadow-2xl">
            {t('app_title')}
          </h1>
          <p className="text-xl md:text-3xl text-indigo-200/80 font-light mb-12 max-w-3xl mx-auto">
            {t('app_subtitle')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transition-shadow"
              >
                Create Account
              </motion.button>
            </Link>
            <Link to="/app/intake">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-900/40 text-white border border-[var(--color-primary)]/50 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-800/60 transition-colors backdrop-blur-md"
              >
                View Live Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
