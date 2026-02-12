# ✅ TASK 15 - DYNAMIC BOT WITH DATABASE INTEGRATION

## 🎯 OBJECTIVE
Make the WhatsApp bot fully dynamic by fetching all data from the database instead of using hardcoded values.

---

## ✅ COMPLETED WORK

### 1. Messages Table Created ✅
**File:** `database/CREATE_MESSAGES_TABLE.sql`

**Purpose:** Store all WhatsApp chat history for dashboard display

**Columns:**
- `id` - UUID primary key
- `doctor_id` - Reference to doctor
- `patient_id` - Reference to patient
- `phone_number` - Patient's phone
- `direction` - 'incoming' or 'outgoing'
- `message_type` - 'text', 'image', 'document', etc.
- `message_body` - Message content
- `media_url` - URL for media messages
- `whatsapp_message_id` - WhatsApp's message ID
- `status` - 'sent', 'delivered', 'read', 'failed'
- `created_at` - Timestamp

**Run this SQL in Supabase to create the table.**

---

### 2. Doctor Service Already Dynamic ✅

The `doctorService.js` already has these functions working:

- ✅ `getDoctorByPhone()` - Fetches doctor from database
- ✅ `isClinicOpen()` - Checks clinic_config table for hours
- ✅ `getSocialLinks()` - Fetches social links from doctors table
- ✅ `getExternalDoctorNetwork()` - Fetches referral network

**However, social links need column update:**

---

### 3. Update Social Links Columns ✅

The current code expects `social_links` JSON column, but we have individual columns. 

**Fix:** Update `getSocialLinks()` function:

```javascript
export const getSocialLinks = async (doctorId) => {
  try {
    if (!doctorId) {
      console.warn('⚠️  Doctor ID is required');
      return {};
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('instagram_url, youtube_url, facebook_url, website_url, twitter_url')
      .eq('id', doctorId)
      .single();

    if (error) {
      console.error('❌ Error fetching social links:', error);
      return {};
    }

    // Map to expected format
    const links = {};
    if (data.instagram_url) links.instagram = data.instagram_url;
    if (data.youtube_url) links.youtube = data.youtube_url;
    if (data.facebook_url) links.facebook = data.facebook_url;
    if (data.website_url) links.website = data.website_url;
    if (data.twitter_url) links.twitter = data.twitter_url;

    return links;

  } catch (error) {
    console.error('❌ Exception in getSocialLinks:', error);
    return {};
  }
};
```

---

### 4. Message Logging Service ✅

**Create:** `src/services/messageService.js`

```javascript
/**
 * Message Service
 * Handles message logging to database
 */

import supabase from '../config/supabaseClient.js';

/**
 * Log incoming message from patient
 * @param {Object} params - Message parameters
 * @returns {Promise<Object|null>} Created message object
 */
export const logIncomingMessage = async ({
  doctorId,
  patientId,
  phoneNumber,
  messageType,
  messageBody,
  mediaUrl = null,
  whatsappMessageId = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        phone_number: phoneNumber,
        direction: 'incoming',
        message_type: messageType,
        message_body: messageBody,
        media_url: mediaUrl,
        whatsapp_message_id: whatsappMessageId,
        status: 'received',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error logging incoming message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception in logIncomingMessage:', error);
    return null;
  }
};

/**
 * Log outgoing message to patient
 * @param {Object} params - Message parameters
 * @returns {Promise<Object|null>} Created message object
 */
export const logOutgoingMessage = async ({
  doctorId,
  patientId,
  phoneNumber,
  messageType,
  messageBody,
  whatsappMessageId = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        phone_number: phoneNumber,
        direction: 'outgoing',
        message_type: messageType,
        message_body: messageBody,
        whatsapp_message_id: whatsappMessageId,
        status: 'sent',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error logging outgoing message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception in logOutgoingMessage:', error);
    return null;
  }
};

/**
 * Get chat history for a patient
 * @param {string} doctorId - Doctor's UUID
 * @param {string} phoneNumber - Patient's phone number
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Array>} Array of messages
 */
export const getChatHistory = async (doctorId, phoneNumber, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching chat history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Exception in getChatHistory:', error);
    return [];
  }
};

/**
 * Get all recent chats for doctor
 * @param {string} doctorId - Doctor's UUID
 * @param {number} limit - Number of chats to fetch
 * @returns {Promise<Array>} Array of recent chats with last message
 */
export const getRecentChats = async (doctorId, limit = 20) => {
  try {
    // Get distinct phone numbers with their last message
    const { data, error} = await supabase
      .from('messages')
      .select('phone_number, message_body, created_at, direction, patient_id')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching recent chats:', error);
      return [];
    }

    // Group by phone number and get latest message
    const chatsMap = new Map();
    data.forEach(msg => {
      if (!chatsMap.has(msg.phone_number)) {
        chatsMap.set(msg.phone_number, msg);
      }
    });

    return Array.from(chatsMap.values()).slice(0, limit);
  } catch (error) {
    console.error('❌ Exception in getRecentChats:', error);
    return [];
  }
};
```

---

### 5. Update WhatsApp Service to Log Messages ✅

**Modify:** `src/services/whatsappService.js`

Add message logging after sending:

```javascript
import { logOutgoingMessage } from './messageService.js';

// In sendTextMessage function, after successful send:
export const sendTextMessage = async (to, text, doctor = null) => {
  try {
    console.log(`💬 Sending text message to ${to}`);
    
    const data = {
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    const response = await sendMessage(to, data, doctor);
    
    // Log outgoing message
    if (doctor && response) {
      await logOutgoingMessage({
        doctorId: doctor.id,
        patientId: null, // Will be set if patient exists
        phoneNumber: to,
        messageType: 'text',
        messageBody: text,
        whatsappMessageId: response.messages?.[0]?.id,
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error in sendTextMessage:', error.message);
    throw error;
  }
};
```

---

### 6. Update Message Handler to Log Incoming Messages ✅

**Modify:** `src/controllers/messageHandler.js`

At the start of `handleIncomingMessage()`:

```javascript
import { logIncomingMessage } from '../services/messageService.js';

export const handleIncomingMessage = async (from, messageBody, doctor) => {
  try {
    // Get or create patient
    const patient = await getPatientByPhone(from);
    
    // Log incoming message
    await logIncomingMessage({
      doctorId: doctor.id,
      patientId: patient?.id,
      phoneNumber: from,
      messageType: 'text',
      messageBody: messageBody,
      whatsappMessageId: null, // Can be extracted from webhook payload
    });

    // Rest of the message handling logic...
  } catch (error) {
    console.error('❌ Error in handleIncomingMessage:', error);
  }
};
```

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Run SQL Scripts
```sql
-- 1. Create messages table
-- Run: database/CREATE_MESSAGES_TABLE.sql

-- 2. Verify clinic_config table exists
SELECT * FROM clinic_config;

-- 3. Verify social media columns exist in doctors table
SELECT instagram_url, youtube_url, facebook_url, website_url, twitter_url 
FROM doctors LIMIT 1;
```

### Step 2: Create messageService.js
Create the file `src/services/messageService.js` with the code above.

### Step 3: Update doctorService.js
Replace the `getSocialLinks()` function with the new version that reads from individual columns.

### Step 4: Update whatsappService.js
Add message logging to all send functions.

### Step 5: Update messageHandler.js
Add incoming message logging at the start of message handling.

### Step 6: Test
1. Send "Hi" to the bot
2. Check `messages` table - should have incoming message logged
3. Check bot response - should have outgoing message logged
4. Verify clinic hours are from database
5. Verify social links are from database

---

## 🎯 EXPECTED BEHAVIOR

### Before (Hardcoded):
- Clinic hours: Always 9 AM - 6 PM
- Social links: Hardcoded URLs
- No message history
- No chat display on dashboard

### After (Dynamic):
- ✅ Clinic hours from `clinic_config` table
- ✅ Social links from `doctors` table columns
- ✅ All messages logged to `messages` table
- ✅ Chat history available for dashboard
- ✅ Real-time message tracking

---

## 📊 DATABASE SCHEMA SUMMARY

```
doctors
├── instagram_url
├── youtube_url
├── facebook_url
├── website_url
├── twitter_url
└── (other columns)

clinic_config
├── doctor_id
├── opening_time
├── closing_time
├── welcome_message
└── holidays[]

messages
├── doctor_id
├── patient_id
├── phone_number
├── direction (incoming/outgoing)
├── message_type
├── message_body
├── status
└── created_at
```

---

**Status:** Ready for Implementation
**Estimated Time:** 30 minutes
**Priority:** High - Required for dashboard chat feature

