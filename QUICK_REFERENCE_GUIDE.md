# 🚀 Quick Reference Guide - Shubhstra WhatsApp Bot

## 📞 How to Start Servers

### Backend Server:
```bash
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

### Dashboard:
```bash
cd shubhstra-dashboard
npm run dev
```

### ngrok (for WhatsApp webhook):
```bash
ngrok http 3000
```

---

## 🔑 Important Credentials

### Supabase:
- **URL:** `https://vliswvuyapadipuxhfuf.supabase.co`
- **Anon Key:** Check `.env.local` file

### WhatsApp:
- **Phone Number ID:** 984043858130065
- **Token:** Check `.env` file (regenerate if expired)
- **Webhook Token:** `shubhstra_secure_token_2024`

### Gemini AI:
- **API Key:** Check `.env` file
- **Model:** gemini-2.5-flash
- **Quota:** 15 requests/minute (free tier)

---

## 🧪 Testing Commands

### Test WhatsApp Token:
```bash
node test-whatsapp-token.js
```

### Test Gemini AI:
```bash
node test-ai.js
```

### Check Quota:
```bash
node check-quota.js
```

### Test Enhanced AI:
```bash
node test-enhanced-ai.js
```

---

## 📱 WhatsApp Bot Commands

### For Patients:
- **"Hi"** → Show menu
- **"I have a headache"** → Get AI health advice
- **Send image** → Analyze medical report
- **"Queue"** → Check queue status
- **"Referral"** → Get referral code
- **"Social"** → Get social media links
- **1-5** → Rate the clinic

### For Doctors (Admin):
- **"/search John"** → Find patient named John
- **"/queue"** → View today's appointments
- **"/report John Doe"** → Generate PDF for patient
- **"/network"** → View referral network stats

---

## 🔧 Common Issues & Solutions

### Issue: "No authenticated user found"
**Solution:** Check Supabase anon key in `.env.local`

### Issue: WhatsApp 401 error
**Solution:** Token expired, generate new one from Meta Dashboard

### Issue: WhatsApp 400 error (recipient not in list)
**Solution:** Add phone number as test recipient in Meta Dashboard

### Issue: AI quota exceeded
**Solution:** Wait 1-2 minutes for quota reset

### Issue: Server not starting
**Solution:** Check if port 3000 is already in use

---

## 📊 Dashboard Pages

1. **Dashboard** (`/`) - Overview with stats
2. **Patients** (`/patients`) - Patient list
3. **Appointments** (`/appointments`) - Appointment management
4. **Queue** (`/queue`) - Today's queue
5. **Marketing** (`/marketing`) - Campaigns
6. **Reports** (`/reports`) - Analytics
7. **Network** (`/network`) - Referral network
8. **Settings** (`/settings`) - Clinic configuration

---

## 🎯 What AI Can Answer

### Common Symptoms:
- Headache, fever, cold, cough
- Stomach pain, nausea, vomiting
- Body pain, weakness, fatigue
- Skin problems, allergies

### Chronic Conditions:
- Diabetes management
- Blood pressure advice
- Thyroid problems
- PCOD/PCOS

### Special Cases:
- Child health
- Pregnancy questions
- Elderly care
- Mental health (stress, anxiety)

### Medical Reports:
- Blood tests
- X-rays
- CT/MRI scans
- Prescriptions

---

## 📝 Important URLs

### Meta Developer Dashboard:
https://developers.facebook.com/apps

### Supabase Dashboard:
https://supabase.com/dashboard

### Gemini API Console:
https://aistudio.google.com/app/apikey

### ngrok Dashboard:
https://dashboard.ngrok.com

---

## 🚨 Emergency Fixes

### Restart Backend:
```bash
# Stop
Stop-Process -Name node -Force

# Start
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

### Regenerate WhatsApp Token:
1. Go to Meta Developer Dashboard
2. Your App → WhatsApp → API Setup
3. Click "Generate Access Token"
4. Copy token
5. Update `.env` file
6. Restart server

### Fix Database Connection:
1. Check Supabase dashboard is accessible
2. Verify credentials in `.env`
3. Test connection: `node -e "import('./src/config/supabaseClient.js')"`

---

## 📈 Monitoring

### Check Server Logs:
- Look for errors in terminal
- Check for 401/400 errors
- Monitor AI response times

### Check Database:
- Go to Supabase Dashboard
- Check `patients` table for new entries
- Verify `appointments` are being created

### Check WhatsApp:
- Test with "Hi" message
- Verify menu appears
- Test AI responses

---

## 💡 Pro Tips

1. **Keep ngrok running** - WhatsApp needs it for webhook
2. **Monitor quota** - Free tier has limits
3. **Add test recipients** - Required for testing in dev mode
4. **Save tokens** - WhatsApp tokens expire, save them
5. **Check logs** - Terminal shows all activity
6. **Test regularly** - Ensure everything works

---

## 📞 Support Resources

### Documentation:
- WhatsApp API: https://developers.facebook.com/docs/whatsapp
- Gemini API: https://ai.google.dev/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

### Community:
- WhatsApp Business API Community
- Gemini API Discord
- Supabase Discord

---

## ✅ Daily Checklist

- [ ] Backend server running
- [ ] Dashboard running
- [ ] ngrok running
- [ ] WhatsApp token valid
- [ ] Gemini API quota available
- [ ] Database connected
- [ ] Test with "Hi" message

---

**Keep this guide handy for quick reference!** 🚀
