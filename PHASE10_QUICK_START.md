# Phase 10 - AI Brain Quick Start

## ✅ What's Done

- ✅ @google/generative-ai installed
- ✅ AI service created (`src/services/aiService.js`)
- ✅ Message handler updated with AI integration
- ✅ Code fully implemented and ready

---

## ⚠️ What You Need to Do (2 Steps)

### Step 1: Get Google Gemini API Key (5 minutes)

1. **Visit:** https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Click:** "Create API Key"

4. **Select:** "Create API key in new project"

5. **Copy** the API key (starts with `AIza...`)

---

### Step 2: Add to .env File (1 minute)

Open your `.env` file and add:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace with your actual API key.

**Save the file.**

---

### Step 3: Restart Server (30 seconds)

Stop current server (Ctrl+C) and restart:

```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

---

## 🧪 Test It

### Test 1: Health Query

Send via WhatsApp:
```
I have a headache
```

**Expected:** AI responds with home remedies + appointment prompt

---

### Test 2: Symptom Query

Send via WhatsApp:
```
My child has fever
```

**Expected:** AI gives advice + prompts for appointment

---

### Test 3: Non-Health Query

Send via WhatsApp:
```
Tell me a joke
```

**Expected:** AI politely redirects to menu

---

### Test 4: Greeting (No AI)

Send via WhatsApp:
```
Hi
```

**Expected:** Shows menu immediately (faster, no AI)

---

## 📊 How to Know It's Working

**Server logs will show:**

```
🤖 Health query detected - Consulting AI...
🤖 AI Query: "I have a headache..."
✅ AI Response: "For a headache, try resting..."
✅ AI health advice sent successfully
```

**Patient receives:** Helpful health advice + appointment prompt

---

## 🆘 Troubleshooting

**AI not responding?**
- Check GEMINI_API_KEY in .env
- Verify API key is valid
- Restart server
- Check internet connection

**"API key not found" error?**
- Add GEMINI_API_KEY to .env
- Restart server
- Check for typos

**Quota exceeded?**
- Free tier: 1,500 requests/day
- Wait for reset (midnight PST)
- Or upgrade (very cheap: $0.00025/request)

---

## 💰 Cost

**FREE Tier:**
- 60 requests/minute
- 1,500 requests/day
- Perfect for small clinics

**Paid Tier (if needed):**
- $0.00025 per request
- 1,000 requests = $0.25
- 10,000 requests = $2.50

**Your likely cost:** $0 - $1/month

---

## 🎯 Success Checklist

- [ ] API key obtained from Google AI Studio
- [ ] GEMINI_API_KEY added to .env
- [ ] Server restarted
- [ ] Test health query sent
- [ ] AI response received
- [ ] Response includes appointment prompt
- [ ] Server logs show AI activity

**When all checked:** Phase 10 is LIVE! 🎉

---

## 📚 Full Documentation

- **Setup Guide:** `PHASE10_SETUP.md`
- **Current Status:** `CURRENT_STATUS.md`

---

**Estimated Time:** 10 minutes total

**API Key:** https://aistudio.google.com/app/apikey

