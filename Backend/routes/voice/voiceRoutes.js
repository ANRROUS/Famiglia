/**
 * Voice Routes
 * Define las rutas para el sistema de control por voz
 */

import express from 'express';
import * as voiceController from '../../controllers/voice/voiceController.js';
import voiceRateLimiter from '../../middleware/voiceRateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/voice/command
 * @desc    Procesar comando de voz y retornar intención interpretada
 * @access  Public (disponible para todos, incluso sin autenticación)
 * @body    { text: String, context: Object }
 * @returns { success, intent, params, confidence, ttsResponse, language }
 */
router.post('/command', voiceRateLimiter, voiceController.processVoiceCommand);

/**
 * @route   GET /api/voice/capabilities
 * @desc    Obtener comandos disponibles según contexto y rol de usuario
 * @access  Public
 * @query   { context: String, userRole: String }
 * @returns { success, context, userRole, commands }
 */
router.get('/capabilities', voiceController.getVoiceCapabilities);

/**
 * @route   POST /api/voice/describe
 * @desc    Obtener descripción auditiva de la página actual
 * @access  Public
 * @body    { page: String, context: Object }
 * @returns { success, page, description, ttsResponse }
 */
router.post('/describe', voiceRateLimiter, voiceController.describeCurrentPage);

export default router;
