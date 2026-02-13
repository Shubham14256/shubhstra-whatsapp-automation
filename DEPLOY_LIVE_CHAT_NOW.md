# 🚀 DEPLOY LIVE CHAT NOW - STEP BY STEP

## ✅ FIXES COMPLETED

### 1. CORS Issue Fixed
- ✅ Installed `cors` package in backend
- ✅ Added CORS middleware to `src/app.js`
- ✅ Configured to allow both localhost and Vercel frontend

### 2. Frontend API URLs Fixed
- ✅ Added `NEXT_PUBLIC_API_URL` environment variable
- ✅ Updated all API calls to use environment variable
- ✅ No more hardcoded `localhost:3000` URLs

---

## 📋 DEPLOYMENT CHECKLIST

### STEP 1: Deploy Backend (Render)

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Fix CORS and add live chat support"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to: https://dashboard.render.com
   - Select your backend service
   - It should auto-deploy from GitHub
   - Wait for deployment to complete

3. **Get Backend URL**
   - Copy your Render backend URL (e.g., `https://your-app.onrender.com`)

4. **Run Database Migration**
   - Go to Supabase Dashboard: https://supabase.com/dashboard
   - Select your project: `vliswvuyapadipuxhfuf`
   - Go to SQL Editor
   - Run the migration: `database/add_live_chat_support.sql`
   - Verify columns added:
     ```sql
     SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'patients' 
     AND column_name IN ('is_bot_paused', 'bot_paused_at', 'bot_paused_by');
     ```

---

### STEP 2: Update Frontend Environment Variable (Vercel)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `shubhstra-dashboard`

2. **Add Environment Variable**
   - Go to: Settings → Environment Variables
   - Add new variable:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://your-backend-url.onrender.com` (from Step 1.3)
     - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

3. **Redeploy Frontend**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

---

### STEP 3: Test Live Chat Feature

1. **Login to Dashboard**
   - Go to: https://shubhstra-dashboard.vercel.app
   - Login with doctor credentials

2. **Test Chat**
   - Go to Patients page
   - Click "Chat" on any patient
   - Try sending a message
   - Verify:
     - ✅ Message sends successfully
     - ✅ AI bot auto-pauses
     - ✅ Status shows "Manual Chat"
     - ✅ No CORS errors in console

3. **Test Bot Toggle**
   - Click "Resume AI" button
   - Verify status changes to "AI Active"
   - Click "Pause AI" button
   - Verify status changes to "Manual Chat"

---

## 🔧 BACKEND CHANGES MADE

### File: `src/app.js`
```javascript
import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:3001',
    'https://shubhstra-dashboard.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## 🎨 FRONTEND CHANGES MADE

### File: `shubhstra-dashboard/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### File: `shubhstra-dashboard/app/patients/page.tsx`
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// All API calls now use:
fetch(`${API_URL}/api/live-chat/...`)
```

---

## 🗄️ DATABASE MIGRATION

### File: `database/add_live_chat_support.sql`
Adds 3 columns to `patients` table:
- `is_bot_paused` (BOOLEAN) - TRUE when doctor is chatting manually
- `bot_paused_at` (TIMESTAMP) - When bot was paused
- `bot_paused_by` (UUID) - Which doctor paused the bot

---

## 🎯 WHAT HAPPENS AFTER DEPLOYMENT

1. **Doctor sends message** → AI bot auto-pauses
2. **Patient sends message** → Saved to database, no AI response
3. **Doctor clicks "Resume AI"** → AI bot resumes normal operation
4. **Patient sends message** → AI responds automatically

---

## 🚨 TROUBLESHOOTING

### CORS Error Still Showing
- Check Render backend logs
- Verify CORS middleware is loaded
- Verify frontend is using correct backend URL

### Messages Not Sending
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Verify backend is running on Render

### Database Error
- Verify migration was run in Supabase
- Check if columns exist in `patients` table
- Verify RLS is disabled for testing

---

## 📱 MOBILE TESTING

After deployment, test on mobile:
1. Open dashboard on phone
2. Go to Patients page
3. Open chat modal
4. Verify responsive design works
5. Send test message

---

## ✅ SUCCESS CRITERIA

- [ ] Backend deployed on Render
- [ ] Database migration run successfully
- [ ] Frontend environment variable added
- [ ] Frontend redeployed on Vercel
- [ ] Chat modal opens without errors
- [ ] Messages send successfully
- [ ] AI bot pauses automatically
- [ ] Bot toggle works
- [ ] No CORS errors in console
- [ ] Mobile responsive works

---

## 🎉 YOU'RE DONE!

Live Chat feature is now deployed and ready to use!

Doctors can now:
- View all patients
- Open chat with any patient
- Send manual messages (AI auto-pauses)
- Resume AI bot when done
- See bot status (AI Active / Manual Chat)

---

## 📞 NEXT STEPS

1. Test with real patients
2. Monitor for any issues
3. Collect doctor feedback
4. Consider enabling native appointments later (code is ready but disabled)

---

**Last Updated**: February 13, 2026
**Status**: Ready to Deploy ✅
