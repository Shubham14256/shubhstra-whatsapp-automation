# 🚀 Deploy Shubhstra Platform - Step by Step

## ✅ Pre-Deployment Checklist
- [x] Code audit complete
- [x] Webhook error handling fixed
- [x] .gitignore created
- [x] Package.json scripts ready
- [ ] Git repository initialized
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Meta webhook updated

---

## 📦 STEP 1: Initialize Git & Push to GitHub (5 minutes)

### 1.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit - Shubhstra WhatsApp Automation Platform"
```

### 1.2 Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `shubhstra-whatsapp-automation`
3. Description: `Multi-tenant WhatsApp automation platform for doctors`
4. **Private** repository
5. Don't initialize with README
6. Click "Create repository"

### 1.3 Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/shubhstra-whatsapp-automation.git
git branch -M main
git push -u origin main
```

**✅ Checkpoint:** Code should be visible on GitHub

---

## 🚂 STEP 2: Deploy Backend to Railway (10 minutes)

### 2.1 Sign Up & Create Project
1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Click "New Project"
5. Select "Deploy from GitHub repo"
6. Choose `shubhstra-whatsapp-automation`

### 2.2 Configure Environment Variables
1. Click on your deployed service
2. Go to "Variables" tab
3. Click "Raw Editor"
4. Paste this (update values if needed):

```env
PORT=3000
NODE_ENV=production
WEBHOOK_VERIFY_TOKEN=shubhstra_secure_token_2024

SUPABASE_URL=https://vliswvuyapadipuxhfuf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXN3dnV5YXBhZGlwdXhoZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM5NDQsImV4cCI6MjA4NjEzOTk0NH0.jvbDc3Fkou6bqB8Uag3eFPPYsv8dlRNqJ56bljj6bjQ

WHATSAPP_TOKEN=EAATpl9Ci1zUBQqNUmR60uwW4fSIo6ZBiE29qdLjdTrXsFfAFZBFXXkZBTPgUT9ZAKHWYW51N8KR3uT41qFM5uiTnAZCM4gB4aKwHjct0Skpr8hn40ZCJBDqPTBcPAJyhF9OpIbgDENAwjnTq8gKbS7taBPBYT78fYVZC222wBRzS4sfjKaWA0e0V1tHR54B5AZDZD
PHONE_NUMBER_ID=984043858130065
WHATSAPP_BUSINESS_ACCOUNT_ID=1200553978900975

GEMINI_API_KEY=AIzaSyA5kqg6NoMm7GtkLwQc87uGGnpM3h7s8x4
```

5. Click "Save"

### 2.3 Generate Domain
1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. **COPY THIS URL** - You'll need it for Meta webhook!

Example: `https://shubhstra-production.up.railway.app`

### 2.4 Verify Deployment
1. Click "View Logs"
2. Look for: `✅ Server running on port 3000`
3. Test: Open `https://YOUR-RAILWAY-URL.up.railway.app/health`
4. Should see: `{"status":"ok"}`

**✅ Checkpoint:** Backend is live and responding

---

## ▲ STEP 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Sign Up & Import Project
1. Go to: https://vercel.com
2. Click "Sign Up" → Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `shubhstra-whatsapp-automation`

### 3.2 Configure Project Settings
1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** Click "Edit" → Enter `shubhstra-dashboard`
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)

### 3.3 Add Environment Variables
Click "Environment Variables" and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vliswvuyapadipuxhfuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXN3dnV5YXBhZGlwdXhoZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM5NDQsImV4cCI6MjA4NjEzOTk0NH0.jvbDc3Fkou6bqB8Uag3eFPPYsv8dlRNqJ56bljj6bjQ
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. **COPY THE URL** when done

Example: `https://shubhstra-dashboard.vercel.app`

### 3.5 Verify Deployment
1. Open your Vercel URL
2. Should see login page
3. Try logging in with: `shubhamsolat36@gmail.com`

**✅ Checkpoint:** Dashboard is live and accessible

---

## 🔗 STEP 4: Update Meta Webhook (5 minutes)

### 4.1 Update Webhook URL
1. Go to: https://developers.facebook.com
2. Select your app
3. Go to: WhatsApp → Configuration
4. Click "Edit" next to Webhook
5. **Callback URL:** `https://YOUR-RAILWAY-URL.up.railway.app/webhook`
6. **Verify Token:** `shubhstra_secure_token_2024`
7. Click "Verify and Save"

### 4.2 Test Webhook
1. Send "Hi" to your WhatsApp test number
2. Check Railway logs (should see webhook data)
3. Should receive bot response

**✅ Checkpoint:** Bot is responding to messages

---

## 🎯 STEP 5: Final Testing (10 minutes)

### Test Backend
- [ ] Railway URL accessible
- [ ] Health check working: `/health`
- [ ] Webhook receiving messages
- [ ] Bot responding to "Hi"
- [ ] Logs showing in Railway

### Test Frontend
- [ ] Vercel URL accessible
- [ ] Login page loads
- [ ] Can login successfully
- [ ] Dashboard shows data
- [ ] Settings page works
- [ ] Can save settings

### Test Integration
- [ ] Send "Hi" to WhatsApp
- [ ] Bot responds with menu
- [ ] Click "Book Appointment"
- [ ] Receives Calendly link
- [ ] Patient appears in dashboard

---

## 📝 STEP 6: Document URLs

**Save these URLs:**

```
Backend (Railway): https://YOUR-APP.up.railway.app
Frontend (Vercel): https://YOUR-APP.vercel.app
Database (Supabase): https://vliswvuyapadipuxhfuf.supabase.co
```

---

## 🎉 DEPLOYMENT COMPLETE!

### What's Live:
✅ Backend API on Railway
✅ Frontend Dashboard on Vercel
✅ WhatsApp Bot responding
✅ Multi-doctor support ready
✅ Database connected

### Share with Doctors:
1. Dashboard URL: `https://YOUR-APP.vercel.app`
2. Login credentials (create in Supabase)
3. Setup guide for their clinic

---

## 🆘 Troubleshooting

### Backend not responding:
```bash
# Check Railway logs
# Look for errors in deployment
# Verify environment variables
```

### Frontend not loading:
```bash
# Check Vercel deployment logs
# Verify root directory is set to: shubhstra-dashboard
# Check environment variables
```

### Webhook not working:
```bash
# Verify Meta webhook URL matches Railway URL
# Check Railway logs for incoming requests
# Test with: curl https://YOUR-RAILWAY-URL/health
```

---

## 📞 Next Steps

1. **Monitor for 24 hours**
   - Check Railway logs
   - Monitor Vercel analytics
   - Watch for errors

2. **Add First Doctor**
   - Create Supabase auth user
   - Insert doctor in database
   - Share dashboard credentials

3. **Collect Feedback**
   - Test all features
   - Note any issues
   - Plan improvements

---

**Total Time:** ~30-40 minutes
**Cost:** Free (Railway $5 credit, Vercel free tier)
**Status:** Production Ready! 🚀

Good luck! 🎉
