/**
 * Voice Controller
 * Maneja los comandos de voz y la interpretación de intenciones
 */

import { interpretVoiceIntent, generateVoiceResponse } from '../../services/geminiService.js';

/**
 * Procesar comando de voz
 * @route POST /api/voice/command
 * @param {Object} req.body.text - Texto del comando de voz
 * @param {Object} req.body.context - Contexto actual (página, rol, estado)
 */
const processVoiceCommand = async (req, res) => {
  try {
    const { text, context = {} } = req.body;

    // 1. Validar input (texto no vacío)
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El texto del comando es requerido',
        ttsResponse: 'No recibí ningún comando. Por favor intenta de nuevo.'
      });
    }

    // 2. Sanitizar comando (eliminar espacios extras, convertir a minúsculas)
    const sanitizedText = text.trim().toLowerCase();

    // Validar longitud razonable
    if (sanitizedText.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'El comando es demasiado largo',
        ttsResponse: 'El comando es muy largo. Por favor sé más conciso.'
      });
    }

    // 3. Llamar a interpretVoiceIntent() con contexto
    const interpretation = await interpretVoiceIntent(sanitizedText, context);

    // 4. Si confidence < 0.5, sugerir "ayuda"
    if (interpretation.confidence < 0.5) {
      return res.status(200).json({
        success: true,
        intent: interpretation.intent,
        params: interpretation.params,
        confidence: interpretation.confidence,
        ttsResponse: `No estoy seguro de lo que quieres hacer. ${interpretation.response} Di "ayuda" para ver los comandos disponibles.`,
        language: interpretation.language,
        suggestion: 'help'
      });
    }

    // 5. Retornar interpretación exitosa
    res.status(200).json({
      success: true,
      intent: interpretation.intent,
      params: interpretation.params,
      confidence: interpretation.confidence,
      ttsResponse: interpretation.response,
      language: interpretation.language
    });

  } catch (error) {
    console.error('Error in processVoiceCommand:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar comando de voz',
      ttsResponse: 'Lo siento, hubo un error al procesar tu comando. Por favor intenta de nuevo.'
    });
  }
};

/**
 * Obtener comandos disponibles según contexto
 * @route GET /api/voice/capabilities
 * @param {String} req.query.context - Contexto actual (home, catalog, cart, etc.)
 * @param {String} req.query.userRole - Rol del usuario (visitante, cliente, admin)
 */
const getVoiceCapabilities = async (req, res) => {
  try {
    const context = req.query.context || 'home';
    const userRole = req.query.userRole || 'visitante';

    // Comandos globales (disponibles en todas las páginas)
    const globalCommands = [
      { command: 'ayuda', description: 'Mostrar comandos disponibles', example: 'ayuda' },
      { command: 'activar asistente', description: 'Activar control por voz', example: 'activar asistente' },
      { command: 'desactivar asistente', description: 'Desactivar control por voz', example: 'desactivar asistente' },
      { command: 'ir a inicio', description: 'Ir a la página principal', example: 'ir a inicio' },
      { command: 'ir a carta', description: 'Ver el menú de productos', example: 'ir a carta' },
      { command: 'ir al carrito', description: 'Ver tu carrito de compras', example: 'ir al carrito' },
      { command: 'leer página', description: 'Leer contenido de la página actual', example: 'leer página' },
      { command: 'subir', description: 'Desplazar hacia arriba', example: 'subir' },
      { command: 'bajar', description: 'Desplazar hacia abajo', example: 'bajar' },
      { command: 'repetir', description: 'Repetir último mensaje', example: 'repetir' }
    ];

    // Comandos contextuales según la página actual
    const contextualCommands = getContextualCommands(context);

    // Comandos específicos por rol
    const roleSpecificCommands = getRoleCommands(userRole);

    res.status(200).json({
      success: true,
      context,
      userRole,
      commands: {
        global: globalCommands,
        contextual: contextualCommands,
        roleSpecific: roleSpecificCommands
      }
    });

  } catch (error) {
    console.error('Error in getVoiceCapabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener capacidades de voz'
    });
  }
};

/**
 * Obtener comandos contextuales según la página
 */
function getContextualCommands(context) {
  const contextCommands = {
    home: [
      { command: 'reserva tu pedido', description: 'Ir a la carta para ordenar', example: 'reserva tu pedido' },
      { command: 'menú', description: 'Ver el menú de productos', example: 'menú' },
      { command: 'abrir rappi', description: 'Abrir enlace de Rappi', example: 'abrir rappi' },
      { command: 'abrir whatsapp', description: 'Contactar por WhatsApp', example: 'abrir whatsapp' },
      { command: 'quiénes somos', description: 'Ver información de Famiglia', example: 'quiénes somos' },
      { command: 'ubicación', description: 'Ver ubicación en el mapa', example: 'ubicación' }
    ],
    catalog: [
      { command: 'buscar [producto]', description: 'Buscar un producto específico', example: 'buscar pan dulce' },
      { command: 'filtrar por [categoría]', description: 'Filtrar productos por categoría', example: 'filtrar por panadería' },
      { command: 'agregar al carrito', description: 'Agregar producto actual al carrito', example: 'agregar al carrito' },
      { command: 'siguiente producto', description: 'Ver siguiente producto', example: 'siguiente producto' },
      { command: 'anterior producto', description: 'Ver producto anterior', example: 'anterior producto' },
      { command: 'leer productos', description: 'Leer lista de productos', example: 'leer productos' },
      { command: 'limpiar filtros', description: 'Quitar todos los filtros', example: 'limpiar filtros' }
    ],
    cart: [
      { command: 'leer carrito', description: 'Leer contenido del carrito', example: 'leer carrito' },
      { command: 'cuánto debo', description: 'Escuchar el total a pagar', example: 'cuánto debo' },
      { command: 'eliminar producto [número]', description: 'Eliminar producto del carrito', example: 'eliminar producto 1' },
      { command: 'vaciar carrito', description: 'Eliminar todos los productos', example: 'vaciar carrito' },
      { command: 'proceder al pago', description: 'Ir a la página de pago', example: 'proceder al pago' }
    ],
    checkout: [
      { command: 'llenar [campo]', description: 'Dictar valor de un campo', example: 'llenar nombre con Juan' },
      { command: 'seleccionar [opción]', description: 'Seleccionar una opción', example: 'seleccionar efectivo' },
      { command: 'finalizar compra', description: 'Confirmar y enviar pedido', example: 'finalizar compra' }
    ],
    test: [
      { command: 'solicitar test', description: 'Comenzar test de preferencias', example: 'solicitar test' },
      { command: 'ver resultado', description: 'Ver recomendación del test', example: 'ver resultado' },
      { command: 'hacer nuevo test', description: 'Reiniciar el test', example: 'hacer nuevo test' }
    ],
    profile: [
      { command: 'ver información', description: 'Leer datos del perfil', example: 'ver información' },
      { command: 'historial de pedidos', description: 'Ver pedidos anteriores', example: 'historial de pedidos' },
      { command: 'historial de tests', description: 'Ver tests realizados', example: 'historial de tests' }
    ]
  };

  return contextCommands[context] || [];
}

/**
 * Obtener comandos específicos por rol
 */
function getRoleCommands(userRole) {
  const roleCommands = {
    visitante: [
      { command: 'iniciar sesión', description: 'Ir al login', example: 'iniciar sesión' },
      { command: 'registrarme', description: 'Crear una cuenta', example: 'registrarme' }
    ],
    cliente: [
      { command: 'ir a mi perfil', description: 'Ver tu perfil', example: 'ir a mi perfil' },
      { command: 'cerrar sesión', description: 'Salir de tu cuenta', example: 'cerrar sesión' }
    ],
    admin: [
      { command: 'ver productos', description: 'Panel de administración de productos', example: 'ver productos' },
      { command: 'ver pedidos', description: 'Panel de pedidos', example: 'ver pedidos' },
      { command: 'buscar pedido [ticket]', description: 'Buscar pedido por número', example: 'buscar pedido 12345' }
    ]
  };

  return roleCommands[userRole] || [];
}

/**
 * Describir página actual
 * @route POST /api/voice/describe
 * @param {String} req.body.page - Nombre de la página actual
 * @param {Object} req.body.context - Contexto adicional (productos, items en carrito, etc.)
 */
const describeCurrentPage = async (req, res) => {
  try {
    const { page, context = {} } = req.body;

    if (!page) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la página es requerido',
        ttsResponse: 'No puedo describir la página sin saber cuál es.'
      });
    }

    // Mapeo de descripciones por página
    const pageDescriptions = {
      home: {
        title: 'Página Principal',
        description: 'Estás en la página principal de Famiglia, tu panadería favorita.',
        details: 'Aquí puedes reservar tu pedido, ver el menú, o contactarnos por WhatsApp o Rappi.'
      },
      catalog: {
        title: 'Carta de Productos',
        description: `Estás en la carta de productos. ${context.productCount ? `Hay ${context.productCount} productos disponibles.` : 'Puedes ver todos nuestros productos.'}`,
        details: 'Puedes buscar productos, filtrar por categoría, o agregar productos al carrito.'
      },
      cart: {
        title: 'Carrito de Compras',
        description: `Estás en tu carrito de compras. ${context.cartItemsCount ? `Tienes ${context.cartItemsCount} productos en el carrito.` : 'Tu carrito está vacío.'}`,
        details: context.cartTotal ? `El total de tu pedido es ${context.cartTotal} pesos. Puedes proceder al pago cuando estés listo.` : 'Agrega productos desde la carta para comenzar tu pedido.'
      },
      checkout: {
        title: 'Proceso de Pago',
        description: 'Estás en la página de pago.',
        details: 'Completa tus datos y selecciona tu método de pago para finalizar tu compra.'
      },
      payment: {
        title: 'Pago',
        description: 'Estás en la página de pago.',
        details: 'Ingresa los detalles de tu pago para completar tu pedido.'
      },
      test: {
        title: 'Test de Preferencias',
        description: 'Estás en el test de preferencias.',
        details: 'Responde las preguntas para recibir una recomendación personalizada de productos.'
      },
      profile: {
        title: 'Mi Perfil',
        description: 'Estás en tu perfil de usuario.',
        details: 'Aquí puedes ver tu información, historial de pedidos y tests de preferencias.'
      },
      login: {
        title: 'Iniciar Sesión',
        description: 'Estás en la página de inicio de sesión.',
        details: 'Ingresa tu correo y contraseña para acceder a tu cuenta.'
      },
      register: {
        title: 'Registro',
        description: 'Estás en la página de registro.',
        details: 'Completa el formulario para crear tu cuenta en Famiglia.'
      },
      admin: {
        title: 'Panel de Administración',
        description: 'Estás en el panel de administración.',
        details: 'Aquí puedes gestionar productos, categorías y pedidos.'
      }
    };

    const pageInfo = pageDescriptions[page] || {
      title: 'Página Desconocida',
      description: `Estás en la página ${page}.`,
      details: 'Di "ayuda" para ver los comandos disponibles.'
    };

    // Construir respuesta TTS
    const ttsResponse = `${pageInfo.description} ${pageInfo.details}`;

    res.status(200).json({
      success: true,
      page,
      title: pageInfo.title,
      description: pageInfo.description,
      details: pageInfo.details,
      ttsResponse
    });

  } catch (error) {
    console.error('Error in describeCurrentPage:', error);
    res.status(500).json({
      success: false,
      error: 'Error al describir página',
      ttsResponse: 'No puedo describir la página en este momento. Por favor intenta de nuevo.'
    });
  }
};

export {
  processVoiceCommand,
  getVoiceCapabilities,
  describeCurrentPage
};
