import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de Winston Logger
 * Logging estructurado para el sistema de voz
 */

// Definir formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let msg = `${timestamp} [${service || 'App'}] ${level}: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'famiglia-voice' },
  transports: [
    // Log de errores (solo errors y warn)
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Log combinado (todos los niveles)
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Log específico para comandos de voz
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/voice-commands.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Si no estamos en producción, log a consola también
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

/**
 * Crear logger hijo para un módulo específico
 * @param {string} module - Nombre del módulo (ej: 'voiceController', 'mcpOrchestrator')
 * @returns {Object} Logger con contexto del módulo
 */
export function createModuleLogger(module) {
  return logger.child({ module });
}

/**
 * Log específico para comandos de voz
 * @param {Object} data - Datos del comando
 */
export function logVoiceCommand(data) {
  logger.info('Voice command processed', {
    transcript: data.transcript,
    user: data.user || 'anonymous',
    success: data.success,
    duration: data.duration,
    stepsExecuted: data.stepsExecuted,
    stepsFailed: data.stepsFailed,
    cached: data.cached || false,
    pathname: data.pathname,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log específico para errores de comandos de voz
 * @param {Object} data - Datos del error
 */
export function logVoiceError(data) {
  logger.error('Voice command error', {
    transcript: data.transcript,
    user: data.user || 'anonymous',
    error: data.error,
    errorType: data.errorType,
    stack: data.stack,
    pathname: data.pathname,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log para pasos de MCP
 * @param {Object} data - Datos del paso
 */
export function logMCPStep(data) {
  logger.info('MCP step executed', {
    step: data.step,
    tool: data.tool,
    success: data.success,
    duration: data.duration,
    retries: data.retries || 0,
    error: data.error,
    timestamp: new Date().toISOString(),
  });
}

// Exportar logger por defecto
export default logger;
