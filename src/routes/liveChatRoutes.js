/**
 * Live Chat Routes
 * API endpoints for doctor-patient manual chat
 */

import express from 'express';
import supabase from '../config/supabaseClient.js';
import { sendTextMessage } from '../services/whatsappService.js';

const router = express.Router();

/**
 * GET /api/live-chat/messages/:patientId
 * Get message history for a patient
 */
router.get('/messages/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 50 } = req.query;
    
    console.log(`📨 Fetching messages for patient: ${patientId}`);
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({ success: true, messages: messages || [] });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/live-chat/send
 * Send message from doctor to patient (and auto-pause AI)
 */
router.post('/send', async (req, res) => {
  try {
    const { patientId, doctorId, messageBody } = req.body;
    
    if (!patientId || !doctorId || !messageBody) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: patientId, doctorId, messageBody' 
      });
    }
    
    console.log(`📤 Doctor sending manual message to patient: ${patientId}`);
    
    // Get patient and doctor info
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('phone_number, name')
      .eq('id', patientId)
      .single();
    
    if (patientError) throw patientError;
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();
    
    if (doctorError) throw doctorError;
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    
    // IMPORTANT: Pause AI bot when doctor sends manual message
    console.log('🚫 Auto-pausing AI bot (doctor is chatting manually)');
    const { error: pauseError } = await supabase
      .from('patients')
      .update({
        is_bot_paused: true,
        bot_paused_at: new Date().toISOString(),
        bot_paused_by: doctorId
      })
      .eq('id', patientId);
    
    if (pauseError) {
      console.error('⚠️  Failed to pause AI bot:', pauseError);
      // Continue anyway - message sending is more important
    } else {
      console.log('✅ AI bot paused successfully');
    }
    
    // Send WhatsApp message
    console.log(`📱 Sending WhatsApp message to: ${patient.phone_number}`);
    
    try {
      await sendTextMessage(patient.phone_number, messageBody, doctor);
    } catch (whatsappError) {
      // WhatsApp API error - return structured error to frontend
      console.error('❌ WhatsApp API error:', whatsappError.message);
      
      if (whatsappError.whatsappError) {
        // Structured error from WhatsApp service
        return res.status(400).json({
          success: false,
          error: whatsappError.whatsappError.userMessage,
          errorCode: whatsappError.whatsappError.code,
          canRetry: whatsappError.whatsappError.canRetry,
          details: whatsappError.whatsappError.message
        });
      }
      
      // Generic error
      return res.status(500).json({
        success: false,
        error: 'Failed to send WhatsApp message. Please try again.',
        canRetry: true
      });
    }
    
    // Save to database
    const { error: saveError } = await supabase
      .from('messages')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        phone_number: patient.phone_number,
        direction: 'outgoing',
        message_type: 'text',
        message_body: messageBody,
        created_at: new Date().toISOString()
      });
    
    if (saveError) {
      console.error('⚠️  Failed to save message to database:', saveError);
      // Message was sent, so still return success
    } else {
      console.log('✅ Message saved to database');
    }
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      botPaused: true
    });
    
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

/**
 * POST /api/live-chat/toggle-bot
 * Pause or resume AI bot for a patient
 */
router.post('/toggle-bot', async (req, res) => {
  try {
    const { patientId, doctorId, pause } = req.body;
    
    if (!patientId || !doctorId || typeof pause !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: patientId, doctorId, pause (boolean)' 
      });
    }
    
    console.log(`🔄 ${pause ? 'Pausing' : 'Resuming'} AI bot for patient: ${patientId}`);
    
    const updateData = {
      is_bot_paused: pause,
      bot_paused_at: pause ? new Date().toISOString() : null,
      bot_paused_by: pause ? doctorId : null
    };
    
    const { error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', patientId);
    
    if (error) throw error;
    
    console.log(`✅ AI bot ${pause ? 'paused' : 'resumed'} successfully`);
    
    res.json({ 
      success: true, 
      message: pause ? 'AI bot paused - You can now chat manually' : 'AI bot resumed',
      isPaused: pause
    });
    
  } catch (error) {
    console.error('❌ Error toggling bot:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle bot' });
  }
});

/**
 * GET /api/live-chat/patient-info/:patientId
 * Get patient information for chat header
 */
router.get('/patient-info/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data: patient, error } = await supabase
      .from('patients')
      .select('id, name, phone_number, is_bot_paused, bot_paused_at, last_seen_at')
      .eq('id', patientId)
      .single();
    
    if (error) throw error;
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    
    res.json({ success: true, patient });
    
  } catch (error) {
    console.error('❌ Error fetching patient info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patient info' });
  }
});

export default router;
