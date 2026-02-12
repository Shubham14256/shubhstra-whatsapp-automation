/**
 * Server Entry Point
 * Starts the Express server and initializes cron jobs
 */

import dotenv from 'dotenv';
import app from './src/app.js';
import { initializeCronJobs } from './src/services/cronService.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!process.env.WEBHOOK_VERIFY_TOKEN) {
  console.error('❌ FATAL ERROR: WEBHOOK_VERIFY_TOKEN is not defined in .env file');
  process.exit(1);
}

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 Shubhstra Tech WhatsApp Automation Platform');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Server running in ${NODE_ENV} mode`);
  console.log(`✅ Listening on port ${PORT}`);
  console.log(`✅ Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════════\n');

  // Initialize cron jobs after server starts
  initializeCronJobs();
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\n⚠️  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
