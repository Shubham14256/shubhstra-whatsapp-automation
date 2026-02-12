/**
 * Doctor Service
 * Handles all database operations related to doctors
 */

import supabase from '../config/supabaseClient.js';

/**
 * Get doctor by phone number
 * @param {string} phoneNumber - The phone number to search for (display_phone_number from webhook)
 * @returns {Promise<Object|null>} Doctor object if found, null otherwise
 */
export const getDoctorByPhone = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn('⚠️  Phone number is required');
      return null;
    }

    // Clean phone number (remove spaces, dashes, plus signs, etc.)
    const cleanedPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

    console.log(`🔍 Searching for doctor with phone: ${cleanedPhone}`);

    // Query the doctors table
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('phone_number', cleanedPhone)
      .eq('is_active', true) // Only get active doctors
      .single(); // Expect only one result

    if (error) {
      // If error is "PGRST116" it means no rows found
      if (error.code === 'PGRST116') {
        console.log(`ℹ️  No doctor found with phone: ${cleanedPhone}`);
        return null;
      }
      
      // Log other errors
      console.error('❌ Error querying doctor:', error);
      return null;
    }

    if (data) {
      console.log(`✅ Doctor found: ${data.name} (ID: ${data.id})`);
      return data;
    }

    return null;
  } catch (error) {
    console.error('❌ Exception in getDoctorByPhone:', error);
    return null;
  }
};

/**
 * Get all active doctors
 * @returns {Promise<Array>} Array of doctor objects
 */
export const getAllDoctors = async () => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching doctors:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Exception in getAllDoctors:', error);
    return [];
  }
};

/**
 * Check if clinic is currently open
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Object>} Clinic status and timing information
 */
export const isClinicOpen = async (doctorId) => {
  try {
    console.log(`🕐 Checking clinic hours for doctor: ${doctorId}`);

    // Get clinic config
    const { data: config, error } = await supabase
      .from('clinic_config')
      .select('*')
      .eq('doctor_id', doctorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️  No clinic config found, assuming open');
        return {
          isOpen: true,
          message: 'Clinic hours not configured',
        };
      }
      throw error;
    }

    // Get current time in HH:MM:SS format
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

    // Check if today is a holiday
    const today = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const holidays = config.holidays || [];
    const isHoliday = holidays.includes(today);

    if (isHoliday) {
      console.log('🏖️  Clinic is closed (Holiday)');
      return {
        isOpen: false,
        reason: 'holiday',
        message: 'Clinic is closed today (Holiday)',
        openingTime: config.opening_time,
        closingTime: config.closing_time,
      };
    }

    // Check if current time is within opening hours
    const isOpen = currentTime >= config.opening_time && currentTime <= config.closing_time;

    if (isOpen) {
      console.log(`✅ Clinic is open (${config.opening_time} - ${config.closing_time})`);
      return {
        isOpen: true,
        openingTime: config.opening_time,
        closingTime: config.closing_time,
      };
    } else {
      console.log(`🔒 Clinic is closed (Opens at ${config.opening_time})`);
      return {
        isOpen: false,
        reason: 'outside_hours',
        message: `Clinic is closed. Opens at ${formatTime(config.opening_time)}`,
        openingTime: config.opening_time,
        closingTime: config.closing_time,
      };
    }

  } catch (error) {
    console.error('❌ Error in isClinicOpen:', error);
    // Default to open if error
    return {
      isOpen: true,
      error: error.message,
    };
  }
};

/**
 * Format time from HH:MM:SS to readable format
 * @param {string} time - Time in HH:MM:SS format
 * @returns {string} Formatted time (e.g., "9:00 AM")
 */
const formatTime = (time) => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Mark appointment payment as pending
 * @param {string} appointmentId - Appointment UUID
 * @param {number} amount - Balance amount
 * @returns {Promise<Object>} Updated appointment object
 */
export const markPaymentPending = async (appointmentId, amount) => {
  try {
    if (!appointmentId || amount === undefined) {
      console.warn('⚠️  Appointment ID and amount are required');
      return null;
    }

    console.log(`💰 Marking payment as pending for appointment: ${appointmentId}`);
    console.log(`   Amount: ₹${amount}`);

    const { data, error } = await supabase
      .from('appointments')
      .update({
        payment_status: 'pending',
        balance_amount: amount,
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating payment status:', error);
      return null;
    }

    console.log('✅ Payment status updated successfully');
    return data;

  } catch (error) {
    console.error('❌ Exception in markPaymentPending:', error);
    return null;
  }
};

/**
 * Mark appointment payment as paid
 * @param {string} appointmentId - Appointment UUID
 * @returns {Promise<Object>} Updated appointment object
 */
export const markPaymentPaid = async (appointmentId) => {
  try {
    if (!appointmentId) {
      console.warn('⚠️  Appointment ID is required');
      return null;
    }

    console.log(`✅ Marking payment as paid for appointment: ${appointmentId}`);

    const { data, error } = await supabase
      .from('appointments')
      .update({
        payment_status: 'paid',
        balance_amount: 0,
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating payment status:', error);
      return null;
    }

    console.log('✅ Payment marked as paid successfully');
    return data;

  } catch (error) {
    console.error('❌ Exception in markPaymentPaid:', error);
    return null;
  }
};

/**
 * Update doctor's social media links
 * @param {string} doctorId - Doctor's UUID
 * @param {Object} links - Social media links object {instagram, youtube, website, facebook, twitter}
 * @returns {Promise<Object>} Updated doctor object
 */
export const updateSocialLinks = async (doctorId, links) => {
  try {
    if (!doctorId) {
      console.warn('⚠️  Doctor ID is required');
      return null;
    }

    console.log(`🔗 Updating social links for doctor: ${doctorId}`);

    // Validate URLs (basic validation)
    const validatedLinks = {};
    for (const [platform, url] of Object.entries(links)) {
      if (url && typeof url === 'string' && url.trim().length > 0) {
        validatedLinks[platform] = url.trim();
      }
    }

    const { data, error } = await supabase
      .from('doctors')
      .update({
        social_links: validatedLinks,
      })
      .eq('id', doctorId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating social links:', error);
      return null;
    }

    console.log('✅ Social links updated successfully');
    return data;

  } catch (error) {
    console.error('❌ Exception in updateSocialLinks:', error);
    return null;
  }
};

/**
 * Get doctor's social media links
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Object>} Social media links object
 */
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


/**
 * Add external doctor to referral network
 * @param {string} name - Doctor's name
 * @param {string} phoneNumber - Doctor's phone number
 * @param {number} commissionPercentage - Commission percentage (default 10%)
 * @returns {Promise<Object>} Created external doctor object
 */
export const addExternalDoctor = async (name, phoneNumber, commissionPercentage = 10.0) => {
  try {
    if (!name || !phoneNumber) {
      console.warn('⚠️  Name and phone number are required');
      return null;
    }

    console.log(`👨‍⚕️ Adding external doctor: ${name}`);

    const { data, error } = await supabase
      .from('external_doctors')
      .insert({
        name,
        phone_number: phoneNumber,
        commission_percentage: commissionPercentage,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log(`ℹ️  External doctor already exists: ${phoneNumber}`);
        // Return existing doctor
        const { data: existing } = await supabase
          .from('external_doctors')
          .select('*')
          .eq('phone_number', phoneNumber)
          .single();
        return existing;
      }
      console.error('❌ Error adding external doctor:', error);
      return null;
    }

    console.log(`✅ External doctor added: ${data.name} (Commission: ${data.commission_percentage}%)`);
    return data;

  } catch (error) {
    console.error('❌ Exception in addExternalDoctor:', error);
    return null;
  }
};

/**
 * Link patient to external doctor (referral)
 * @param {string} patientPhone - Patient's phone number
 * @param {string} externalDoctorName - External doctor's name
 * @returns {Promise<boolean>} Success status
 */
export const linkPatientToDoctor = async (patientPhone, externalDoctorName) => {
  try {
    if (!patientPhone || !externalDoctorName) {
      console.warn('⚠️  Patient phone and doctor name are required');
      return false;
    }

    console.log(`🔗 Linking patient ${patientPhone} to doctor ${externalDoctorName}`);

    // Find external doctor by name
    const { data: externalDoctor, error: doctorError } = await supabase
      .from('external_doctors')
      .select('*')
      .ilike('name', `%${externalDoctorName}%`)
      .eq('is_active', true)
      .single();

    if (doctorError || !externalDoctor) {
      console.log(`❌ External doctor not found: ${externalDoctorName}`);
      return false;
    }

    // Find patient by phone
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('phone_number', patientPhone)
      .single();

    if (patientError || !patient) {
      console.log(`❌ Patient not found: ${patientPhone}`);
      return false;
    }

    // Link patient to external doctor
    const { error: updateError } = await supabase
      .from('patients')
      .update({ referred_by_doctor_id: externalDoctor.id })
      .eq('id', patient.id);

    if (updateError) {
      console.error('❌ Error linking patient to doctor:', updateError);
      return false;
    }

    console.log(`✅ Patient linked successfully!`);
    console.log(`   Patient: ${patient.name}`);
    console.log(`   Referred by: ${externalDoctor.name}`);
    console.log(`   Commission: ${externalDoctor.commission_percentage}%`);

    return true;

  } catch (error) {
    console.error('❌ Exception in linkPatientToDoctor:', error);
    return false;
  }
};

/**
 * Get external doctor network and commission stats
 * @param {string} doctorId - Doctor's UUID (optional, for filtering)
 * @returns {Promise<Array>} Array of external doctors with stats
 */
export const getExternalDoctorNetwork = async (doctorId = null) => {
  try {
    console.log('📊 Fetching external doctor network...');

    const { data, error } = await supabase
      .from('external_doctor_analytics')
      .select('*')
      .order('total_referrals', { ascending: false });

    if (error) {
      console.error('❌ Error fetching external doctor network:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('❌ Exception in getExternalDoctorNetwork:', error);
    return [];
  }
};
