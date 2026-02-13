# 🚀 Deploy Live Chat - STEP BY STEP

## ⚠️ IMPORTANT: Do These Steps IN ORDER

---

## STEP 1: Database Migration (DO THIS FIRST!)

1. Open Supabase: https://vliswvuyapadipuxhfuf.supabase.co
2. Click: **SQL Editor** (left sidebar)
3. Click: **New Query**
4. Copy and paste this ENTIRE block:

```sql
-- Add Live Chat columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS is_bot_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bot_paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bot_paused_by UUID REFERENCES doctors(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_patients_is_bot_paused ON patients(is_bot_paused);

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('is_bot_paused', 'bot_paused_at', 'bot_paused_by');
```

5. Click: **Run** (or press Ctrl+Enter)
6. You should see 3 rows returned showing the new columns
7. ✅ Database is ready!

---

## STEP 2: Commit and Push Code

Open terminal and run these commands:

```bash
git add .
git commit -m "Add Live Chat feature with AI pause functionality"
git push origin main
```

---

## STEP 3: Wait for Auto-Deploy

If you have auto-deploy enabled on Render:
- Backend will deploy automatically (takes ~5 minutes)
- Frontend will deploy automatically (takes ~3 minutes)

Check deployment status:
- Backend: https://dashboard.render.com (check your backend service)
- Frontend: https://dashboard.render.com (check your frontend service)

---

## STEP 4: Verify Deployment

Once deployed, check:

1. **Backend Health Check**
   - Open: https://YOUR-BACKEND-URL.com/health
   - Should see: `{"status":"healthy"}`

2. **Frontend Dashboard**
   - Open: https://YOUR-FRONTEND-URL.com
   - Login with doctor credentials
   - Click: **Patients**
   - You should see the patients list

3. **Test Live Chat**
   - Click: **Chat** button on any patient
   - Modal should open
   - Try sending a message
   - Check if patient receives it on WhatsApp

---

## STEP 5: Test Full Flow

1. **Send message from dashboard**
   - Open chat modal
   - Type: "Hello, this is a test"
   - Click Send
   - Check patient's WhatsApp ✅

2. **Verify AI pause**
   - Status should change to "Manual Chat" (orange)
   - Patient should receive message ✅

3. **Patient replies**
   - Send message from patient's WhatsApp
   - Message should appear in dashboard ✅
   - AI should NOT respond (paused) ✅

4. **Resume AI**
   - Click "Resume AI" button
   - Status changes to "AI Active" (green)
   - Next patient message → AI responds ✅

---

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] Code committed and pushed
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Can login to dashboard
- [ ] Can see patients list
- [ ] Can open chat modal
- [ ] Can send message
- [ ] Patient receives message on WhatsApp
- [ ] Status changes to "Manual Chat"
- [ ] AI doesn't respond when paused
- [ ] Can resume AI
- [ ] AI responds after resume

---

## 🆘 If Something Goes Wrong

### Issue: Database migration fails
**Solution**: Check if columns already exist, if yes, that's fine!

### Issue: Deployment fails
**Solution**: Check Render logs for errors, ensure all env variables are set

### Issue: Can't send messages
**Solution**: Check WhatsApp credentials in Render environment variables

### Issue: Messages not appearing
**Solution**: Check backend logs, verify API endpoints are accessible

---

## 📞 Production URLs

**Backend**: _______________ (fill in your URL)
**Frontend**: _______________ (fill in your URL)
**Supabase**: https://vliswvuyapadipuxhfuf.supabase.co

---

**Deployment Date**: February 13, 2026
**Status**: ⏳ In Progress

---

**Good luck! You're deploying to production! 🚀**
