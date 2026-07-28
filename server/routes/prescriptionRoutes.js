const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');

// Create a new prescription
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, doctorId, medicines, advice } = req.body;
    const newRx = new Prescription({
      patientId,
      patientName,
      doctorId,
      medicines,
      advice
    });
    const savedRx = await newRx.save();
    res.status(201).json(savedRx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all pending prescriptions (for Pharmacy)
router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get prescriptions for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update prescription status (Dispense)
router.put('/:id/dispense', async (req, res) => {
  try {
    const rx = await Prescription.findByIdAndUpdate(req.params.id, { status: 'Dispensed' }, { new: true });
    res.status(200).json(rx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
