/**
 * Webhook Controller
 * Handles WhatsApp Cloud API webhook verification and incoming messages
 */

import { getDoctorByPhone } from '../services/doctorService.js';
import { handleIncomingMessage, handleInteractiveResponse } from './messageHandler.js';
import { upsertPatient } from '../services/patientService.js';

/**
 * Verify WhatsApp webhook (GET request)
 * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge
 */
export const verifyWebhook = (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('📥 Webhook verification request received');
    console.log('Mode:', mode);
    console.log('Token:', token);

    // Check if mode and token are present
    if (!mode || !token) {
      console.error('❌ Missing required parameters');
      return res.status(400).send('Missing required parameters');
    }

    // Verify the mode and token
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      return res.status(200).send(challenge);
    }

    console.error('❌ Verification failed - Invalid token or mode');
    return res.status(403).send('Forbidden');
  } catch (error) {
    console.error('❌ Error in webhook verification:', error);
    return res.status(500).send('Internal Server Error');
  }
};

/**
 * Handle incoming WhatsApp messages (POST request)
 * Logs the incoming webhook data to console and identifies the doctor
 */
export const receiveMessage = async (req, res) => {
  try {
    const body = req.body;

    console.log('\n📨 Incoming webhook data:');
    console.log('═══════════════════════════════════════');
    console.log(JSON.stringify(body, null, 2));
    console.log('═══════════════════════════════════════\n');

    // Check if this is a WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      // Extract metadata and messages
      if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value) {
        const value = body.entry[0].changes[0].value;
        const metadata = value.metadata;
        const messages = value.messages;

        // Extract the display_phone_number (the doctor's WhatsApp Business number)
        const displayPhoneNumber = metadata?.display_phone_number;

        if (displayPhoneNumber) {
          console.log(`📞 Display Phone Number (Doctor's Number): ${displayPhoneNumber}`);

          try {
            // Check if this phone number belongs to a registered doctor
            const doctor = await getDoctorByPhone(displayPhoneNumber);

            if (!doctor) {
              console.log('❌ Unknown Doctor Number');
              console.log(`   Phone: ${displayPhoneNumber} is not registered in the system`);
              // Still return 200 to prevent Meta retries
              return res.status(200).send('UNKNOWN_DOCTOR');
            }

            console.log(`✅ Doctor Identified: Dr. ${doctor.name}`);
            console.log(`   Specialization: ${doctor.specialization || 'N/A'}`);
            console.log(`   Email: ${doctor.email || 'N/A'}`);

            // Extract patient information from contacts
            const contacts = value.contacts;
            let patientName = null;
            
            if (contacts && contacts.length > 0 && contacts[0].profile) {
              patientName = contacts[0].profile.name;
              console.log(`👤 Patient Name from WhatsApp: ${patientName}`);
            }

            // Process incoming messages
            if (messages && messages.length > 0) {
              for (const message of messages) {
                try {
                  console.log('\n📱 Message Details:');
                  console.log('  From (Patient):', message.from);
                  console.log('  Type:', message.type);
                  console.log('  Timestamp:', message.timestamp);
                  console.log('  Message ID:', message.id);

                  // Upsert patient in database
                  const patient = await upsertPatient(message.from, doctor.id, patientName);
                  
                  if (patient) {
                    console.log(`💾 Patient record updated (ID: ${patient.id})`);
                  } else {
                    console.warn('⚠️  Failed to update patient record');
                  }

                  // Handle text messages
                  if (message.type === 'text' && message.text?.body) {
                    const messageBody = message.text.body.trim();
                    console.log('  Text:', messageBody);

                    // Process the message and send appropriate response
                    await handleIncomingMessage(message.from, messageBody, doctor);
                    
                  } else if (message.type === 'image' && message.image) {
                    // Handle image messages (medical reports)
                    console.log('  Image ID:', message.image.id);
                    console.log('  MIME Type:', message.image.mime_type);
                    console.log('  Caption:', message.image.caption || 'No caption');

                    // Import image handler
                    const { handleImageMessage } = await import('./messageHandler.js');
                    await handleImageMessage(message.from, message.image, doctor);
                    
                  } else if (message.type === 'interactive') {
                    // Handle interactive message responses (button/list clicks)
                    console.log('  Interactive Response:', JSON.stringify(message.interactive, null, 2));
                    
                    const responseId = message.interactive?.list_reply?.id || message.interactive?.button_reply?.id;
                    const responseTitle = message.interactive?.list_reply?.title || message.interactive?.button_reply?.title;
                    
                    if (responseId) {
                      console.log('  User selected:', responseId, '-', responseTitle);
                      
                      // Handle interactive responses
                      await handleInteractiveResponse(message.from, message.interactive, doctor);
                    }
                    
                  } else {
                    console.log('  Unsupported message type:', message.type);
                    console.log('  Message data:', JSON.stringify(message, null, 2));
                  }
                } catch (messageError) {
                  console.error('❌ Error processing individual message:', messageError);
                  console.error('   Message ID:', message.id);
                  console.error('   From:', message.from);
                  // Continue processing other messages
                }
              }
            }
          } catch (dbError) {
            console.error('❌ Database error while fetching doctor:', dbError);
            console.error('   Display Phone:', displayPhoneNumber);
            // Return 200 to prevent Meta retries during database outages
            return res.status(200).send('DATABASE_ERROR_LOGGED');
          }
        } else {
          console.warn('⚠️  No display_phone_number found in metadata');
        }
      }

      // Acknowledge receipt of the webhook
      return res.status(200).send('EVENT_RECEIVED');
    }

    // If not a WhatsApp event, return 404
    console.warn('⚠️  Unknown webhook event type');
    return res.status(404).send('Not Found');
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
};
