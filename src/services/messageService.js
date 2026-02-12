/**
 * Message Service
 * Handles message logging to database for chat history
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

    console.log('✅ Incoming message logged');
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

    console.log('✅ Outgoing message logged');
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
    const { data, error } = await supabase
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

/**
 * Update message status (for delivery/read receipts)
 * @param {string} whatsappMessageId - WhatsApp message ID
 * @param {string} status - New status ('delivered', 'read', 'failed')
 * @returns {Promise<boolean>} Success status
 */
export const updateMessageStatus = async (whatsappMessageId, status) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('whatsapp_message_id', whatsappMessageId);

    if (error) {
      console.error('❌ Error updating message status:', error);
      return false;
    }

    console.log(`✅ Message status updated to: ${status}`);
    return true;
  } catch (error) {
    console.error('❌ Exception in updateMessageStatus:', error);
    return false;
  }
};
