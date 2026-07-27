// server/services/notificationService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendSMS = async (phoneNumber, message) => {
  console.log(`[Notification Service] Falling back to EMAIL for ${phoneNumber}`);
  // Since we don't have Twilio keys, we route the "SMS" alert as an email to the default user
  return sendEmailAlert(message, 'SMS Backup');
};

const sendWhatsApp = async (phoneNumber, message) => {
  console.log(`[Notification Service] Falling back to EMAIL for ${phoneNumber}`);
  // Route WhatsApp alert as an email
  return sendEmailAlert(message, 'WhatsApp Backup');
};

const sendEmailAlert = async (message, type) => {
  try {
    const mailOptions = {
      from: `"Swasthya Mitra Triage" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Sending to the registered user for demo purposes
      subject: `Swasthya Mitra Alert (${type})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #0f172a;">Swasthya Mitra Health Alert</h2>
          <p style="background-color: #e0e7ff; color: #3730a3; padding: 15px; border-radius: 8px; font-weight: bold;">
            ${message}
          </p>
          <p style="font-size: 12px; color: #64748b;">This is an automated notification from the Swasthya Mitra Rural Triage System.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId, type: 'Email' };
  } catch (error) {
    console.error('Nodemailer Error:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendWhatsApp,
};
