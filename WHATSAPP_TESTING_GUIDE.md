# WhatsApp Cloud API - Complete Testing Guide

## 🎉 Congratulations!

You've successfully set up Meta WhatsApp Cloud API! Now let's connect it to your backend.

---

## 📋 Step 1: Add Your Credentials to `.env`

### **Open your `.env` file and replace these values:**

```env
# WhatsApp Cloud API Configuration
WHATSAPP_TOKEN=YOUR_TEMPORARY_ACCESS_TOKEN_HERE
PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID_HERE
WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID_HERE
```

### **Where to find these values:**

1. **Go to**: https://developers.facebook.com/apps
2. **Select your app**
3. **Go to**: WhatsApp → Getting Started

**Copy these values:**
- **Temporary Access Token**: Long string starting with `EAAJ...`
- **Phone Number ID**: Number like `123456789012345`
- **Business Account ID**: Number like `987654321098765`

### **Example (with fake values):**
```env
WHATSAPP_TOKEN=EAAJxyz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123
PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
```

---

## 🚀 Step 2: Start Your Backend Server

### **Option A: Using Command Line**

```bash
# Make sure you're in the project root directory
cd C:\Users\Shree\OneDrive\Desktop\shubhstra-backend Doctor

# Start the server
node server.js
```

### **Option B: I can start it for you**

Just say: "Kiro, start the backend server"

### **Expected Output:**
```
✅ Supabase client initialized
🚀 Shubhstra Tech WhatsApp Automation Platform
═══════════════════════════════════════════════
✅ Server running in development mode
✅ Listening on port 3000
✅ Webhook URL: http://localhost:3000/webhook
✅ Health check: http://localhost:3000/health
═══════════════════════════════════════════════
```

---

## 🌐 Step 3: Expose Your Local Server to Internet

**Why?** Meta needs a public URL to send webhook events to your local server.

### **Option A: Using ngrok (Recommended)**

1. **Download ngrok**: https://ngrok.com/download
2. **Install and run**:
   ```bash
   ngrok http 3000
   ```
3. **Copy the HTTPS URL** (looks like: `https://abc123.ngrok.io`)

### **Option B: Using localtunnel**

```bash
# Install
npm install -g localtunnel

# Run
lt --port 3000
```

### **Option C: Using Cloudflare Tunnel**

```bash
# Install
npm install -g cloudflared

# Run
cloudflared tunnel --url http://localhost:3000
```

### **You'll get a URL like:**
```
https://abc123.ngrok.io
```

**Important**: Keep this terminal window open!

---

## 🔗 Step 4: Configure Webhook in Meta Dashboard

### **Go to Meta Dashboard:**

1. **Open**: https://developers.facebook.com/apps
2. **Select your app**
3. **Go to**: WhatsApp → Configuration

### **Configure Webhook:**

1. **Click**: "Edit" next to Webhook

2. **Enter Callback URL**:
   ```
   https://YOUR_NGROK_URL/webhook
   ```
   Example: `https://abc123.ngrok.io/webhook`

3. **Enter Verify Token**:
   ```
   shubhstra_secure_token_2024
   ```
   (This matches your `.env` file)

4. **Click**: "Verify and Save"

### **Expected Result:**
✅ "Webhook verified successfully"

### **If verification fails:**
- Check if your server is running
- Check if ngrok is running
- Check if the verify token matches
- Check server logs for errors

---

## 📡 Step 5: Subscribe to Webhook Events

### **In Meta Dashboard:**

1. **Go to**: WhatsApp → Configuration
2. **Find**: "Webhook fields"
3. **Subscribe to these events**:
   - ✅ `messages` (Required)
   - ✅ `message_status` (Optional)

4. **Click**: "Subscribe"

---

## 🧪 Step 6: Test the Integration

### **Test 1: Send a Message to Your WhatsApp Bot**

1. **Open WhatsApp** on your phone
2. **Send a message** to your WhatsApp Business number
3. **Type**: "Hello"

### **What Should Happen:**

**In your server logs, you should see:**
```
📨 Received webhook event
📱 Processing message from: +919876543210
💬 Message: Hello
🤖 AI Response: Hello! I'm your clinic assistant...
✅ Message sent successfully
```

**On your phone, you should receive:**
```
Hello! I'm your clinic assistant. How can I help you today?
```

---

## 🔍 Step 7: Verify Everything is Working

### **Check 1: Server Logs**

Look for these messages in your terminal:
```
✅ Webhook verified
📨 Received message
🤖 AI processing
✅ Response sent
```

### **Check 2: Database**

Run this in Supabase SQL Editor:
```sql
-- Check if patient was created
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;

-- Check if messages are logged
SELECT * FROM message_logs ORDER BY created_at DESC LIMIT 10;
```

### **Check 3: WhatsApp**

- ✅ You receive automated replies
- ✅ Bot understands your queries
- ✅ You can book appointments via chat

---

## 🐛 Troubleshooting

### **Problem 1: Webhook Verification Failed**

**Possible Causes:**
- Server not running
- ngrok not running
- Wrong verify token
- Firewall blocking

**Solution:**
```bash
# Check if server is running
curl http://localhost:3000/health

# Check ngrok
curl https://YOUR_NGROK_URL/health

# Check logs
# Look for "Webhook verification" in server logs
```

### **Problem 2: Not Receiving Messages**

**Possible Causes:**
- Webhook not subscribed to `messages` event
- Wrong credentials in `.env`
- Server crashed

**Solution:**
1. Check Meta Dashboard → WhatsApp → Configuration
2. Verify webhook is subscribed to `messages`
3. Check server logs for errors
4. Restart server

### **Problem 3: Bot Not Responding**

**Possible Causes:**
- Gemini API key invalid
- Rate limit exceeded
- Network error

**Solution:**
```bash
# Test Gemini API
node test-ai.js

# Check logs for AI errors
# Look for "AI Error" in server logs
```

### **Problem 4: Database Errors**

**Possible Causes:**
- Supabase key invalid
- Tables not created
- Network error

**Solution:**
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if you can insert
INSERT INTO patients (phone_number, name) 
VALUES ('919999999999', 'Test Patient');
```

---

## 📊 Testing Scenarios

### **Scenario 1: New Patient Inquiry**

**User sends**: "Hello, I want to book an appointment"

**Expected**:
1. Patient created in database
2. AI responds with available slots
3. Conversation logged

### **Scenario 2: Appointment Booking**

**User sends**: "Book appointment for tomorrow 10 AM"

**Expected**:
1. AI confirms details
2. Appointment created in database
3. Confirmation message sent

### **Scenario 3: Query About Clinic**

**User sends**: "What are your clinic timings?"

**Expected**:
1. AI fetches from `clinic_config` table
2. Responds with opening/closing times
3. Conversation logged

---

## 🔐 Security Notes

### **Important:**

1. **Temporary Access Token expires in 24 hours**
   - For production, generate a permanent token
   - Go to: Meta Dashboard → System Users

2. **Never commit `.env` to Git**
   - Already in `.gitignore`
   - Keep credentials secret

3. **Use HTTPS for webhook**
   - ngrok provides HTTPS automatically
   - Required by Meta

4. **Verify webhook signature** (Already implemented)
   - Prevents unauthorized requests
   - Validates requests are from Meta

---

## 📱 Testing Commands

### **Test the webhook endpoint:**
```bash
# Health check
curl http://localhost:3000/health

# Test webhook verification (GET)
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=shubhstra_secure_token_2024&hub.challenge=test123"

# Should return: test123
```

### **Test sending a message:**
```bash
# Test WhatsApp API
node test-whatsapp.js
```

### **Test AI integration:**
```bash
# Test Gemini AI
node test-ai.js
```

---

## 📋 Quick Checklist

Before testing, make sure:

- [ ] `.env` file has all credentials
- [ ] Backend server is running (port 3000)
- [ ] ngrok/tunnel is running
- [ ] Webhook configured in Meta Dashboard
- [ ] Webhook verified successfully
- [ ] Subscribed to `messages` event
- [ ] Test recipient added in Meta Dashboard
- [ ] Supabase tables created
- [ ] Gemini API key is valid

---

## 🎯 Success Criteria

You'll know everything is working when:

1. ✅ Server starts without errors
2. ✅ Webhook verification succeeds
3. ✅ You send a message to your bot
4. ✅ Bot responds within 2-3 seconds
5. ✅ Patient record created in database
6. ✅ Conversation logged
7. ✅ AI understands context
8. ✅ You can book appointments via chat

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Generate Permanent Access Token**
   - Go to Meta Dashboard → System Users
   - Create system user
   - Generate permanent token
   - Update `.env` file

2. **Deploy to Production**
   - Use a cloud server (AWS, Heroku, DigitalOcean)
   - Set up proper domain
   - Configure production webhook
   - Enable monitoring

3. **Add More Features**
   - Payment reminders
   - Appointment confirmations
   - Health tips broadcasts
   - Queue management

---

## 📞 Need Help?

If you encounter any issues:

1. **Check server logs** - Most errors are logged
2. **Check Meta Dashboard** - Look for webhook delivery logs
3. **Test each component** - Use the test scripts
4. **Ask me** - I'm here to help! 😊

---

## 🎉 You're Almost There!

Just follow these steps:
1. Add credentials to `.env`
2. Start server
3. Start ngrok
4. Configure webhook
5. Send a test message

**Let's do this!** 🚀

---

**Last Updated**: February 10, 2026  
**Status**: Ready for Testing  
**Next**: Add your credentials and start testing!
