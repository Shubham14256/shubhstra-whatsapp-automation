/**
 * Missed Call Controller
 * Handles missed call triggers from Android App and sends recovery messages
 */

import { getDoctorByPhone } from '../services/doctorService.js';
import { sendListMessage, sendTemplateMessage } from '../services/whatsappService.js';

/**
 * Handle missed call notification from Android App
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Expected request body:
 * {
 *   doctor_phone_number: "919876543210",
 *   patient_phone_number: "919999999999"
 * }
 */
export const handleMissedCall = async (req, res) => {
  try {
    const { doctor_phone_number, patient_phone_number } = req.body;

    console.log('\n📞 Missed Call Notification Received');
    console.log('═══════════════════════════════════════');
    console.log('Doctor Phone:', doctor_phone_number);
    console.log('Patient Phone:', patient_phone_number);
    console.log('═══════════════════════════════════════\n');

    // Validate required fields
    if (!doctor_phone_number || !patient_phone_number) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        status: 'error',
        message: 'Both doctor_phone_number and patient_phone_number are required',
      });
    }

    // Find the doctor in database
    console.log(`🔍 Looking up doctor: ${doctor_phone_number}`);
    const doctor = await getDoctorByPhone(doctor_phone_number);

    if (!doctor) {
      console.error(`❌ Doctor not found: ${doctor_phone_number}`);
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found in system',
        doctor_phone_number: doctor_phone_number,
      });
    }

    console.log(`✅ Doctor found: Dr. ${doctor.name}`);
    console.log(`   Clinic: ${doctor.clinic_name || 'N/A'}`);

    // Construct the recovery message
    const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;
    const headerText = clinicName;
    const bodyText = 
      `Hello! 👋\n\n` +
      `We noticed a missed call from you at *${clinicName}*.\n\n` +
      `We are currently attending other patients. Would you like to book an appointment? 👇`;

    const sections = [
      {
        title: 'Quick Actions',
        rows: [
          {
            id: 'book_appt',
            title: '📅 Book Now',
            description: 'Schedule an appointment',
          },
          {
            id: 'emergency',
            title: '🚑 Urgent',
            description: 'Need immediate assistance',
          },
        ],
      },
    ];

    // Send recovery message to patient
    console.log(`📤 Sending recovery message to patient: ${patient_phone_number}`);
    
    try {
      // Try sending interactive list message first (works within 24-hour window)
      await sendListMessage(patient_phone_number, headerText, bodyText, sections);
      
      console.log('✅ Recovery message sent successfully (Interactive List)');
      console.log('═══════════════════════════════════════\n');

      // Send success response to Android App
      return res.status(200).json({
        status: 'success',
        message: 'Recovery message sent',
        message_type: 'interactive',
        data: {
          doctor_name: doctor.name,
          clinic_name: clinicName,
          patient_phone_number: patient_phone_number,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (sendError) {
      // Handle WhatsApp API errors
      console.error('❌ Failed to send interactive message:', sendError.message);
      
      // Check if it's a 24-hour window error
      if (sendError.response?.data?.error?.code === 131047) {
        console.warn('⚠️  24-Hour Window Closed. Attempting Template Message...');
        
        try {
          // Fallback to template message (works outside 24-hour window)
          // Template name: 'missed_call_recovery' (must be pre-approved in Meta Business Manager)
          // You can pass clinic name as a parameter if your template supports it
          
          const components = [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: clinicName, // {{1}} in template
                },
              ],
            },
          ];

          await sendTemplateMessage(
            patient_phone_number,
            'missed_call_recovery', // Template name (must exist in Meta)
            'en_US',
            components
          );

          console.log('✅ Recovery message sent successfully (Template Message)');
          console.log('═══════════════════════════════════════\n');

          return res.status(200).json({
            status: 'success',
            message: 'Recovery message sent via template',
            message_type: 'template',
            data: {
              doctor_name: doctor.name,
              clinic_name: clinicName,
              patient_phone_number: patient_phone_number,
              timestamp: new Date().toISOString(),
            },
          });

        } catch (templateError) {
          console.error('❌ Failed to send template message:', templateError.message);
          
          return res.status(500).json({
            status: 'error',
            message: 'Failed to send recovery message (both interactive and template failed)',
            error: templateError.message,
          });
        }
      }

      // Other errors (not 24-hour window)
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send recovery message',
        error: sendError.message,
      });
    }

  } catch (error) {
    console.error('❌ Error in handleMissedCall:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};
