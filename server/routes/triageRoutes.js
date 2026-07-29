const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// AI Triage Logic Simulation
const calculateRisk = (vitals, symptoms) => {
  let riskLevel = 'Normal';
  let flaggedConditions = [];

  const { heartRate, bloodPressureSys, bloodPressureDia, spO2 } = vitals;

  // Cardiovascular checks
  if (bloodPressureSys >= 160 || bloodPressureDia >= 100) {
    riskLevel = 'High Risk';
    flaggedConditions.push('Hypertensive Crisis');
  } else if (bloodPressureSys >= 140 || bloodPressureDia >= 90) {
    if (riskLevel === 'Normal') riskLevel = 'Elevated';
    flaggedConditions.push('Hypertension');
  }

  if (heartRate > 120 || heartRate < 50) {
    riskLevel = 'High Risk';
    flaggedConditions.push('Abnormal Heart Rate');
  }

  if (spO2 < 92) {
    riskLevel = 'High Risk';
    flaggedConditions.push('Hypoxia');
  }

  // Symptom checks
  const criticalSymptoms = ['chest pain', 'shortness of breath', 'chhati ma dukhvo', 'shwas levama taklif'];
  
  const hasCriticalSymptom = symptoms.some(sym => 
    criticalSymptoms.some(crit => sym.toLowerCase().includes(crit))
  );

  if (hasCriticalSymptom) {
    riskLevel = 'High Risk';
    flaggedConditions.push('Critical Symptom Reported');
  }

  return { riskLevel, flaggedConditions };
};

// @route   POST /api/triage
// @desc    Submit patient vitals/symptoms and calculate risk
router.post('/', async (req, res) => {
  try {
    const { name, age, gender, language, vitals, symptoms } = req.body;

    const { riskLevel, flaggedConditions } = calculateRisk(vitals, symptoms);

    const newPatient = new Patient({
      name,
      age,
      gender,
      language,
      vitals,
      symptoms,
      riskLevel,
      flaggedConditions
    });

    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Triage POST Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/triage
// @desc    Get all triaged patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Triage GET Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/triage/:id/vitals
// @desc    Update patient vitals
router.put('/:id/vitals', async (req, res) => {
  try {
    const { vitals } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    patient.vitals = { ...patient.vitals, ...vitals };
    
    // Recalculate risk if needed based on new vitals
    const { riskLevel, flaggedConditions } = calculateRisk(patient.vitals, patient.symptoms);
    patient.riskLevel = riskLevel;
    patient.flaggedConditions = flaggedConditions;
    
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    console.error('Triage PUT Vitals Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/triage/:id/iv
// @desc    Toggle patient IV drip status
router.put('/:id/iv', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    patient.ivDrip = !patient.ivDrip;
    
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    console.error('Triage PUT IV Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
