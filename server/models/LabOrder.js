const mongoose = require('mongoose');

const LabOrderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String },
  testName: { type: String, required: true },
  priority: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  results: { type: String } // Optional text results or URL
}, { timestamps: true });

module.exports = mongoose.model('LabOrder', LabOrderSchema);
