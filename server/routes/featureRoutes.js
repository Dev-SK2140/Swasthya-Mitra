const express = require('express');
const router = express.Router();
const FeatureData = require('../models/FeatureData');
const Patient = require('../models/Patient');
const MaternalHealth = require('../models/MaternalHealth');
const HospitalBed = require('../models/HospitalBed');
const EmergencyReferral = require('../models/EmergencyReferral');

// 1. ASHA Survey
router.post('/asha-survey', async (req, res) => {
    try {
        const newData = new FeatureData({ type: 'asha_survey', data: req.body });
        await newData.save();
        res.status(201).json({ message: 'ASHA survey submitted successfully', data: newData });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting survey', error: error.message });
    }
});

// 2. Drug Safety
router.post('/drug-safety', async (req, res) => {
    try {
        const newData = new FeatureData({ type: 'drug_safety', data: req.body });
        await newData.save();
        // In a real app, you'd check a medical database here.
        // For now, we simulate an API check and save the query log.
        res.status(201).json({ message: 'Drug interaction logged', data: newData });
    } catch (error) {
        res.status(500).json({ message: 'Error checking drug safety', error: error.message });
    }
});

// 3. PM-JAY Verification
router.post('/pmjay-verify', async (req, res) => {
    try {
        const { abhaId, rationCard } = req.body;
        const newData = new FeatureData({ type: 'pmjay_claim', data: req.body });
        await newData.save();
        
        // Mock verification logic
        const isEligible = abhaId?.length > 5 || rationCard?.length > 5;
        res.status(200).json({ 
            eligible: isEligible, 
            message: isEligible ? 'Eligible for PM-JAY benefits' : 'Verification failed. Please check details.',
            coverageAmount: isEligible ? 500000 : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying PM-JAY', error: error.message });
    }
});

// 4. Ambulance Dispatch
router.post('/ambulance', async (req, res) => {
    try {
        const newData = new FeatureData({ type: 'ambulance_dispatch', data: req.body });
        await newData.save();
        res.status(201).json({ message: '108 EMRI Ambulance dispatched successfully', data: newData });
    } catch (error) {
        res.status(500).json({ message: 'Error dispatching ambulance', error: error.message });
    }
});

// Get all feature data (for admin or analytics)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const data = await FeatureData.find(query).sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feature data', error: error.message });
    }
});

// @route   GET /api/features/analytics
// @desc    Get aggregated analytics for the admin dashboard
router.get('/analytics', async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const highRiskPatients = await Patient.countDocuments({ riskLevel: { $in: ['High Risk', 'Emergency', 'Critical'] } });
        
        const mchCases = await MaternalHealth.countDocuments({ status: 'Active' });
        const highRiskMch = await MaternalHealth.countDocuments({ status: 'Active', highRisk: true });
        
        const totalBeds = await HospitalBed.countDocuments();
        const occupiedBeds = await HospitalBed.countDocuments({ status: 'Occupied' });
        const criticalBeds = await HospitalBed.countDocuments({ status: 'Critical' });
        
        const activeReferrals = await EmergencyReferral.countDocuments({ status: { $in: ['Pending', 'Dispatched'] } });

        res.json({
            patients: { total: totalPatients, highRisk: highRiskPatients },
            mch: { total: mchCases, highRisk: highRiskMch },
            beds: { total: totalBeds, occupied: occupiedBeds, critical: criticalBeds },
            referrals: { active: activeReferrals }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
