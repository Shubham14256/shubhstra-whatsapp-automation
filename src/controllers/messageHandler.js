/**
 * Message Handler
 * Contains logic for processing different types of incoming messages
 */

import { sendListMessage, sendTextMessage, sendLocationMessage, sendButtonMessage } from '../services/whatsappService.js';
import { isClinicOpen, getSocialLinks } from '../services/doctorService.js';
import { getPatientByPhone } from '../services/patientService.js';
import { getQueueStatus, formatQueueMessage } from '../services/queueService.js';
import { getHealthAdvice, isGreetingOrMenu, isHealthQuery } from '../services/aiService.js';
import { getOrCreateReferralCode } from '../services/referralService.js';
import { searchMedicalAdvice, searchAdministrativeFAQ } from '../services/knowledgeBaseService.js';
import supabase from '../config/supabaseClient.js';

/**
 * Handle incoming text message and send appropriate response
 * @param {string} from - Patient's phone number
 * @param {string} messageBody - Message text from patient
 * @param {Object} doctor - Doctor object from database
 */
export const handleIncomingMessage = async (from, messageBody, doctor) => {
  try {
    const normalizedMessage = messageBody.toLowerCase().trim();

    console.log('\n🤖 Processing text message logic...');
    console.log('Patient:', from);
    console.log('Message:', messageBody);
    console.log('Doctor:', doctor.name);

    // Get patient details for language preference
    const patient = await getPatientByPhone(from);
    const language = patient?.preferred_language || 'en';

    console.log(`🌐 Patient language: ${language}`);

    // Check if message is from doctor (for admin commands)
    const isDoctorMessage = from === doctor.phone_number;

    if (isDoctorMessage) {
      console.log('👨‍⚕️ Message from doctor - checking for commands');
      
      // Handle /search command
      if (messageBody.startsWith('/search ')) {
        await handleDoctorSearch(from, messageBody, doctor);
        return;
      }

      // Handle /queue command
      if (messageBody.toLowerCase() === '/queue') {
        await handleDoctorQueue(from, doctor);
        return;
      }

      // Handle /report command
      if (messageBody.startsWith('/report ')) {
        await handleDoctorReport(from, messageBody, doctor);
        return;
      }

      // Handle /network command
      if (messageBody.toLowerCase() === '/network') {
        await handleDoctorNetwork(from, doctor);
        return;
      }
    }

    // Check if message is a greeting or menu request
    const greetings = ['hi', 'hello', 'hey', 'menu', 'start', 'help', 'नमस्कार', 'हॅलो'];
    const isGreeting = greetings.some(greeting => normalizedMessage.includes(greeting));

    if (isGreeting) {
      console.log('✅ Greeting detected - Checking clinic hours...');
      
      // Check clinic timing
      const clinicStatus = await isClinicOpen(doctor.id);
      
      if (!clinicStatus.isOpen) {
        // Clinic is closed - send timing info but still show menu
        const closedMessage = language === 'mr'
          ? `🔒 *क्लिनिक बंद आहे*\n\n` +
            `आम्ही ${clinicStatus.openingTime} वाजता उघडतो.\n\n` +
            `तरीही तुम्ही अपॉइंटमेंट बुक करू शकता! 👇`
          : `🔒 *Clinic is Currently Closed*\n\n` +
            `We open at ${clinicStatus.openingTime}.\n\n` +
            `However, you can still book an appointment! 👇`;

        await sendTextMessage(from, closedMessage, doctor);
      }

      await sendMainMenu(from, doctor, language);
      return;
    }

    // Check for queue status request
    const queueKeywords = ['queue', 'token', 'wait', 'waiting', 'रांग', 'टोकन', 'प्रतीक्षा'];
    const isQueueRequest = queueKeywords.some(keyword => normalizedMessage.includes(keyword));

    if (isQueueRequest && patient) {
      console.log('📊 Queue status requested');
      const queueStatus = await getQueueStatus(patient.id);
      const queueMessage = formatQueueMessage(queueStatus, language);
      await sendTextMessage(from, queueMessage, doctor);
      return;
    }

    // Check for social media request
    const socialKeywords = ['social', 'follow', 'instagram', 'youtube', 'website', 'facebook'];
    const isSocialRequest = socialKeywords.some(keyword => normalizedMessage.includes(keyword));

    if (isSocialRequest) {
      console.log('🔗 Social media links requested');
      await handleSocialMediaRequest(from, doctor, language);
      return;
    }

    // Check for referral request
    const referralKeywords = ['refer', 'referral', 'code', 'share', 'रेफर', 'कोड'];
    const isReferralRequest = referralKeywords.some(keyword => normalizedMessage.includes(keyword));

    if (isReferralRequest && patient) {
      console.log('🎁 Referral code requested');
      await handleReferralRequest(from, patient, language);
      return;
    }

    // Check if message is a rating (1-5)
    const rating = parseInt(messageBody.trim());
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      console.log(`⭐ Rating detected: ${rating}/5`);
      await handleRatingResponse(from, rating, doctor, language);
      return;
    }

    // Check if it's a health-related query - Use AI
    if (isHealthQuery(messageBody)) {
      console.log('🤖 Health query detected - Checking knowledge base first...');
      
      // STEP 1: Check doctor's knowledge base first (saves API costs!)
      const knowledgeBaseMatch = await searchMedicalAdvice(messageBody, doctor.id);
      
      if (knowledgeBaseMatch) {
        console.log(`✅ Found match in knowledge base: ${knowledgeBaseMatch.symptom_name}`);
        console.log(`💰 API call saved! Using doctor's personalized advice`);
        
        // Send doctor's pre-defined medical advice
        const response = `🩺 *${knowledgeBaseMatch.symptom_name}*\n\n${knowledgeBaseMatch.medical_advice}\n\n` +
                        `_This advice is personalized by Dr. ${doctor.name}_`;
        
        await sendTextMessage(from, response, doctor);
        console.log('✅ Knowledge base advice sent successfully');
        return;
      }
      
      // STEP 2: No match in knowledge base - Use Gemini AI
      console.log('ℹ️  No match in knowledge base - Consulting Gemini AI...');
      
      const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;
      const aiResponse = await getHealthAdvice(messageBody, clinicName);
      
      await sendTextMessage(from, aiResponse, doctor);
      console.log('✅ AI health advice sent successfully');
      return;
    }

    // Default: Unknown message - Check administrative FAQ first, then use AI
    console.log('🔍 Checking administrative FAQ...');
    
    const faqMatch = await searchAdministrativeFAQ(messageBody, doctor.id);
    
    if (faqMatch) {
      console.log(`✅ Found FAQ match: "${faqMatch.question}"`);
      console.log(`💰 API call saved! Using doctor's FAQ answer`);
      
      await sendTextMessage(from, faqMatch.answer, doctor);
      console.log('✅ FAQ answer sent successfully');
      return;
    }
    
    // No FAQ match - Use AI for general response
    console.log('🤖 No FAQ match - Consulting AI...');
    
    const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;
    const aiResponse = await getHealthAdvice(messageBody, clinicName);
    
    await sendTextMessage(from, aiResponse, doctor);
    console.log('✅ AI response sent successfully');

  } catch (error) {
    console.error('❌ Error in handleIncomingMessage:', error);
    await sendErrorMessage(from, doctor);
  }
};

/**
 * Handle interactive message responses (list/button selections)
 * @param {string} from - Patient's phone number
 * @param {Object} interactive - Interactive response object
 * @param {Object} doctor - Doctor object from database
 */
export const handleInteractiveResponse = async (from, interactive, doctor) => {
  try {
    // Get the selected option ID
    const responseId = interactive.list_reply?.id || interactive.button_reply?.id;
    const responseTitle = interactive.list_reply?.title || interactive.button_reply?.title;

    console.log('\n🎯 Processing interactive response...');
    console.log('Patient:', from);
    console.log('Selected ID:', responseId);
    console.log('Selected Title:', responseTitle);
    console.log('Doctor:', doctor.name);

    if (!responseId) {
      console.warn('⚠️  No response ID found in interactive message');
      return;
    }

    // Handle different menu options
    switch (responseId) {
      case 'book':
      case 'book_appt':
        console.log('📅 Book Appointment selected');
        await handleBookAppointment(from, doctor);
        break;

      case 'address':
      case 'clinic_address':
        console.log('📍 Clinic Address selected');
        await handleClinicAddress(from, doctor);
        break;

      case 'queue':
        console.log('📊 Queue Status selected');
        const patient = await getPatientByPhone(from);
        if (patient) {
          const queueStatus = await getQueueStatus(patient.id);
          const queueMessage = formatQueueMessage(queueStatus, patient.preferred_language || 'en');
          await sendTextMessage(from, queueMessage, doctor);
        } else {
          await sendTextMessage(from, 'Please book an appointment first to check queue status.', doctor);
        }
        break;

      case 'social':
        console.log('🔗 Social Media selected');
        const patientData = await getPatientByPhone(from);
        await handleSocialMediaRequest(from, doctor, patientData?.preferred_language || 'en');
        break;

      case 'referral':
        console.log('🎁 Referral Code selected');
        const patientForReferral = await getPatientByPhone(from);
        if (patientForReferral) {
          await handleReferralRequest(from, patientForReferral, patientForReferral.preferred_language || 'en', doctor);
        } else {
          await sendTextMessage(from, 'Please send "Hi" first to register.', doctor);
        }
        break;

      case 'review':
      case 'review_request':
        console.log('⭐ Review request selected');
        await handleReviewRequest(from, doctor);
        break;

      default:
        console.log(`ℹ️  Unknown option selected: ${responseId}`);
        await sendTextMessage(from, 'Sorry, I didn\'t understand that option. Type *Menu* to see available options.', doctor);
    }

  } catch (error) {
    console.error('❌ Error in handleInteractiveResponse:', error);
    await sendErrorMessage(from, doctor);
  }
};

/**
 * Send main menu to patient
 * @param {string} from - Patient's phone number
 * @param {Object} doctor - Doctor object from database
 * @param {string} language - Language code (en, mr)
 */
const sendMainMenu = async (from, doctor, language = 'en') => {
  const headerText = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;
  
  // Use welcome message from doctor object (from doctors table)
  const welcomeMessage = doctor.welcome_message || 
    (language === 'mr' ? 'नमस्कार! 👋\n\nआम्ही आपली कशी मदत करू शकतो?' : 'Welcome! 👋\n\nHow can we help you today?');
  
  const bodyText = welcomeMessage;
  
  const sections = [
    {
      title: language === 'mr' ? 'मुख्य मेनू' : 'Main Menu',
      rows: [
        {
          id: 'book',
          title: language === 'mr' ? '📅 अपॉइंटमेंट बुक करा' : '📅 Book Appointment',
          description: language === 'mr' ? 'डॉक्टरांची भेट घ्या' : 'Schedule a visit with the doctor',
        },
        {
          id: 'address',
          title: language === 'mr' ? '📍 क्लिनिक पत्ता' : '📍 Clinic Address',
          description: language === 'mr' ? 'क्लिनिकचे स्थान मिळवा' : 'Get clinic location and directions',
        },
        {
          id: 'queue',
          title: language === 'mr' ? '📊 रांग स्थिती' : '📊 Queue Status',
          description: language === 'mr' ? 'तुमची प्रतीक्षा स्थिती पहा' : 'Check your waiting status',
        },
        {
          id: 'social',
          title: language === 'mr' ? '🔗 सोशल मीडिया' : '🔗 Social Media',
          description: language === 'mr' ? 'आम्हाला फॉलो करा' : 'Follow us for health tips',
        },
        {
          id: 'referral',
          title: language === 'mr' ? '🎁 रेफरल कोड' : '🎁 Referral Code',
          description: language === 'mr' ? 'मित्रांना शेअर करा' : 'Share with friends & earn',
        },
        {
          id: 'review',
          title: language === 'mr' ? '⭐ रिव्ह्यू द्या' : '⭐ Rate Us',
          description: language === 'mr' ? 'तुमचा अनुभव शेअर करा' : 'Share your experience',
        },
      ],
    },
  ];

  await sendListMessage(from, headerText, bodyText, sections, doctor);
  
  // Send additional AI help message
  const aiHelpText = language === 'mr'
    ? `\n💡 *टीप:* तुम्ही मला थेट प्रश्न विचारू शकता!\n\n` +
      `उदाहरण:\n` +
      `• "मला डोकेदुखी आहे"\n` +
      `• "ताप कसा कमी करावा?"\n` +
      `• मेडिकल रिपोर्टचा फोटो पाठवा 📸\n\n` +
      `मी तुम्हाला मदत करण्यासाठी AI वापरतो! 🤖`
    : `\n💡 *Tip:* You can ask me health questions directly!\n\n` +
      `Examples:\n` +
      `• "I have a headache"\n` +
      `• "How to reduce fever?"\n` +
      `• Send medical report photo 📸\n\n` +
      `I use AI to help you! 🤖`;

  await sendTextMessage(from, aiHelpText, doctor);
  console.log('✅ Menu sent successfully');
};

/**
 * Handle book appointment request
 * @param {string} from - Patient's phone number
 * @param {Object} doctor - Doctor object from database
 */
const handleBookAppointment = async (from, doctor) => {
  try {
    console.log('📅 Fetching appointment booking link...');

    // Get clinic config with calendly link
    const { data: config, error } = await supabase
      .from('clinic_config')
      .select('calendly_link')
      .eq('doctor_id', doctor.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching config:', error);
    }

    const calendlyLink = config?.calendly_link;

    if (calendlyLink && calendlyLink.trim().length > 0) {
      // Send Calendly link
      const message = `📅 *Book Your Appointment*\n\n` +
        `Please select your preferred date and time here:\n\n` +
        `${calendlyLink}\n\n` +
        `We look forward to seeing you! 😊`;

      await sendTextMessage(from, message, doctor);
      console.log('✅ Calendly link sent successfully');
    } else {
      // Fallback: No link configured
      const clinicPhone = doctor.phone_number || 'the clinic';
      const message = `📅 *Book Your Appointment*\n\n` +
        `Please contact us directly to book your appointment:\n\n` +
        `📞 Phone: ${clinicPhone}\n\n` +
        `Our team will help you schedule a convenient time. 😊`;

      await sendTextMessage(from, message, doctor);
      console.log('✅ Fallback booking message sent (no Calendly link configured)');
    }
  } catch (error) {
    console.error('❌ Error in handleBookAppointment:', error);
    await sendErrorMessage(from, doctor);
  }
};

/**
 * Handle clinic address request
 * @param {string} from - Patient's phone number
 * @param {Object} doctor - Doctor object from database
 */
const handleClinicAddress = async (from, doctor) => {
  // Use clinic address from database or default coordinates (Pune, India)
  const latitude = 18.5204;  // Default: Pune coordinates
  const longitude = 73.8567;
  const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;
  const clinicAddress = doctor.clinic_address || 'Pune, Maharashtra, India';

  // Send location message
  await sendLocationMessage(from, latitude, longitude, clinicName, clinicAddress, doctor);
  
  // Send additional text with directions
  const message = `📍 *${clinicName}*\n\n` +
    `${clinicAddress}\n\n` +
    `Tap on the location above to get directions via Google Maps! 🗺️`;

  await sendTextMessage(from, message, doctor);
  console.log('✅ Location sent successfully');
};

/**
 * Handle review request
 * @param {string} from - Patient's phone number
 * @param {Object} doctor - Doctor object from database
 */
const handleReviewRequest = async (from, doctor) => {
  const message = `⭐ *How was your experience?*\n\n` +
    `Please rate your visit on a scale of 1-5:\n\n` +
    `5 - Excellent ⭐⭐⭐⭐⭐\n` +
    `4 - Good ⭐⭐⭐⭐\n` +
    `3 - Average ⭐⭐⭐\n` +
    `2 - Below Average ⭐⭐\n` +
    `1 - Poor ⭐\n\n` +
    `Just reply with a number (1-5)`;

  await sendTextMessage(from, message, doctor);
  console.log('✅ Review request sent successfully');
};

/**
 * Handle rating response from patient
 * @param {string} from - Patient's phone number
 * @param {number} rating - Rating value (1-5)
 * @param {Object} doctor - Doctor object from database
 * @param {string} language - Language code (en, mr)
 */
const handleRatingResponse = async (from, rating, doctor, language = 'en') => {
  if (rating === 5) {
    // Excellent rating - Request Google Review
    console.log('🌟 Excellent rating (5/5) - Fetching review link...');
    
    // Get clinic config with review link
    const { data: config, error } = await supabase
      .from('clinic_config')
      .select('review_link')
      .eq('doctor_id', doctor.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching config:', error);
    }

    const reviewLink = config?.review_link;

    if (reviewLink && reviewLink.trim().length > 0) {
      // Send review link
      const message = language === 'mr'
        ? `🌟 *खूप खूप धन्यवाद!*\n\n` +
          `आम्हाला खूप आनंद झाला! 😊\n\n` +
          `कृपया Google वर तुमचा अनुभव शेअर करा. यामुळे आम्हाला अधिक रुग्णांना मदत करता येईल.\n\n` +
          `येथे रिव्ह्यू द्या:\n${reviewLink}\n\n` +
          `तुमच्या सहकार्याबद्दल धन्यवाद! 🙏`
        : `🌟 *Thank you so much!*\n\n` +
          `We're thrilled you had a great experience! 😊\n\n` +
          `Would you mind sharing your experience on Google? It helps us serve more patients like you.\n\n` +
          `Leave a review here:\n${reviewLink}\n\n` +
          `Thank you for your support! 🙏`;

      await sendTextMessage(from, message, doctor);
      console.log('✅ Review link sent successfully');
    } else {
      // Fallback: No review link configured
      const message = language === 'mr'
        ? `🌟 *खूप खूप धन्यवाद!*\n\n` +
          `आम्हाला खूप आनंद झाला! 😊\n\n` +
          `तुमचा अनुभव शेअर करण्यासाठी कृपया आमच्याशी संपर्क साधा.\n\n` +
          `तुमच्या सहकार्याबद्दल धन्यवाद! 🙏`
        : `🌟 *Thank you so much!*\n\n` +
          `We're thrilled you had a great experience! 😊\n\n` +
          `Thank you for your wonderful feedback! 🙏`;

      await sendTextMessage(from, message, doctor);
      console.log('✅ Thank you message sent (no review link configured)');
    }

  } else if (rating >= 1 && rating <= 4) {
    // Low rating - Request feedback
    console.log(`⚠️  Low rating (${rating}/5) - Requesting feedback`);
    
    const message = language === 'mr'
      ? `😔 *आम्हाला वाईट वाटले*\n\n` +
        `आम्ही तुमचा अभिप्राय खूप महत्त्वाचा मानतो आणि सुधारणा करू इच्छितो.\n\n` +
        `कृपया आम्हाला सांगा काय चूक झाली? तुमचा अभिप्राय आम्हाला तुम्हाला चांगली सेवा देण्यास मदत करेल.\n\n` +
        `कृपया तुमचा अभिप्राय लिहा, आणि आम्ही तुमच्या समस्यांचे निराकरण करू. 🙏`
      : `😔 *We're sorry to hear that*\n\n` +
        `We truly value your feedback and want to improve.\n\n` +
        `Could you please tell us what went wrong? Your input helps us serve you better.\n\n` +
        `Please reply with your feedback, and we'll make sure to address your concerns. 🙏`;

    await sendTextMessage(from, message, doctor);
    console.log('✅ Feedback request sent');
  }
};

/**
 * Send error message to patient
 * @param {string} from - Patient's phone number
 * @param {Object} doctor - Doctor object (optional)
 */
const sendErrorMessage = async (from, doctor = null) => {
  try {
    await sendTextMessage(
      from,
      'Sorry, we encountered an error. Please try again later or contact us directly.',
      doctor
    );
  } catch (sendError) {
    console.error('❌ Failed to send error message to patient:', sendError);
  }
};


/**
 * Handle doctor search command
 * @param {string} from - Doctor's phone number
 * @param {string} messageBody - Message text with search query
 * @param {Object} doctor - Doctor object
 */
const handleDoctorSearch = async (from, messageBody, doctor) => {
  try {
    // Extract search query
    const searchQuery = messageBody.replace('/search ', '').trim();
    
    if (!searchQuery) {
      await sendTextMessage(from, '❌ Please provide a name to search.\n\nUsage: /search <name>', doctor);
      return;
    }

    console.log(`🔍 Doctor searching for: "${searchQuery}"`);

    // Search patients by name (case-insensitive)
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctor.id)
      .ilike('name', `%${searchQuery}%`)
      .order('last_seen_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!patients || patients.length === 0) {
      await sendTextMessage(from, `🔍 No patients found matching "${searchQuery}"`, doctor);
      return;
    }

    // Format search results
    let resultMessage = `🔍 *Found ${patients.length} Patient(s):*\n\n`;

    patients.forEach((patient, index) => {
      const lastSeen = new Date(patient.last_seen_at);
      const formattedDate = lastSeen.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const phoneDisplay = patient.phone_number.slice(0, 6) + '...';
      
      resultMessage += `${index + 1}. *${patient.name || 'Unknown'}*\n`;
      resultMessage += `   📱 ${phoneDisplay}\n`;
      resultMessage += `   📅 Last Visit: ${formattedDate}\n\n`;
    });

    await sendTextMessage(from, resultMessage, doctor);
    console.log(`✅ Search results sent (${patients.length} patients)`);

  } catch (error) {
    console.error('❌ Error in handleDoctorSearch:', error);
    await sendTextMessage(from, '❌ Error searching patients. Please try again.', doctor);
  }
};

/**
 * Handle doctor queue command
 * @param {string} from - Doctor's phone number
 * @param {Object} doctor - Doctor object
 */
const handleDoctorQueue = async (from, doctor) => {
  try {
    console.log('📊 Doctor requested queue status');

    const { getTodayQueue } = await import('../services/queueService.js');
    const queue = await getTodayQueue(doctor.id);

    if (queue.length === 0) {
      await sendTextMessage(from, '📋 *Today\'s Queue*\n\nNo appointments scheduled for today.', doctor);
      return;
    }

    let queueMessage = `📋 *Today's Queue (${queue.length} patients)*\n\n`;

    queue.forEach((appointment, index) => {
      const time = new Date(appointment.appointment_time);
      const formattedTime = time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const patientName = appointment.patients?.name || 'Unknown';
      const status = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

      queueMessage += `${index + 1}. *${patientName}*\n`;
      queueMessage += `   ⏰ ${formattedTime}\n`;
      queueMessage += `   📊 ${status}\n\n`;
    });

    await sendTextMessage(from, queueMessage, doctor);
    console.log(`✅ Queue status sent (${queue.length} appointments)`);

  } catch (error) {
    console.error('❌ Error in handleDoctorQueue:', error);
    await sendTextMessage(from, '❌ Error fetching queue. Please try again.', doctor);
  }
};

/**
 * Handle social media links request
 * @param {string} from - Patient's phone number
 * @param {Object} doctor - Doctor object
 * @param {string} language - Language code (en, mr)
 */
const handleSocialMediaRequest = async (from, doctor, language = 'en') => {
  try {
    console.log('🔗 Fetching social media links...');

    // Get social links from database
    const socialLinks = await getSocialLinks(doctor.id);

    if (!socialLinks || Object.keys(socialLinks).length === 0) {
      const message = language === 'mr'
        ? `माफ करा, सध्या सोशल मीडिया लिंक उपलब्ध नाहीत.`
        : `Sorry, social media links are not available at the moment.`;
      
      await sendTextMessage(from, message, doctor);
      return;
    }

    // Build message with available links
    const headerMessage = language === 'mr'
      ? `📱 *आमच्याशी जुळून रहा!*\n\nआम्हाला फॉलो करा:`
      : `📱 *Stay Connected with Us!*\n\nFollow us on:`;

    let linksMessage = headerMessage + '\n\n';

    if (socialLinks.instagram) {
      linksMessage += `📸 Instagram: ${socialLinks.instagram}\n\n`;
    }
    if (socialLinks.youtube) {
      linksMessage += `🎥 YouTube: ${socialLinks.youtube}\n\n`;
    }
    if (socialLinks.facebook) {
      linksMessage += `👍 Facebook: ${socialLinks.facebook}\n\n`;
    }
    if (socialLinks.website) {
      linksMessage += `🌐 Website: ${socialLinks.website}\n\n`;
    }
    if (socialLinks.twitter) {
      linksMessage += `🐦 Twitter: ${socialLinks.twitter}\n\n`;
    }

    const footerMessage = language === 'mr'
      ? `आम्हाला फॉलो करा आणि आरोग्य टिप्स मिळवा! 💚`
      : `Follow us for health tips and updates! 💚`;

    linksMessage += footerMessage;

    await sendTextMessage(from, linksMessage, doctor);
    console.log('✅ Social media links sent successfully');

  } catch (error) {
    console.error('❌ Error in handleSocialMediaRequest:', error);
    await sendErrorMessage(from, doctor);
  }
};

/**
 * Handle referral code request
 * @param {string} from - Patient's phone number
 * @param {Object} patient - Patient object
 * @param {string} language - Language code (en, mr)
 * @param {Object} doctor - Doctor object (optional)
 */
const handleReferralRequest = async (from, patient, language = 'en', doctor = null) => {
  try {
    console.log('🎁 Generating/fetching referral code...');

    // Get or create referral code
    const referralCode = await getOrCreateReferralCode(patient.id);

    if (!referralCode) {
      const message = language === 'mr'
        ? `माफ करा, रेफरल कोड तयार करता आला नाही. कृपया पुन्हा प्रयत्न करा.`
        : `Sorry, couldn't generate referral code. Please try again.`;
      
      await sendTextMessage(from, message, doctor);
      return;
    }

    // Build referral message
    const message = language === 'mr'
      ? `🎁 *तुमचा रेफरल कोड*\n\n` +
        `कोड: *${referralCode}*\n\n` +
        `हा कोड तुमच्या मित्रांना शेअर करा!\n\n` +
        `जेव्हा ते या कोडचा वापर करून नोंदणी करतील, तेव्हा तुम्हाला आणि त्यांना विशेष फायदे मिळतील! 🎉\n\n` +
        `तुम्ही ${patient.referral_count || 0} मित्रांना रेफर केले आहे. धन्यवाद! 🙏`
      : `🎁 *Your Referral Code*\n\n` +
        `Code: *${referralCode}*\n\n` +
        `Share this code with your friends and family!\n\n` +
        `When they register using your code, both of you will get special benefits! 🎉\n\n` +
        `You've referred ${patient.referral_count || 0} friends so far. Thank you! 🙏`;

    await sendTextMessage(from, message, doctor);
    console.log(`✅ Referral code sent: ${referralCode}`);

  } catch (error) {
    console.error('❌ Error in handleReferralRequest:', error);
    await sendErrorMessage(from, doctor);
  }
};


/**
 * Handle image message (medical report analysis)
 * @param {string} from - Patient's phone number
 * @param {Object} imageData - Image data from WhatsApp
 * @param {Object} doctor - Doctor object
 */
export const handleImageMessage = async (from, imageData, doctor) => {
  try {
    console.log('\n📸 Processing image message...');
    console.log('Patient:', from);
    console.log('Image ID:', imageData.id);
    console.log('MIME Type:', imageData.mime_type);

    // Send acknowledgment message
    await sendTextMessage(from, '📸 Analyzing your medical report... Please wait a moment.', doctor);

    // Get image URL from WhatsApp
    const imageUrl = await getWhatsAppMediaUrl(imageData.id);

    if (!imageUrl) {
      await sendTextMessage(from, '❌ Sorry, I couldn\'t download the image. Please try again.', doctor);
      return;
    }

    console.log('✅ Image URL retrieved');

    // Import AI service
    const { analyzeMedicalReport } = await import('../services/aiService.js');

    // Analyze the medical report
    const analysis = await analyzeMedicalReport(imageUrl, imageData.mime_type);

    // Send analysis to patient
    const responseMessage = `📋 *Medical Report Analysis*\n\n${analysis}\n\n` +
      `Need clarification? Type 'Hi' to book an appointment with ${doctor.name}.`;

    await sendTextMessage(from, responseMessage, doctor);
    console.log('✅ Medical report analysis sent successfully');

  } catch (error) {
    console.error('❌ Error in handleImageMessage:', error);
    await sendTextMessage(
      from,
      '❌ Sorry, I encountered an error analyzing the image. Please try again or type \'Hi\' to see the menu.',
      doctor
    );
  }
};

/**
 * Get WhatsApp media URL from media ID
 * @param {string} mediaId - WhatsApp media ID
 * @returns {Promise<string|null>} - Media URL
 */
const getWhatsAppMediaUrl = async (mediaId) => {
  try {
    if (!process.env.WHATSAPP_TOKEN) {
      console.error('❌ WHATSAPP_TOKEN not found');
      return null;
    }

    console.log(`🔍 Fetching media URL for ID: ${mediaId}`);

    // Import axios
    const axios = (await import('axios')).default;

    // Get media URL from WhatsApp API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        timeout: 10000,
      }
    );

    const mediaUrl = response.data.url;
    console.log(`✅ Media URL retrieved: ${mediaUrl.substring(0, 50)}...`);

    return mediaUrl;

  } catch (error) {
    console.error('❌ Error fetching media URL:', error.response?.data || error.message);
    return null;
  }
};


/**
 * Handle doctor report command
 * @param {string} from - Doctor's phone number
 * @param {string} messageBody - Message text with patient name
 * @param {Object} doctor - Doctor object
 */
const handleDoctorReport = async (from, messageBody, doctor) => {
  try {
    // Extract patient name
    const patientName = messageBody.replace('/report ', '').trim();
    
    if (!patientName) {
      await sendTextMessage(from, '❌ Please provide a patient name.\n\nUsage: /report <patient name>', doctor);
      return;
    }

    console.log(`📄 Doctor requested report for: "${patientName}"`);

    // Search for patient
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', doctor.id)
      .ilike('name', `%${patientName}%`)
      .limit(5);

    if (error) throw error;

    if (!patients || patients.length === 0) {
      await sendTextMessage(from, `❌ No patient found matching "${patientName}"`, doctor);
      return;
    }

    if (patients.length > 1) {
      // Multiple patients found
      let message = `🔍 Found ${patients.length} patients:\n\n`;
      patients.forEach((p, index) => {
        message += `${index + 1}. ${p.name} (${p.phone_number.slice(0, 6)}...)\n`;
      });
      message += `\nPlease be more specific with the name.`;
      await sendTextMessage(from, message, doctor);
      return;
    }

    // Single patient found - generate report
    const patient = patients[0];
    console.log(`✅ Patient found: ${patient.name} (${patient.id})`);

    await sendTextMessage(from, `📄 Generating report for ${patient.name}... Please wait.`, doctor);

    // Import PDF service
    const { generatePatientReport, deletePDF } = await import('../services/pdfService.js');
    const { sendDocument } = await import('../services/whatsappService.js');

    // Generate PDF
    const pdfPath = await generatePatientReport(patient.id);

    if (!pdfPath) {
      await sendTextMessage(from, '❌ Error generating report. Please try again.', doctor);
      return;
    }

    // Send PDF to doctor
    const filename = `${patient.name.replace(/\s+/g, '_')}_Report.pdf`;
    await sendDocument(from, pdfPath, filename, `Medical report for ${patient.name}`, doctor);

    console.log('✅ Report sent successfully');

    // Delete PDF file
    deletePDF(pdfPath);

  } catch (error) {
    console.error('❌ Error in handleDoctorReport:', error);
    await sendTextMessage(from, '❌ Error generating report. Please try again.', doctor);
  }
};

/**
 * Handle doctor network command
 * @param {string} from - Doctor's phone number
 * @param {Object} doctor - Doctor object
 */
const handleDoctorNetwork = async (from, doctor) => {
  try {
    console.log('🌐 Doctor requested referral network');

    // Import doctor service
    const { getExternalDoctorNetwork } = await import('../services/doctorService.js');

    const network = await getExternalDoctorNetwork();

    if (network.length === 0) {
      await sendTextMessage(from, '📋 *Referral Network*\n\nNo external doctors in your network yet.', doctor);
      return;
    }

    // Build network message
    let message = `🌐 *Referral Network*\n\n`;
    message += `Total External Doctors: ${network.length}\n\n`;

    let totalCommission = 0;

    network.forEach((doc, index) => {
      message += `${index + 1}. *${doc.name}*\n`;
      message += `   Specialization: ${doc.specialization || 'N/A'}\n`;
      message += `   Referrals: ${doc.total_referrals}\n`;
      message += `   Commission: ${doc.commission_percentage}%\n`;
      message += `   Due: ₹${doc.total_commission_due || 0}\n\n`;

      totalCommission += parseFloat(doc.total_commission_due || 0);
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *Total Commission Due: ₹${totalCommission.toFixed(2)}*`;

    await sendTextMessage(from, message, doctor);
    console.log(`✅ Network info sent (${network.length} doctors)`);

  } catch (error) {
    console.error('❌ Error in handleDoctorNetwork:', error);
    await sendTextMessage(from, '❌ Error fetching network. Please try again.', doctor);
  }
};
