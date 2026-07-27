const express = require('express');
const router = express.Router();
const HospitalBed = require('../models/HospitalBed');

// Initialize some default beds if none exist
const initializeBeds = async () => {
  const count = await HospitalBed.countDocuments();
  if (count === 0) {
    const bedsToCreate = [];
    ['General', 'ICU', 'Maternity', 'Emergency'].forEach(ward => {
      for (let i = 1; i <= 5; i++) {
        bedsToCreate.push({
          ward,
          bedNumber: `${ward.substring(0, 1).toUpperCase()}-${100 + i}`,
          status: 'Available'
        });
      }
    });
    await HospitalBed.insertMany(bedsToCreate);
    console.log('✅ Initialized default hospital beds');
  }
};

// Call initialization (in a real app this might be in a seed file)
initializeBeds().catch(console.error);

// @route   GET /api/beds
// @desc    Get all hospital beds
router.get('/', async (req, res) => {
  try {
    const beds = await HospitalBed.find().populate('patientId', 'name age');
    res.json(beds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching beds' });
  }
});

// @route   PUT /api/beds/:id
// @desc    Update a bed's status (occupy/release)
router.put('/:id', async (req, res) => {
  try {
    const { status, patientId, notes } = req.body;
    
    let updateData = { status, notes };
    
    if (status === 'Occupied') {
      updateData.patientId = patientId;
      updateData.admittedAt = new Date();
    } else {
      updateData.patientId = null;
      updateData.admittedAt = null;
    }

    const updatedBed = await HospitalBed.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after' }
    ).populate('patientId', 'name age');

    res.json(updatedBed);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bed' });
  }
});

module.exports = router;
