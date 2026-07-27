const express = require('express');
const router = express.Router();
const CommunitySurvey = require('../models/CommunitySurvey');

// @route   POST /api/surveys
// @desc    Submit a new community health survey
router.post('/', async (req, res) => {
  try {
    const survey = new CommunitySurvey(req.body);
    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting survey' });
  }
});

// @route   GET /api/surveys
// @desc    Get all community health surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await CommunitySurvey.find().sort({ createdAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching surveys' });
  }
});

module.exports = router;
