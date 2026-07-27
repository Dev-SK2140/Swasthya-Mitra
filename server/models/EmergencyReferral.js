const mongoose = require('mongoose');

const EmergencyReferralSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: { type: String }, // Can be provided if not registered
  type: { type: String, enum: ['Emergency SOS', 'Inter-Facility Referral'], required: true },
  fromFacility: { type: String, default: 'Village Health Clinic' },
  toFacility: { type: String, required: true },
  reason: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  transportRequested: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Dispatched', 'Arrived', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyReferral', EmergencyReferralSchema);
