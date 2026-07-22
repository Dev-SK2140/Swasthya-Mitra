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
  riskLevel: {
    type: String,
    enum: ['Normal', 'Elevated', 'High Risk', 'Emergency'],
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
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
