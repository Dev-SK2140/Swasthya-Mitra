const mongoose = require('mongoose');

const CommunitySurveySchema = new mongoose.Schema({
  village: { type: String, required: true },
  familyHeadName: { type: String, required: true },
  familySize: { type: Number, required: true },
  hasPregnantWomen: { type: Boolean, default: false },
  hasChildrenUnderFive: { type: Boolean, default: false },
  waterSource: { type: String, enum: ['Tap', 'Well', 'Handpump', 'Other'] },
  sanitation: { type: String, enum: ['Private Toilet', 'Public Toilet', 'Open Defecation'] },
  healthConcerns: [{ type: String }],
  notes: { type: String },
  submittedBy: { type: String } // ASHA worker name or ID
}, { timestamps: true });

module.exports = mongoose.model('CommunitySurvey', CommunitySurveySchema);
