# 🚀 Move WhatsApp Bot from Sandbox to Live Mode

## Complete Step-by-Step Guide

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Meta Business Manager account
- ✅ WhatsApp Business Account (WABA)
- ✅ Business verification completed (or in progress)
- ✅ A permanent phone number (not currently on WhatsApp)
- ✅ Backend deployed on Render
- ✅ Dashboard deployed on Vercel

---

## PART 1: Create Privacy Policy (Required for Live Mode)

### Step 1: Create Privacy Policy Page

You need a publicly accessible Privacy Policy URL. Here are 3 options:

**Option A: Use Free Privacy Policy Generator (Easiest)**

1. Go to: https://www.privacypolicygenerator.info/
2. Fill in details:
   - **Website Name:** [Clinic Name] WhatsApp Bot
   - **Website URL:** https://shubhstra-dashboard.vercel.app
   - **Country:** India
   - **Company Name:** [Doctor's Clinic Name]
   - **Email:** [Clinic Email]
3. Select:
   - ✅ Website
   - ✅ Mobile App
   - ✅ WhatsApp
4. Click "Generate Privacy Policy"
5. Copy the generated policy

**Option B: Host on GitHub Pages (Free)**

1. Create a new file: `privacy-policy.html`
2. Paste the privacy policy content
3. Push to GitHub
4. Enable GitHub Pages in repo settings
5. URL will be: `https://yourusername.github.io/repo-name/privacy-policy.html`

**Option C: Add to Your Dashboard (Recommended)**

Create a public privacy policy page in your dashboard:

```typescript
// Create: shubhstra-dashboard/app/privacy-policy/page.tsx

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
        <p className="mb-4">
          We collect the following information when you interact with our WhatsApp bot:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Phone number</li>
          <li>Name (if provided)</li>
          <li>Messages sent to the bot</li>
          <li>Appointment details</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
        <p className="mb-4">
          We use your information to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Respond to your queries</li>
          <li>Schedule and manage appointments</li>
          <li>Send appointment reminders</li>
          <li>Provide healthcare information</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information.
          Your data is stored securely and is not shared with third parties without your consent.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Access your personal data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of communications</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
        <p className="mb-4">
          For privacy-related questions, contact us at: [Clinic Email]
        </p>
      </section>

      <p className="text-sm text-gray-600 mt-8">
        Last Updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
```

After creating this, your Privacy Policy URL will be:
```
https://shubhstra-dashboard.vercel.app/privacy-policy
```

---

## PART 2: Generate Permanent System User Access Token

### Step 1: Create System User

1. Go to: https://business.facebook.com
2. Click **Business Settings** (gear icon)
3. In left sidebar, click **Users** → **System Users**
4. Click **"Add"** button
5. Fill in:
   - **System User Name:** `Shubhstra WhatsApp Bot`
   - **System User Role:** `Admin`
6. Click **"Create System User"**

### Step 2: Assign WhatsApp Permissions

1. Find your newly created system user
2. Click **"Add Assets"**
3. Select **"Apps"**
4. Find your WhatsApp app
5. Toggle **"Full Control"** ON
6. Click **"Save Changes"**

### Step 3: Generate Permanent Token

1. Click on your system user name
2. Click **"Generate New Token"**
3. Select your WhatsApp app from dropdown
4. Select these permissions:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
   - ✅ `business_management`
5. Set token expiration: **"Never"** (permanent token)
6. Click **"Generate Token"**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

**Token Format:** `EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

This token never expires! 🎉

---

## PART 3: Add Permanent Phone Number

### Step 1: Prepare Phone Number

**Requirements:**
- Phone number must NOT be registered on WhatsApp (personal or business)
- Must be able to receive SMS or voice calls
- Recommended: Get a new SIM card for the bot

**If number is already on WhatsApp:**
1. Open WhatsApp on that phone
2. Go to Settings → Account → Delete My Account
3. Wait 24 hours before using it for API

### Step 2: Add Phone Number to Meta

1. Go to: https://developers.facebook.com
2. Select your WhatsApp app
3. Go to **WhatsApp** → **API Setup**
4. Click **"Add Phone Number"**
5. Select your WhatsApp Business Account
6. Enter phone number (with country code, no + sign)
   - Example: `919545816728` (for India)
7. Choose verification method:
   - **SMS** (recommended) or **Voice Call**
8. Click **"Next"**

### Step 3: Verify Phone Number

1. You'll receive a 6-digit code via SMS/call
2. Enter the code
3. Click **"Verify"**
4. Phone number is now verified! ✅

### Step 4: Get New Phone Number ID

1. After verification, you'll see:
   - **Phone Number ID:** `123456789012345` (15 digits)
   - **WhatsApp Business Account ID:** `123456789012345` (same or different)
2. **COPY BOTH IDs** - you'll need them!

---

## PART 4: Switch App to Live Mode

### Step 1: Add Privacy Policy

1. Go to: https://developers.facebook.com
2. Select your WhatsApp app
3. Go to **App Settings** → **Basic**
4. Scroll down to **"Privacy Policy URL"**
5. Enter your privacy policy URL:
   ```
   https://shubhstra-dashboard.vercel.app/privacy-policy
   ```
6. Click **"Save Changes"**

### Step 2: Switch to Live Mode

1. At the top of the page, you'll see a toggle: **"Development Mode"**
2. Click the toggle to switch to **"Live Mode"**
3. Confirm the switch
4. App is now LIVE! 🎉

**Note:** You can only switch to Live mode after:
- ✅ Privacy Policy URL is added
- ✅ At least one phone number is verified
- ✅ Business verification is completed (or in progress)

---

## PART 5: Update Backend Environment Variables

### Step 1: Update .env File Locally

Open your `.env` file and update these values:

```env
# OLD VALUES (Test/Sandbox)
WHATSAPP_TOKEN=EAATpl9Ci1zUBQqNUmR60uwW4fSIo6ZBiE29qdLjdTrXsFfAFZBFXXkZBTPgUT9ZAKHWYW51N8KR3uT41qFM5uiTnAZCM4gB4aKwHjct0Skpr8hn40ZCJBDqPTBcPAJyhF9OpIbgDENAwjnTq8gKbS7taBPBYT78fYVZC222wBRzS4sfjKaWA0e0V1tHR54B5AZDZD
PHONE_NUMBER_ID=984043858130065
WHATSAPP_BUSINESS_ACCOUNT_ID=1200553978900975

# NEW VALUES (Live/Production)
WHATSAPP_TOKEN=YOUR_NEW_PERMANENT_SYSTEM_USER_TOKEN
PHONE_NUMBER_ID=YOUR_NEW_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_WABA_ID
```

### Step 2: Update Render Environment Variables

1. Go to: https://dashboard.render.com
2. Click on your service: `shubhstra-whatsapp-automation`
3. Click **"Environment"** tab
4. Update these 3 variables:

```
WHATSAPP_TOKEN = [Your new permanent token]
PHONE_NUMBER_ID = [Your new phone number ID]
WHATSAPP_BUSINESS_ACCOUNT_ID = [Your WABA ID]
```

5. Click **"Save Changes"**
6. Render will automatically redeploy with new values

### Step 3: Update Database

Update the doctor's record in Supabase:

```sql
UPDATE doctors 
SET 
  phone_number = '919545816728',  -- Your new permanent number
  display_phone_number = '919545816728',
  whatsapp_phone_number_id = 'YOUR_NEW_PHONE_NUMBER_ID',
  whatsapp_business_account_id = 'YOUR_WABA_ID',
  whatsapp_access_token = 'YOUR_NEW_PERMANENT_TOKEN'
WHERE email = 'shubhamsolat36@gmail.com';
```

---

## PART 6: Update Webhook (If Needed)

If you changed your WhatsApp Business Account, update the webhook:

1. Go to: https://developers.facebook.com
2. Select your WhatsApp app
3. Go to **WhatsApp** → **Configuration**
4. Click **"Edit"** next to Webhook
5. Verify these settings:
   - **Callback URL:** `https://shubhstra-whatsapp-automation.onrender.com/webhook`
   - **Verify Token:** `shubhstra_secure_token_2024`
6. Make sure these fields are subscribed:
   - ✅ `messages`
   - ✅ `message_status` (optional)
7. Click **"Verify and Save"**

---

## PART 7: Test Live Mode

### Step 1: Test with Your Number

1. Send "Hi" to your new permanent WhatsApp number
2. Bot should respond immediately
3. Check Render logs for activity

### Step 2: Test with Any Number

Now you can message from ANY number (no 5-number limit!)

1. Ask a friend to send "Hi" to your bot number
2. They should get a response
3. No need to add them to allowed list!

### Step 3: Verify Dashboard

1. Login to: https://shubhstra-dashboard.vercel.app
2. Check if new patients appear
3. Check if messages are logged

---

## ✅ Checklist: Sandbox → Live Migration

- [ ] Business verification submitted/completed
- [ ] Privacy policy created and hosted
- [ ] System user created in Business Manager
- [ ] Permanent access token generated (never expires)
- [ ] New phone number added and verified
- [ ] Phone Number ID and WABA ID copied
- [ ] Privacy Policy URL added to app settings
- [ ] App switched to Live Mode
- [ ] .env file updated locally
- [ ] Render environment variables updated
- [ ] Database updated with new credentials
- [ ] Webhook verified (if needed)
- [ ] Tested with your number
- [ ] Tested with friend's number
- [ ] Dashboard showing new data

---

## 🎯 What Changes After Going Live

**Before (Sandbox/Test Mode):**
- ❌ Only 5 phone numbers allowed
- ❌ Test number only
- ❌ Token expires in 24 hours
- ❌ Limited features

**After (Live/Production Mode):**
- ✅ Unlimited phone numbers
- ✅ Your permanent business number
- ✅ Token never expires
- ✅ All features unlocked
- ✅ Professional green checkmark (after verification)
- ✅ Higher message limits (1000 free conversations/month)

---

## 🔒 Security Best Practices

1. **Never commit .env file to Git** (already in .gitignore ✅)
2. **Store permanent token securely** (save in password manager)
3. **Rotate tokens annually** (even though they don't expire)
4. **Monitor usage** in Meta Business Manager
5. **Set up billing alerts** (after free tier)

---

## 💰 Pricing After Free Tier

**Free Tier:**
- 1000 service conversations/month (FREE)
- Unlimited marketing conversations (first 1000 free)

**After Free Tier:**
- ₹0.40 - ₹1.50 per conversation (India pricing)
- Billed monthly
- Add payment method in Meta Business Manager

---

## 🆘 Troubleshooting

### Token Not Working
- Verify system user has "Full Control" on app
- Check token permissions include `whatsapp_business_messaging`
- Regenerate token if needed

### Phone Number Not Receiving Messages
- Verify phone number is verified in Meta
- Check webhook is pointing to correct URL
- Verify database has correct phone_number and display_phone_number

### Can't Switch to Live Mode
- Add Privacy Policy URL first
- Complete business verification
- Verify at least one phone number

### Messages Not Sending
- Check Render logs for errors
- Verify WHATSAPP_TOKEN is updated
- Verify PHONE_NUMBER_ID is correct
- Check Meta Business Manager for API errors

---

## 📞 Support

If you face issues:
1. Check Render logs: https://dashboard.render.com
2. Check Meta Business Manager: https://business.facebook.com
3. Check WhatsApp API status: https://developers.facebook.com

---

**Estimated Time:** 2-3 hours (including verification wait time)

**Difficulty:** Medium

**Result:** Production-ready WhatsApp bot with unlimited messaging! 🚀
