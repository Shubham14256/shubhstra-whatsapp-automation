# Live Chat Feature - Deployment Checklist

## ✅ COMPLETED TASKS

### 1. Database Migration
- ✅ Created `database/add_live_chat_support.sql`
- ✅ Adds `is_bot_paused`, `bot_paused_at`, `bot_paused_by` columns
- ✅ Creates index for performance
- ⏳ **ACTION REQUIRED**: Run migration in Supabase

### 2. Backend API
- ✅ Created `src/routes/liveChatRoutes.js` with 4 endpoints:
  - `GET /api/live-chat/messages/:patientId` - Get message history
  - `POST /api/live-chat/send` - Send message (auto-pauses AI)
  - `POST /api/live-chat/toggle-bot` - Pause/resume AI manually
  - `GET /api/live-chat/patient-info/:patientId` - Get patient info
- ✅ Routes registered in `src/app.js`
- ✅ Auto-pause AI when doctor sends message

### 3. Message Handler
- ✅ AI pause check implemented in `src/controllers/messageHandler.js`
- ✅ When `is_bot_paused = true`, messages are saved but AI doesn't respond
- ✅ `saveIncomingMessage()` function implemented

### 4. Frontend Dashboard
- ✅ Updated `shubhstra-dashboard/app/patients/page.tsx`
- ✅ Mobile card view with Chat buttons
- ✅ Desktop table view with status indicators
- ✅ Full-featured chat modal with:
  - Message history display
  - Real-time message refresh (3 second interval)
  - Send message form
  - Bot pause/resume toggle
  - Status banners (AI Active / Manual Chat)
  - Auto-scroll to latest message
- ✅ Mobile-responsive design

### 5. Native Appointments (DELAYED)
- ✅ Code written in `src/services/appointmentBookingService.js`
- ✅ Feature flag `ENABLE_NATIVE_BOOKING = false` in messageHandler
- ✅ Code preserved but disabled
- ✅ Calendly remains active

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Run Database Migration

1. Open Supabase Dashboard: https://vliswvuyapadipuxhfuf.supabase.co
2. Go to SQL Editor
3. Copy contents of `database/add_live_chat_support.sql`
4. Run the migration
5. Verify columns were added:
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'patients' 
   AND column_name IN ('is_bot_paused', 'bot_paused_at', 'bot_paused_by');
   ```

### Step 2: Test Locally (RECOMMENDED)

#### Terminal 1: Start Backend
```bash
node server.js
```
Expected output:
```
🚀 Server running on port 3000
✅ Live Chat routes registered
```

#### Terminal 2: Start Frontend
```bash
cd shubhstra-dashboard
npm run dev
```
Expected output:
```
▲ Next.js 14.x.x
- Local: http://localhost:3001
```

#### Test Scenarios:

**Test 1: View Patients**
1. Open http://localhost:3001/patients
2. Should see list of patients
3. Check "AI Active" status badges

**Test 2: Open Chat Modal**
1. Click "Chat" button on any patient
2. Modal should open with message history
3. Should see "AI Bot is active" banner

**Test 3: Send Manual Message**
1. Type a message in the input field
2. Click "Send"
3. Message should appear in chat
4. Status should change to "Manual Chat"
5. Banner should say "AI Bot is paused"

**Test 4: Verify AI Pause**
1. Send a WhatsApp message from patient's phone
2. Message should be saved in database
3. AI should NOT respond (bot is paused)
4. Message should appear in dashboard chat

**Test 5: Resume AI**
1. Click "Resume AI" button
2. Status should change to "AI Active"
3. Send another WhatsApp message
4. AI should respond normally

**Test 6: Mobile Responsiveness**
1. Open on mobile device or use browser DevTools
2. Should see card view (not table)
3. Chat modal should be mobile-friendly
4. All buttons should be accessible

### Step 3: Deploy to Production

#### Option A: Render.com (Current Setup)

1. **Commit and Push Code**
   ```bash
   git add .
   git commit -m "Add Live Chat feature with AI pause"
   git push origin main
   ```

2. **Render will auto-deploy** (if auto-deploy is enabled)
   - Backend: Check Render dashboard for deployment status
   - Frontend: Check Render dashboard for deployment status

3. **Verify Environment Variables**
   - Ensure all `.env` variables are set in Render
   - Check `SUPABASE_URL` and `SUPABASE_KEY`
   - Check WhatsApp credentials

#### Option B: Manual Deployment

1. **Backend**
   ```bash
   # SSH into your server
   cd /path/to/your/app
   git pull origin main
   npm install
   pm2 restart server
   ```

2. **Frontend**
   ```bash
   cd shubhstra-dashboard
   git pull origin main
   npm install
   npm run build
   pm2 restart dashboard
   ```

### Step 4: Post-Deployment Verification

1. **Check Backend Health**
   ```bash
   curl https://your-backend-url.com/health
   ```
   Should return: `{"status":"healthy"}`

2. **Test Live Chat API**
   ```bash
   curl https://your-backend-url.com/api/live-chat/patient-info/PATIENT_ID
   ```

3. **Test Frontend**
   - Open production URL
   - Login as doctor
   - Navigate to Patients page
   - Open chat modal
   - Send test message

4. **Test WhatsApp Integration**
   - Send message from patient phone
   - Verify it appears in dashboard
   - Send reply from dashboard
   - Verify patient receives it on WhatsApp

---

## 📋 TESTING CHECKLIST

- [ ] Database migration ran successfully
- [ ] Backend server starts without errors
- [ ] Frontend builds without errors
- [ ] Patients page loads correctly
- [ ] Chat button opens modal
- [ ] Message history displays
- [ ] Can send message from dashboard
- [ ] Message appears on WhatsApp
- [ ] AI auto-pauses when doctor sends message
- [ ] Incoming messages saved when AI paused
- [ ] AI doesn't respond when paused
- [ ] Can manually resume AI
- [ ] AI responds normally after resume
- [ ] Mobile view works correctly
- [ ] Desktop table view works correctly
- [ ] Status badges show correctly
- [ ] Real-time message refresh works

---

## 🔧 TROUBLESHOOTING

### Issue: "Cannot read property 'is_bot_paused' of null"
**Solution**: Run database migration to add the column

### Issue: "Failed to send message"
**Solution**: Check WhatsApp credentials in `.env` file

### Issue: "Messages not appearing in dashboard"
**Solution**: Check backend logs, verify API endpoint is accessible

### Issue: "AI still responding when paused"
**Solution**: Check `messageHandler.js` has the AI pause check before line 80

### Issue: "Chat modal not opening"
**Solution**: Check browser console for errors, verify React state management

### Issue: "Mobile view broken"
**Solution**: Check Tailwind CSS classes, verify responsive breakpoints

---

## 📊 MONITORING

### Key Metrics to Watch

1. **Message Delivery Rate**
   - Check WhatsApp API logs
   - Monitor failed message count

2. **AI Pause Usage**
   ```sql
   SELECT COUNT(*) FROM patients WHERE is_bot_paused = true;
   ```

3. **Manual Messages Sent**
   ```sql
   SELECT COUNT(*) FROM messages 
   WHERE direction = 'outgoing' 
   AND created_at > NOW() - INTERVAL '24 hours';
   ```

4. **Response Times**
   - Monitor API endpoint latency
   - Check message delivery times

---

## 🎯 SUCCESS CRITERIA

✅ Doctors can view all patients in dashboard
✅ Doctors can open chat with any patient
✅ Doctors can send messages via dashboard
✅ Messages are delivered to WhatsApp
✅ AI automatically pauses when doctor chats
✅ Incoming messages saved when AI paused
✅ AI doesn't respond when paused
✅ Doctors can manually resume AI
✅ Mobile-responsive on all screen sizes
✅ No breaking changes to existing features
✅ Calendly appointments still work

---

## 🚨 ROLLBACK PLAN

If something goes wrong:

1. **Revert Database Changes**
   ```sql
   ALTER TABLE patients 
   DROP COLUMN IF EXISTS is_bot_paused,
   DROP COLUMN IF EXISTS bot_paused_at,
   DROP COLUMN IF EXISTS bot_paused_by;
   ```

2. **Revert Code**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Restart Services**
   ```bash
   pm2 restart all
   ```

---

## 📝 NOTES

- Native appointment booking is DISABLED (feature flag = false)
- Calendly remains the primary booking method
- All appointment booking code is preserved for future use
- To enable native booking: Set `ENABLE_NATIVE_BOOKING = true` in messageHandler.js

---

## 🎉 NEXT STEPS (AFTER DEPLOYMENT)

1. Monitor for 24 hours
2. Gather doctor feedback
3. Fix any bugs or issues
4. Consider enabling native appointments
5. Add more features:
   - Message templates
   - Quick replies
   - Patient notes
   - Chat history export
   - Notification sounds

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Production URL**: _____________
**Status**: ⏳ Pending / ✅ Success / ❌ Failed
