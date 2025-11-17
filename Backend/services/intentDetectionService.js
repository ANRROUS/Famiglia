import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getSelectorsByPage, getActionsByPage } from './selectorMappingService.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Detecta la intención del usuario usando Gemini con contexto completo
 * @param {Object} params
 * @param {string} params.transcript - Comando del usuario
 * @param {Object} params.context - Contexto actual (página, autenticación, etc.)
 * @returns {Promise<Object>} - Intención detectada con parámetros
 */
export async function detectIntentWithGemini({ transcript, context }) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' }); // Rápido para intent detection

    // Construir contexto enriquecido
    const pageSelectors = getSelectorsByPage(context.pathname);
    const pageActions = getActionsByPage(context.pathname);

    const prompt = `
Eres un asistente de navegación por voz para un e-commerce de pastelería.

CONTEXTO ACTUAL:
- Página: ${context.pathname}
- Usuario autenticado: ${context.isAuthenticated ? 'Sí' : 'No'}
- Rol: ${context.user?.rol || 'visitante'}

ACCIONES DISPONIBLES EN ESTA PÁGINA:
${JSON.stringify(pageActions, null, 2)}

COMANDO DEL USUARIO:
"${transcript}"

INSTRUCCIONES:
Analiza el comando y determina:
1. La INTENCIÓN principal (qué quiere hacer)
2. El OBJETIVO (sobre qué elemento/producto)
3. El MÉTODO (cómo ejecutarlo: por índice, por nombre, etc.)
4. PARÁMETROS adicionales (cantidad, filtros, etc.)

Responde ÚNICAMENTE con JSON válido (sin markdown):
{
  "intent": "addToCart|search|filter|navigate|increase|decrease|remove|...",
  "target": "nombre del producto o elemento",
  "method": "byName|byIndex|byId|direct",
  "params": {
    "index": 0,
    "quantity": 1,
    "category": "",
    "searchTerm": ""
  },
  "confidence": 0.95,
  "requiresAuth": false,
  "fallbackToAI": false
}

EJEMPLOS:

Usuario: "agregar chocolate al carrito"
Respuesta: {
  "intent": "addToCart",
  "target": "chocolate",
  "method": "byName",
  "params": {},
  "confidence": 0.95,
  "requiresAuth": false,
  "fallbackToAI": false
}

Usuario: "agregar el primero"
Respuesta: {
  "intent": "addToCart",
  "target": "primer producto visible",
  "method": "byIndex",
  "params": { "index": 0 },
  "confidence": 1.0,
  "requiresAuth": false,
  "fallbackToAI": false
}

Usuario: "filtra por tortas y muestra los primeros 3"
Respuesta: {
  "intent": "filterAndList",
  "target": "productos",
  "method": "complex",
  "params": {
    "category": "tortas",
    "limit": 3
  },
  "confidence": 0.85,
  "requiresAuth": false,
  "fallbackToAI": true
}

Usuario: "proceder al pago"
Respuesta: {
  "intent": "proceedToPayment",
  "target": "checkout",
  "method": "direct",
  "params": {},
  "confidence": 1.0,
  "requiresAuth": true,
  "fallbackToAI": false
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Limpiar respuesta
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const intentData = JSON.parse(cleanedResponse);

    console.log('[Intent Detection] 🎯 Intención detectada:', {
      intent: intentData.intent,
      target: intentData.target,
      method: intentData.method,
      confidence: intentData.confidence
    });

    return intentData;

  } catch (error) {
    console.error('[Intent Detection] ❌ Error:', error);
    
    // Fallback: retornar estructura que fuerza uso de AI completo
    return {
      intent: 'unknown',
      target: null,
      method: 'complex',
      params: {},
      confidence: 0,
      requiresAuth: false,
      fallbackToAI: true,
      error: error.message
    };
  }
}

/**
 * Obtiene selectores disponibles para una página
 */
function getSelectorsByPage(pathname) {
  const selectorMap = {
    '/carta': ['search.input', 'catalog.product.card', 'catalog.filters.category'],
    '/cart': ['cart.product.card', 'cart.increase', 'cart.decrease', 'cart.remove'],
    '/payment': ['payment.method.yape', 'payment.method.plin', 'payment.phone', 'payment.code'],
    '/profile': ['profile.tabs.pedidos', 'profile.tabs.tests', 'profile.2fa.activate'],
    '/test': ['test.start', 'test.option', 'test.next', 'test.previous'],
    '/contact-us': ['contact.name', 'contact.email', 'contact.message', 'contact.submit'],
    '/complaints': ['complaints.nombre', 'complaints.correo', 'complaints.motivo', 'complaints.submit'],
    '/delivery': ['delivery.rappi', 'delivery.whatsapp'],
    '/catalogo-admin': ['catalogoAdmin.search', 'catalogoAdmin.filters.category', 'catalogoAdmin.products.card']
  };

  return selectorMap[pathname] || [];
}

/**
 * Obtiene acciones disponibles para una página
 */
function getActionsByPage(pathname) {
  const actionMap = {
    '/carta': [
      'addToCart (agregar producto al carrito)',
      'search (buscar productos)',
      'filter (filtrar por categoría)',
      'navigate (cambiar página)',
      'clearFilters (limpiar filtros)',
      'setPriceRange (establecer rango de precio)'
    ],
    '/cart': [
      'increaseQuantity (aumentar cantidad)',
      'decreaseQuantity (disminuir cantidad)',
      'removeFromCart (eliminar producto)',
      'clearCart (vaciar carrito)',
      'proceedToPayment (ir a pago)',
      'goToCatalog (volver al catálogo)'
    ],
    '/payment': [
      'selectPaymentMethod (seleccionar método de pago)',
      'fillPhoneNumber (llenar teléfono)',
      'fillVerificationCode (llenar código)',
      'confirmPayment (confirmar pago)',
      'goToCart (volver al carrito)'
    ],
    '/profile': [
      'switchToOrders (cambiar a pedidos)',
      'switchToTests (cambiar a tests)',
      'activate2FA (activar autenticación 2FA)',
      'disable2FA (desactivar 2FA)',
      'navigate (cambiar página de resultados)'
    ],
    '/test': [
      'startTest (iniciar test)',
      'selectOption (seleccionar opción)',
      'nextQuestion (siguiente pregunta)',
      'previousQuestion (pregunta anterior)',
      'resetTest (reiniciar test)',
      'viewRecommendation (ver recomendación)'
    ],
    '/contact-us': [
      'fillName (llenar nombre)',
      'fillEmail (llenar email)',
      'fillMessage (llenar mensaje)',
      'submitForm (enviar formulario)',
      'clearForm (limpiar formulario)'
    ],
    '/complaints': [
      'fillNombre (llenar nombre)',
      'fillCorreo (llenar correo)',
      'fillMotivo (llenar motivo)',
      'submitComplaint (enviar reclamo)',
      'clearForm (limpiar formulario)'
    ],
    '/delivery': [
      'getDeliveryInfo (obtener información de delivery)',
      'getWhatsappNumber (obtener número de WhatsApp)',
      'getRappiInfo (información de Rappi)'
    ],
    '/catalogo-admin': [
      'search (buscar productos)',
      'filter (filtrar por categoría)',
      'setPriceRange (establecer rango de precio)',
      'clearFilters (limpiar filtros)',
      'getStats (obtener estadísticas)'
    ]
  };

  return actionMap[pathname] || ['navigate (navegación general)'];
}

export default {
  detectIntentWithGemini
};
