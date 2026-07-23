import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';

const PatientIntakeForm = ({ onPatientAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    heartRate: '',
    bloodPressureSys: '',
    bloodPressureDia: '',
    spO2: '',
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Attempt to use language selector, fallback to en-US. For Gujarat, gu-IN could be used.
    recognition.lang = 'en-US'; 
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ 
        ...prev, 
        symptoms: prev.symptoms ? prev.symptoms + ', ' + transcript : transcript 
      }));
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      vitals: {
        heartRate: Number(formData.heartRate),
        bloodPressureSys: Number(formData.bloodPressureSys),
        bloodPressureDia: Number(formData.bloodPressureDia),
        spO2: Number(formData.spO2),
      },
      symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s)
    };

    const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitr-server.onrender.com/api');

    try {
      const res = await fetch(`${API_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      onPatientAdded?.(data);
      alert('Triage submitted successfully');
      setFormData({
        name: '', age: '', gender: 'Male', heartRate: '', bloodPressureSys: '', bloodPressureDia: '', spO2: '', symptoms: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error submitting data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="text-2xl font-semibold mb-6">{t('intake.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm mb-2">{t('intake.name')}</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.age')}</label>
            <input required type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.gender')}</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white">
              <option value="Male">{t('intake.male')}</option>
              <option value="Female">{t('intake.female')}</option>
              <option value="Other">{t('intake.other')}</option>
            </select>
          </div>
        </div>

        <h3 className="text-xl font-medium text-slate-200 pt-4 border-t border-slate-700">{t('intake.vitals')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.hr')}</label>
            <input required type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.spo2')}</label>
            <input required type="number" name="spO2" value={formData.spO2} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.sys')}</label>
            <input required type="number" name="bloodPressureSys" value={formData.bloodPressureSys} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.dia')}</label>
            <input required type="number" name="bloodPressureDia" value={formData.bloodPressureDia} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-slate-300 text-sm">{t('intake.symptoms')}</label>
            <button 
              type="button" 
              onClick={startListening}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${isListening ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}
            >
              <Mic className={`w-3 h-3 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening ? 'Listening...' : 'Dictate'}
            </button>
          </div>
          <textarea rows="3" name="symptoms" value={formData.symptoms} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-white"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[var(--color-primary)] hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          {loading ? 'Processing...' : t('intake.submit')}
        </button>
      </form>
    </div>
  );
};

export default PatientIntakeForm;
