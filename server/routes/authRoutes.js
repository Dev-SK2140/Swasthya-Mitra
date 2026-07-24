const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_swasthya_mitra';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP for Registration / Reset
router.post('/send-otp', async (req, res) => {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const existingUser = await User.findOne({ email });

        // If type is not 'reset', we assume it's for registration
        if (type !== 'reset' && existingUser) {
            return res.status(400).json({ message: 'Email already registered. Please login.' });
        }
        if (type === 'reset' && !existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const otp = generateOTP();
        await Otp.create({ email, otp });

        const htmlTemplate = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; padding: 20px; color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
                <div style="background-color: #0f172a; padding: 30px 20px; text-align: center; border-bottom: 1px solid #334155;">
                    <h1 style="margin: 0; color: #818cf8; font-size: 28px; font-weight: bold;">સ્વાસ્થ્ય મિત્ર AI</h1>
                    <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px;">Intelligent Rural Health Triage Platform</p>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="font-size: 18px; margin-top: 0; font-weight: bold; color: #f8fafc;">Hello,</p>
                    <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;">
                        To ensure the security of your account, please verify your identity with the code below.
                    </p>
                    <div style="border: 2px dashed #818cf8; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px; background-color: #0f172a;">
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #ffffff; margin-bottom: 10px;">
                            ${otp.split('').join(' ')}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">
                            Verification Code
                        </div>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 40px;">
                        This code is valid for 5 minutes. Please do not share this code with anyone.
                    </p>
                    <hr style="border: none; border-top: 1px solid #334155; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #f8fafc;">Government of Gujarat</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">Primary Health Centers (PHCs)</p>
                </div>
            </div>
        </div>
        `;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'સ્વાસ્થ્ય મિત્ર AI - Your Verification Code',
                html: htmlTemplate
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            console.log(`[MOCK EMAIL] OTP for ${email} is ${otp}`);
            res.json({ message: 'OTP generated (Check server console)' });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// 2. Register Account
router.post('/register', async (req, res) => {
    const { email, otp, password, name, role } = req.body;
    if (!email || !otp || !password || !name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role: role || 'Patient'
        });
        await newUser.save();
        await Otp.deleteOne({ _id: validOtp._id });

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Registration successful', token, user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 3. Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ==================== GOOGLE LOGIN ====================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_CLIENT_ID is missing");
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        // Verify Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google token"
            });
        }

        const {
            email,
            name,
            picture,
            email_verified
        } = payload;

        if (!email_verified) {
            return res.status(401).json({
                success: false,
                message: "Google email is not verified"
            });
        }

        let user = await User.findOne({ email });

        if (!user) {

            const randomPassword =
                Math.random().toString(36).substring(2) +
                Math.random().toString(36).substring(2);

            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: "Patient",
                profilePicture: picture || "",
                provider: "google"
            });

        } else {

            // Update picture if changed
            if (picture && user.profilePicture !== picture) {
                user.profilePicture = picture;
                await user.save();
            }

        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.profilePicture
            }
        });

    } catch (error) {

        console.error("Google Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Google login failed",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
});

// 5. Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        await Otp.deleteOne({ _id: validOtp._id });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
