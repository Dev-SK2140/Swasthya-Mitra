const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_swasthya_mitra';

const EMAIL_USER = process.env.EMAIL_USER || 'sk90168440@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'zfkiejmqvmycgofz';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090d16; padding: 30px 15px; color: #f8fafc;">
            <div style="max-width: 580px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #07a9b0 0%, #4f46e5 100%); padding: 35px 25px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">સ્વાસ્થ્ય મિત્ર AI</h1>
                    <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 13px; font-weight: 500;">Swasthya Mitra Rural Healthcare Platform • Govt. of Gujarat</p>
                </div>
                <div style="padding: 35px 30px; background-color: #0f172a;">
                    <h2 style="font-size: 18px; margin-top: 0; font-weight: 700; color: #f8fafc;">Account Verification Code</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                        Hello! Please use the following 6-digit One-Time Password (OTP) to complete your account registration.
                    </p>
                    <div style="border: 2px dashed #07a9b0; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px; background-color: #090d16;">
                        <div style="font-size: 38px; font-weight: 900; letter-spacing: 14px; color: #82d8a5; text-indent: 14px;">
                            ${otp}
                        </div>
                        <div style="font-size: 11px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px; font-weight: 700;">
                            Valid for 5 Minutes
                        </div>
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 25px;">
                        If you did not request this verification code, please ignore this email or contact PHC administrator.
                    </p>
                    <hr style="border: none; border-top: 1px solid #1e293b; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #cbd5e1;">Government of Gujarat • Health & Family Welfare Department</p>
                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Primary Health Center Triage Unit</p>
                    </div>
                </div>
            </div>
        </div>
        `;

        const mailOptions = {
            from: `"Swasthya Mitra AI" <${EMAIL_USER}>`,
            to: email,
            subject: `[Swasthya Mitra] Your Verification Code: ${otp}`,
            html: htmlTemplate
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL SUCCESS] Real OTP email sent to ${email}`);
            return res.status(200).json({ message: 'OTP sent to your email inbox' });
        } catch (mailErr) {
            console.error('[EMAIL ERROR] Nodemailer send failed:', mailErr.message);
            // Fallback response with OTP if email server fails
            return res.status(200).json({ message: 'OTP sent', otp });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ message: 'Error generating OTP' });
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

        // Strict Admin Protection: Only shahidsandhi1786@gmail.com can be Admin
        const assignedRole = (role === 'Admin' && email.toLowerCase() !== 'shahidsandhi1786@gmail.com') 
            ? 'Doctor' 
            : (role || 'Doctor');

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role: assignedRole
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
                role: "Doctor",
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
