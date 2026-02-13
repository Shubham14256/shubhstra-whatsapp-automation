# 🚀 Deploy to Render.com (Free) + UptimeRobot

## 📋 Overview
- **Backend:** Render.com (Free tier)
- **Frontend:** Vercel (Free tier)
- **Keep-Alive:** UptimeRobot (Free)
- **Total Cost:** ₹0 (100% Free!)

---

## 🎯 PART 1: Deploy Backend to Render (10 minutes)

### Step 1: Sign Up for Render
1. Go to: https://render.com
2. Click **"Get Started"**
3. Click **"Sign in with GitHub"**
4. Authorize Render to access your GitHub

### Step 2: Create Web Service
1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Find and select: `shubhstra-whatsapp-automation`
4. Click **"Connect"**

### Step 3: Configure Service Settings

Fill in these details:

**Basic Settings:**
- **Name:** `shubhstra-backend` (or any name you like)
- **Region:** `Singapore` (closest to India)
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select: **Free** ✅

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** and add these ONE BY ONE:

```
Key: PORT
Value: 3000

Key: NODE_ENV
Value: production

Key: WEBHOOK_VERIFY_TOKEN
Value: shubhstra_secure_token_2024

Key: SUPABASE_URL
Value: https://vliswvuyapadipuxhfuf.supabase.co

Key: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXN3dnV5YXBhZGlwdXhoZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM5NDQsImV4cCI6MjA4NjEzOTk0NH0.jvbDc3Fkou6bqB8Uag3eFPPYsv8dlRNqJ56bljj6bjQ

Key: WHATSAPP_TOKEN
Value: EAATpl9Ci1zUBQqNUmR60uwW4fSIo6ZBiE29qdLjdTrXsFfAFZBFXXkZBTPgUT9ZAKHWYW51N8KR3uT41qFM5uiTnAZCM4gB4aKwHjct0Skpr8hn40ZCJBDqPTBcPAJyhF9OpIbgDENAwjnTq8gKbS7taBPBYT78fYVZC222wBRzS4sfjKaWA0e0V1tHR54B5AZDZD

Key: PHONE_NUMBER_ID
Value: 984043858130065

Key: WHATSAPP_BUSINESS_ACCOUNT_ID
Value: 1200553978900975

Key: GEMINI_API_KEY
Value: AIzaSyA5kqg6NoMm7GtkLwQc87uGGnpM3h7s8x4
```

### Step 5: Deploy!
1. Click **"Create Web Service"** (bottom)
2. Wait 3-5 minutes for deployment
3. Watch the logs - should see: `✅ Server running on port 3000`

### Step 6: Get Your Render URL
After deployment completes, you'll see your URL at the top:

Example: `https://shubhstra-backend.onrender.com`

**COPY THIS URL** - you'll need it!

### Step 7: Test Backend
Open: `https://YOUR-RENDER-URL.onrender.com/health`

Should see: `{"status":"ok"}`

✅ **Backend is live!**

---

## ⏰ PART 2: Setup UptimeRobot (Keep Server Awake)

### Why UptimeRobot?
Render free tier sleeps after 15 minutes of inactivity. UptimeRobot pings your server every 5 minutes to keep it awake!

### Step 1: Sign Up
1. Go to: https://uptimerobot.com
2. Click **"Free Sign Up"**
3. Enter email and create account
4. Verify email

### Step 2: Add Monitor
1. Click **"+ Add New Monitor"**
2. Fill in details:

**Monitor Type:** `HTTP(s)`
**Friendly Name:** `Shubhstra Backend`
**URL:** `https://YOUR-RENDER-URL.onrender.com/health`
**Monitoring Interval:** `5 minutes` (free tier)

3. Click **"Create Monitor"**

### Step 3: Verify
- Monitor should show **"Up"** status
- Server will now stay awake 24/7!

✅ **Keep-Alive configured!**

---

## ▲ PART 3: Deploy Frontend to Vercel (10 minutes)

### Step 1: Sign Up for Vercel
1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find: `shubhstra-whatsapp-automation`
3. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected) ✅

**Root Directory:** 
- Click **"Edit"**
- Enter: `shubhstra-dashboard`
- Click **"Continue"**

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://vliswvuyapadipuxhfuf.supabase.co

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXN3dnV5YXBhZGlwdXhoZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM5NDQsImV4cCI6MjA4NjEzOTk0NH0.jvbDc3Fkou6bqB8Uag3eFPPYsv8dlRNqJ56bljj6bjQ
```

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://shubhstra-dashboard.vercel.app`

**COPY THIS URL!**

### Step 6: Test Frontend
1. Open your Vercel URL
2. Should see login page
3. Try logging in with: `shubhamsolat36@gmail.com`

✅ **Dashboard is live!**

---

## 🔗 PART 4: Update Meta Webhook (5 minutes)

### Step 1: Update Webhook URL
1. Go to: https://developers.facebook.com
2. Select your WhatsApp app
3. Go to: **WhatsApp** → **Configuration**
4. Click **"Edit"** next to Webhook

### Step 2: Configure Webhook
**Callback URL:** `https://YOUR-RENDER-URL.onrender.com/webhook`
**Verify Token:** `shubhstra_secure_token_2024`

Click **"Verify and Save"**

### Step 3: Test Webhook
1. Send "Hi" to your WhatsApp test number
2. Check Render logs (click "Logs" tab)
3. Should see webhook data
4. Bot should respond!

✅ **Webhook working!**

---

## ✅ DEPLOYMENT COMPLETE!

### Your URLs:
```
Backend (Render): https://YOUR-APP.onrender.com
Frontend (Vercel): https://YOUR-APP.vercel.app
Database (Supabase): https://vliswvuyapadipuxhfuf.supabase.co
```

### What's Working:
✅ Backend API on Render (stays awake with UptimeRobot)
✅ Frontend Dashboard on Vercel
✅ WhatsApp Bot responding
✅ Multi-doctor support ready
✅ 100% Free!

---

## ⚠️ Important Notes

### Render Free Tier Limitations:
- **750 hours/month** (enough for 24/7 with UptimeRobot)
- **First request after sleep:** 30-60 seconds delay
- **With UptimeRobot:** No sleep, instant response!

### If Server Sleeps:
- Check UptimeRobot monitor is active
- Verify ping interval is 5 minutes
- Check Render logs for errors

### Performance:
- **First message:** May take 2-3 seconds
- **Subsequent messages:** Instant (<1 second)
- **Good enough for:** Testing, 1-5 doctors
- **Upgrade to Railway when:** 10+ doctors, high traffic

---

## 🎉 Next Steps

1. **Test Everything:**
   - Send "Hi" to WhatsApp
   - Check bot responds
   - Login to dashboard
   - Save settings

2. **Monitor:**
   - Check UptimeRobot daily
   - Watch Render logs
   - Monitor Vercel analytics

3. **Add First Doctor:**
   - Create Supabase auth user
   - Insert doctor in database
   - Share dashboard credentials

4. **Collect Feedback:**
   - Test all features
   - Note any issues
   - Plan improvements

---

## 🆘 Troubleshooting

### Backend not responding:
- Check Render logs for errors
- Verify UptimeRobot monitor is "Up"
- Test: `https://YOUR-RENDER-URL/health`

### Frontend not loading:
- Check Vercel deployment logs
- Verify root directory: `shubhstra-dashboard`
- Check environment variables

### Webhook not working:
- Verify Meta webhook URL
- Check Render logs for incoming requests
- Test with local ngrok first

### Server sleeping:
- Check UptimeRobot monitor status
- Verify ping interval is 5 minutes
- Add second monitor if needed

---

**Total Setup Time:** ~25-30 minutes
**Total Cost:** ₹0 (100% Free!)
**Good For:** Testing, 1-10 doctors
**Upgrade When:** Need faster response, 10+ doctors

Enjoy your free deployment! 🚀
