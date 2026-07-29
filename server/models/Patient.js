const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String },
  language: { type: String, default: 'en' },
  vitals: {
    heartRate: { type: Number },
    bloodPressureSys: { type: Number },
    bloodPressureDia: { type: Number },
    spO2: { type: Number },
  },
  symptoms: [{ type: String }],
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  riskLevel: {
    type: String,
    default: 'Normal'
  },
  flaggedConditions: [{ type: String }],
  
  // New AI Triage Fields
  aiAnalysis: {
    duration: { type: String },
    severity: { type: String },
    riskScore: { type: Number },
    confidence: { type: Number },
    possibleRisks: [{ type: String }],
    doctorSummary: { type: String },
    recommendation: { type: String },
    referral: { type: String },
    healthEducation: { type: String },
    explanation: { type: String }
  },
  history: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Triage', 'Consultation', 'Lab Report', 'Prescription', 'Note'], default: 'Note' },
    doctor: { type: String },
    notes: { type: String }
  }],
  
  createdAt: { type: Date, default: Date.now },
  ivDrip: { type: Boolean, default: false }
});

module.exports = mongoose.model('Patient', PatientSchema);
