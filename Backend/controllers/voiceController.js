import { interpretVoiceWithGemini } from '../services/voiceGeminiService.js';
import { detectIntent, getSelectorForIntent, isValidSelectorForContext } from '../utils/selectorHelper.js';
import { executeToolDirectly } from '../services/mcpOrchestratorService.js';
import { logVoiceCommand, logVoiceError, createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('voiceController');

/**
 * Procesa un comando de voz del usuario
 * @param {Object} req - Request con transcript, context y screenshot
 * @param {Object} res - Response
 */
export const processVoiceCommand = async (req, res) => {
  const startTime = Date.now(); // Mover al inicio para que esté disponible en el catch
  
  try {
    const { transcript, context, screenshot } = req.body;

    // Validación
    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Transcript es requerido y debe ser una cadena no vacía'
      });
    }

    // Enriquecer contexto con datos del usuario (autenticado o anónimo)
    const enrichedContext = {
      ...context,
      isAuthenticated: req.isAuthenticated || false,
      userId: req.user?.id_usuario || null,
      userName: req.user?.nombre || null,
      userEmail: req.user?.correo || null,
      userRole: req.user?.rol || 'guest',
      savedAddress: req.user?.direccion || null,
      userPhone: req.user?.telefono || null
    };

    logger.info('Voice command received', {
      transcript,
      user: req.user?.nombre || 'Anónimo',
      userId: req.user?.id_usuario,
      authenticated: enrichedContext.isAuthenticated,
      pathname: context?.currentUrl || context?.pathname,
    });

    console.log(`[Voice Controller] ═══════════════════════════════════════`);
    console.log(`[Voice Controller] 🎤 Nuevo comando de voz`);
    console.log(`[Voice Controller] Usuario: ${req.user?.nombre || 'Anónimo'}`);
    console.log(`[Voice Controller] Autenticado: ${enrichedContext.isAuthenticated ? '✅ Sí' : '❌ No'}`);
    console.log(`[Voice Controller] Comando: "${transcript}"`);
    console.log(`[Voice Controller] URL actual: ${context?.currentUrl || context?.pathname || 'Unknown'}`);
    console.log(`[Voice Controller] ═══════════════════════════════════════`);

    // Detectar intención del comando
    const detectedIntent = detectIntent(transcript);
    
    if (detectedIntent) {
      console.log(`[Voice Controller] 🎯 Intención detectada: ${detectedIntent}`);
      enrichedContext.detectedIntent = detectedIntent;

      // Para intenciones simples, ejecutar directamente sin Gemini
      if (isSimpleNavigationIntent(detectedIntent)) {
        console.log(`[Voice Controller] 🚀 Ejecución directa de intención simple`);
        
        const action = getActionForIntent(detectedIntent);
        
        if (action) {
          // Para navegación, no necesitamos selector
          const isNavigation = action.tool === 'navigate';
          
          if (isNavigation) {
            // Navegación directa - no requiere validación de selector
            try {
              const result = await executeToolDirectly(action.tool, action.params(null));
              
              console.log(`[Voice Controller] ✓ Navegación directa exitosa`);
              console.log(`[Voice Controller] Resultado:`, result);
              
              return res.json({
                success: true,
                data: {
                  reasoning: `Navegación directa a ${detectedIntent}`,
                  userFeedback: getFeedbackForIntent(detectedIntent),
                  execution: {
                    success: result.success !== false,
                    stepsCompleted: 1,
                    stepsFailed: result.success === false ? 1 : 0,
                    totalSteps: 1,
                    results: [result]
                  },
                  fastPath: true
                }
              });
            } catch (error) {
              console.warn(`[Voice Controller] ⚠️ Navegación directa falló:`, error.message);
              // Si falla, continuar con Gemini
            }
          } else {
            // Click en elemento - necesita selector y validación
            const selector = getSelectorForIntent(detectedIntent, enrichedContext);
            
            if (selector && isValidSelectorForContext(selector, enrichedContext)) {
              try {
                const result = await executeToolDirectly(action.tool, action.params(selector));
                
                console.log(`[Voice Controller] ✓ Click directo exitoso`);
                
                return res.json({
                  success: true,
                  data: {
                    reasoning: `Acción directa: ${detectedIntent}`,
                    userFeedback: getFeedbackForIntent(detectedIntent),
                    execution: {
                      success: result.success !== false,
                      stepsCompleted: 1,
                      stepsFailed: result.success === false ? 1 : 0,
                      totalSteps: 1,
                      results: [result]
                    },
                    fastPath: true
                  }
                });
              } catch (error) {
                console.warn(`[Voice Controller] ⚠️ Click directo falló:`, error.message);
                // Si falla, continuar con Gemini
              }
            } else {
              console.warn(`[Voice Controller] ⚠️ Selector no válido para contexto`);
              // Continuar con Gemini
            }
          }
        }
      }
    }

    console.log(`[Voice Controller] 🤖 Usando Gemini para comando complejo`);
    console.log(`[Voice Controller] Comando: "${transcript}"`);
    console.log(`[Voice Controller] URL actual: ${context?.currentUrl || 'Unknown'}`);

    // Interpretar con Gemini y ejecutar plan con MCP (con timeout de 30s)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT: El comando tardó más de 30 segundos'));
      }, 30000); // 30 segundos
    });

    const commandPromise = interpretVoiceWithGemini(
      transcript,
      enrichedContext,
      screenshot
    );

    // Race entre comando y timeout
    const result = await Promise.race([commandPromise, timeoutPromise]);

    // Log del resultado
    console.log(`[Voice Controller] ═══════════════════════════════════════`);
    console.log(`[Voice Controller] 📊 Resultado final`);
    console.log(`[Voice Controller] Success: ${result.success ? '✅' : '❌'}`);
    if (result.execution) {
      console.log(`[Voice Controller] Steps: ${result.execution.stepsCompleted}/${result.execution.totalSteps}`);
      console.log(`[Voice Controller] Fallidos: ${result.execution.stepsFailed || 0}`);
    }
    console.log(`[Voice Controller] Feedback: "${result.userFeedback || 'N/A'}"`);
    console.log(`[Voice Controller] ═══════════════════════════════════════`);

    // Log estructurado del comando
    const duration = Date.now() - startTime;
    logVoiceCommand({
      transcript,
      user: req.user?.nombre || 'anonymous',
      success: result.success,
      duration: `${duration}ms`,
      stepsExecuted: result.execution?.stepsCompleted || 0,
      stepsFailed: result.execution?.stepsFailed || 0,
      cached: result.cached || false,
      pathname: context?.currentUrl || context?.pathname,
    });

    // Responder al frontend
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Voice Controller] Error procesando comando:', error);

    // Determinar tipo de error para respuesta específica
    let errorMessage = 'Error procesando comando de voz';
    let statusCode = 500;
    let isTimeout = false;
    let errorType = 'unknown';

    // Detectar error de cuota excedida de Gemini
    if (error.status === 429 || error.message.includes('429') || error.message.includes('quota')) {
      errorMessage = 'Has alcanzado el límite de comandos por hoy (50 comandos gratis/día). Por favor, espera unas horas o intenta mañana.';
      statusCode = 429; // Too Many Requests
      errorType = 'quota_exceeded';
    } else if (error.message.includes('TIMEOUT')) {
      errorMessage = 'La operación tardó demasiado tiempo (más de 30 segundos). Por favor, intenta con un comando más simple o verifica tu conexión.';
      statusCode = 408; // Request Timeout
      isTimeout = true;
      errorType = 'timeout';
    } else if (error.message.includes('Gemini')) {
      errorMessage = 'Error con el servicio de IA. Intenta de nuevo.';
      statusCode = 503;
      errorType = 'gemini';
    } else if (error.message.includes('MCP')) {
      errorMessage = 'Error ejecutando acciones en la aplicación. Intenta de nuevo.';
      statusCode = 503;
      errorType = 'mcp';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'La operación tardó demasiado. Intenta con un comando más simple.';
      statusCode = 504;
      errorType = 'timeout';
    }

    // Log estructurado del error
    logVoiceError({
      transcript,
      user: req.user?.nombre || 'anonymous',
      error: errorMessage,
      errorType,
      stack: error.stack,
      pathname: context?.currentUrl || context?.pathname,
      duration: `${duration}ms`,
    });

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      timeout: isTimeout,
      errorType,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper: Determina si una intención es de navegación simple
 */
function isSimpleNavigationIntent(intent) {
  const simpleIntents = [
    'goToHome', 'goToCatalog', 'goToCart', 'goToProfile', 'goToContact',
    'goToTerms', 'goToPrivacy', 'goToComplaints', 'goToAbout',
    'login', 'register', 'logout'
  ];
  return simpleIntents.includes(intent);
}

/**
 * Helper: Obtiene la acción MCP apropiada para una intención
 */
function getActionForIntent(intent) {
  const navigationIntents = ['goToHome', 'goToCatalog', 'goToCart', 'goToProfile', 'goToContact'];
  const clickIntents = ['login', 'register', 'logout', 'goToTerms', 'goToPrivacy', 'goToComplaints', 'goToAbout'];

  if (navigationIntents.includes(intent)) {
    const routeMap = {
      goToHome: '/',
      goToCatalog: '/carta',
      goToCart: '/cart',
      goToProfile: '/profile',
      goToContact: '/contact-us'
    };
    return {
      tool: 'navigate',
      params: (selector) => ({ url: routeMap[intent] })
    };
  }

  if (clickIntents.includes(intent)) {
    return {
      tool: 'click',
      params: (selector) => ({ selector })
    };
  }

  return null;
}

/**
 * Helper: Obtiene feedback amigable para una intención
 */
function getFeedbackForIntent(intent) {
  const feedbackMap = {
    goToHome: 'Te llevo al inicio',
    goToCatalog: 'Te muestro nuestro catálogo',
    goToCart: 'Aquí está tu carrito',
    goToProfile: 'Abriendo tu perfil',
    goToContact: 'Te llevo a la página de contacto',
    login: 'Abriendo formulario de inicio de sesión',
    register: 'Abriendo formulario de registro',
    logout: 'Cerrando tu sesión',
    goToTerms: 'Mostrando términos y condiciones',
    goToPrivacy: 'Mostrando política de privacidad',
    goToComplaints: 'Abriendo libro de reclamaciones',
    goToAbout: 'Te muestro información sobre nosotros'
  };

  return feedbackMap[intent] || 'Procesando tu comando';
}
