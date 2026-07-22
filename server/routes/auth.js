const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// In-memory store for OTPs: { email: { otp: string, expiresAt: Date } }
const otpStore = new Map();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Save to store (expires in 5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Send Email
    const mailOptions = {
      from: `"Swasthya Mitra AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Registration OTP - Swasthya Mitra',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #07a9b0;">Swasthya Mitra AI</h2>
          <p>Hello,</p>
          <p>Please use the following One Time Password (OTP) to complete your registration:</p>
          <h1 style="letter-spacing: 5px; color: #1b2532; background: #f3f4f6; padding: 10px; border-radius: 5px; width: fit-content;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send OTP email' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;
    
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    // Verify OTP
    const storedOtpData = otpStore.get(email);
    
    if (!storedOtpData) {
      return res.status(400).json({ message: 'No OTP requested for this email or OTP expired' });
    }
    
    if (new Date() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Clear the OTP after successful verification
    otpStore.delete(email);

    // Check if user exists (Double check)
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
