/**
 * Webhook Routes
 * Defines routes for WhatsApp Cloud API webhook and missed call handling
 */

import express from 'express';
import { verifyWebhook, receiveMessage } from '../controllers/webhookController.js';
import { handleMissedCall } from '../controllers/missedCallController.js';

const router = express.Router();

/**
 * GET /webhook - Webhook verification endpoint
 * Used by Meta to verify the webhook URL
 */
router.get('/webhook', verifyWebhook);

/**
 * POST /webhook - Receive incoming messages
 * Used by Meta to send incoming WhatsApp messages
 */
router.post('/webhook', receiveMessage);

/**
 * POST /api/missed-call - Handle missed call notifications
 * Used by Android App to trigger recovery messages
 */
router.post('/api/missed-call', handleMissedCall);

export default router;
