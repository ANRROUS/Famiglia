import express from 'express';
import { processVoiceCommand } from '../../controllers/voiceController.js';
import { optionalAuthMiddleware } from '../../middleware/optionalAuthMiddleware.js';

const router = express.Router();

/**
 * POST /api/voice/process
 * Procesa un comando de voz del usuario
 * Funciona con usuarios autenticados y anónimos
 */
router.post('/process', optionalAuthMiddleware, processVoiceCommand);

export default router;
