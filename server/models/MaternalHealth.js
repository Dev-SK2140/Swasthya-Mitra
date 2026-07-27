const mongoose = require('mongoose');

const ANCVisitSchema = new mongoose.Schema({
  visitDate: { type: Date, required: true },
  trimester: { type: Number, required: true, min: 1, max: 3 },
  weight: { type: Number },
  bloodPressureSys: { type: Number },
  bloodPressureDia: { type: Number },
  hemoglobin: { type: Number },
  fetalHeartRate: { type: Number },
  ironFolicAcidGiven: { type: Boolean, default: false },
  tetanusToxoidGiven: { type: Boolean, default: false },
  notes: { type: String }
});

const MaternalHealthSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  lastMenstrualPeriod: { type: Date, required: true },
  estimatedDeliveryDate: { type: Date, required: true },
  gravida: { type: Number, required: true, default: 1 }, // Total pregnancies
  para: { type: Number, required: true, default: 0 },    // Live births
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  highRisk: { type: Boolean, default: false },
  highRiskFactors: [{ type: String }], // e.g., 'Anemia', 'Hypertension', 'Gestational Diabetes'
  ancVisits: [ANCVisitSchema],
  status: { type: String, enum: ['Active', 'Delivered', 'Miscarriage', 'Transferred'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('MaternalHealth', MaternalHealthSchema);
