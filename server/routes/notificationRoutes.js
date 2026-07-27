const express = require('express');
const router = express.Router();
const { sendSMS, sendWhatsApp } = require('../services/notificationService');

router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message, type } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required.' });
    }

    let result;
    if (type === 'whatsapp') {
      result = await sendWhatsApp(phoneNumber, message);
    } else {
      result = await sendSMS(phoneNumber, message);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
