import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Patient' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, type: 'register' })
      });
      if(res.ok) setStep(2);
      else {
        const data = await res.json();
        alert(data.message || 'Error sending OTP');
      }
    } catch(err) {
      alert('Network Error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp })
      });
      if(res.ok) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        const data = await res.json();
        alert(data.message || 'Registration failed');
      }
    } catch(err) {
      alert('Error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      if(res.ok) navigate('/app/doctor');
      else alert('Google Login Failed');
    } catch(err) {
      alert('Error connecting to server');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="text-center text-3xl font-extrabold text-white">Create an Account</h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-800/60 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-white/10">
          
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button type="submit" className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Send OTP
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <p className="text-emerald-400 text-sm text-center bg-emerald-400/10 py-2 rounded">OTP sent to {formData.email}</p>
              <div>
                <label className="block text-sm font-medium text-slate-300">Enter OTP</label>
                <input required type="text" value={otp} onChange={e => setOtp(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500 text-center tracking-widest text-xl" placeholder="123456" />
              </div>
              <button type="submit" className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Verify & Register
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </div>
          
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Google Login Failed')}
              theme="filled_black"
              shape="pill"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
