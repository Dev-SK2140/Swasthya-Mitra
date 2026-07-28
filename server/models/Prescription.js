const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String },
  medicines: [{
    name: { type: String, required: true },
    dose: { type: String },
    duration: { type: String }
  }],
  advice: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Dispensed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
