/**
 * Voice Rate Limiter Middleware
 * Limita el número de comandos de voz para prevenir abuso
 * Límite: 30 comandos por minuto por IP
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter específico para comandos de voz
 * - 30 solicitudes por minuto
 * - Mensaje personalizado en español
 * - Headers para informar al cliente sobre el límite
 */
const voiceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 comandos por minuto
  message: {
    success: false,
    error: 'Demasiados comandos de voz. Por favor espera un momento.',
    ttsResponse: 'Has enviado demasiados comandos. Por favor espera un momento antes de continuar.',
    retryAfter: 60
  },
  standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Contar todas las solicitudes, incluso exitosas
  skipFailedRequests: false, // Contar también las solicitudes fallidas

  // Identificar cliente por IP
  keyGenerator: (req) => {
    // Obtener IP real considerando proxies
    return req.ip || req.connection.remoteAddress;
  },

  // Handler personalizado cuando se excede el límite
  handler: (req, res) => {
    console.warn(`[Voice Rate Limit] IP ${req.ip} excedió el límite de comandos de voz`);

    res.status(429).json({
      success: false,
      error: 'Demasiados comandos de voz. Por favor espera un momento.',
      ttsResponse: 'Has enviado demasiados comandos. Por favor espera un momento antes de continuar.',
      retryAfter: 60
    });
  }
});

export default voiceRateLimiter;
