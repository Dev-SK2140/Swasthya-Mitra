const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  category: { type: String, required: true }, // e.g., 'Tablet', 'Syrup', 'Injection'
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'strips' },
  threshold: { type: Number, required: true }, // Low stock alert threshold
  expiryDate: { type: Date, required: true },
  batchNumber: { type: String },
  price: { type: Number }, // For Jan Aushadhi generic comparison
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
