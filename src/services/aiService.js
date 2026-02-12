/**
 * AI Service - Google Gemini Integration
 * Provides intelligent health advice for patient queries
 */

import axios from 'axios';

/**
 * Get health advice from AI for patient queries
 * @param {string} userText - Patient's question
 * @param {string} clinicName - Doctor's clinic name for personalization
 * @returns {Promise<string>} - AI-generated health advice
 */
export const getHealthAdvice = async (userText, clinicName = 'our clinic') => {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return "I'm currently unable to process your query. Please type 'Hi' to see the menu or book an appointment.";
    }

    // Validate input
    if (!userText || userText.trim().length === 0) {
      return "Please describe your health concern, and I'll try to help.";
    }

    console.log(`🤖 AI Query: "${userText.substring(0, 50)}..."`);

    // Enhanced system prompt for comprehensive medical assistance
    const systemPrompt = `You are an intelligent medical assistant AI for ${clinicName}. You help patients with health-related questions before they visit the doctor.

YOUR CAPABILITIES:
- Answer ALL health-related questions comprehensively
- Provide detailed home remedies and self-care advice
- Explain symptoms, causes, and when to seek medical help
- Give lifestyle and prevention tips
- Be empathetic, professional, and helpful

IMPORTANT RULES:
1. Answer health questions in detail (100-150 words) - be thorough and helpful
2. For common conditions (cold, fever, headache, stomach pain, etc.):
   - Explain possible causes
   - Suggest multiple home remedies
   - Give self-care tips
   - Mention warning signs
3. NEVER prescribe specific medicines or drugs by name
4. NEVER diagnose serious diseases definitively
5. For serious symptoms (chest pain, difficulty breathing, severe bleeding, etc.):
   - Emphasize urgency
   - Advise immediate medical attention
   - Say "Please visit the clinic or emergency room immediately"
6. For non-health queries (jokes, general chat, weather, etc.):
   - Politely redirect: "I can only help with health-related questions. Type 'Hi' to see the menu."
7. ALWAYS end health advice with: "For proper diagnosis and treatment, please book an appointment with our doctor."
8. Use simple, easy-to-understand language
9. Be warm, caring, and supportive
10. If asked about pregnancy, children, or elderly care - provide age-appropriate advice

RESPONSE FORMAT:
- Start with empathy ("I understand your concern...")
- Provide detailed explanation
- List 3-5 actionable home remedies
- Mention when to seek medical help
- End with appointment reminder

Patient Query: ${userText}

Your Detailed Response:`;

    // Call Gemini API directly using axios
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                       "I couldn't generate a response. Please type 'Hi' to see the menu.";

    console.log(`✅ AI Response: "${aiResponse.substring(0, 100)}..."`);

    return aiResponse;

  } catch (error) {
    console.error('❌ Error in AI Service:', error.response?.data || error.message);

    // Handle specific errors
    if (error.message.includes('API key') || error.response?.status === 400) {
      return "I'm currently unable to process your query. Please type 'Hi' to see the menu.";
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      console.error('⚠️  AI API quota exceeded');
      return "I'm experiencing high demand right now. Please type 'Hi' to see the menu or book an appointment directly.";
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return "I'm taking too long to respond. Please type 'Hi' to see the menu.";
    }

    // Generic fallback
    return "I couldn't process your question right now. Please type 'Hi' to see the menu or book an appointment.";
  }
};

/**
 * Check if user text is a simple greeting or menu request
 * @param {string} text - User's message
 * @returns {boolean} - True if it's a greeting/menu request
 */
export const isGreetingOrMenu = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase().trim();
  const greetings = ['hi', 'hello', 'hey', 'menu', 'start', 'help', 'namaste', 'namaskar'];
  
  return greetings.includes(lowerText);
};

/**
 * Check if text is likely a health query
 * @param {string} text - User's message
 * @returns {boolean} - True if it seems health-related
 */
export const isHealthQuery = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Comprehensive health-related keywords
  const healthKeywords = [
    // Symptoms
    'pain', 'ache', 'hurt', 'sore', 'burning', 'itching', 'swelling',
    'fever', 'temperature', 'cold', 'cough', 'sneeze', 'flu',
    'headache', 'migraine', 'dizzy', 'vertigo',
    'stomach', 'belly', 'abdomen', 'nausea', 'vomit', 'diarrhea', 'constipation',
    'chest', 'heart', 'breathing', 'breath', 'asthma',
    'throat', 'tonsil', 'voice', 'hoarse',
    'nose', 'sinus', 'congestion', 'runny',
    'ear', 'hearing', 'tinnitus',
    'eye', 'vision', 'blurry', 'red eyes',
    'skin', 'rash', 'acne', 'pimple', 'allergy', 'hives',
    'back', 'neck', 'shoulder', 'joint', 'muscle', 'sprain',
    'leg', 'foot', 'ankle', 'knee', 'arm', 'hand', 'wrist',
    
    // Conditions
    'sick', 'ill', 'unwell', 'disease', 'infection', 'virus', 'bacteria',
    'diabetes', 'sugar', 'blood pressure', 'bp', 'hypertension',
    'thyroid', 'pcod', 'pcos', 'hormonal',
    'pregnancy', 'pregnant', 'conception', 'fertility',
    'period', 'menstruation', 'cramps', 'pms',
    'weight', 'obesity', 'overweight', 'underweight',
    'sleep', 'insomnia', 'tired', 'fatigue', 'weakness', 'energy',
    'stress', 'anxiety', 'depression', 'mental health',
    'injury', 'wound', 'cut', 'bruise', 'fracture',
    
    // Medical terms
    'symptom', 'medicine', 'medication', 'treatment', 'cure', 'remedy',
    'doctor', 'health', 'medical', 'clinic', 'hospital',
    'test', 'report', 'diagnosis', 'prescription',
    'vitamin', 'supplement', 'nutrition', 'diet',
    
    // Questions
    'what is', 'how to', 'why do i', 'should i', 'can i',
    'is it normal', 'is it safe', 'home remedy', 'natural cure',
    
    // Hindi/Marathi common words
    'dard', 'bukhar', 'pet', 'sir', 'khasi', 'jukam',
    'दर्द', 'बुखार', 'पेट', 'सिर', 'खांसी', 'जुकाम'
  ];
  
  return healthKeywords.some(keyword => lowerText.includes(keyword));
};

/**
 * Get a quick health tip (for testing or fallback)
 * @returns {string} - Random health tip
 */
export const getHealthTip = () => {
  const tips = [
    "💧 Stay hydrated! Drink at least 8 glasses of water daily.",
    "🏃 Regular exercise for 30 minutes can boost your immunity.",
    "😴 Get 7-8 hours of quality sleep for better health.",
    "🥗 Eat a balanced diet with plenty of fruits and vegetables.",
    "🧘 Practice stress management through meditation or yoga.",
    "🚭 Avoid smoking and limit alcohol consumption.",
    "🧼 Wash your hands regularly to prevent infections.",
    "☀️ Get some sunlight daily for Vitamin D.",
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
};

export default {
  getHealthAdvice,
  isGreetingOrMenu,
  isHealthQuery,
  getHealthTip,
};


/**
 * Analyze medical report image using Gemini Vision
 * @param {string} imageUrl - WhatsApp media URL
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns {Promise<string>} - AI analysis of the medical report
 */
export const analyzeMedicalReport = async (imageUrl, mimeType = 'image/jpeg') => {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return "I'm currently unable to analyze images. Please type 'Hi' to see the menu.";
    }

    // Validate WhatsApp token
    if (!process.env.WHATSAPP_TOKEN) {
      console.error('❌ WHATSAPP_TOKEN not found in environment variables');
      return "I'm currently unable to download images. Please try again later.";
    }

    console.log(`📸 Downloading image from WhatsApp...`);
    console.log(`   URL: ${imageUrl.substring(0, 50)}...`);

    // Step 1: Download image from WhatsApp (requires authorization)
    const imageResponse = await axios.get(imageUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });

    // Convert to base64
    const imageBuffer = Buffer.from(imageResponse.data);
    const base64Image = imageBuffer.toString('base64');

    console.log(`✅ Image downloaded (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    console.log(`🤖 Analyzing medical report with Gemini Vision...`);

    // Step 2: Analyze with Gemini Vision
    const systemPrompt = `You are an expert medical assistant AI for Shubhstra Clinic. Analyze this image carefully and provide helpful insights.

ANALYSIS GUIDELINES:

1. IF IT IS A MEDICAL REPORT (Lab test, Blood test, X-ray, Scan, Prescription, etc.):
   
   A. IDENTIFY THE TYPE:
      - Blood test, Urine test, X-ray, CT Scan, MRI, Ultrasound, ECG, etc.
   
   B. EXTRACT KEY FINDINGS:
      - List ABNORMAL or concerning values with their ranges
      - Highlight values that are HIGH or LOW
      - Use simple language to explain what each parameter means
   
   C. PROVIDE CONTEXT:
      - Explain what the abnormal values might indicate
      - Suggest possible causes (lifestyle, diet, etc.)
      - Mention if it's common or needs attention
   
   D. HOME CARE SUGGESTIONS:
      - If applicable, suggest diet/lifestyle changes
      - Mention foods to eat or avoid
      - Recommend hydration, rest, exercise, etc.
   
   E. FORMAT:
      📋 Report Type: [Type]
      
      🔍 Key Findings:
      • [Parameter]: [Value] ([Normal Range]) - [HIGH/LOW/NORMAL]
      • [Explanation in simple terms]
      
      💡 What This Means:
      [Simple explanation of findings]
      
      🏠 Home Care Tips:
      • [Tip 1]
      • [Tip 2]
      • [Tip 3]

2. IF IT IS NOT A MEDICAL REPORT (Selfie, Random photo, Document, etc.):
   - Politely say: "This doesn't appear to be a medical report. Please upload a clear photo of your lab test, blood test, X-ray, or medical prescription."

3. IMPORTANT RULES:
   - Use simple, patient-friendly language
   - Be empathetic and supportive
   - DO NOT diagnose diseases definitively
   - DO NOT prescribe medicines
   - ALWAYS end with: "⚠️ This is AI analysis for your reference. Please consult our doctor for proper diagnosis and treatment. Book an appointment for detailed consultation."

4. RESPONSE LENGTH:
   - Provide detailed analysis (150-200 words)
   - Be thorough but concise
   - Focus on actionable insights

Analyze the image now:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            {
              text: systemPrompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.5, // Balanced temperature for factual yet helpful analysis
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const aiAnalysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                       "I couldn't analyze this image. Please try uploading a clearer photo.";

    console.log(`✅ Analysis complete: "${aiAnalysis.substring(0, 100)}..."`);

    return aiAnalysis;

  } catch (error) {
    console.error('❌ Error in analyzeMedicalReport:', error.response?.data || error.message);

    // Handle specific errors
    if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
      return "The image analysis is taking too long. Please try with a smaller image or try again later.";
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return "I couldn't download the image. Please make sure it's a valid WhatsApp image.";
    }

    if (error.message.includes('quota') || error.response?.status === 429) {
      console.error('⚠️  AI API quota exceeded');
      return "I'm experiencing high demand right now. Please try again in a few minutes.";
    }

    // Generic fallback
    return "I couldn't analyze this image. Please try again or type 'Hi' to see the menu.";
  }
};

/**
 * Get a random health tip
 * @returns {string} - Health tip message
 */
export const getRandomHealthTip = () => {
  const healthTips = [
    "🌿 *Health Tip:* Drink at least 3 liters of water daily to stay hydrated and maintain healthy kidney function!",
    "🥗 *Health Tip:* Eat a rainbow! Include fruits and vegetables of different colors in your diet for maximum nutrition.",
    "🏃 *Health Tip:* Walk for 30 minutes daily. It improves heart health, boosts mood, and helps maintain healthy weight.",
    "😴 *Health Tip:* Get 7-8 hours of quality sleep. Good sleep strengthens immunity and improves mental health.",
    "🧘 *Health Tip:* Practice deep breathing for 5 minutes daily. It reduces stress and improves lung capacity.",
    "🚭 *Health Tip:* Avoid smoking and limit alcohol. These habits significantly reduce risk of chronic diseases.",
    "🧼 *Health Tip:* Wash your hands regularly with soap for 20 seconds to prevent infections and diseases.",
    "☀️ *Health Tip:* Get 15 minutes of morning sunlight daily for natural Vitamin D and better bone health.",
    "🥛 *Health Tip:* Include calcium-rich foods like milk, yogurt, and leafy greens for strong bones and teeth.",
    "🍎 *Health Tip:* An apple a day keeps the doctor away! Fruits are packed with vitamins and fiber.",
    "🧠 *Health Tip:* Keep your mind active with puzzles, reading, or learning new skills to prevent cognitive decline.",
    "💪 *Health Tip:* Stretch for 10 minutes daily to improve flexibility, reduce muscle tension, and prevent injuries.",
    "🥤 *Health Tip:* Limit sugary drinks. Replace soda with water, herbal tea, or fresh fruit juice.",
    "🍽️ *Health Tip:* Eat slowly and chew thoroughly. It aids digestion and helps you feel full with less food.",
    "🏥 *Health Tip:* Get regular health checkups. Early detection of problems leads to better treatment outcomes.",
  ];

  return healthTips[Math.floor(Math.random() * healthTips.length)];
};
