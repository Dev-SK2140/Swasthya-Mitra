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
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

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
const bcrypt = require('bcryptjs');

const seedDemoUsers = async () => {
  const demoUsers = [
    { name: 'Dr. Demo', email: 'doctor@demo.com', password: 'password', role: 'Doctor' },
    { name: 'Nurse Demo', email: 'nurse@demo.com', password: 'password', role: 'Nurse' },
    { name: 'Receptionist Demo', email: 'receptionist@demo.com', password: 'password', role: 'Receptionist' },
    { name: 'Admin Demo', email: 'admin@demo.com', password: 'password', role: 'Admin' }
  ];

  for (let user of demoUsers) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      await User.create({ ...user, password: hashedPassword });
      console.log(`✅ Seeded demo user: ${user.email} | password: password`);
    }
  }
};

mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDemoUsers();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Starting server without DB connection for demo purposes...');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (No DB)`));
  });
