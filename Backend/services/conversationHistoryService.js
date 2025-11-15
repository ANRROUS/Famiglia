/**
 * Servicio de Historial de Conversación
 * Mantiene contexto de comandos de voz anteriores para continuidad conversacional
 */

// Map: sessionId -> Array de mensajes
const conversationHistories = new Map();

// Configuración
const MAX_HISTORY_LENGTH = 10; // Últimos 10 intercambios (20 mensajes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos de inactividad

/**
 * Obtiene el historial de conversación para una sesión
 * @param {string} sessionId - ID de sesión (puede ser userId o sessionId temporal)
 * @returns {Array} Array de mensajes [{role: 'user'|'model', parts: [{text}]}]
 */
export function getHistory(sessionId) {
  if (!sessionId) {
    return [];
  }

  const session = conversationHistories.get(sessionId);
  
  if (!session) {
    return [];
  }

  // Verificar timeout
  const timeSinceLastActivity = Date.now() - session.lastActivityAt;
  if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
    console.log(`[Conversation History] Sesión ${sessionId} expirada (${Math.round(timeSinceLastActivity / 60000)} minutos de inactividad)`);
    conversationHistories.delete(sessionId);
    return [];
  }

  return session.messages || [];
}

/**
 * Agrega un mensaje de usuario al historial
 * @param {string} sessionId - ID de sesión
 * @param {string} userMessage - Mensaje del usuario
 */
export function addUserMessage(sessionId, userMessage) {
  if (!sessionId || !userMessage) {
    return;
  }

  ensureSession(sessionId);
  
  const session = conversationHistories.get(sessionId);
  
  session.messages.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  session.lastActivityAt = Date.now();
  
  trimHistory(sessionId);
  
  console.log(`[Conversation History] Usuario → "${userMessage.substring(0, 50)}..." (total: ${session.messages.length} mensajes)`);
}

/**
 * Agrega una respuesta del modelo al historial
 * @param {string} sessionId - ID de sesión
 * @param {string} modelResponse - Respuesta del modelo
 */
export function addModelResponse(sessionId, modelResponse) {
  if (!sessionId || !modelResponse) {
    return;
  }

  ensureSession(sessionId);
  
  const session = conversationHistories.get(sessionId);
  
  session.messages.push({
    role: 'model',
    parts: [{ text: modelResponse }]
  });

  session.lastActivityAt = Date.now();
  
  trimHistory(sessionId);
  
  console.log(`[Conversation History] Modelo → "${modelResponse.substring(0, 50)}..." (total: ${session.messages.length} mensajes)`);
}

/**
 * Limpia el historial de una sesión
 * @param {string} sessionId - ID de sesión
 */
export function clearHistory(sessionId) {
  if (!sessionId) {
    return;
  }

  conversationHistories.delete(sessionId);
  console.log(`[Conversation History] Historial limpiado para sesión ${sessionId}`);
}

/**
 * Limpia todas las sesiones expiradas (ejecutar periódicamente)
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  let expiredCount = 0;

  for (const [sessionId, session] of conversationHistories.entries()) {
    const timeSinceLastActivity = now - session.lastActivityAt;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
      conversationHistories.delete(sessionId);
      expiredCount++;
    }
  }

  if (expiredCount > 0) {
    console.log(`[Conversation History] Limpieza automática: ${expiredCount} sesiones expiradas eliminadas`);
  }

  return expiredCount;
}

/**
 * Asegura que exista una sesión en el Map
 * @param {string} sessionId - ID de sesión
 */
function ensureSession(sessionId) {
  if (!conversationHistories.has(sessionId)) {
    conversationHistories.set(sessionId, {
      messages: [],
      createdAt: Date.now(),
      lastActivityAt: Date.now()
    });
    console.log(`[Conversation History] Nueva sesión creada: ${sessionId}`);
  }
}

/**
 * Recorta el historial si excede el máximo permitido
 * Mantiene solo los últimos MAX_HISTORY_LENGTH intercambios (par usuario-modelo)
 * @param {string} sessionId - ID de sesión
 */
function trimHistory(sessionId) {
  const session = conversationHistories.get(sessionId);
  
  if (!session) {
    return;
  }

  // Máximo de mensajes = MAX_HISTORY_LENGTH * 2 (user + model)
  const maxMessages = MAX_HISTORY_LENGTH * 2;
  
  if (session.messages.length > maxMessages) {
    // Eliminar mensajes más antiguos
    const toRemove = session.messages.length - maxMessages;
    session.messages.splice(0, toRemove);
    
    console.log(`[Conversation History] Historial recortado: eliminados ${toRemove} mensajes antiguos`);
  }
}

/**
 * Obtiene estadísticas de sesiones activas
 * @returns {Object} Estadísticas
 */
export function getStats() {
  const activeSessions = conversationHistories.size;
  let totalMessages = 0;

  for (const session of conversationHistories.values()) {
    totalMessages += session.messages.length;
  }

  return {
    activeSessions,
    totalMessages,
    avgMessagesPerSession: activeSessions > 0 ? Math.round(totalMessages / activeSessions) : 0
  };
}

// Limpieza automática cada 15 minutos
setInterval(cleanupExpiredSessions, 15 * 60 * 1000);
