const express = require('express');
const router = express.Router();
const { analyzeTriageData, chatFollowUp, generalAssistantChat } = require('../services/aiService');
const Patient = require('../models/Patient');

// @route   POST /api/ai/chat
// @desc    Process dynamic follow-up questions for triage
router.post('/chat', async (req, res) => {
  try {
    const { history, currentInput } = req.body;
    if (!currentInput) {
      return res.status(400).json({ message: 'Input is required' });
    }

    const response = await chatFollowUp(history || [], currentInput);
    res.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Error processing AI chat' });
  }
});

// @route   POST /api/ai/analyze
// @desc    Generate structured triage JSON and save to DB
router.post('/analyze', async (req, res) => {
  try {
    const { name, age, gender, language, vitals, symptoms, history } = req.body;
    
    // Create the full context object for Gemini
    const patientContext = {
      age,
      gender,
      language: language || 'en',
      vitals,
      symptoms,
      conversation_history: history
    };

    // Call Gemini to analyze
    const aiAnalysis = await analyzeTriageData(patientContext);

    // Save to Database
    const newPatient = new Patient({
      name,
      age,
      gender,
      language: aiAnalysis.language || language || 'en',
      vitals,
      symptoms: aiAnalysis.symptoms || symptoms,
      riskLevel: aiAnalysis.risk_level || 'Normal',
      flaggedConditions: aiAnalysis.possible_risks || [],
      aiAnalysis: {
        duration: aiAnalysis.duration,
        severity: aiAnalysis.severity,
        riskScore: aiAnalysis.risk_score,
        confidence: aiAnalysis.confidence,
        possibleRisks: aiAnalysis.possible_risks,
        doctorSummary: aiAnalysis.doctor_summary,
        recommendation: aiAnalysis.recommendation,
        referral: aiAnalysis.referral,
        healthEducation: aiAnalysis.health_education,
        explanation: aiAnalysis.explanation || 'Analyzed via AI model'
      }
    });

    const savedPatient = await newPatient.save();
    res.status(201).json({ patient: savedPatient, aiAnalysis });
  } catch (error) {
    console.error('AI Analyze Error:', error);
    res.status(500).json({ message: 'Error analyzing patient data' });
  }
});

// @route   POST /api/ai/assistant
// @desc    General medical assistant chat for doctors/nurses
router.post('/assistant', async (req, res) => {
  try {
    const { history, currentInput } = req.body;
    if (!currentInput) {
      return res.status(400).json({ message: 'Input is required' });
    }

    const response = await generalAssistantChat(history || [], currentInput);
    res.json(response);
  } catch (error) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({ message: 'Error processing AI assistant chat' });
  }
});

module.exports = router;
