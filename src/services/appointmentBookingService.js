/**
 * Appointment Booking Service
 * Handles conversational appointment booking via WhatsApp
 */

import supabase from '../config/supabaseClient.js';
import { createAppointment } from './patientService.js';
import * as chrono from 'chrono-node';

/**
 * Parse natural language date/time
 * Examples: "tomorrow 3pm", "next monday 10am", "feb 15 at 2:30pm"
 * @param {string} text - User's message
 * @returns {Date|null} - Parsed date or null if invalid
 */
export const parseDateTime = (text) => {
  try {
    const results = chrono.parse(text);
    
    if (results.length === 0) {
      console.log('⚠️  No date/time found in text');
      return null;
    }
    
    const parsedDate = results[0].start.date();
    console.log(`📅 Parsed date: ${parsedDate.toISOString()}`);
    
    // Validate: must be in future
    const now = new Date();
    if (parsedDate < now) {
      console.log('⚠️  Date is in the past');
      return null;
    }
    
    return parsedDate;
  } catch (error) {
    console.error('❌ Error parsing date/time:', error);
    return null;
  }
};

/**
 * Start appointment booking conversation
 * @param {string} patientId - Patient's UUID
 */
export const startBookingConversation = async (patientId) => {
  try {
    console.log(`🔄 Starting booking conversation for patient: ${patientId}`);
    
    const { error } = await supabase
      .from('patients')
      .update({
        conversation_state: 'booking_appointment',
        conversation_data: { step: 'awaiting_datetime', started_at: new Date().toISOString() }
      })
      .eq('id', patientId);
    
    if (error) throw error;
    
    console.log('✅ Booking conversation started');
    return true;
  } catch (error) {
    console.error('❌ Error starting booking conversation:', error);
    return false;
  }
};

/**
 * Handle appointment booking response
 * @param {Object} patient - Patient object with conversation state
 * @param {string} messageText - User's message
 * @param {Object} doctor - Doctor object
 * @returns {Promise<Object>} - { success: boolean, message: string }
 */
export const handleBookingResponse = async (patient, messageText, doctor) => {
  try {
    const state = patient.conversation_data?.step;
    
    console.log(`📋 Handling booking response - State: ${state}`);
    console.log(`   Message: "${messageText}"`);
    
    // Check for cancellation
    if (messageText.toLowerCase().trim() === 'cancel') {
      await resetConversationState(patient.id);
      return {
        success: true,
        message: "Booking cancelled. Type 'Hi' to see the menu again."
      };
    }
    
    if (state === 'awaiting_datetime') {
      // Parse date/time from message
      const appointmentTime = parseDateTime(messageText);
      
      if (!appointmentTime) {
        return {
          success: false,
          message: "I couldn't understand that date/time. Please try again.\n\n" +
                   "Examples:\n" +
                   "• Tomorrow 3pm\n" +
                   "• Next Monday 10am\n" +
                   "• Feb 15 at 2:30pm\n\n" +
                   "(Type 'cancel' to go back)"
        };
      }
      
      // Check clinic hours (9 AM to 6 PM)
      const hour = appointmentTime.getHours();
      if (hour < 9 || hour >= 18) {
        return {
          success: false,
          message: "⏰ Sorry, we're only open from 9 AM to 6 PM.\n\n" +
                   "Please choose a time within clinic hours.\n\n" +
                   "(Type 'cancel' to go back)"
        };
      }
      
      // Check if it's a weekend (optional - remove if you work weekends)
      const dayOfWeek = appointmentTime.getDay();
      if (dayOfWeek === 0) { // Sunday
        return {
          success: false,
          message: "📅 Sorry, we're closed on Sundays.\n\n" +
                   "Please choose a weekday.\n\n" +
                   "(Type 'cancel' to go back)"
        };
      }
      
      console.log(`✅ Valid appointment time: ${appointmentTime.toISOString()}`);
      
      // Create appointment
      const appointment = await createAppointment(
        patient.id,
        doctor.id,
        appointmentTime.toISOString(),
        'Booked via WhatsApp conversational booking'
      );
      
      if (!appointment) {
        console.error('❌ Failed to create appointment');
        return {
          success: false,
          message: "Sorry, couldn't book the appointment. Please try again or contact us directly.\n\n" +
                   `📞 ${doctor.phone_number || 'Call clinic'}`
        };
      }
      
      console.log(`✅ Appointment created: ${appointment.id}`);
      
      // Reset conversation state
      await resetConversationState(patient.id);
      
      // Format confirmation message
      const formattedTime = appointmentTime.toLocaleString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;
      
      return {
        success: true,
        message: `✅ *Appointment Confirmed!*\n\n` +
                 `📅 *Date & Time:*\n${formattedTime}\n\n` +
                 `📍 *Location:*\n${clinicName}\n${doctor.clinic_address || ''}\n\n` +
                 `💡 *What's Next:*\n` +
                 `• We'll send you a reminder 2 hours before\n` +
                 `• Please arrive 10 minutes early\n` +
                 `• Bring any previous medical reports\n\n` +
                 `See you soon! 😊\n\n` +
                 `Type 'Hi' to see the menu again.`
      };
    }
    
    // Unknown state
    console.warn(`⚠️  Unknown conversation state: ${state}`);
    await resetConversationState(patient.id);
    return { 
      success: false, 
      message: "Something went wrong. Type 'Hi' to start over." 
    };
    
  } catch (error) {
    console.error('❌ Error in handleBookingResponse:', error);
    await resetConversationState(patient.id);
    return {
      success: false,
      message: "Sorry, an error occurred. Type 'Hi' to try again."
    };
  }
};

/**
 * Reset conversation state to idle
 * @param {string} patientId - Patient's UUID
 */
const resetConversationState = async (patientId) => {
  try {
    const { error } = await supabase
      .from('patients')
      .update({
        conversation_state: 'idle',
        conversation_data: {}
      })
      .eq('id', patientId);
    
    if (error) throw error;
    console.log('✅ Conversation state reset to idle');
  } catch (error) {
    console.error('❌ Error resetting conversation state:', error);
  }
};

/**
 * Check if patient is in a conversation
 * @param {Object} patient - Patient object
 * @returns {boolean}
 */
export const isInConversation = (patient) => {
  return patient && patient.conversation_state && patient.conversation_state !== 'idle';
};

export default {
  parseDateTime,
  startBookingConversation,
  handleBookingResponse,
  isInConversation,
};
