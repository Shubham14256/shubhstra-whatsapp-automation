/**
 * Cron Service
 * Handles automated background jobs for reminders and follow-ups
 */

import cron from 'node-cron';
import supabase from '../config/supabaseClient.js';
import { sendTemplateMessage } from './whatsappService.js';

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  console.log('🤖 Initializing Cron Jobs...');

  // Job 1: Appointment Reminders (Every 30 minutes)
  appointmentReminderJob();

  // Job 2: Payment Recovery (Daily at 8 PM)
  paymentRecoveryJob();

  // Job 3: Patient Recall (Daily at 11 AM)
  patientRecallJob();

  // Job 4: Weekly Health Tips (Every Monday at 9 AM)
  weeklyHealthTipsJob();

  console.log('✅ Cron Jobs initialized successfully');
};

/**
 * Job 1: Send appointment reminders
 * Runs every 30 minutes
 * Sends reminders for appointments in the next 2 hours
 */
const appointmentReminderJob = () => {
  // Run every 30 minutes: */30 * * * *
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('\n⏰ Running Appointment Reminder Job...');
      console.log('Time:', new Date().toLocaleString());

      // Calculate time range (next 2 hours)
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Query appointments needing reminders
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          patients (
            id,
            name,
            phone_number,
            preferred_language
          ),
          doctors (
            id,
            name,
            clinic_name
          )
        `)
        .eq('status', 'confirmed')
        .eq('reminder_sent', false)
        .gte('appointment_time', now.toISOString())
        .lte('appointment_time', twoHoursLater.toISOString());

      if (error) {
        console.error('❌ Error fetching appointments:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        console.log('ℹ️  No appointments need reminders at this time');
        return;
      }

      console.log(`📋 Found ${appointments.length} appointment(s) needing reminders`);

      // Send reminders
      let successCount = 0;
      let failCount = 0;

      for (const appointment of appointments) {
        try {
          const patient = appointment.patients;
          const doctor = appointment.doctors;

          if (!patient || !doctor) {
            console.warn(`⚠️  Missing patient or doctor data for appointment ${appointment.id}`);
            continue;
          }

          const appointmentTime = new Date(appointment.appointment_time);
          const formattedTime = appointmentTime.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });

          const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;

          console.log(`📤 Sending reminder to ${patient.name} (${patient.phone_number})`);

          // Prepare template components
          const components = [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: patient.name || 'Patient',
                },
                {
                  type: 'text',
                  text: formattedTime,
                },
                {
                  type: 'text',
                  text: clinicName,
                },
              ],
            },
          ];

          // Send template message
          await sendTemplateMessage(
            patient.phone_number,
            'appointment_reminder', // Template name (must be created in Meta)
            patient.preferred_language || 'en',
            components
          );

          // Mark reminder as sent
          const { error: updateError } = await supabase
            .from('appointments')
            .update({ reminder_sent: true })
            .eq('id', appointment.id);

          if (updateError) {
            console.error(`❌ Error updating reminder status:`, updateError);
          } else {
            console.log(`✅ Reminder sent to ${patient.name}`);
            successCount++;
          }

        } catch (sendError) {
          console.error(`❌ Error sending reminder:`, sendError.message);
          failCount++;
        }
      }

      console.log(`\n📊 Reminder Job Summary:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
      console.log(`   📋 Total: ${appointments.length}\n`);

    } catch (error) {
      console.error('❌ Error in appointment reminder job:', error);
    }
  });

  console.log('✅ Appointment Reminder Job scheduled (every 30 minutes)');
};

/**
 * Job 2: Send payment recovery reminders
 * Runs daily at 8 PM
 * Sends reminders for pending payments from yesterday's appointments
 */
const paymentRecoveryJob = () => {
  // Run daily at 8 PM: 0 20 * * *
  cron.schedule('0 20 * * *', async () => {
    try {
      console.log('\n💰 Running Payment Recovery Job...');
      console.log('Time:', new Date().toLocaleString());

      // Calculate yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      // Query appointments with pending payments
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          balance_amount,
          patients (
            id,
            name,
            phone_number,
            preferred_language
          ),
          doctors (
            id,
            name,
            clinic_name
          )
        `)
        .eq('payment_status', 'pending')
        .in('status', ['completed', 'confirmed'])
        .gte('appointment_time', yesterday.toISOString())
        .lte('appointment_time', yesterdayEnd.toISOString());

      if (error) {
        console.error('❌ Error fetching pending payments:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        console.log('ℹ️  No pending payments from yesterday');
        return;
      }

      console.log(`📋 Found ${appointments.length} pending payment(s)`);

      // Send payment reminders
      let successCount = 0;
      let failCount = 0;
      let totalAmount = 0;

      for (const appointment of appointments) {
        try {
          const patient = appointment.patients;
          const doctor = appointment.doctors;

          if (!patient || !doctor) {
            console.warn(`⚠️  Missing patient or doctor data for appointment ${appointment.id}`);
            continue;
          }

          const amount = appointment.balance_amount || 0;
          totalAmount += parseFloat(amount);

          const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;

          console.log(`📤 Sending payment reminder to ${patient.name} (₹${amount})`);

          // Prepare template components
          const components = [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: patient.name || 'Patient',
                },
                {
                  type: 'text',
                  text: `₹${amount}`,
                },
                {
                  type: 'text',
                  text: clinicName,
                },
              ],
            },
          ];

          // Send template message
          await sendTemplateMessage(
            patient.phone_number,
            'payment_reminder', // Template name (must be created in Meta)
            patient.preferred_language || 'en',
            components
          );

          console.log(`✅ Payment reminder sent to ${patient.name}`);
          successCount++;

        } catch (sendError) {
          console.error(`❌ Error sending payment reminder:`, sendError.message);
          failCount++;
        }
      }

      console.log(`\n📊 Payment Recovery Job Summary:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
      console.log(`   📋 Total: ${appointments.length}`);
      console.log(`   💰 Total Amount: ₹${totalAmount.toFixed(2)}\n`);

    } catch (error) {
      console.error('❌ Error in payment recovery job:', error);
    }
  });

  console.log('✅ Payment Recovery Job scheduled (daily at 8 PM)');
};

/**
 * Manual trigger for appointment reminder (for testing)
 * @param {string} appointmentId - Appointment UUID
 */
export const sendManualReminder = async (appointmentId) => {
  try {
    console.log(`📤 Manually sending reminder for appointment: ${appointmentId}`);

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_time,
        patients (
          name,
          phone_number,
          preferred_language
        ),
        doctors (
          name,
          clinic_name
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error) throw error;

    const patient = appointment.patients;
    const doctor = appointment.doctors;

    const appointmentTime = new Date(appointment.appointment_time);
    const formattedTime = appointmentTime.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;

    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: patient.name || 'Patient',
          },
          {
            type: 'text',
            text: formattedTime,
          },
          {
            type: 'text',
            text: clinicName,
          },
        ],
      },
    ];

    await sendTemplateMessage(
      patient.phone_number,
      'appointment_reminder',
      patient.preferred_language || 'en',
      components
    );

    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', appointmentId);

    console.log(`✅ Manual reminder sent successfully`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error sending manual reminder:', error);
    return { success: false, error: error.message };
  }
};


/**
 * Job 3: Send patient recall messages
 * Runs daily at 11 AM
 * Sends recall messages to patients who visited 6 months ago
 */
const patientRecallJob = () => {
  // Run daily at 11 AM: 0 11 * * *
  cron.schedule('0 11 * * *', async () => {
    try {
      console.log('\n📢 Running Patient Recall Job...');
      console.log('Time:', new Date().toLocaleString());

      // Calculate 6 months ago date
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const sixMonthsAgoEnd = new Date(sixMonthsAgo);
      sixMonthsAgoEnd.setHours(23, 59, 59, 999);

      // Query patients who need recall
      const { data: patients, error } = await supabase
        .from('patients')
        .select(`
          id,
          name,
          phone_number,
          last_seen_at,
          last_recall_sent,
          preferred_language,
          doctors (
            id,
            name,
            clinic_name
          )
        `)
        .lte('last_seen_at', sixMonthsAgoEnd.toISOString())
        .or(`last_recall_sent.is.null,last_recall_sent.lte.${sixMonthsAgoEnd.toISOString()}`)
        .limit(50); // Limit to 50 patients per day

      if (error) {
        console.error('❌ Error fetching recall candidates:', error);
        return;
      }

      if (!patients || patients.length === 0) {
        console.log('ℹ️  No patients need recall at this time');
        return;
      }

      // Filter out patients with future appointments
      const patientsNeedingRecall = [];
      
      for (const patient of patients) {
        const { data: futureAppointments, error: apptError } = await supabase
          .from('appointments')
          .select('id')
          .eq('patient_id', patient.id)
          .gt('appointment_time', new Date().toISOString())
          .in('status', ['pending', 'confirmed'])
          .limit(1);

        if (apptError) {
          console.error(`❌ Error checking appointments for patient ${patient.id}:`, apptError);
          continue;
        }

        // Only add if no future appointments
        if (!futureAppointments || futureAppointments.length === 0) {
          patientsNeedingRecall.push(patient);
        }
      }

      if (patientsNeedingRecall.length === 0) {
        console.log('ℹ️  All patients have future appointments scheduled');
        return;
      }

      console.log(`📋 Found ${patientsNeedingRecall.length} patient(s) needing recall`);

      // Send recall messages
      let successCount = 0;
      let failCount = 0;

      for (const patient of patientsNeedingRecall) {
        try {
          const doctor = patient.doctors;

          if (!doctor) {
            console.warn(`⚠️  Missing doctor data for patient ${patient.id}`);
            continue;
          }

          const lastVisit = new Date(patient.last_seen_at);
          const monthsAgo = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));

          const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;

          console.log(`📤 Sending recall message to ${patient.name} (${patient.phone_number})`);
          console.log(`   Last visit: ${monthsAgo} months ago`);

          // Prepare template components
          const components = [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: patient.name || 'Patient',
                },
                {
                  type: 'text',
                  text: `${monthsAgo} months`,
                },
                {
                  type: 'text',
                  text: clinicName,
                },
              ],
            },
          ];

          // Send template message
          await sendTemplateMessage(
            patient.phone_number,
            'checkup_recall', // Template name (must be created in Meta)
            patient.preferred_language || 'en',
            components
          );

          // Update last_recall_sent timestamp
          const { error: updateError } = await supabase
            .from('patients')
            .update({ last_recall_sent: new Date().toISOString() })
            .eq('id', patient.id);

          if (updateError) {
            console.error(`❌ Error updating recall timestamp:`, updateError);
          } else {
            console.log(`✅ Recall message sent to ${patient.name}`);
            successCount++;
          }

        } catch (sendError) {
          console.error(`❌ Error sending recall message:`, sendError.message);
          failCount++;
        }
      }

      console.log(`\n📊 Patient Recall Job Summary:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
      console.log(`   📋 Total: ${patientsNeedingRecall.length}\n`);

    } catch (error) {
      console.error('❌ Error in patient recall job:', error);
    }
  });

  console.log('✅ Patient Recall Job scheduled (daily at 11 AM)');
};

/**
 * Manual trigger for patient recall (for testing)
 * @param {string} patientId - Patient UUID
 */
export const sendManualRecall = async (patientId) => {
  try {
    console.log(`📢 Manually sending recall for patient: ${patientId}`);

    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        phone_number,
        last_seen_at,
        preferred_language,
        doctors (
          name,
          clinic_name
        )
      `)
      .eq('id', patientId)
      .single();

    if (error) throw error;

    const doctor = patient.doctors;
    const lastVisit = new Date(patient.last_seen_at);
    const monthsAgo = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;

    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: patient.name || 'Patient',
          },
          {
            type: 'text',
            text: `${monthsAgo} months`,
          },
          {
            type: 'text',
            text: clinicName,
          },
        ],
      },
    ];

    await sendTemplateMessage(
      patient.phone_number,
      'checkup_recall',
      patient.preferred_language || 'en',
      components
    );

    await supabase
      .from('patients')
      .update({ last_recall_sent: new Date().toISOString() })
      .eq('id', patientId);

    console.log(`✅ Manual recall sent successfully`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error sending manual recall:', error);
    return { success: false, error: error.message };
  }
};


/**
 * Job 4: Send weekly health tips
 * Runs every Monday at 9 AM
 * Sends health tips to active patients
 */
const weeklyHealthTipsJob = () => {
  // Run every Monday at 9 AM: 0 9 * * 1
  cron.schedule('0 9 * * 1', async () => {
    try {
      console.log('\n🌿 Running Weekly Health Tips Job...');
      console.log('Time:', new Date().toLocaleString());

      // Import health tip function
      const { getRandomHealthTip } = await import('./aiService.js');
      const { sendTextMessage } = await import('./whatsappService.js');

      // Get random health tip
      const healthTip = getRandomHealthTip();

      console.log(`💡 Health Tip: "${healthTip.substring(0, 50)}..."`);

      // Query active patients (limit to 100 per week to avoid spam)
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, name, phone_number, preferred_language')
        .eq('is_active', true)
        .order('last_seen_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error fetching patients:', error);
        return;
      }

      if (!patients || patients.length === 0) {
        console.log('ℹ️  No active patients found');
        return;
      }

      console.log(`📋 Sending health tip to ${patients.length} patient(s)`);

      // Send health tips
      let successCount = 0;
      let failCount = 0;

      for (const patient of patients) {
        try {
          console.log(`📤 Sending to ${patient.name} (${patient.phone_number})`);

          // Add personalized greeting
          const personalizedTip = `Hello ${patient.name || 'there'}! 👋\n\n${healthTip}\n\n` +
            `Stay healthy! 💚\n- Shubhstra Clinic`;

          await sendTextMessage(patient.phone_number, personalizedTip);

          console.log(`✅ Health tip sent to ${patient.name}`);
          successCount++;

          // Add small delay to avoid rate limiting (100ms between messages)
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (sendError) {
          console.error(`❌ Error sending to ${patient.name}:`, sendError.message);
          failCount++;
        }
      }

      console.log(`\n📊 Weekly Health Tips Job Summary:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
      console.log(`   📋 Total: ${patients.length}\n`);

    } catch (error) {
      console.error('❌ Error in weekly health tips job:', error);
    }
  });

  console.log('✅ Weekly Health Tips Job scheduled (every Monday at 9 AM)');
};

/**
 * Manual trigger for health tip broadcast (for testing)
 * @param {number} limit - Number of patients to send to
 */
export const sendManualHealthTip = async (limit = 5) => {
  try {
    console.log(`🌿 Manually sending health tip to ${limit} patients...`);

    const { getRandomHealthTip } = await import('./aiService.js');
    const { sendTextMessage } = await import('./whatsappService.js');

    const healthTip = getRandomHealthTip();

    const { data: patients, error } = await supabase
      .from('patients')
      .select('id, name, phone_number')
      .eq('is_active', true)
      .order('last_seen_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!patients || patients.length === 0) {
      console.log('ℹ️  No patients found');
      return { success: false, message: 'No patients found' };
    }

    let successCount = 0;

    for (const patient of patients) {
      try {
        const personalizedTip = `Hello ${patient.name || 'there'}! 👋\n\n${healthTip}\n\n` +
          `Stay healthy! 💚\n- Shubhstra Clinic`;

        await sendTextMessage(patient.phone_number, personalizedTip);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error sending to ${patient.name}:`, error.message);
      }
    }

    console.log(`✅ Health tips sent to ${successCount}/${patients.length} patients`);
    return { success: true, sent: successCount, total: patients.length };

  } catch (error) {
    console.error('❌ Error sending manual health tip:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run patient recall job manually (for dashboard trigger)
 */
export const runPatientRecallJob = async () => {
  try {
    console.log('\n📢 Running Patient Recall Job (Manual Trigger)...');
    console.log('Time:', new Date().toLocaleString());

    // Calculate 6 months ago date
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const sixMonthsAgoEnd = new Date(sixMonthsAgo);
    sixMonthsAgoEnd.setHours(23, 59, 59, 999);

    // Query patients who need recall
    const { data: patients, error } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        phone_number,
        last_seen_at,
        last_recall_sent,
        preferred_language,
        doctors (
          id,
          name,
          clinic_name
        )
      `)
      .lte('last_seen_at', sixMonthsAgoEnd.toISOString())
      .or(`last_recall_sent.is.null,last_recall_sent.lte.${sixMonthsAgoEnd.toISOString()}`)
      .limit(50);

    if (error) {
      console.error('❌ Error fetching recall candidates:', error);
      throw error;
    }

    if (!patients || patients.length === 0) {
      console.log('ℹ️  No patients need recall at this time');
      return { success: true, sent: 0, message: 'No patients need recall' };
    }

    // Filter out patients with future appointments
    const patientsNeedingRecall = [];
    
    for (const patient of patients) {
      const { data: futureAppointments, error: apptError } = await supabase
        .from('appointments')
        .select('id')
        .eq('patient_id', patient.id)
        .gt('appointment_time', new Date().toISOString())
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (apptError) {
        console.error(`❌ Error checking appointments for patient ${patient.id}:`, apptError);
        continue;
      }

      if (!futureAppointments || futureAppointments.length === 0) {
        patientsNeedingRecall.push(patient);
      }
    }

    if (patientsNeedingRecall.length === 0) {
      console.log('ℹ️  All patients have future appointments scheduled');
      return { success: true, sent: 0, message: 'All patients have appointments' };
    }

    console.log(`📋 Found ${patientsNeedingRecall.length} patient(s) needing recall`);

    // Send recall messages
    let successCount = 0;
    let failCount = 0;

    for (const patient of patientsNeedingRecall) {
      try {
        const doctor = patient.doctors;

        if (!doctor) {
          console.warn(`⚠️  Missing doctor data for patient ${patient.id}`);
          continue;
        }

        const lastVisit = new Date(patient.last_seen_at);
        const monthsAgo = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));

        const clinicName = doctor.clinic_name || `Dr. ${doctor.name}'s Clinic`;

        console.log(`📤 Sending recall message to ${patient.name} (${patient.phone_number})`);

        const components = [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: patient.name || 'Patient',
              },
              {
                type: 'text',
                text: `${monthsAgo} months`,
              },
              {
                type: 'text',
                text: clinicName,
              },
            ],
          },
        ];

        await sendTemplateMessage(
          patient.phone_number,
          'checkup_recall',
          patient.preferred_language || 'en',
          components
        );

        await supabase
          .from('patients')
          .update({ last_recall_sent: new Date().toISOString() })
          .eq('id', patient.id);

        console.log(`✅ Recall message sent to ${patient.name}`);
        successCount++;

      } catch (sendError) {
        console.error(`❌ Error sending recall message:`, sendError.message);
        failCount++;
      }
    }

    console.log(`\n📊 Patient Recall Job Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    return { success: true, sent: successCount, failed: failCount, total: patientsNeedingRecall.length };

  } catch (error) {
    console.error('❌ Error in patient recall job:', error);
    throw error;
  }
};
