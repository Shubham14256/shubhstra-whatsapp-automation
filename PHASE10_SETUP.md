# Phase 10: The AI Brain (Symptom Checker) - Setup Guide

## Overview
Phase 10 integrates Google Gemini AI to provide intelligent health advice when patients ask questions the bot doesn't understand. This creates a smart, conversational experience while maintaining medical safety.

## Business Value

### Intelligent Patient Engagement:
- **24/7 Health Guidance** - AI answers basic health questions anytime
- **Reduced Call Volume** - Patients get instant answers to common queries
- **Better Experience** - Natural conversation instead of rigid menus
- **Lead Capture** - Every AI response ends with appointment booking prompt
- **Safe Advice** - AI trained to NEVER prescribe medicines, only suggest home remedies

### Revenue Impact:
- **Increased Bookings** - AI always prompts for appointments
- **Patient Satisfaction** - Helpful, empathetic responses
- **Professional Image** - Modern, AI-powered clinic
- **Competitive Edge** - Stand out from traditional clinics

## Changes Made

### 1. New Dependencies
- `@google/generative-ai` - Google Gemini AI SDK

### 2. New Files Created
- `src/services/aiService.js` - AI integration service

### 3. Updated Files
- `src/controllers/messageHandler.js` - Integrated AI for unknown queries
- `.env.example` - Added GEMINI_API_KEY

## Installation Steps

### Step 1: Install Dependencies ✅ DONE

```bash
npm install @google/generative-ai
```

**Status:** Already installed!

---

### Step 2: Get Google Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with Google Account**

3. **Create API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Copy the API key (starts with `AIza...`)

4. **Add to .env file:**

```env
# Add this line to your .env file
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Important:** Keep this key secret! Never commit it to Git.

---

### Step 3: Restart Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

---

## How It Works

### The AI Flow:

```
Patient sends message
    ↓
Is it a greeting? (Hi, Hello, Menu)
    ↓ NO
Is it from doctor? (Admin commands)
    ↓ NO
Is it a queue request?
    ↓ NO
Is it a rating (1-5)?
    ↓ NO
Is it health-related? (pain, fever, cough, etc.)
    ↓ YES
    ↓
🤖 AI ANALYZES QUERY
    ↓
AI generates response with:
  - Brief health advice (max 50 words)
  - Home remedies only
  - NO medicine prescriptions
  - Ends with: "Please book an appointment"
    ↓
Send AI response to patient
```

### AI Safety Rules:

The AI is programmed with **STRICT RULES**:

1. ✅ Answer general health queries briefly (max 50 words)
2. ✅ Suggest home remedies ONLY (rest, hydration, warm compress)
3. ❌ NEVER prescribe medicines or drugs
4. ❌ NEVER diagnose serious conditions
5. ✅ ALWAYS end with: "Please book an appointment for proper treatment"
6. ✅ If not health-related, politely redirect to menu
7. ✅ Be empathetic and professional
8. ✅ Use simple language

---

## Example Conversations

### Example 1: Health Query

**Patient:** "I have a headache"

**AI Response:**
```
For a headache, try resting in a quiet, dark room and staying hydrated. 
A cold compress on your forehead may help. Avoid screens and loud noises.

Please book an appointment for proper treatment.
```

---

### Example 2: Symptom Query

**Patient:** "My child has fever"

**AI Response:**
```
For fever, ensure your child stays hydrated and rests. Use a cool cloth 
on the forehead. Monitor the temperature regularly.

Please book an appointment for proper treatment.
```

---

### Example 3: Non-Health Query

**Patient:** "What's the weather today?"

**AI Response:**
```
I can only help with health-related questions. Type 'Hi' to see the menu.
```

---

### Example 4: Greeting (No AI)

**Patient:** "Hi"

**Bot Response:** (Shows menu - no AI used)
```
Welcome! 👋

How can we help you today?

[Menu with Book Appointment, Clinic Address]
```

---

## Features Breakdown

### 1. Smart Query Detection

**Health Keywords Detected:**
- Pain, ache, fever, cold, cough, headache, stomach
- Sick, ill, hurt, injury, symptom, medicine, treatment
- Doctor, health, disease, infection, allergy, diabetes
- Pressure, blood, chest, throat, nose, ear, eye
- Skin, rash, swelling, vomit, diarrhea, constipation
- Weakness, tired, fatigue, dizzy, nausea, breathing

**If any keyword found:** AI processes the query

---

### 2. AI Response Generation

**Model:** Google Gemini Pro

**Configuration:**
- Temperature: 0.7 (balanced creativity)
- Max tokens: 150 (keeps responses short)
- Safety filters: BLOCK_MEDIUM_AND_ABOVE

**System Prompt:**
```
You are a helpful medical receptionist for [Clinic Name].

STRICT RULES:
1. Answer general health queries briefly (maximum 50 words).
2. Suggest home remedies ONLY (rest, hydration, warm compress, etc.).
3. NEVER prescribe medicines or specific drugs.
4. NEVER diagnose serious conditions.
5. ALWAYS end with: "Please book an appointment for proper treatment."
6. If not health-related, politely say: "I can only help with health-related questions."
7. Be empathetic and professional.
8. Use simple language.
```

---

### 3. Fallback Handling

**If AI fails:**
- API key missing → "Please type 'Hi' to see the menu"
- Quota exceeded → "High demand right now. Please type 'Hi'"
- Network error → "Couldn't process your question. Please type 'Hi'"

**Server never crashes** - graceful error handling

---

## API Functions

### aiService.js

#### `getHealthAdvice(userText, clinicName)`
```javascript
const response = await getHealthAdvice(
  "I have a headache",
  "Dr. Sharma's Clinic"
);

// Returns: AI-generated health advice string
```

#### `isHealthQuery(text)`
```javascript
const isHealth = isHealthQuery("I have fever");
// Returns: true

const isHealth = isHealthQuery("What's the weather?");
// Returns: false
```

#### `isGreetingOrMenu(text)`
```javascript
const isGreeting = isGreetingOrMenu("Hi");
// Returns: true

const isGreeting = isGreetingOrMenu("I have pain");
// Returns: false
```

#### `getHealthTip()`
```javascript
const tip = getHealthTip();
// Returns: Random health tip (for testing/fallback)
```

---

## Testing

### Test 1: Health Query

**Send via WhatsApp:**
```
I have a headache
```

**Expected:**
- Server logs: "🤖 Health query detected - Consulting AI..."
- AI response with home remedies
- Ends with appointment prompt

---

### Test 2: Symptom Query

**Send via WhatsApp:**
```
My stomach is hurting
```

**Expected:**
- AI analyzes query
- Suggests home remedies (rest, hydration)
- Prompts for appointment

---

### Test 3: Non-Health Query

**Send via WhatsApp:**
```
Tell me a joke
```

**Expected:**
- AI detects non-health query
- Politely redirects to menu
- "I can only help with health-related questions"

---

### Test 4: Greeting (Should NOT use AI)

**Send via WhatsApp:**
```
Hi
```

**Expected:**
- Shows menu immediately
- NO AI call (faster response)
- Menu with Book Appointment, Clinic Address

---

### Test 5: Rating (Should NOT use AI)

**Send via WhatsApp:**
```
5
```

**Expected:**
- Recognizes as rating
- Requests Google Review
- NO AI call

---

## Server Logs

### Successful AI Query:

```
🤖 Processing text message logic...
Patient: 919999999999
Message: I have a headache
Doctor: Dr. Sharma

🤖 Health query detected - Consulting AI...
🤖 AI Query: "I have a headache..."
✅ AI Response: "For a headache, try resting in a quiet..."
✅ AI health advice sent successfully
```

---

### Non-Health Query:

```
🤖 Processing text message logic...
Patient: 919999999999
Message: Tell me a joke
Doctor: Dr. Sharma

🤖 Unknown message - Consulting AI...
🤖 AI Query: "Tell me a joke..."
✅ AI Response: "I can only help with health-related questions..."
✅ AI response sent successfully
```

---

### Greeting (No AI):

```
🤖 Processing text message logic...
Patient: 919999999999
Message: Hi
Doctor: Dr. Sharma

✅ Greeting detected - Checking clinic hours...
✅ Menu sent successfully
```

---

## Configuration

### Change AI Response Length:

In `aiService.js`:

```javascript
// Current: 150 tokens (max 50 words)
maxOutputTokens: 150,

// Shorter responses (30 words):
maxOutputTokens: 100,

// Longer responses (100 words):
maxOutputTokens: 300,
```

---

### Change AI Temperature:

```javascript
// Current: 0.7 (balanced)
temperature: 0.7,

// More creative (varied responses):
temperature: 0.9,

// More consistent (similar responses):
temperature: 0.5,
```

---

### Add More Health Keywords:

In `aiService.js`, update `isHealthQuery()`:

```javascript
const healthKeywords = [
  'pain', 'ache', 'fever', 'cold', 'cough',
  // Add your keywords:
  'migraine', 'backache', 'joint', 'muscle',
];
```

---

### Customize System Prompt:

In `aiService.js`, update the `systemPrompt`:

```javascript
const systemPrompt = `You are a helpful medical receptionist for ${clinicName}.

STRICT RULES:
1. Answer briefly (max 50 words).
2. Suggest home remedies ONLY.
3. NEVER prescribe medicines.
// Add your custom rules here
`;
```

---

## Cost Considerations

### Google Gemini API Pricing:

**Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- **FREE** for most small clinics

**Paid Tier (if needed):**
- $0.00025 per request (Gemini Pro)
- 1,000 requests = $0.25
- 10,000 requests = $2.50

### Example Monthly Cost:

**Scenario:** 100 patients/month, 30% ask health questions

- 30 AI queries/month
- Cost: 30 × $0.00025 = **$0.0075/month**
- **Essentially FREE!**

**ROI:**
- Reduced phone calls: 30 calls saved
- Staff time saved: 30 × 2 mins = 1 hour/month
- Value: ₹500/hour saved
- **ROI: Infinite** (cost is negligible)

---

## Troubleshooting

### Issue: AI not responding

**Check:**
1. ✅ GEMINI_API_KEY in .env?
2. ✅ API key valid? (test at https://aistudio.google.com)
3. ✅ Server restarted after adding key?
4. ✅ Internet connection working?

**Solution:**
- Verify API key is correct
- Check server logs for error messages
- Test API key in Google AI Studio

---

### Issue: "API key not found" error

**Error in logs:**
```
❌ GEMINI_API_KEY not found in environment variables
```

**Solution:**
1. Add `GEMINI_API_KEY=your_key` to .env
2. Restart server
3. Verify with: `console.log(process.env.GEMINI_API_KEY)`

---

### Issue: "Quota exceeded" error

**Error in logs:**
```
⚠️  AI API quota exceeded
```

**Solution:**
- Free tier: 60 requests/minute, 1,500/day
- Wait for quota reset (daily at midnight PST)
- Or upgrade to paid tier (very cheap)

---

### Issue: AI gives wrong advice

**Problem:** AI suggests medicines or diagnoses

**Solution:**
- Update system prompt to be more strict
- Add more safety rules
- Lower temperature (0.5 for more consistent)
- Report to Google if persistent

---

### Issue: AI too slow

**Problem:** Responses take 5+ seconds

**Solution:**
- Normal: 2-4 seconds for AI response
- Check internet speed
- Consider caching common queries
- Use shorter maxOutputTokens (100 instead of 150)

---

## Best Practices

### AI Usage:
- ✅ Use for general health questions
- ✅ Keep responses short (50 words max)
- ✅ Always prompt for appointment
- ✅ Monitor AI responses regularly
- ❌ Don't rely on AI for emergencies
- ❌ Don't let AI diagnose serious conditions

### Safety:
- ✅ Review AI responses periodically
- ✅ Update system prompt if needed
- ✅ Keep safety filters enabled
- ✅ Log all AI interactions
- ❌ Never disable safety checks

### Performance:
- ✅ Cache common queries (future enhancement)
- ✅ Use health keyword detection first
- ✅ Fallback gracefully on errors
- ✅ Monitor API usage and costs

---

## Security & Privacy

### Data Handling:
- ✅ Patient queries sent to Google Gemini API
- ✅ Google's privacy policy applies
- ✅ No patient data stored by AI
- ✅ Responses generated in real-time
- ✅ HIPAA considerations: Consult legal team

### API Key Security:
- ✅ Keep GEMINI_API_KEY secret
- ✅ Never commit to Git
- ✅ Use environment variables only
- ✅ Rotate keys periodically
- ✅ Monitor usage for anomalies

---

## Future Enhancements (Phase 11+)

- [ ] Multi-language AI responses (Marathi, Hindi)
- [ ] Voice message transcription + AI analysis
- [ ] Image analysis (rash, wound photos)
- [ ] Symptom severity scoring
- [ ] Emergency detection (chest pain → urgent)
- [ ] AI-powered appointment scheduling
- [ ] Personalized health tips based on history
- [ ] Integration with medical knowledge bases

---

## Monitoring

### Check AI Usage:

**Server logs show:**
```
🤖 Health query detected - Consulting AI...
🤖 AI Query: "I have a headache..."
✅ AI Response: "For a headache, try resting..."
✅ AI health advice sent successfully
```

### Track AI Performance:

**Metrics to monitor:**
- Response time (should be 2-4 seconds)
- Success rate (should be >95%)
- Error rate (should be <5%)
- Patient satisfaction (via ratings)

### Query Database:

```sql
-- Count messages by type (future enhancement)
-- Add message_type column to track AI vs menu vs rating
```

---

## Support

### Get Help:

1. **Check server logs** for error messages
2. **Test API key** in Google AI Studio
3. **Verify .env file** has GEMINI_API_KEY
4. **Review system prompt** for safety rules
5. **Monitor AI responses** for quality

### Resources:

- Google Gemini Docs: https://ai.google.dev/docs
- API Key Management: https://aistudio.google.com/app/apikey
- Pricing: https://ai.google.dev/pricing
- Safety Settings: https://ai.google.dev/docs/safety_setting_gemini

---

## Success Checklist

- [ ] @google/generative-ai installed
- [ ] GEMINI_API_KEY added to .env
- [ ] Server restarted
- [ ] Test health query sent
- [ ] AI response received
- [ ] Response includes appointment prompt
- [ ] Non-health query redirects to menu
- [ ] Greeting shows menu (no AI)
- [ ] Server logs show AI activity
- [ ] No errors in console

**When all checked:** Phase 10 is COMPLETE! 🎉

---

**Phase 10 Status:** ✅ Code Complete (Needs API Key)  
**Last Updated:** February 9, 2026  
**Features:** AI-Powered Health Advice  
**Dependencies:** @google/generative-ai  
**Cost:** FREE (up to 1,500 requests/day)

