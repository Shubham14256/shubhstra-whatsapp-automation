# How to Get Your Google Gemini API Key

## ⚠️ Current Issue

Your current API key `gen-lang-client-0603316567` is **INVALID**.

**Error:** "API key not valid. Please pass a valid API key."

A valid Gemini API key should:
- Start with `AIza`
- Be approximately 39 characters long
- Look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

---

## 🔑 How to Get the Correct API Key

### Step 1: Visit Google AI Studio

**Option 1 (Recommended):**
https://aistudio.google.com/app/apikey

**Option 2:**
https://makersuite.google.com/app/apikey

---

### Step 2: Sign In

- Use your Google account
- Accept terms of service if prompted

---

### Step 3: Create API Key

1. Click **"Create API Key"** button (blue button on the page)

2. You'll see two options:
   - **"Create API key in new project"** (Recommended for first time)
   - **"Create API key in existing project"** (If you have a Google Cloud project)

3. Click **"Create API key in new project"**

4. Wait 2-3 seconds for the key to be generated

---

### Step 4: Copy the API Key

You'll see a popup with your API key:

```
Your API key
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

[Copy] [Close]
```

**IMPORTANT:** 
- Click **"Copy"** to copy the key
- Save it somewhere safe (you can't see it again later)
- The key starts with `AIza`
- It's about 39 characters long

---

### Step 5: Add to .env File

Open your `.env` file and **REPLACE** the current line:

**WRONG:**
```env
GEMINI_API_KEY=gen-lang-client-0603316567
```

**CORRECT:**
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace the X's with your actual API key.

**Save the file.**

---

### Step 6: Restart Server

Stop the current server (Ctrl+C) and restart:

```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

---

### Step 7: Test AI

Run the test script:

```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe test-ai.js
```

**Expected output:**
```
🤖 AI Query: "I have a headache..."
✅ AI Response: "For a headache, try resting in a quiet..."
✅ AI health advice sent successfully
```

---

## 🎯 Visual Guide

### What the Google AI Studio Page Looks Like:

```
┌─────────────────────────────────────────┐
│  Google AI Studio                       │
├─────────────────────────────────────────┤
│                                         │
│  Get an API key                         │
│                                         │
│  [Create API Key] ← Click this button  │
│                                         │
│  Your existing API keys:                │
│  (empty if first time)                  │
│                                         │
└─────────────────────────────────────────┘
```

### After Clicking "Create API Key":

```
┌─────────────────────────────────────────┐
│  Create API key                         │
├─────────────────────────────────────────┤
│                                         │
│  ○ Create API key in new project       │
│     (Recommended)                       │
│                                         │
│  ○ Create API key in existing project  │
│                                         │
│  [Cancel]  [Create] ← Click Create     │
│                                         │
└─────────────────────────────────────────┘
```

### After Key is Created:

```
┌─────────────────────────────────────────┐
│  Your API key                           │
├─────────────────────────────────────────┤
│                                         │
│  AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX │
│                                         │
│  [Copy]  [Close]  ← Click Copy         │
│                                         │
│  ⚠️ Save this key! You won't be able   │
│     to see it again.                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Issue: "I don't see the Create API Key button"

**Solution:**
- Make sure you're signed in with a Google account
- Try a different browser (Chrome recommended)
- Clear browser cache and try again
- Use the direct link: https://aistudio.google.com/app/apikey

---

### Issue: "API key creation failed"

**Solution:**
- Check your Google account is verified
- Try creating in a different Google Cloud project
- Wait a few minutes and try again
- Contact Google AI support

---

### Issue: "I lost my API key"

**Solution:**
- You can't recover a lost API key
- Create a new one (it's free)
- Delete the old one from Google AI Studio
- Update your .env file with the new key

---

### Issue: "Still getting 'API key not valid' error"

**Check:**
1. ✅ API key starts with `AIza`?
2. ✅ API key is 39 characters long?
3. ✅ No extra spaces in .env file?
4. ✅ Server restarted after updating .env?
5. ✅ Using the correct .env file (not .env.example)?

---

## 💰 Pricing

**Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- **$0/month** for most small clinics

**Paid Tier (if needed):**
- $0.00025 per request (Gemini Pro)
- 1,000 requests = $0.25
- 10,000 requests = $2.50

**Your likely usage:** 30-100 requests/month = **FREE**

---

## 🔐 Security

**Keep your API key safe:**
- ✅ Never share it publicly
- ✅ Never commit to Git
- ✅ Use .env file only
- ✅ Add .env to .gitignore
- ✅ Rotate keys periodically

**If compromised:**
1. Go to Google AI Studio
2. Delete the compromised key
3. Create a new key
4. Update your .env file

---

## ✅ Success Checklist

- [ ] Visited https://aistudio.google.com/app/apikey
- [ ] Signed in with Google account
- [ ] Clicked "Create API Key"
- [ ] Selected "Create API key in new project"
- [ ] Copied the API key (starts with AIza)
- [ ] Pasted into .env file
- [ ] Saved .env file
- [ ] Restarted server
- [ ] Ran test-ai.js
- [ ] Saw successful AI response

**When all checked:** AI is working! 🎉

---

## 📞 Need Help?

**Google AI Studio:** https://aistudio.google.com/app/apikey  
**Documentation:** https://ai.google.dev/docs  
**Support:** https://ai.google.dev/support

---

**Current Status:** ⚠️ Invalid API Key  
**Next Step:** Get correct API key from Google AI Studio  
**Time Required:** 5 minutes

