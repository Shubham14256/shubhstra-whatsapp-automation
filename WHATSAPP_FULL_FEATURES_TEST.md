# 🎉 WhatsApp Full Features Testing Guide

## ✅ What's Been Fixed

Your WhatsApp bot now has **6 menu options** instead of just 2!

### New Menu Options:
1. 📅 **Book Appointment** - Schedule a visit
2. 📍 **Clinic Address** - Get location
3. 📊 **Queue Status** - Check waiting status (NEW!)
4. 🔗 **Social Media** - Follow for health tips (NEW!)
5. 🎁 **Referral Code** - Share with friends (NEW!)
6. ⭐ **Rate Us** - Share your experience (NEW!)

Plus, the bot now tells users they can ask health questions directly!

---

## 🧪 How to Test All Features

### 1️⃣ Test Menu (Type "Hi")
**Send:** `Hi`

**Expected Response:**
- Menu with 6 options
- Additional message explaining you can ask health questions directly
- Examples of what to ask

---

### 2️⃣ Test AI Health Advice
**Send:** `I have a headache`

**Expected Response:**
- AI-generated health advice
- Home remedies suggestion
- Recommendation to book appointment

**Try these too:**
- `My child has fever`
- `How to reduce stomach pain?`
- `What to do for cold and cough?`

---

### 3️⃣ Test Medical Report Analysis (AI Vision)
**Send:** A photo of a medical report (blood test, X-ray, etc.)

**Expected Response:**
- "Analyzing your medical report... Please wait"
- AI analysis of the report
- Extracted abnormal values
- Recommendation to consult doctor

---

### 4️⃣ Test Queue Status
**From Menu:** Select "📊 Queue Status"

**Expected Response:**
- Your current position in queue
- Estimated wait time
- Number of patients ahead

---

### 5️⃣ Test Social Media Links
**From Menu:** Select "🔗 Social Media"

**Expected Response:**
- List of social media links
- Instagram, YouTube, Facebook, Website
- Message encouraging to follow

---

### 6️⃣ Test Referral Code
**From Menu:** Select "🎁 Referral Code"

**Expected Response:**
- Your unique referral code
- Instructions to share with friends
- Number of friends you've referred

---

### 7️⃣ Test Rating System
**From Menu:** Select "⭐ Rate Us"

**Expected Response:**
- Request to rate 1-5
- If you rate 5: Request for Google Review
- If you rate 1-4: Request for feedback

**Then send:** `5`

**Expected Response:**
- Thank you message
- Google Review link

---

### 8️⃣ Test Doctor Commands (Admin Only)
**Note:** These only work if you send from the doctor's registered WhatsApp number

**Send:** `/search John`
- Searches for patients named "John"

**Send:** `/queue`
- Shows today's appointment queue

**Send:** `/report John Doe`
- Generates PDF report for patient "John Doe"

**Send:** `/network`
- Shows referral network statistics

---

## 🔍 What to Check in Terminal

When you send messages, you should see:

```
📨 Incoming webhook data:
═══════════════════════════════════════
{
  "object": "whatsapp_business_account",
  ...
}
═══════════════════════════════════════

📞 Display Phone Number (Doctor's Number): +91XXXXXXXXXX
✅ Doctor Identified: Dr. Demo Doctor
👤 Patient Name from WhatsApp: John Doe
💾 Patient record updated (ID: xxx-xxx-xxx)

📱 Message Details:
  From (Patient): 91XXXXXXXXXX
  Type: text
  Text: I have a headache

🤖 Processing text message logic...
🤖 Health query detected - Consulting AI...
🤖 AI Query: "I have a headache..."
✅ AI Response: "I understand you're experiencing..."
✅ AI health advice sent successfully
```

---

## ✅ Success Checklist

- [ ] Menu shows 6 options (not just 2)
- [ ] AI responds to health questions
- [ ] Medical report images are analyzed
- [ ] Queue status works
- [ ] Social media links are sent
- [ ] Referral code is generated
- [ ] Rating system works
- [ ] Patient data is saved in Supabase

---

## 🚨 Troubleshooting

### If AI doesn't respond:
1. Check terminal for errors
2. Verify `GEMINI_API_KEY` in `.env` file
3. Test with: `node test-ai.js`

### If menu only shows 2 options:
1. Make sure server was restarted after changes
2. Check terminal for "Server running" message
3. Send "Hi" again to refresh

### If features don't work:
1. Check terminal logs for errors
2. Verify Supabase connection
3. Check `.env` file has all credentials

---

## 📊 Database Check

After testing, verify in Supabase:

1. **Patients Table:**
   - New patient records created
   - `last_seen_at` updated
   - Names captured from WhatsApp

2. **Appointments Table:**
   - Appointments created when booked
   - Status tracked (pending, confirmed, etc.)

---

## 🎯 Next Steps

Once all features are working:

1. ✅ Test with multiple patients
2. ✅ Test appointment booking flow
3. ✅ Test image analysis with real medical reports
4. ✅ Configure social media links in Settings page
5. ✅ Set up Google Review link
6. ✅ Test referral system end-to-end

---

**Server Status:** ✅ Running on port 3000
**ngrok URL:** https://marisha-unshort-jenae.ngrok-free.dev
**Webhook Status:** ✅ Verified and Active

**All features are now LIVE! 🚀**
