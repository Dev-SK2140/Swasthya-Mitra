const express = require('express');
const router = express.Router();
const EmergencyReferral = require('../models/EmergencyReferral');
const { sendNotification } = require('../services/notificationService');

// @route   POST /api/referrals
// @desc    Submit a new emergency SOS or referral
router.post('/', async (req, res) => {
  try {
    const { type, toFacility, reason, priority, transportRequested, patientName } = req.body;
    
    const referral = new EmergencyReferral({
      type,
      toFacility,
      reason,
      priority,
      transportRequested,
      patientName
    });

    await referral.save();

    // Trigger Email Notification using existing service
    const emailSubject = `🚨 ${priority.toUpperCase()} PRIORITY: ${type} at ${toFacility}`;
    const emailText = `An urgent ${type.toLowerCase()} has been initiated.\n\nPriority: ${priority}\nPatient: ${patientName || 'Unknown'}\nReason: ${reason}\nAmbulance Requested: ${transportRequested ? 'YES' : 'NO'}\n\nPlease prepare immediately.`;
    
    // In a real scenario, this would go to the target hospital's emergency desk
    await sendNotification('emergency-desk@demo.com', emailSubject, emailText);

    res.status(201).json(referral);
  } catch (error) {
    console.error('Error submitting referral:', error);
    res.status(500).json({ message: 'Error submitting referral' });
  }
});

// @route   GET /api/referrals
// @desc    Get all active referrals
router.get('/', async (req, res) => {
  try {
    const referrals = await EmergencyReferral.find().sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referrals' });
  }
});

module.exports = router;
