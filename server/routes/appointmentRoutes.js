const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Get all appointments (or by email/doctorId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.patientEmail) filter.patientEmail = req.query.patientEmail;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;

    const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a new appointment
router.post('/', async (req, res) => {
  try {
    const newApt = new Appointment(req.body);
    const savedApt = await newApt.save();
    res.status(201).json(savedApt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
