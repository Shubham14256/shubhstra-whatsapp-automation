/**
 * Express Application Setup
 * Configures middleware and routes
 */

import express from 'express';
import cors from 'cors';
import webhookRoutes from './routes/webhookRoutes.js';
import liveChatRoutes from './routes/liveChatRoutes.js';

const app = express();

// CORS Configuration - Allow frontend to access API
const corsOptions = {
  origin: [
    'http://localhost:3001', // Local development
    'https://shubhstra-dashboard.vercel.app' // Production frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Shubhstra Tech WhatsApp Automation Platform - API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Trigger recall campaign manually
app.post('/api/trigger-recall', async (req, res) => {
  try {
    console.log('📢 Manual recall campaign triggered');
    
    // Import the recall function from cronService
    const { runPatientRecallJob } = await import('./services/cronService.js');
    
    // Run the recall job
    await runPatientRecallJob();
    
    res.json({ success: true, message: 'Recall campaign triggered successfully' });
  } catch (error) {
    console.error('Error triggering recall:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate and send patient report
app.post('/api/generate-report', async (req, res) => {
  try {
    const { patientId, patientName, phoneNumber } = req.body;
    
    if (!patientId || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`📄 Generating report for patient: ${patientName || phoneNumber}`);
    
    const pdfService = await import('./services/pdfService.js');
    const whatsappService = await import('./services/whatsappService.js');
    
    // Generate PDF
    const pdfPath = await pdfService.generatePatientReport(patientId);
    
    // Send via WhatsApp
    await whatsappService.sendDocument(phoneNumber, pdfPath, `Patient_Report_${patientName || 'Unknown'}.pdf`);
    
    // Delete the file
    const fs = await import('fs');
    fs.unlinkSync(pdfPath);
    
    res.json({ success: true, message: 'Report generated and sent successfully' });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook routes
app.use('/', webhookRoutes);

// Live Chat routes - Fixed infinite loop issue
app.use('/api/live-chat', liveChatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

export default app;
