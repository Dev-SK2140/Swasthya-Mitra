const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();



const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now, should restrict in production
    methods: ['GET', 'POST']
  }
});

// Socket.io Events for Telemedicine
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Telemedicine Signaling
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.roomId).emit('newMessage', data);
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const path = require('path');

// Add Routes
const triageRoutes = require('./routes/triageRoutes');
app.use('/api/triage', triageRoutes);

const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patients', patientRoutes);

const bedRoutes = require('./routes/bedRoutes');
app.use('/api/beds', bedRoutes);

const surveyRoutes = require('./routes/surveyRoutes');
app.use('/api/surveys', surveyRoutes);

const referralRoutes = require('./routes/referralRoutes');
app.use('/api/referrals', referralRoutes);

// Auth routes (real JWT)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// AI Triage routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Feature routes
const featureRoutes = require('./routes/featureRoutes');
app.use('/api/features', featureRoutes);

// MCH routes
const mchRoutes = require('./routes/mchRoutes');
app.use('/api/mch', mchRoutes);

// Inventory routes
const inventoryRoutes = require('./routes/inventory');
app.use('/api/inventory', inventoryRoutes);

// Notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Appointment routes
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

// Prescription routes
const prescriptionRoutes = require('./routes/prescriptionRoutes');
app.use('/api/prescriptions', prescriptionRoutes);

// Lab routes
const labRoutes = require('./routes/labRoutes');
app.use('/api/lab', labRoutes);

// Serve static frontend in production / single-service deployment
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  next();
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
  // Remove old generic admin demo user
  await User.deleteOne({ email: 'admin@demo.com' });

  const demoUsers = [
    { name: 'Dr. Rajesh Kumar', email: 'doctor@demo.com', password: 'password', role: 'Doctor' },
    { name: 'Dr. Priya Sharma', email: 'doctor2@demo.com', password: 'password', role: 'Doctor' },
    { name: 'Nurse Anjali Patel', email: 'nurse@demo.com', password: 'password', role: 'Nurse' },
    { name: 'Sunita Desai (Reception)', email: 'receptionist@demo.com', password: 'password', role: 'Receptionist' },
    { name: 'Shahid Sandhi (Admin)', email: 'shahidsandhi1786@gmail.com', password: 'sk2140', role: 'Admin' },
    { name: 'Ramesh Singh (Patient)', email: 'patient@demo.com', password: 'password', role: 'Patient' },
    { name: 'Amit Verma (Lab)', email: 'lab@demo.com', password: 'password', role: 'Lab' },
    { name: 'Sneha Patel (Pharmacy)', email: 'pharmacy@demo.com', password: 'password', role: 'Pharmacy' }
  ];

  for (let user of demoUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { ...user, password: hashedPassword } },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`✅ Seeded/Updated user: ${user.name} (${user.email}) -> Role: ${user.role}`);
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
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Starting server without DB connection for demo purposes...');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (No DB)`));
  });
