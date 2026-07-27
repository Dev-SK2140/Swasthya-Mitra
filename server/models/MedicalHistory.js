const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['Consultation', 'Lab Report', 'Prescription', 'Triage'], required: true },
  doctor: { type: String },
  notes: { type: String },
  attachments: [{ type: String }],
  diagnosis: { type: String },
  status: { type: String, enum: ['Completed', 'Pending', 'Referred'], default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);
