# 🚀 DEPLOY LIVE CHAT TO PRODUCTION - QUICK GUIDE

## ✅ WHAT'S READY

1. ✅ CORS fixed in backend (`src/app.js`)
2. ✅ Frontend configured to use Render backend
3. ✅ Backend URL: `https://shubhstra-whatsapp-automation.onrender.com`
4. ✅ Frontend URL: `https://shubhstra-dashboard.vercel.app`

---

## 📋 DEPLOYMENT STEPS (15 minutes)

### STEP 1: Push Code to GitHub (2 min)

```bash
git add .
git commit -m "Add CORS and Live Chat support"
git push origin main
```

**What happens:**
- Render will auto-deploy backend (takes 3-5 min)
- Vercel will auto-deploy frontend (takes 2-3 min)

---

### STEP 2: Run Database Migration (2 min)

1. Go to: https://supabase.com/dashboard/project/vliswvuyapadipuxhfuf
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add Live Chat columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS is_bot_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bot_paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bot_paused_by UUID REFERENCES doctors(id);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_patients_is_bot_paused ON patients(is_bot_paused);
```

5. Click **Run** (or press F5)
6. Should see: "Success. No rows returned"

**Verify it worked:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('is_bot_paused', 'bot_paused_at', 'bot_paused_by');
```

Should show 3 rows ✅

---

### STEP 3: Add Environment Variable to Vercel (3 min)

1. Go to: https://vercel.com/dashboard
2. Click your project: **shubhstra-dashboard**
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://shubhstra-whatsapp-automation.onrender.com`
   - **Environment**: Check all 3 boxes (Production, Preview, Development)
6. Click **Save**

---

### STEP 4: Redeploy Frontend (2 min)

1. Still in Vercel dashboard
2. Go to **Deployments** tab
3. Find the latest deployment
4. Click **"..."** (three dots)
5. Click **Redeploy**
6. Wait 2-3 minutes

---

### STEP 5: Test Live Chat (5 min)

1. **Open Dashboard**
   - Go to: https://shubhstra-dashboard.vercel.app
   - Login with: `shubhamsolat36@gmail.com`

2. **Go to Patients Page**
   - Click "Patients" in sidebar

3. **Open Chat**
   - Click "Chat" button on any patient
   - Chat modal should open

4. **Send Test Message**
   - Type: "Hello, this is a test"
   - Click Send
   - Should see:
     - ✅ Message sent successfully
     - ✅ Status changes to "Manual Chat"
     - ✅ Orange badge shows "Manual"
     - ✅ No CORS errors in browser console (F12)

5. **Check WhatsApp**
   - Patient should receive your message on WhatsApp

6. **Test Bot Toggle**
   - Click "Resume AI" button
   - Status should change to "AI Active"
   - Green badge appears

---

## 🎯 WHAT TO EXPECT

### When Doctor Sends Message:
1. Message sent via WhatsApp API ✅
2. AI bot auto-pauses ✅
3. Status shows "Manual Chat" ✅
4. Patient receives message on WhatsApp ✅

### When Patient Replies (Bot Paused):
1. Message saved to database ✅
2. NO AI response sent ✅
3. Doctor sees message in chat modal ✅
4. Doctor can reply manually ✅

### When Doctor Resumes AI:
1. Status changes to "AI Active" ✅
2. Patient messages trigger AI responses ✅
3. Bot works normally ✅

---

## 🔍 TROUBLESHOOTING

### CORS Error Still Showing
**Check:**
1. Render deployment completed successfully
2. Backend logs show CORS middleware loaded
3. Frontend redeployed after adding env variable

**Fix:**
- Wait 5 minutes for Render to fully deploy
- Check Render logs: https://dashboard.render.com

### Messages Not Sending
**Check:**
1. Browser console (F12) for errors
2. Network tab shows request to Render URL
3. Render backend is awake (not sleeping)

**Fix:**
- Visit: https://shubhstra-whatsapp-automation.onrender.com/health
- Should see: `{"status":"healthy"}`
- If sleeping, wait 30 seconds for wake-up

### Database Error
**Check:**
1. Migration ran successfully in Supabase
2. Columns exist in patients table
3. RLS is disabled

**Fix:**
- Re-run migration SQL
- Verify with SELECT query

### Frontend Shows Localhost URL
**Check:**
1. Environment variable added in Vercel
2. Frontend redeployed after adding variable
3. Hard refresh browser (Ctrl+Shift+R)

**Fix:**
- Clear browser cache
- Redeploy frontend again

---

## 📱 MOBILE TESTING

After deployment works on desktop:

1. Open dashboard on phone: https://shubhstra-dashboard.vercel.app
2. Login
3. Go to Patients
4. Open chat modal
5. Send message
6. Verify responsive design works

---

## ✅ SUCCESS CHECKLIST

- [ ] Code pushed to GitHub
- [ ] Render backend deployed (check logs)
- [ ] Database migration run in Supabase
- [ ] Vercel environment variable added
- [ ] Frontend redeployed
- [ ] Chat modal opens without errors
- [ ] Test message sends successfully
- [ ] Patient receives WhatsApp message
- [ ] AI bot pauses automatically
- [ ] Status shows "Manual Chat"
- [ ] Bot toggle works (Resume AI)
- [ ] No CORS errors in console
- [ ] Mobile responsive works

---

## 🎉 YOU'RE LIVE!

Once all checks pass, your Live Chat feature is deployed and working!

**What Doctors Can Do:**
- View all patients in one place
- Click to open chat with any patient
- Send manual WhatsApp messages
- AI auto-pauses when doctor chats
- Resume AI when done
- See bot status (AI Active / Manual Chat)

**Next Steps:**
1. Share dashboard with doctors
2. Train them on Live Chat feature
3. Monitor for any issues
4. Collect feedback
5. Consider enabling native appointments later

---

## 📞 SUPPORT

If you face any issues:
1. Check Render logs: https://dashboard.render.com
2. Check Vercel logs: https://vercel.com/dashboard
3. Check Supabase logs: https://supabase.com/dashboard
4. Check browser console (F12)

---

**Deployment Time:** ~15 minutes
**Status:** Ready to Deploy ✅
**Last Updated:** February 13, 2026
