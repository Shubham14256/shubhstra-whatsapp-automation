/**
 * Queue Service
 * Handles patient queue management and wait time calculations
 */

import supabase from '../config/supabaseClient.js';

/**
 * Get queue status for a patient
 * Calculates token number, people ahead, and estimated wait time
 * 
 * @param {string} patientId - Patient's UUID
 * @param {string} appointmentId - Appointment UUID (optional)
 * @returns {Promise<Object>} Queue status information
 */
export const getQueueStatus = async (patientId, appointmentId = null) => {
  try {
    console.log(`📊 Calculating queue status for patient: ${patientId}`);

    // Get patient's appointment
    let appointment;
    
    if (appointmentId) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();
      
      if (error) throw error;
      appointment = data;
    } else {
      // Get patient's next appointment
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .in('status', ['pending', 'confirmed'])
        .gte('appointment_time', new Date().toISOString())
        .order('appointment_time', { ascending: true })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return {
            hasAppointment: false,
            message: 'No upcoming appointment found.',
          };
        }
        throw error;
      }
      appointment = data;
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count appointments before this patient's appointment time
    const { count: peopleAhead, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', appointment.doctor_id)
      .in('status', ['confirmed', 'pending'])
      .gte('appointment_time', today.toISOString())
      .lt('appointment_time', appointment.appointment_time);

    if (countError) throw countError;

    // Get total appointments for today (for token number)
    const { count: totalToday, error: totalError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', appointment.doctor_id)
      .gte('appointment_time', today.toISOString())
      .lt('appointment_time', tomorrow.toISOString())
      .lte('appointment_time', appointment.appointment_time);

    if (totalError) throw totalError;

    // Get clinic config for average consultation time
    const { data: clinicConfig } = await supabase
      .from('clinic_config')
      .select('average_consultation_time')
      .eq('doctor_id', appointment.doctor_id)
      .single();

    const avgConsultationTime = clinicConfig?.average_consultation_time || 15;

    // Calculate estimated wait time
    const estimatedWaitMinutes = (peopleAhead || 0) * avgConsultationTime;

    const tokenNumber = totalToday || 1;

    console.log(`✅ Queue status calculated:`);
    console.log(`   Token: #${tokenNumber}`);
    console.log(`   People ahead: ${peopleAhead || 0}`);
    console.log(`   Estimated wait: ${estimatedWaitMinutes} mins`);

    return {
      hasAppointment: true,
      tokenNumber: tokenNumber,
      peopleAhead: peopleAhead || 0,
      estimatedWaitMinutes: estimatedWaitMinutes,
      appointmentTime: appointment.appointment_time,
      status: appointment.status,
    };

  } catch (error) {
    console.error('❌ Error in getQueueStatus:', error);
    return {
      hasAppointment: false,
      error: error.message,
    };
  }
};

/**
 * Get all appointments in queue for today
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Array>} Array of appointments in queue
 */
export const getTodayQueue = async (doctorId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          name,
          phone_number
        )
      `)
      .eq('doctor_id', doctorId)
      .in('status', ['confirmed', 'pending'])
      .gte('appointment_time', today.toISOString())
      .lt('appointment_time', tomorrow.toISOString())
      .order('appointment_time', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error in getTodayQueue:', error);
    return [];
  }
};

/**
 * Format queue status message
 * @param {Object} queueStatus - Queue status object
 * @param {string} language - Language code (en, mr)
 * @returns {string} Formatted message
 */
export const formatQueueMessage = (queueStatus, language = 'en') => {
  if (!queueStatus.hasAppointment) {
    return language === 'mr' 
      ? 'तुमची कोणतीही येणारी भेट नाही.'
      : 'You don\'t have any upcoming appointment.';
  }

  const { tokenNumber, peopleAhead, estimatedWaitMinutes } = queueStatus;

  if (language === 'mr') {
    return `🎫 *तुमचा टोकन क्रमांक: #${tokenNumber}*\n\n` +
           `👥 तुमच्या आधी: ${peopleAhead} लोक\n` +
           `⏱️ अंदाजे प्रतीक्षा: ${estimatedWaitMinutes} मिनिटे\n\n` +
           `कृपया वेळेवर येण्याचा प्रयत्न करा. धन्यवाद! 🙏`;
  }

  return `🎫 *Your Token Number: #${tokenNumber}*\n\n` +
         `👥 People ahead of you: ${peopleAhead}\n` +
         `⏱️ Approximate wait time: ${estimatedWaitMinutes} minutes\n\n` +
         `Please try to arrive on time. Thank you! 🙏`;
};
