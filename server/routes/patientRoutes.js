const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const MedicalHistory = require('../models/MedicalHistory');

// @route   GET /api/patients
// @desc    Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient' });
  }
});

// @route   GET /api/patients/:id/history
// @desc    Get medical history for a patient
router.get('/:id/history', async (req, res) => {
  try {
    const history = await MedicalHistory.find({ patientId: req.params.id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical history' });
  }
});

// @route   POST /api/patients/:id/history
// @desc    Add a medical history record for a patient
router.post('/:id/history', async (req, res) => {
  try {
    const { type, doctor, notes, diagnosis, status } = req.body;
    const newRecord = new MedicalHistory({
      patientId: req.params.id,
      type,
      doctor,
      notes,
      diagnosis,
      status
    });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error adding medical history' });
  }
});

module.exports = router;
