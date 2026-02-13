# Test Live Chat Feature Locally - Quick Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Run Database Migration

1. Open Supabase: https://vliswvuyapadipuxhfuf.supabase.co
2. Go to **SQL Editor**
3. Copy and paste this:

```sql
-- Add Live Chat columns
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS is_bot_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bot_paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bot_paused_by UUID REFERENCES doctors(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_patients_is_bot_paused ON patients(is_bot_paused);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('is_bot_paused', 'bot_paused_at', 'bot_paused_by');
```

4. Click **Run**
5. Should see 3 rows returned (the new columns)

### Step 2: Start Backend Server

Open Terminal 1:
```bash
node server.js
```

Expected output:
```
🚀 Server running on port 3000
✅ Webhook routes registered
✅ Live Chat routes registered
```

### Step 3: Start Frontend Dashboard

Open Terminal 2:
```bash
cd shubhstra-dashboard
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local: http://localhost:3001
✓ Ready in 2.5s
```

### Step 4: Test the Feature

1. **Open Dashboard**
   - Go to: http://localhost:3001
   - Login with your doctor credentials

2. **Navigate to Patients**
   - Click "Patients" in sidebar
   - Should see list of patients
   - Look for "AI Active" badges

3. **Open Chat**
   - Click "Chat" button on any patient
   - Modal should open
   - Should see message history (if any)

4. **Send Test Message**
   - Type: "Hello, this is a test from dashboard"
   - Click "Send"
   - Message should appear in blue on right side
   - Status should change to "Manual Chat" (orange badge)

5. **Check WhatsApp**
   - Patient should receive the message on WhatsApp
   - (Make sure you're testing with a real patient number)

6. **Test AI Pause**
   - Send a message FROM the patient's WhatsApp
   - Message should appear in dashboard
   - AI should NOT respond (because bot is paused)

7. **Resume AI**
   - Click "Resume AI" button (green)
   - Status should change to "AI Active"
   - Send another message from patient
   - AI should respond normally

---

## 🎯 What to Look For

### ✅ Success Indicators

- Patients page loads without errors
- Chat modal opens smoothly
- Messages display correctly
- Send button works
- Status badges update
- AI pause/resume works
- WhatsApp messages are delivered

### ❌ Error Indicators

- Console errors in browser (F12)
- "Failed to send message" alerts
- Messages not appearing
- Status not updating
- Backend errors in terminal

---

## 🐛 Quick Fixes

### "Cannot read property 'is_bot_paused'"
**Fix**: Run the database migration (Step 1)

### "Failed to send message"
**Fix**: Check `.env` file has WhatsApp credentials

### "404 Not Found" on API calls
**Fix**: Make sure backend is running on port 3000

### Chat modal not opening
**Fix**: Check browser console (F12) for React errors

### Messages not appearing in WhatsApp
**Fix**: Verify patient phone number is correct and WhatsApp credentials are valid

---

## 📱 Test on Mobile

1. Find your computer's local IP:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Open on phone:
   ```
   http://YOUR_IP:3001/patients
   ```

3. Should see mobile card view (not table)

---

## 🔍 Debugging Tips

### Check Backend Logs
Look for these in Terminal 1:
```
📨 Fetching messages for patient: xxx
📤 Doctor sending manual message to patient: xxx
🚫 Auto-pausing AI bot
✅ AI bot paused successfully
📱 Sending WhatsApp message to: xxx
✅ Message saved to database
```

### Check Frontend Console
Press F12 in browser, look for:
- Network errors (red)
- React warnings (yellow)
- API response data

### Check Database
```sql
-- See which patients have AI paused
SELECT name, phone_number, is_bot_paused, bot_paused_at 
FROM patients 
WHERE is_bot_paused = true;

-- See recent messages
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ Testing Checklist

- [ ] Database migration successful
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login to dashboard
- [ ] Patients page loads
- [ ] Can see patient list
- [ ] Chat button works
- [ ] Modal opens
- [ ] Can see messages
- [ ] Can send message
- [ ] Message appears in chat
- [ ] Status changes to "Manual"
- [ ] Patient receives on WhatsApp
- [ ] AI doesn't respond when paused
- [ ] Can resume AI
- [ ] AI responds after resume
- [ ] Mobile view works

---

## 🎉 Ready to Deploy?

If all tests pass:
1. Commit your code
2. Push to production
3. Run migration on production database
4. Monitor for issues

See `LIVE_CHAT_DEPLOYMENT_CHECKLIST.md` for full deployment guide.

---

## 🆘 Need Help?

Common issues and solutions:

**Issue**: Backend won't start
**Solution**: Check if port 3000 is already in use
```bash
# Windows
netstat -ano | findstr :3000
# Kill the process if needed
```

**Issue**: Frontend won't start
**Solution**: Check if port 3001 is already in use, or delete `.next` folder and try again

**Issue**: Can't login
**Solution**: Check Supabase credentials in `shubhstra-dashboard/.env.local`

**Issue**: No patients showing
**Solution**: Make sure you're logged in as a doctor who has patients in the database

---

**Happy Testing! 🚀**
