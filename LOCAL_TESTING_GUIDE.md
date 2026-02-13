# Local Testing Guide - Native Appointments

## Step 1: Database Migration (2 minutes)

### Run the SQL migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project → SQL Editor
3. Copy and paste this SQL:

```sql
-- Add conversation state columns
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS conversation_state VARCHAR(50) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS conversation_data JSONB DEFAULT '{}';

-- Create index
CREATE INDEX IF NOT EXISTS idx_patients_conversation_state ON patients(conversation_state);

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('conversation_state', 'conversation_data');
```

4. Click "Run"
5. You should see 2 rows returned showing the new columns

---

## Step 2: Install Dependencies (1 minute)

```bash
npm install chrono-node
```

---

## Step 3: Create Appointment Booking Service (5 minutes)

Create new file: `src/services/appointmentBookingService.js`

I'll create this file for you now...


---

## Step 4: Check for Errors (1 minute)

```bash
# Check if there are any syntax errors
npm run check
```

If you see any errors, let me know!

---

## Step 5: Start the Server (1 minute)

```bash
# Make sure you're in the project root directory
C:\Users\Shree\AppData\Local\nvm\v20.11.0\node.exe server.js
```

You should see:
```
✅ Server running on port 3000
✅ Webhook endpoint: /webhook
```

---

## Step 6: Test the Appointment Booking Flow

### Test Scenario 1: Happy Path

1. **Send "Hi" to your WhatsApp bot**
   - Bot should show the menu

2. **Select "📅 Book Appointment"**
   - Bot should ask: "When would you like to visit?"

3. **Reply: "Tomorrow 3pm"**
   - Bot should parse the date/time
   - Bot should create appointment
   - Bot should send confirmation with formatted date

### Test Scenario 2: Invalid Time

1. **Send "Hi"** → Select "Book Appointment"
2. **Reply: "Yesterday 3pm"** (past date)
   - Bot should say: "I couldn't understand that date/time"
   - Bot should show examples

3. **Reply: "Tomorrow 8pm"** (outside clinic hours)
   - Bot should say: "Sorry, we're only open from 9 AM to 6 PM"

### Test Scenario 3: Cancel Booking

1. **Send "Hi"** → Select "Book Appointment"
2. **Reply: "cancel"**
   - Bot should say: "Booking cancelled"
   - Conversation state should reset

---

## Step 7: Verify in Database

1. Open Supabase Dashboard → Table Editor → `appointments`
2. You should see your new appointment with:
   - `patient_id`: Your patient ID
   - `doctor_id`: Your doctor ID
   - `appointment_time`: The parsed date/time
   - `status`: 'pending'
   - `notes`: 'Booked via WhatsApp conversational booking'

3. Check `patients` table:
   - `conversation_state` should be 'idle' (after booking completes)
   - `conversation_data` should be empty `{}`

---

## Step 8: Check Server Logs

Look for these log messages:

```
✅ Good logs:
🔄 Patient in conversation state: booking_appointment
📅 Parsed date: 2026-02-14T15:00:00.000Z
✅ Valid appointment time: ...
✅ Appointment created: <uuid>
✅ Conversation state reset to idle

❌ Error logs to watch for:
⚠️  No date/time found in text
⚠️  Date is in the past
❌ Failed to create appointment
```

---

## Troubleshooting

### Issue: "I couldn't understand that date/time"

**Cause**: chrono-node couldn't parse the text

**Solutions**:
- Try different formats: "tomorrow 3pm", "feb 15 3pm", "next monday 10am"
- Make sure time is included (not just date)
- Check server logs for parsing details

### Issue: Appointment not created

**Cause**: Database error or validation failed

**Solutions**:
1. Check server logs for error details
2. Verify `doctor_id` exists in `doctors` table
3. Check `appointments` table has all required columns
4. Verify RLS policies allow insert

### Issue: Bot doesn't respond

**Cause**: Webhook not receiving messages

**Solutions**:
1. Check ngrok is running
2. Verify webhook URL in Meta dashboard
3. Check server logs for incoming webhook calls
4. Test with curl:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"1234567890","text":{"body":"Hi"}}]}}]}]}'
```

---

## What to Test

### ✅ Must Test
- [ ] Book appointment with "tomorrow 3pm"
- [ ] Book appointment with "next monday 10am"
- [ ] Try past date (should fail)
- [ ] Try time outside clinic hours (should fail)
- [ ] Cancel booking mid-conversation
- [ ] Verify appointment appears in dashboard
- [ ] Check conversation state resets after booking

### 🔍 Optional Tests
- [ ] Book appointment on Sunday (should fail if you added weekend check)
- [ ] Try ambiguous dates like "monday" (should pick next monday)
- [ ] Try different time formats: "3:30pm", "15:00", "3 pm"
- [ ] Book multiple appointments in a row
- [ ] Test with different languages (if supported)

---

## Success Criteria

✅ **You're ready for production if:**
1. Bot successfully parses natural language dates
2. Appointments are created in database
3. Confirmation message shows correct date/time
4. Conversation state resets after booking
5. Error messages are helpful
6. No server crashes or errors

---

## Next Steps After Testing

Once local testing is successful:

1. **Commit changes**:
```bash
git add .
git commit -m "feat: Add native conversational appointment booking"
git push origin main
```

2. **Deploy to production**:
   - Render will auto-deploy backend
   - Test on production WhatsApp number

3. **Monitor for 24 hours**:
   - Check appointment creation rate
   - Monitor error logs
   - Collect user feedback

4. **Optional: Remove Calendly**:
   - Once confident, remove Calendly fallback
   - Update settings page to remove Calendly link field

---

## Need Help?

If you encounter any issues:
1. Check server logs first
2. Verify database migration ran successfully
3. Test with simple dates first ("tomorrow 3pm")
4. Share error logs with me

Let's test it! 🚀
