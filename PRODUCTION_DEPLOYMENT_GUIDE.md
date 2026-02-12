# 🚀 Production Deployment Guide - Shubhstra WhatsApp Automation

## 📋 Overview

**Backend:** Railway (Node.js + Express)
**Frontend:** Vercel (Next.js Dashboard)
**Database:** Supabase (Already hosted)

---

## 🔧 Part 1: Environment Variables

### Backend (Railway) - Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=production
WEBHOOK_VERIFY_TOKEN=shubhstra_secure_token_2024

# Supabase Configuration
SUPABASE_URL=https://vliswvuyapadipuxhfuf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXN3dnV5YXBhZGlwdXhoZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM5NDQsImV4cCI6MjA4NjEzOTk0NH0.jvbDc3Fkou6bqB8Uag3eFPPYsv8dlRNqJ56bljj6bjQ

# WhatsApp Cloud API Configuration (Master/Fallback)
WHATSAPP_TOKEN=EAATpl9Ci1zUBQqNUmR60uwW4fSIo6ZBiE29qdLjdTrXsFfAFZBFXXkZBTPgUT9ZAKHWYW51N8KR3uT41qFM5uiTnAZCM4gB4aKwHjct0Skpr8hn40ZCJBDqPTBcPAJyhF9OpIbgDENAwjnTq8gKbS7taBPBYT78fYVZC222wBRzS4sfjKaWA0e0V1tHR54B5AZDZD
PHONE_NUMBER_ID=984043858130065
WHATSAPP_BUSINESS_ACCOUNT_ID=1200553978900975

# Google Gemini AI Configuration
GEMINI_API_KEY=AIzaSyA5kqg6NoMm7GtkLwQc87uGGnpM3h7s8x4
```

### Frontend (Vercel) - Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vliswvuyapadipuxhfuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaXN3dnV5YXBhZGlwdXhoZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM5NDQsImV4cCI6MjA4NjEzOTk0NH0.jvbDc3Fkou6bqB8Uag3eFPPYsv8dlRNqJ56bljj6bjQ
```

---

## 📦 Part 2: Prepare Code for GitHub

### Step 1: Create .gitignore (Root Directory)

Create `.gitignore` in root folder:

```gitignore
# Dependencies
node_modules/
shubhstra-dashboard/node_modules/

# Environment variables
.env
.env.local
.env.production
shubhstra-dashboard/.env.local

# Build outputs
shubhstra-dashboard/.next/
shubhstra-dashboard/out/
dist/
build/

# Logs
*.log
npm-debug.log*
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Misc
.vercel
.railway
```

### Step 2: Initialize Git Repository

```bash
# Open terminal in project root
git init
git add .
git commit -m "Initial commit - Shubhstra WhatsApp Automation Platform"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `shubhstra-whatsapp-automation`
3. Description: `Multi-tenant WhatsApp automation platform for doctors`
4. Keep it **Private**
5. Don't initialize with README (we already have code)
6. Click "Create repository"

### Step 4: Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/shubhstra-whatsapp-automation.git
git branch -M main
git push -u origin main
```

---

## 🚂 Part 3: Deploy Backend to Railway

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway to access your repositories

### Step 2: Deploy Backend

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `shubhstra-whatsapp-automation`
4. Railway will auto-detect Node.js

### Step 3: Configure Environment Variables

1. Click on your deployed service
2. Go to "Variables" tab
3. Click "Raw Editor"
4. Paste all backend environment variables (from Part 1)
5. Click "Save"

### Step 4: Configure Build Settings

1. Go to "Settings" tab
2. **Root Directory:** Leave empty (root)
3. **Build Command:** (leave default)
4. **Start Command:** `npm start`
5. Click "Save"

### Step 5: Get Railway URL

1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Copy the URL (e.g., `https://your-app.up.railway.app`)

---

## ▲ Part 4: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign in with GitHub
4. Authorize Vercel

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Import `shubhstra-whatsapp-automation`
3. Vercel will detect Next.js

### Step 3: Configure Project

1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `shubhstra-dashboard`
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

### Step 4: Add Environment Variables

1. Expand "Environment Variables"
2. Add variables from Part 1 (Frontend section)
3. Click "Deploy"

### Step 5: Get Vercel URL

1. Wait for deployment to complete
2. Copy the URL (e.g., `https://your-app.vercel.app`)

---

## 🔗 Part 5: Update Meta Webhook

### Step 1: Update Webhook URL

1. Go to Meta Developer Dashboard
2. Your App → WhatsApp → Configuration
3. Edit Webhook
4. **Callback URL:** `https://your-railway-url.up.railway.app/webhook`
5. **Verify Token:** `shubhstra_secure_token_2024`
6. Click "Verify and Save"

### Step 2: Test Webhook

1. Send "Hi" to your WhatsApp test number
2. Check Railway logs (click "View Logs")
3. You should see webhook data

---

## ✅ Part 6: Post-Deployment Checklist

### Backend Verification

- [ ] Railway deployment successful
- [ ] Environment variables set
- [ ] Railway URL accessible
- [ ] Webhook receiving messages
- [ ] Bot responding to "Hi"
- [ ] Cron jobs running

### Frontend Verification

- [ ] Vercel deployment successful
- [ ] Environment variables set
- [ ] Dashboard accessible
- [ ] Login working
- [ ] Settings page loading
- [ ] Data displaying correctly

### Meta Configuration

- [ ] Webhook URL updated to Railway
- [ ] Webhook verified
- [ ] Test messages working
- [ ] Bot responses working

---

## 🎯 Part 7: Give Access to Doctors

### For Each New Doctor:

1. **Create Supabase Auth User:**
   - Go to Supabase → Authentication → Users
   - Click "Add user"
   - Email: doctor's email
   - Password: temporary password
   - Send them login credentials

2. **Add Doctor to Database:**
   ```sql
   INSERT INTO doctors (
     name, 
     email, 
     phone_number, 
     clinic_name,
     clinic_address,
     consultation_fee,
     welcome_message,
     is_active
   ) VALUES (
     'Dr. Name',
     'doctor@example.com',
     '919876543210',
     'Clinic Name',
     'Clinic Address',
     500,
     'Welcome to our clinic! How can we help you?',
     true
   );
   ```

3. **Share Dashboard URL:**
   - URL: `https://your-app.vercel.app`
   - Email: their email
   - Password: temporary password
   - Ask them to change password after first login

4. **Guide Doctor to Configure:**
   - Login to dashboard
   - Go to Settings
   - Fill in clinic details
   - Add Calendly link (optional)
   - Add Review link (optional)
   - Save settings

5. **Setup WhatsApp (Optional - for individual credentials):**
   - Doctor creates WhatsApp Business Account
   - Gets Phone Number ID, WABA ID, Access Token
   - Updates in database:
   ```sql
   UPDATE doctors 
   SET 
     whatsapp_phone_number_id = 'THEIR_PHONE_ID',
     whatsapp_business_account_id = 'THEIR_WABA_ID',
     whatsapp_access_token = 'THEIR_TOKEN'
   WHERE email = 'doctor@example.com';
   ```

---

## 🔒 Part 8: Security Recommendations

### Before Going Live:

1. **Enable RLS Policies:**
   ```sql
   -- Run the SQL from database/FIX_RLS_PERMISSIONS.sql
   ```

2. **Use Service Role Key for Backend:**
   - Get service_role key from Supabase
   - Update `SUPABASE_KEY` in Railway

3. **Secure Environment Variables:**
   - Never commit .env files
   - Use Railway/Vercel secrets
   - Rotate tokens regularly

4. **Setup Custom Domain (Optional):**
   - Railway: Settings → Domains → Add custom domain
   - Vercel: Settings → Domains → Add domain

---

## 📊 Part 9: Monitoring

### Railway Logs:
- Click on service → "View Logs"
- Monitor webhook requests
- Check for errors

### Vercel Logs:
- Project → Deployments → Click deployment → "View Function Logs"
- Monitor dashboard access
- Check for errors

### Supabase Logs:
- Supabase Dashboard → Logs
- Monitor database queries
- Check authentication

---

## 🆘 Troubleshooting

### Backend Not Responding:
- Check Railway logs
- Verify environment variables
- Check if service is running

### Frontend Not Loading:
- Check Vercel deployment logs
- Verify environment variables
- Check build errors

### Webhook Not Working:
- Verify Meta webhook URL
- Check Railway logs
- Test with ngrok first

### Database Errors:
- Check RLS policies
- Verify Supabase connection
- Check table permissions

---

## 📞 Support

If you face issues:
1. Check Railway/Vercel logs
2. Verify all environment variables
3. Test locally first
4. Check Meta webhook configuration

---

**Deployment Time:** ~15-20 minutes
**Cost:** Free (Railway $5 credit, Vercel free tier)
**Ready for:** Multiple doctors, production use

Good luck with deployment! 🚀
