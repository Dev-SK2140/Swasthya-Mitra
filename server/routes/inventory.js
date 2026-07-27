const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Seed some initial inventory if empty
const seedInventory = async () => {
  const count = await Inventory.countDocuments();
  if (count === 0) {
    await Inventory.insertMany([
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Tablet', quantity: 15, threshold: 50, expiryDate: new Date('2026-09-01') },
      { name: 'Electral ORS Sachets', genericName: 'ORS', category: 'Powder', quantity: 40, threshold: 100, expiryDate: new Date('2025-12-01') },
      { name: 'Paracetamol 650mg', genericName: 'Paracetamol', category: 'Tablet', quantity: 500, threshold: 200, expiryDate: new Date('2027-01-01') },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: 'Tablet', quantity: 120, threshold: 100, expiryDate: new Date('2026-05-01') },
      { name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan', category: 'Syrup', quantity: 5, threshold: 20, expiryDate: new Date('2024-11-01') }, // Low stock & near expiry
    ]);
    console.log('✅ Seeded demo inventory');
  }
};
seedInventory();

// Get all inventory
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory quantity
router.patch('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
