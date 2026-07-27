const express = require('express');
const router = express.Router();
const MaternalHealth = require('../models/MaternalHealth');
const Patient = require('../models/Patient');

// @route   GET /api/mch
// @desc    Get all active MCH patients
router.get('/', async (req, res) => {
  try {
    const mchRecords = await MaternalHealth.find({ status: 'Active' }).populate('patientId', 'name age phone village');
    res.json(mchRecords);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching MCH records' });
  }
});

// @route   POST /api/mch
// @desc    Register a new patient into MCH tracking
router.post('/', async (req, res) => {
  try {
    const { patientId, lastMenstrualPeriod, gravida, para, bloodGroup, highRiskFactors } = req.body;
    
    // Calculate EDD (Naegele's rule: LMP + 7 days + 9 months)
    const lmpDate = new Date(lastMenstrualPeriod);
    const edd = new Date(lmpDate);
    edd.setDate(edd.getDate() + 7);
    edd.setMonth(edd.getMonth() + 9);

    const newRecord = new MaternalHealth({
      patientId,
      lastMenstrualPeriod,
      estimatedDeliveryDate: edd,
      gravida,
      para,
      bloodGroup,
      highRisk: highRiskFactors && highRiskFactors.length > 0,
      highRiskFactors
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ message: 'Error creating MCH record' });
  }
});

module.exports = router;
