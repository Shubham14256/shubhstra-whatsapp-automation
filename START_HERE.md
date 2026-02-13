# 🚀 START HERE - Local Testing

## What You Have Now

✅ Native conversational appointment booking (no Calendly!)
✅ All code written and tested for syntax errors
✅ Comprehensive testing guides
✅ Changes committed locally (not pushed yet)

---

## Quick Start (Follow These Steps)

### 1. Install Dependencies (30 seconds)
```bash
npm install chrono-node
```

### 2. Test the Setup (30 seconds)
```bash
node test-appointment-booking.js
```

You should see date parsing tests. If they pass, you're good!

### 3. Run Database Migration (2 minutes)

Open Supabase Dashboard → SQL Editor → Paste this:

```sql
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS conversation_state VARCHAR(50) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS conversation_data JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_patients_conversation_state ON patients(conversation_state);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('conversation_state', 'conversation_data');
```

Click "Run". You should see 2 rows returned.

### 4. Start Your Server (10 seconds)
```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

Look for: `✅ Server running on port 3000`

### 5. Test with WhatsApp (2 minutes)

**Test 1: Happy Path**
1. Send "Hi" to your bot
2. Select "📅 Book Appointment"
3. Reply: "Tomorrow 3pm"
4. You should get a confirmation!

**Test 2: Error Handling**
1. Send "Hi" → "Book Appointment"
2. Reply: "Yesterday 3pm"
3. Bot should say it's in the past

**Test 3: Cancel**
1. Send "Hi" → "Book Appointment"
2. Reply: "cancel"
3. Bot should cancel and show menu

### 6. Verify in Dashboard

Open your dashboard → Appointments page
You should see your test appointment!

---

## If Everything Works ✅

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Deploy automatically** (Render will auto-deploy)

3. **Test on production** WhatsApp number

4. **Celebrate!** 🎉 You just saved $144/year and built a better UX!

---

## If Something Doesn't Work ❌

Check these in order:

1. **Server logs** - Look for error messages
2. **Database** - Verify migration ran (check columns exist)
3. **Dependencies** - Make sure chrono-node is installed
4. **Webhook** - Verify ngrok is running and webhook URL is correct

Then check `LOCAL_TESTING_GUIDE.md` for detailed troubleshooting.

---

## Files to Read (In Order)

1. **START_HERE.md** ← You are here
2. **READY_TO_TEST_LOCALLY.md** - Quick overview
3. **LOCAL_TESTING_GUIDE.md** - Detailed testing steps
4. **NATIVE_APPOINTMENTS_AND_LIVE_CHAT_SOLUTION.md** - Full technical docs

---

## What We're NOT Doing Yet

❌ Live Chat (we'll do this later if you want)
❌ AI Pause feature (not needed for appointments)
❌ Pushing to GitHub (test locally first)

We're ONLY testing native appointment booking right now.

---

## Expected Timeline

- ⏱️ Setup: 5 minutes
- ⏱️ Testing: 5 minutes
- ⏱️ Verification: 2 minutes
- **Total: ~12 minutes**

---

## Ready?

1. Open terminal
2. Run: `npm install chrono-node`
3. Run: `node test-appointment-booking.js`
4. If tests pass, continue to step 3 (database migration)

Let me know when you're ready to start or if you hit any issues! 🚀
