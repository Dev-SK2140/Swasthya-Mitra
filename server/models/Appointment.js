const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String
  },
  doctorId: {
    type: String, // Can just store a string ID for now
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  date: {
    type: String, // ISO date string (YYYY-MM-DD)
    required: true
  },
  time: {
    type: String, // e.g., "10:00 AM"
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
