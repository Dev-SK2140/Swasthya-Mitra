const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { analyzeTriageData, chatFollowUp, generalAssistantChat } = require('../services/aiService');
const Patient = require('../models/Patient');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


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

// @route   POST /api/ai/scan-report
// @desc    Actual OCR extraction using Gemini Vision API
router.post('/scan-report', upload.single('reportImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');

    // Prompt for Gemini to parse the lab report
    const prompt = `You are a medical lab report parser. Extract the following details from this image and return ONLY a valid JSON object matching this structure:
{
  "patientName": "string",
  "reportType": "string",
  "findings": [
    { "test": "string", "value": "string (with units)", "status": "Normal | Low | High | Elevated", "normal": "string", "flag": "string" }
  ],
  "aiInterpretation": "string (brief clinical summary)"
}`;

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    // Parse the JSON from the markdown block
    let responseText = response.text;
    // Clean up markdown ```json ... ``` formatting if present
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(responseText);

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ success: false, message: 'Error scanning report with Gemini' });
  }
});

// @route   POST /api/ai/translate
// @desc    Translate medical text (prescription) to local language
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ success: false, message: 'Text and target language required' });
    }

    const prompt = `You are a medical translator. Translate the following medical prescription or text into ${targetLanguage}. 
Keep the medical terms accurate but ensure the dosage instructions (e.g., "Take 1 pill twice a day after meals") are very simple and easy to understand for a rural patient.
Return ONLY the translated text without any markdown or extra conversational filler.

Text to translate:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    res.json({ success: true, translation: response.text.trim() });
  } catch (error) {
    console.error('AI Translation Error:', error);
    res.status(500).json({ success: false, message: 'Error translating text' });
  }
});

module.exports = router;
