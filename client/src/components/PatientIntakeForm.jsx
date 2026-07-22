import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

    try {
      const res = await fetch('http://localhost:5000/api/triage', {
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
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.age')}</label>
            <input required type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.gender')}</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white">
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
            <input required type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.spo2')}</label>
            <input required type="number" name="spO2" value={formData.spO2} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.sys')}</label>
            <input required type="number" name="bloodPressureSys" value={formData.bloodPressureSys} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-2">{t('intake.dia')}</label>
            <input required type="number" name="bloodPressureDia" value={formData.bloodPressureDia} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-2">{t('intake.symptoms')}</label>
          <textarea rows="3" name="symptoms" value={formData.symptoms} onChange={handleChange} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
          {loading ? 'Processing...' : t('intake.submit')}
        </button>
      </form>
    </div>
  );
};

export default PatientIntakeForm;
