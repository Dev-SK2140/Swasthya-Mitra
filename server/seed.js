const mongoose = require('mongoose');
require('dotenv').config();

const Patient = require('./models/Patient');
const LabOrder = require('./models/LabOrder');
const Inventory = require('./models/Inventory');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthya-mitra');
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing
    await Patient.deleteMany();
    await LabOrder.deleteMany();
    await Inventory.deleteMany();

    // 1. Seed Patients
    const patients = await Patient.insertMany([
      {
        name: 'Ramesh Bhai', age: 45, gender: 'Male', language: 'gu',
        vitals: { heartRate: 110, bloodPressureSys: 150, bloodPressureDia: 95, spO2: 96 },
        symptoms: ['chest pain', 'sweating'], riskLevel: 'High Risk', flaggedConditions: ['Hypertension']
      },
      {
        name: 'Sita Ben', age: 32, gender: 'Female', language: 'hi',
        vitals: { heartRate: 85, bloodPressureSys: 120, bloodPressureDia: 80, spO2: 98 },
        symptoms: ['mild fever', 'cough'], riskLevel: 'Normal', flaggedConditions: []
      },
      {
        name: 'Anil Kumar', age: 60, gender: 'Male', language: 'en',
        vitals: { heartRate: 95, bloodPressureSys: 135, bloodPressureDia: 85, spO2: 94 },
        symptoms: ['shortness of breath'], riskLevel: 'Elevated', flaggedConditions: ['Asthma History']
      }
    ]);
    console.log(`✅ Seeded ${patients.length} Patients`);

    // 2. Seed Lab Orders
    const labOrders = await LabOrder.insertMany([
      { patientId: patients[0]._id, patientName: patients[0].name, doctorId: 'Dr. Sharma', testName: 'ECG & Trop-T', priority: 'Urgent', status: 'Pending' },
      { patientId: patients[1]._id, patientName: patients[1].name, doctorId: 'Dr. Sharma', testName: 'CBC, Dengue NS1', priority: 'Normal', status: 'Pending' }
    ]);
    console.log(`✅ Seeded ${labOrders.length} Lab Orders`);

    // 3. Seed Inventory (Pharmacy)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const inventory = await Inventory.insertMany([
      { name: 'Paracetamol 500mg', category: 'Tablet', quantity: 50, reorderLevel: 100, threshold: 20, price: 15, expiryDate: nextYear, genericName: 'Acetaminophen', batchNumber: 'BAT100' },
      { name: 'Amoxicillin 250mg', category: 'Capsule', quantity: 150, reorderLevel: 50, threshold: 10, price: 40, expiryDate: nextYear, genericName: 'Amoxicillin', batchNumber: 'BAT101' },
      { name: 'ORS Powder', category: 'Packet', quantity: 200, reorderLevel: 50, threshold: 20, price: 20, expiryDate: nextYear, genericName: 'Oral Rehydration Salts', batchNumber: 'BAT102' },
      { name: 'Aspirin 75mg', category: 'Tablet', quantity: 30, reorderLevel: 50, threshold: 15, price: 10, expiryDate: nextYear, genericName: 'Aspirin', batchNumber: 'BAT103' },
      { name: 'Cough Syrup', category: 'Syrup', quantity: 15, reorderLevel: 20, threshold: 5, price: 55, expiryDate: nextYear, genericName: 'Dextromethorphan', batchNumber: 'BAT104' }
    ]);
    console.log(`✅ Seeded ${inventory.length} Inventory Items`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
