const express = require('express');
const router = express.Router();
const LabOrder = require('../models/LabOrder');

// Create a new lab order
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, doctorId, testName, priority } = req.body;
    const newOrder = new LabOrder({
      patientId,
      patientName,
      doctorId,
      testName,
      priority
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all lab orders (for Lab Dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await LabOrder.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update lab order status (Complete)
router.put('/:id/complete', async (req, res) => {
  try {
    const order = await LabOrder.findByIdAndUpdate(req.params.id, { status: 'Completed', results: req.body.results }, { new: true });
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
