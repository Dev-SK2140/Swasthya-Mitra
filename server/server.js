const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add Routes
const triageRoutes = require('./routes/triageRoutes');
app.use('/api/triage', triageRoutes);

// Auth routes (real JWT)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// AI Triage routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Mock Google Auth (legacy for smooth hackathon testing if needed)
app.post('/api/auth/google', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { name: 'Dr. Admin', role: 'Doctor' } });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string_here') {
  console.warn('⚠️  MONGODB_URI is not set in .env file. Please add your connection string.');
}

const User = require('./models/User');
const Patient = require('./models/Patient');
const bcrypt = require('bcryptjs');

const seedDemoUsers = async () => {
  const demoUsers = [
    { name: 'Dr. Rajesh Kumar', email: 'doctor@demo.com', password: 'password', role: 'Doctor' },
    { name: 'Dr. Priya Sharma', email: 'doctor2@demo.com', password: 'password', role: 'Doctor' },
    { name: 'Nurse Anjali Patel', email: 'nurse@demo.com', password: 'password', role: 'Nurse' },
    { name: 'Sunita Desai (Reception)', email: 'receptionist@demo.com', password: 'password', role: 'Receptionist' },
    { name: 'Amit Verma (Admin)', email: 'admin@demo.com', password: 'password', role: 'Admin' }
  ];

  for (let user of demoUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { ...user, password: hashedPassword } },
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded/Updated demo user: ${user.name} (${user.email})`);
  }
};

const seedDemoPatients = async () => {
  const count = await Patient.countDocuments();
  if (count < 5) {
    const demoPatients = [
      {
        name: 'Ramesh Singh', age: 45, gender: 'Male', language: 'hi',
        vitals: { heartRate: 105, bloodPressureSys: 150, bloodPressureDia: 95, spO2: 94 },
        symptoms: ['chest pain', 'shortness of breath', 'sweating'],
        riskLevel: 'High Risk', flaggedConditions: ['Possible Myocardial Infarction']
      },
      {
        name: 'Kavita Joshi', age: 28, gender: 'Female', language: 'gu',
        vitals: { heartRate: 78, bloodPressureSys: 110, bloodPressureDia: 75, spO2: 98 },
        symptoms: ['mild fever', 'cough', 'sore throat'],
        riskLevel: 'Normal', flaggedConditions: []
      },
      {
        name: 'Anil Mehta', age: 62, gender: 'Male', language: 'en',
        vitals: { heartRate: 88, bloodPressureSys: 135, bloodPressureDia: 85, spO2: 96 },
        symptoms: ['joint pain', 'fatigue'],
        riskLevel: 'Elevated', flaggedConditions: ['Arthritis flair']
      },
      {
        name: 'Meena Shah', age: 35, gender: 'Female', language: 'hi',
        vitals: { heartRate: 110, bloodPressureSys: 140, bloodPressureDia: 90, spO2: 97 },
        symptoms: ['severe headache', 'blurred vision', 'nausea'],
        riskLevel: 'Elevated', flaggedConditions: ['Migraine / Hypertension']
      },
      {
        name: 'Sanjay Reddy', age: 50, gender: 'Male', language: 'en',
        vitals: { heartRate: 120, bloodPressureSys: 160, bloodPressureDia: 100, spO2: 92 },
        symptoms: ['difficulty breathing', 'chest tightness'],
        riskLevel: 'High Risk', flaggedConditions: ['Severe Asthma / COPD Exacerbation']
      }
    ];
    await Patient.insertMany(demoPatients);
    console.log('✅ Seeded demo patients (Indian profiles)');
  }
};

mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDemoUsers();
    await seedDemoPatients();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Starting server without DB connection for demo purposes...');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (No DB)`));
  });
