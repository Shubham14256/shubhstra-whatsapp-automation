# 🔧 Fix WhatsApp Webhook Issue

## ❌ Problem
Messages sent to WhatsApp number are not reaching your server.

## 🔍 Root Cause
**ngrok is not running** - Your local server (localhost:3000) is not accessible from the internet, so Meta WhatsApp cannot send webhook events to it.

---

## ✅ Solution

### Step 1: Start ngrok

Open a **NEW terminal** and run:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc-xyz-123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc-xyz-123.ngrok-free.app`)

---

### Step 2: Update Webhook URL in Meta Dashboard

1. Go to: https://developers.facebook.com/apps
2. Select your app
3. Click **WhatsApp** → **Configuration**
4. Find **Webhook** section
5. Click **Edit**
6. Update **Callback URL** to:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/webhook
   ```
   Example: `https://abc-xyz-123.ngrok-free.app/webhook`

7. **Verify Token:** `shubhstra_secure_token_2024`
8. Click **Verify and Save**

---

### Step 3: Subscribe to Webhook Events

Make sure these events are subscribed:
- ✅ messages
- ✅ message_status (optional)

---

### Step 4: Update Phone Number in Database

The phone number **9545816728** needs to be registered in your `doctors` table.

**Check if it exists:**

Go to Supabase Dashboard → SQL Editor → Run:

```sql
SELECT * FROM doctors WHERE phone_number LIKE '%9545816728%';
```

**If not found, add it:**

```sql
UPDATE doctors 
SET phone_number = '919545816728'
WHERE email = 'demo@test.com';  -- Replace with your doctor's email
```

**Note:** Phone number format should be: `919545816728` (country code + number, no spaces or +)

---

### Step 5: Test the Webhook

1. Send "Hi" to **9545816728** on WhatsApp
2. Check your backend terminal for:
   ```
   📨 Incoming webhook data:
   ═══════════════════════════════════════
   ```

3. If you see this, webhook is working! ✅

---

## 🚨 Common Issues

### Issue 1: "Webhook verification failed"
**Solution:** Make sure verify token is exactly: `shubhstra_secure_token_2024`

### Issue 2: "Unknown Doctor Number"
**Solution:** Update phone number in database (see Step 4)

### Issue 3: ngrok URL keeps changing
**Solution:** 
- Free ngrok URLs change every restart
- Update webhook URL in Meta Dashboard each time
- Or upgrade to ngrok paid plan for static URL

### Issue 4: "No authenticated user found" in dashboard
**Solution:** Already fixed - Supabase key is correct

---

## 📋 Quick Checklist

- [ ] Backend server running (port 3000)
- [ ] ngrok running and forwarding to port 3000
- [ ] Webhook URL updated in Meta Dashboard
- [ ] Webhook verified successfully
- [ ] Phone number 919545816728 in doctors table
- [ ] Test message sent to WhatsApp
- [ ] Webhook data appearing in terminal

---

## 🎯 Expected Flow

```
Patient sends "Hi" to 9545816728
    ↓
WhatsApp Cloud API receives message
    ↓
Sends webhook POST to your ngrok URL
    ↓
ngrok forwards to localhost:3000/webhook
    ↓
Your server receives and processes
    ↓
Checks knowledge base first
    ↓
If no match, calls Gemini AI
    ↓
Sends response back to patient
```

---

## 💡 Pro Tip

Keep ngrok running in a separate terminal window. If you restart your computer or ngrok, you'll need to update the webhook URL in Meta Dashboard again.

---

**Once ngrok is running and webhook is updated, messages will start flowing! 🚀**
