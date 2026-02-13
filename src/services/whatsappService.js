/**
 * WhatsApp Service
 * Handles all WhatsApp Cloud API message sending operations
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get WhatsApp credentials from doctor object or fallback to environment variables
 * @param {Object} doctor - Doctor object with WhatsApp credentials
 * @returns {Object} Credentials object {token, phoneNumberId}
 */
const getCredentials = (doctor) => {
  // Priority 1: Use doctor-specific credentials if available
  if (doctor?.whatsapp_access_token && doctor?.whatsapp_phone_number_id) {
    console.log(`🔑 Using doctor-specific credentials for: ${doctor.name}`);
    return {
      token: doctor.whatsapp_access_token,
      phoneNumberId: doctor.whatsapp_phone_number_id,
    };
  }

  // Priority 2: Fallback to environment variables (master account)
  console.log('🔑 Using master account credentials from .env');
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.PHONE_NUMBER_ID,
  };
};

/**
 * Send a generic message to WhatsApp Cloud API
 * @param {string} to - Recipient phone number
 * @param {Object} data - Message data object
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
export const sendMessage = async (to, data, doctor = null) => {
  try {
    // Get credentials (doctor-specific or fallback to master)
    const { token, phoneNumberId } = getCredentials(doctor);

    if (!token) {
      throw new Error('WhatsApp access token is not available');
    }

    if (!phoneNumberId) {
      throw new Error('WhatsApp phone number ID is not available');
    }

    const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      ...data,
    };

    console.log('📤 Sending message to WhatsApp API...');
    console.log('Recipient:', to);
    console.log('Phone Number ID:', phoneNumberId);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Message sent successfully');
    console.log('Response:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Error sending message to WhatsApp API:');
    
    if (error.response) {
      // API responded with error
      console.error('Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));

      // Extract error details
      const errorData = error.response.data?.error;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message;
      const errorSubcode = errorData?.error_subcode;

      // Create structured error object
      const structuredError = {
        code: errorCode,
        message: errorMessage,
        subcode: errorSubcode,
        userMessage: 'Failed to send WhatsApp message',
        canRetry: false
      };

      // Handle specific error codes
      if (errorCode === 131047 || errorCode === 131026) {
        // 24-hour window expired
        console.warn('\n⚠️  ═══════════════════════════════════════════════');
        console.warn('⚠️  24-Hour Window Expired');
        console.warn('⚠️  ═══════════════════════════════════════════════');
        console.warn(`⚠️  Recipient: ${to}`);
        console.warn('⚠️  Cannot send message - patient must reply first');
        console.warn('⚠️  ═══════════════════════════════════════════════\n');
        
        structuredError.userMessage = '24-hour window expired. Patient must reply to the bot first before you can send messages.';
        structuredError.canRetry = false;
      } else if (errorCode === 131031) {
        // Invalid phone number
        structuredError.userMessage = 'Invalid phone number format';
        structuredError.canRetry = false;
      } else if (errorCode === 131051) {
        // Message undeliverable
        structuredError.userMessage = 'Message undeliverable. Number may be invalid or blocked.';
        structuredError.canRetry = false;
      } else if (errorCode === 100) {
        // Invalid parameter
        structuredError.userMessage = 'Invalid message format';
        structuredError.canRetry = false;
      } else if (errorCode === 190) {
        // Access token expired
        structuredError.userMessage = 'WhatsApp access token expired. Please contact admin.';
        structuredError.canRetry = false;
      }

      // Throw structured error
      const err = new Error(structuredError.userMessage);
      err.whatsappError = structuredError;
      err.originalError = error.response.data;
      throw err;
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from WhatsApp API');
      const err = new Error('WhatsApp API not responding. Please try again.');
      err.whatsappError = {
        code: 'NO_RESPONSE',
        message: 'No response from WhatsApp API',
        userMessage: 'WhatsApp API not responding. Please try again.',
        canRetry: true
      };
      throw err;
    } else {
      // Error in request setup
      console.error('Error:', error.message);
      const err = new Error('Failed to send message. Please try again.');
      err.whatsappError = {
        code: 'REQUEST_ERROR',
        message: error.message,
        userMessage: 'Failed to send message. Please try again.',
        canRetry: true
      };
      throw err;
    }
  }
};
        console.warn('⚠️  ═══════════════════════════════════════════════\n');
      } else if (errorCode === 131026) {
        console.warn('\n⚠️  Message Undeliverable: Recipient may have blocked the number or is not on WhatsApp');
      } else if (errorCode === 131021) {
        console.warn('\n⚠️  Recipient phone number not registered on WhatsApp');
      } else {
        console.error(`Error Code: ${errorCode}`);
        console.error(`Error Message: ${errorMessage}`);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from WhatsApp API');
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }

    throw error;
  }
};

/**
 * Send a text message
 * @param {string} to - Recipient phone number
 * @param {string} text - Message text
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
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

    return await sendMessage(to, data, doctor);
  } catch (error) {
    console.error('❌ Error in sendTextMessage:', error.message);
    throw error;
  }
};

/**
 * Send an interactive list message
 * @param {string} to - Recipient phone number
 * @param {string} headerText - Header text
 * @param {string} bodyText - Body text
 * @param {Array} sections - Array of sections with rows
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
export const sendListMessage = async (to, headerText, bodyText, sections, doctor = null) => {
  try {
    console.log(`📋 Sending list message to ${to}`);
    
    const data = {
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: headerText,
        },
        body: {
          text: bodyText,
        },
        action: {
          button: 'View Options',
          sections: sections,
        },
      },
    };

    return await sendMessage(to, data, doctor);
  } catch (error) {
    console.error('❌ Error in sendListMessage:', error.message);
    throw error;
  }
};

/**
 * Send a button message
 * @param {string} to - Recipient phone number
 * @param {string} bodyText - Body text
 * @param {Array} buttons - Array of buttons (max 3)
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
export const sendButtonMessage = async (to, bodyText, buttons, doctor = null) => {
  try {
    console.log(`🔘 Sending button message to ${to}`);
    
    // WhatsApp allows max 3 buttons
    if (buttons.length > 3) {
      throw new Error('Maximum 3 buttons allowed');
    }

    const data = {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: bodyText,
        },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
        },
      },
    };

    return await sendMessage(to, data, doctor);
  } catch (error) {
    console.error('❌ Error in sendButtonMessage:', error.message);
    throw error;
  }
};

/**
 * Send a location message
 * @param {string} to - Recipient phone number
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} name - Location name
 * @param {string} address - Location address
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
export const sendLocationMessage = async (to, latitude, longitude, name, address, doctor = null) => {
  try {
    console.log(`📍 Sending location message to ${to}`);
    console.log(`Location: ${name} (${latitude}, ${longitude})`);
    
    const data = {
      type: 'location',
      location: {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        name: name,
        address: address,
      },
    };

    return await sendMessage(to, data, doctor);
  } catch (error) {
    console.error('❌ Error in sendLocationMessage:', error.message);
    throw error;
  }
};

/**
 * Send a template message (for 24+ hour window)
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Name of the approved template
 * @param {string} languageCode - Language code (e.g., 'en_US')
 * @param {Array} components - Template components
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
export const sendTemplateMessage = async (to, templateName, languageCode = 'en_US', components = [], doctor = null) => {
  try {
    console.log(`📋 Sending template message to ${to}`);
    console.log(`Template: ${templateName} (${languageCode})`);
    
    const data = {
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    // Add components if provided
    if (components && components.length > 0) {
      data.template.components = components;
      console.log('Components:', JSON.stringify(components, null, 2));
    }

    return await sendMessage(to, data, doctor);
  } catch (error) {
    console.error('❌ Error in sendTemplateMessage:', error.message);
    throw error;
  }
};


/**
 * Send document (PDF) via WhatsApp
 * @param {string} to - Recipient phone number
 * @param {string} filepath - Path to document file
 * @param {string} filename - Display filename
 * @param {string} caption - Optional caption
 * @param {Object} doctor - Doctor object with WhatsApp credentials (optional)
 * @returns {Promise<Object>} API response
 */
export const sendDocument = async (to, filepath, filename, caption = '', doctor = null) => {
  try {
    console.log(`📎 Sending document to ${to}`);
    console.log(`   File: ${filename}`);

    // Get credentials
    const { token, phoneNumberId } = getCredentials(doctor);

    // Import fs for reading file
    const fs = (await import('fs')).default;
    const FormData = (await import('form-data')).default;

    // Step 1: Upload document to WhatsApp
    const uploadUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/media`;

    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', fs.createReadStream(filepath), {
      filename: filename,
      contentType: 'application/pdf',
    });

    console.log('📤 Uploading document to WhatsApp...');

    const uploadResponse = await axios.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
    });

    const mediaId = uploadResponse.data.id;
    console.log(`✅ Document uploaded. Media ID: ${mediaId}`);

    // Step 2: Send document message
    const messageData = {
      type: 'document',
      document: {
        id: mediaId,
        filename: filename,
      },
    };

    if (caption) {
      messageData.document.caption = caption;
    }

    const response = await sendMessage(to, messageData, doctor);

    console.log('✅ Document sent successfully');
    return response;

  } catch (error) {
    console.error('❌ Error sending document:', error.response?.data || error.message);

    // Handle specific errors
    if (error.response?.status === 413) {
      console.error('⚠️  File too large. WhatsApp limit is 100MB for documents.');
    }

    throw error;
  }
};
