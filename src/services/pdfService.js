/**
 * PDF Service
 * Generates PDF reports for patient history
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from '../config/supabaseClient.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate patient history PDF report
 * @param {string} patientId - Patient's UUID
 * @returns {Promise<string|null>} - Path to generated PDF file
 */
export const generatePatientReport = async (patientId) => {
  try {
    if (!patientId) {
      console.warn('⚠️  Patient ID is required');
      return null;
    }

    console.log(`📄 Generating PDF report for patient: ${patientId}`);

    // Fetch patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        doctors (
          name,
          clinic_name,
          specialization,
          phone_number,
          email
        )
      `)
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('❌ Patient not found:', patientError);
      return null;
    }

    // Fetch last 5 appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('appointment_time', { ascending: false })
      .limit(5);

    if (appointmentsError) {
      console.error('❌ Error fetching appointments:', appointmentsError);
      return null;
    }

    console.log(`✅ Patient data fetched: ${patient.name}`);
    console.log(`   Appointments: ${appointments?.length || 0}`);

    // Create PDF
    const pdfPath = await createPDF(patient, appointments || []);

    if (pdfPath) {
      console.log(`✅ PDF generated successfully: ${pdfPath}`);
    }

    return pdfPath;

  } catch (error) {
    console.error('❌ Error in generatePatientReport:', error);
    return null;
  }
};

/**
 * Create PDF document
 * @param {Object} patient - Patient object
 * @param {Array} appointments - Array of appointments
 * @returns {Promise<string>} - Path to PDF file
 */
const createPDF = async (patient, appointments) => {
  return new Promise((resolve, reject) => {
    try {
      // Create tmp directory if it doesn't exist
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Generate filename
      const timestamp = Date.now();
      const filename = `patient_report_${patient.id.substring(0, 8)}_${timestamp}.pdf`;
      const filepath = path.join(tmpDir, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Get doctor info
      const doctor = patient.doctors;
      const clinicName = doctor?.clinic_name || `Dr. ${doctor?.name}'s Clinic`;

      // Header
      doc.fontSize(20)
         .fillColor('#2563eb')
         .text(clinicName, { align: 'center' });

      doc.fontSize(10)
         .fillColor('#666666')
         .text(doctor?.specialization || 'Medical Clinic', { align: 'center' });

      if (doctor?.phone_number) {
        doc.text(`Phone: ${doctor.phone_number}`, { align: 'center' });
      }

      if (doctor?.email) {
        doc.text(`Email: ${doctor.email}`, { align: 'center' });
      }

      // Line separator
      doc.moveDown();
      doc.strokeColor('#2563eb')
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke();

      doc.moveDown();

      // Report Title
      doc.fontSize(16)
         .fillColor('#000000')
         .text('Patient Medical Report', { align: 'center' });

      doc.moveDown();

      // Patient Information Section
      doc.fontSize(14)
         .fillColor('#2563eb')
         .text('Patient Information', { underline: true });

      doc.moveDown(0.5);

      doc.fontSize(11)
         .fillColor('#000000');

      const patientInfo = [
        ['Name:', patient.name || 'N/A'],
        ['Phone:', patient.phone_number || 'N/A'],
        ['Patient ID:', patient.id.substring(0, 13) + '...'],
        ['First Visit:', new Date(patient.created_at).toLocaleDateString('en-IN')],
        ['Last Visit:', new Date(patient.last_seen_at).toLocaleDateString('en-IN')],
      ];

      patientInfo.forEach(([label, value]) => {
        doc.text(label, 50, doc.y, { continued: true, width: 150 })
           .text(value, { width: 350 });
        doc.moveDown(0.3);
      });

      doc.moveDown();

      // Appointments History Section
      doc.fontSize(14)
         .fillColor('#2563eb')
         .text('Recent Appointments', { underline: true });

      doc.moveDown(0.5);

      if (appointments.length === 0) {
        doc.fontSize(11)
           .fillColor('#666666')
           .text('No appointments found.', { align: 'center' });
      } else {
        // Table header
        const tableTop = doc.y;
        const colWidths = [40, 120, 100, 100, 125];
        const colPositions = [50, 90, 210, 310, 410];

        doc.fontSize(10)
           .fillColor('#ffffff')
           .rect(50, tableTop, 495, 25)
           .fill('#2563eb');

        doc.fillColor('#ffffff')
           .text('#', colPositions[0], tableTop + 8, { width: colWidths[0] })
           .text('Date', colPositions[1], tableTop + 8, { width: colWidths[1] })
           .text('Time', colPositions[2], tableTop + 8, { width: colWidths[2] })
           .text('Status', colPositions[3], tableTop + 8, { width: colWidths[3] })
           .text('Payment', colPositions[4], tableTop + 8, { width: colWidths[4] });

        doc.moveDown(2);

        // Table rows
        appointments.forEach((appointment, index) => {
          const rowY = doc.y;
          const appointmentDate = new Date(appointment.appointment_time);

          // Alternate row colors
          if (index % 2 === 0) {
            doc.rect(50, rowY - 5, 495, 25)
               .fill('#f3f4f6');
          }

          doc.fillColor('#000000')
             .fontSize(9)
             .text(index + 1, colPositions[0], rowY, { width: colWidths[0] })
             .text(appointmentDate.toLocaleDateString('en-IN'), colPositions[1], rowY, { width: colWidths[1] })
             .text(appointmentDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), colPositions[2], rowY, { width: colWidths[2] })
             .text(appointment.status.toUpperCase(), colPositions[3], rowY, { width: colWidths[3] })
             .text(appointment.payment_status ? appointment.payment_status.toUpperCase() : 'N/A', colPositions[4], rowY, { width: colWidths[4] });

          doc.moveDown(1.5);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8)
         .fillColor('#666666')
         .text(`Report generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

      doc.text('This is a computer-generated report.', { align: 'center' });

      // Finalize PDF
      doc.end();

      // Wait for stream to finish
      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete PDF file after sending
 * @param {string} filepath - Path to PDF file
 */
export const deletePDF = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`🗑️  PDF file deleted: ${filepath}`);
    }
  } catch (error) {
    console.error('❌ Error deleting PDF:', error);
  }
};

export default {
  generatePatientReport,
  deletePDF,
};
