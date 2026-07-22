const { GoogleGenAI } = require('@google/genai');

let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY' });
} catch (e) {
  console.error("Warning: Failed to initialize GoogleGenAI. Is GEMINI_API_KEY set?");
}

const triageSystemPrompt = `You are Swasthya Mitra, an AI-powered multilingual health triage assistant for rural clinics.
Your primary role is to process patient symptoms and vitals to identify high-risk patients and assist doctors in clinical prioritization.

IMPORTANT RULES:
1. You DO NOT diagnose diseases.
2. You ONLY assist in triage.
3. Doctors always make the final clinical decision.
4. You must explain why a patient is considered high risk.
5. If vitals or symptoms indicate an emergency, flag it immediately.

When analyzing, output STRICT JSON matching the provided schema.`;

const analyzeTriageData = async (patientContext) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("MOCK AI ANALYSIS: No Gemini API Key provided.");
    return generateMockAnalysis(patientContext);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following patient data for triage:\n\n${JSON.stringify(patientContext)}`,
      config: {
        systemInstruction: triageSystemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            language: { type: "string" },
            symptoms: { type: "array", items: { type: "string" } },
            duration: { type: "string" },
            severity: { type: "string" },
            risk_level: { type: "string", enum: ["Low Risk", "Moderate Risk", "High Risk", "Emergency"] },
            risk_score: { type: "number" },
            confidence: { type: "number" },
            possible_risks: { type: "array", items: { type: "string" } },
            followup_questions: { type: "array", items: { type: "string" } },
            doctor_summary: { type: "string" },
            recommendation: { type: "string" },
            referral: { type: "string" },
            health_education: { type: "string" },
            disclaimer: { type: "string" }
          },
          required: ["risk_level", "risk_score", "doctor_summary", "recommendation", "disclaimer"]
        }
      }
    });

    return JSON.parse(response.text());
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to process AI analysis");
  }
};

const chatFollowUp = async (history, currentInput) => {
  if (!process.env.GEMINI_API_KEY) {
    return {
      reply: "Mock Reply: Can you tell me more about your symptoms? (Add GEMINI_API_KEY to .env to enable real AI)",
      isComplete: false
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Conversation History:\n${JSON.stringify(history)}\n\nPatient Input: ${currentInput}`,
      config: {
        systemInstruction: `You are an AI Triage assistant. Ask dynamic follow-up questions to gather: symptoms, duration, severity, pain location, and relevant medical history. 
Respond in the language the patient used (Gujarati, Hindi, or English).
Output JSON with:
- reply: Your response/question to the patient
- isComplete: true if you have enough clinical information to proceed to vitals, otherwise false.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            reply: { type: "string" },
            isComplete: { type: "boolean" }
          },
          required: ["reply", "isComplete"]
        }
      }
    });

    return JSON.parse(response.text());
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw new Error("Failed to process AI chat");
  }
};

const generalAssistantChat = async (history, currentInput) => {
  if (!process.env.GEMINI_API_KEY) {
    return { reply: "Mock Reply: Based on government protocols, please proceed with standard observation. (Add API Key to enable real AI)" };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Conversation History:\n${JSON.stringify(history)}\n\nUser Input: ${currentInput}`,
      config: {
        systemInstruction: `You are Swasthya Sahayak (સ્વાસ્થ્ય સહાયક), a Government Medical Assistant AI for Doctors and Nurses in rural Indian clinics.
Answer medical queries regarding treatment protocols, drug interactions, and triage escalation.
Keep answers concise, actionable, and aligned with standard rural healthcare protocols (like referring complex cases to CHC or District Hospitals).
Do not output JSON, just plain text.`,
      }
    });

    return { reply: response.text() };
  } catch (error) {
    console.error("General AI Chat Error:", error);
    throw new Error("Failed to process AI assistant chat");
  }
};

// Fallback mock function if no API key is present
const generateMockAnalysis = (context) => {
  return {
    language: context.language || "English",
    symptoms: context.symptoms || ["Chest Pain", "Sweating"],
    duration: "2 days",
    severity: "High",
    risk_level: "High Risk",
    risk_score: 93,
    confidence: 91,
    possible_risks: ["Cardiovascular Emergency"],
    followup_questions: ["Does the pain spread to your left arm?"],
    doctor_summary: "Patient presents with chest pain and severe hypertension. Immediate physician assessment recommended.",
    recommendation: "Immediate doctor assessment.",
    referral: "District Hospital",
    health_education: "Reduce salt intake, continue prescribed medicines, seek medical care immediately.",
    disclaimer: "AI-assisted triage only. Final diagnosis must be made by a licensed medical professional."
  };
};

module.exports = { analyzeTriageData, chatFollowUp, generalAssistantChat };
