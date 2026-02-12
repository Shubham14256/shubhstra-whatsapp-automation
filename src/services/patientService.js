/**
 * Patient Service
 * Handles all database operations related to patients and appointments
 */

import supabase from '../config/supabaseClient.js';

/**
 * Upsert patient (insert or update)
 * Creates new patient if doesn't exist, updates last_seen_at if exists
 * 
 * @param {string} phoneNumber - Patient's phone number
 * @param {string} doctorId - Doctor's UUID
 * @param {string} name - Patient's name (optional)
 * @returns {Promise<Object|null>} Patient object if successful, null otherwise
 */
export const upsertPatient = async (phoneNumber, doctorId, name = null) => {
  try {
    if (!phoneNumber || !doctorId) {
      console.warn('⚠️  Phone number and doctor ID are required');
      return null;
    }

    // Clean phone number
    const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    console.log(`💾 Upserting patient: ${cleanedPhone}`);

    // Check if patient exists
    const { data: existingPatient, error: checkError } = await supabase
      .from('patients')
      .select('*')
      .eq('phone_number', cleanedPhone)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('❌ Error checking patient:', checkError);
      return null;
    }

    if (existingPatient) {
      // Patient exists - update last_seen_at and name if provided
      console.log(`✅ Patient exists (ID: ${existingPatient.id}) - Updating last_seen_at`);

      const updateData = {
        last_seen_at: new Date().toISOString(),
      };

      // Update name if provided and different
      if (name && name !== existingPatient.name) {
        updateData.name = name;
        console.log(`   Updating name: ${name}`);
      }

      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', existingPatient.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating patient:', updateError);
        return existingPatient; // Return existing data even if update fails
      }

      console.log('✅ Patient updated successfully');
      return updatedPatient;

    } else {
      // Patient doesn't exist - create new
      console.log('📝 Creating new patient...');

      const { data: newPatient, error: insertError } = await supabase
        .from('patients')
        .insert({
          phone_number: cleanedPhone,
          name: name,
          doctor_id: doctorId,
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating patient:', insertError);
        return null;
      }

      console.log(`✅ New patient created (ID: ${newPatient.id})`);
      return newPatient;
    }

  } catch (error) {
    console.error('❌ Exception in upsertPatient:', error);
    return null;
  }
};

/**
 * Get patient by phone number
 * @param {string} phoneNumber - Patient's phone number
 * @returns {Promise<Object|null>} Patient object if found, null otherwise
 */
export const getPatientByPhone = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn('⚠️  Phone number is required');
      return null;
    }

    const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone_number', cleanedPhone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`ℹ️  No patient found with phone: ${cleanedPhone}`);
        return null;
      }
      console.error('❌ Error querying patient:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Exception in getPatientByPhone:', error);
    return null;
  }
};

/**
 * Create appointment
 * @param {string} patientId - Patient's UUID
 * @param {string} doctorId - Doctor's UUID
 * @param {Date|string} appointmentTime - Appointment date/time
 * @param {string} notes - Optional notes
 * @returns {Promise<Object|null>} Appointment object if successful, null otherwise
 */
export const createAppointment = async (patientId, doctorId, appointmentTime, notes = null) => {
  try {
    if (!patientId || !doctorId || !appointmentTime) {
      console.warn('⚠️  Patient ID, Doctor ID, and appointment time are required');
      return null;
    }

    console.log(`📅 Creating appointment for patient: ${patientId}`);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_time: appointmentTime,
        status: 'pending',
        notes: notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating appointment:', error);
      return null;
    }

    console.log(`✅ Appointment created (ID: ${data.id})`);
    return data;

  } catch (error) {
    console.error('❌ Exception in createAppointment:', error);
    return null;
  }
};

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment UUID
 * @param {string} status - New status (pending, confirmed, completed, cancelled, no_show)
 * @returns {Promise<Object|null>} Updated appointment object if successful, null otherwise
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    
    if (!validStatuses.includes(status)) {
      console.warn(`⚠️  Invalid status: ${status}`);
      return null;
    }

    console.log(`📝 Updating appointment ${appointmentId} status to: ${status}`);

    const { data, error } = await supabase
      .from('appointments')
      .update({ status: status })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating appointment:', error);
      return null;
    }

    console.log('✅ Appointment status updated');
    return data;

  } catch (error) {
    console.error('❌ Exception in updateAppointmentStatus:', error);
    return null;
  }
};

/**
 * Get patient's appointments
 * @param {string} patientId - Patient's UUID
 * @returns {Promise<Array>} Array of appointment objects
 */
export const getPatientAppointments = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_time', { ascending: false });

    if (error) {
      console.error('❌ Error fetching appointments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Exception in getPatientAppointments:', error);
    return [];
  }
};
