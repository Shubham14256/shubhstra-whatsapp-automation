/**
 * Referral Service
 * Handles patient referral system and tracking
 */

import supabase from '../config/supabaseClient.js';

/**
 * Generate referral code for a patient
 * @param {string} patientId - Patient's UUID
 * @param {string} name - Patient's name
 * @param {string} phoneNumber - Patient's phone number
 * @returns {Promise<string|null>} Generated referral code
 */
export const generateReferralCode = async (patientId, name, phoneNumber) => {
  try {
    if (!patientId || !name || !phoneNumber) {
      console.warn('⚠️  Patient ID, name, and phone number are required');
      return null;
    }

    console.log(`🎫 Generating referral code for: ${name}`);

    // Use database function to generate unique code
    const { data, error } = await supabase
      .rpc('generate_referral_code', {
        patient_name: name,
        phone_number: phoneNumber,
      });

    if (error) {
      console.error('❌ Error generating referral code:', error);
      
      // Fallback: Generate code manually
      const namePart = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
      const phonePart = phoneNumber.slice(-4);
      const fallbackCode = `${namePart}${phonePart}`;
      
      console.log(`⚠️  Using fallback code: ${fallbackCode}`);
      
      // Update patient with fallback code
      const { data: updateData, error: updateError } = await supabase
        .from('patients')
        .update({ referral_code: fallbackCode })
        .eq('id', patientId)
        .select('referral_code')
        .single();

      if (updateError) {
        console.error('❌ Error updating with fallback code:', updateError);
        return null;
      }

      return updateData.referral_code;
    }

    // Update patient with generated code
    const { data: updateData, error: updateError } = await supabase
      .from('patients')
      .update({ referral_code: data })
      .eq('id', patientId)
      .select('referral_code')
      .single();

    if (updateError) {
      console.error('❌ Error updating referral code:', updateError);
      return null;
    }

    console.log(`✅ Referral code generated: ${updateData.referral_code}`);
    return updateData.referral_code;

  } catch (error) {
    console.error('❌ Exception in generateReferralCode:', error);
    return null;
  }
};

/**
 * Get patient's referral code (or generate if doesn't exist)
 * @param {string} patientId - Patient's UUID
 * @returns {Promise<string|null>} Referral code
 */
export const getOrCreateReferralCode = async (patientId) => {
  try {
    if (!patientId) {
      console.warn('⚠️  Patient ID is required');
      return null;
    }

    // Get patient details
    const { data: patient, error } = await supabase
      .from('patients')
      .select('id, name, phone_number, referral_code')
      .eq('id', patientId)
      .single();

    if (error) {
      console.error('❌ Error fetching patient:', error);
      return null;
    }

    // If code already exists, return it
    if (patient.referral_code) {
      console.log(`✅ Existing referral code: ${patient.referral_code}`);
      return patient.referral_code;
    }

    // Generate new code
    return await generateReferralCode(patient.id, patient.name, patient.phone_number);

  } catch (error) {
    console.error('❌ Exception in getOrCreateReferralCode:', error);
    return null;
  }
};

/**
 * Apply referral code when a new patient signs up
 * @param {string} newPatientId - New patient's UUID
 * @param {string} referralCode - Referral code provided
 * @returns {Promise<boolean>} Success status
 */
export const applyReferralCode = async (newPatientId, referralCode) => {
  try {
    if (!newPatientId || !referralCode) {
      console.warn('⚠️  Patient ID and referral code are required');
      return false;
    }

    console.log(`🎁 Applying referral code: ${referralCode}`);

    // Find the referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from('patients')
      .select('id, name')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      console.log(`❌ Invalid referral code: ${referralCode}`);
      return false;
    }

    // Update new patient with referrer
    const { error: updateError } = await supabase
      .from('patients')
      .update({ referred_by: referrer.id })
      .eq('id', newPatientId);

    if (updateError) {
      console.error('❌ Error applying referral code:', updateError);
      return false;
    }

    console.log(`✅ Referral applied! Referred by: ${referrer.name}`);
    return true;

  } catch (error) {
    console.error('❌ Exception in applyReferralCode:', error);
    return false;
  }
};

/**
 * Get referral statistics for a patient
 * @param {string} patientId - Patient's UUID
 * @returns {Promise<Object>} Referral statistics
 */
export const getReferralStats = async (patientId) => {
  try {
    if (!patientId) {
      console.warn('⚠️  Patient ID is required');
      return null;
    }

    // Get patient with referral count
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('referral_code, referral_count')
      .eq('id', patientId)
      .single();

    if (patientError) {
      console.error('❌ Error fetching patient:', patientError);
      return null;
    }

    // Get list of referred patients
    const { data: referredPatients, error: referredError } = await supabase
      .from('patients')
      .select('id, name, phone_number, created_at')
      .eq('referred_by', patientId)
      .order('created_at', { ascending: false });

    if (referredError) {
      console.error('❌ Error fetching referred patients:', referredError);
      return null;
    }

    return {
      referralCode: patient.referral_code,
      totalReferrals: patient.referral_count,
      referredPatients: referredPatients || [],
    };

  } catch (error) {
    console.error('❌ Exception in getReferralStats:', error);
    return null;
  }
};

/**
 * Get top referrers (leaderboard)
 * @param {string} doctorId - Doctor's UUID (optional, for filtering)
 * @param {number} limit - Number of top referrers to return
 * @returns {Promise<Array>} Array of top referrers
 */
export const getTopReferrers = async (doctorId = null, limit = 10) => {
  try {
    let query = supabase
      .from('patients')
      .select('id, name, phone_number, referral_code, referral_count')
      .gt('referral_count', 0)
      .order('referral_count', { ascending: false })
      .limit(limit);

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching top referrers:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('❌ Exception in getTopReferrers:', error);
    return [];
  }
};

export default {
  generateReferralCode,
  getOrCreateReferralCode,
  applyReferralCode,
  getReferralStats,
  getTopReferrers,
};
