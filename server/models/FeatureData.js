const mongoose = require('mongoose');

const FeatureDataSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['asha_survey', 'drug_safety', 'pmjay_claim', 'ambulance_dispatch'],
    required: true
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FeatureData', FeatureDataSchema);
