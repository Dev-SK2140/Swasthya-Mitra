const mongoose = require('mongoose');

const HospitalBedSchema = new mongoose.Schema({
  ward: { type: String, enum: ['General', 'ICU', 'Maternity', 'Emergency'], required: true },
  bedNumber: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  admittedAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('HospitalBed', HospitalBedSchema);
