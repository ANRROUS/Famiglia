/**
 * Helper para generación inteligente de selectores
 * Basado en SELECTORS_REFERENCE.md
 */

import SELECTORS from '../services/selectorMappingService.js';

/**
 * Genera selector apropiado según intención y contexto
 * @param {string} intent - Intención del usuario ("search", "login", "addToCart", etc)
 * @param {Object} context - Contexto actual (url, page, userAuth, etc)
 * @param {Object} params - Parámetros adicionales
 * @returns {string} Selector CSS con fallbacks
 */
export function getSelectorForIntent(intent, context = {}, params = {}) {
  const { currentUrl = '/', isAuthenticated = false } = context;

  switch (intent) {
    // BÚSQUEDA
    case 'search':
    case 'buscar':
      return SELECTORS.CATALOG_SELECTORS.search.input;

    // AUTENTICACIÓN
    case 'login':
    case 'iniciarSesion':
      return isAuthenticated
        ? null // Ya está autenticado
        : SELECTORS.HEADER_SELECTORS.auth.iniciarSesion;

    case 'register':
    case 'registrarse':
      return SELECTORS.HEADER_SELECTORS.auth.registrarse;

    case 'logout':
    case 'cerrarSesion':
      return SELECTORS.HEADER_SELECTORS.user.cerrarSesion;

    // NAVEGACIÓN
    case 'goToHome':
    case 'irAlInicio':
      return SELECTORS.HEADER_SELECTORS.nav.home;

    case 'goToCatalog':
    case 'irAlCatalogo':
      return SELECTORS.HEADER_SELECTORS.nav.carta;

    case 'goToCart':
    case 'irAlCarrito':
      return SELECTORS.HEADER_SELECTORS.user.carrito;

    case 'goToProfile':
    case 'irAlPerfil':
      return SELECTORS.HEADER_SELECTORS.user.perfil;

    case 'goToContact':
    case 'irAContacto':
      return SELECTORS.HEADER_SELECTORS.nav.contacto;

    // CARRITO
    case 'increaseQuantity':
    case 'aumentarCantidad':
      if (params.itemId) {
        return `${SELECTORS.CART_SELECTORS.getItemById(params.itemId)} ${SELECTORS.CART_SELECTORS.quantity.increase}`;
      }
      return SELECTORS.CART_SELECTORS.quantity.increase;

    case 'decreaseQuantity':
    case 'disminuirCantidad':
      if (params.itemId) {
        return `${SELECTORS.CART_SELECTORS.getItemById(params.itemId)} ${SELECTORS.CART_SELECTORS.quantity.decrease}`;
      }
      return SELECTORS.CART_SELECTORS.quantity.decrease;

    case 'removeFromCart':
    case 'eliminarDelCarrito':
      if (params.itemId) {
        return `${SELECTORS.CART_SELECTORS.getItemById(params.itemId)} ${SELECTORS.CART_SELECTORS.eliminar}`;
      }
      return SELECTORS.CART_SELECTORS.eliminar;

    case 'proceedToPayment':
    case 'procederAlPago':
      return SELECTORS.CART_SELECTORS.procederAlPago;

    // CATÁLOGO
    case 'addToCart':
    case 'agregarAlCarrito':
      if (params.productIndex !== undefined) {
        return SELECTORS.SELECTOR_GENERATORS.addToCartByIndex(params.productIndex);
      }
      return SELECTORS.CATALOG_SELECTORS.productos.agregar;

    case 'filterByCategory':
    case 'filtrarPorCategoria':
      if (params.category) {
        return SELECTORS.CATALOG_SELECTORS.filtros.categoriaButton(params.category);
      }
      return null;

    // PAGO
    case 'fillAddress':
    case 'llenarDireccion':
      return SELECTORS.PAYMENT_SELECTORS.delivery.direccion;

    case 'selectPaymentMethod':
    case 'seleccionarMetodoPago':
      if (params.method === 'yape') {
        return SELECTORS.PAYMENT_SELECTORS.metodoPago.yape;
      } else if (params.method === 'tarjeta') {
        return SELECTORS.PAYMENT_SELECTORS.metodoPago.tarjeta;
      } else if (params.method === 'efectivo') {
        return SELECTORS.PAYMENT_SELECTORS.metodoPago.efectivo;
      }
      return null;

    case 'confirmPayment':
    case 'confirmarPago':
      return SELECTORS.PAYMENT_SELECTORS.confirmarPedido;

    // FOOTER (requieren auto-scroll)
    case 'goToTerms':
    case 'irATerminos':
      return SELECTORS.FOOTER_SELECTORS.terminos; // usa text= para auto-scroll

    case 'goToPrivacy':
    case 'irAPrivacidad':
      return SELECTORS.FOOTER_SELECTORS.privacidad;

    case 'goToComplaints':
    case 'irAReclamaciones':
      return SELECTORS.FOOTER_SELECTORS.libroReclamaciones;

    case 'goToAbout':
    case 'irAQuienesSomos':
      return SELECTORS.FOOTER_SELECTORS.quienesSomos;

    // FORMULARIOS
    case 'fillEmail':
    case 'llenarEmail':
      if (currentUrl.includes('/profile')) {
        return SELECTORS.PROFILE_SELECTORS.misDatos.email;
      } else if (currentUrl.includes('/login') || context.loginModalOpen) {
        return SELECTORS.LOGIN_FORM_SELECTORS.correo;
      }
      return SELECTORS.SELECTOR_UTILS.withFallbacks(
        'input[type="email"]',
        'input[name="email"]',
        'input[name="correo"]'
      );

    case 'fillPassword':
    case 'llenarContraseña':
      return SELECTORS.SELECTOR_UTILS.withFallbacks(
        'input[type="password"]',
        'input[name="password"]',
        'input[name="contraseña"]'
      );

    case 'submitForm':
    case 'enviarFormulario':
      return 'button[type="submit"]';

    default:
      console.warn(`[Selector Helper] Intención no reconocida: ${intent}`);
      return null;
  }
}

/**
 * Obtiene múltiples selectores con prioridad (fallbacks)
 * @param {string} intent - Intención
 * @param {Object} context - Contexto
 * @param {Object} params - Parámetros
 * @returns {Array<string>} Array de selectores ordenados por prioridad
 */
export function getSelectorsWithFallbacks(intent, context, params) {
  const primary = getSelectorForIntent(intent, context, params);

  if (!primary) return [];

  // Si el selector ya tiene comas (múltiples fallbacks), retornar como array
  if (primary.includes(',')) {
    return primary.split(',').map(s => s.trim());
  }

  return [primary];
}

/**
 * Valida si un selector es apropiado para el contexto actual
 * @param {string} selector - Selector CSS
 * @param {Object} context - Contexto actual
 * @returns {boolean} True si es válido
 */
export function isValidSelectorForContext(selector, context) {
  const { currentUrl = '/', pathname = '/', isAuthenticated = false } = context;

  if (!selector) {
    console.warn('[Selector Helper] Selector vacío o null');
    return false;
  }

  // Para selectores que son rutas (intenciones de navegación), siempre son válidas
  // porque la navegación misma maneja la autenticación
  const navigationPaths = ['/', '/carta', '/cart', '/profile', '/contact-us', '/payment'];
  if (navigationPaths.includes(selector)) {
    return true; // Las rutas siempre son válidas, el navegador manejará la autenticación
  }

  // Selectores que requieren autenticación (solo clicks en elementos, no navegación)
  const authRequiredSelectors = [
    SELECTORS.HEADER_SELECTORS?.user?.carrito,
    SELECTORS.HEADER_SELECTORS?.user?.perfil,
    SELECTORS.HEADER_SELECTORS?.user?.cerrarSesion,
  ].filter(Boolean); // Filtrar valores undefined

  // Solo bloquear si es un selector de elemento (no una ruta) y requiere auth
  const isElementSelector = selector.includes('[') || selector.includes('.') || selector.includes('#') || selector.includes(':');
  
  if (isElementSelector && !isAuthenticated && authRequiredSelectors.includes(selector)) {
    console.warn('[Selector Helper] Selector requiere autenticación:', selector);
    return false;
  }

  // Los demás selectores son válidos
  return true;
}

/**
 * Genera selector dinámico basado en texto visible
 * Útil cuando Gemini detecta texto en el screenshot
 * @param {string} text - Texto visible en el elemento
 * @param {string} type - Tipo de elemento ('button', 'link', 'input')
 * @returns {string} Selector generado
 */
export function generateSelectorByText(text, type = 'button') {
  switch (type) {
    case 'button':
      return SELECTORS.SELECTOR_GENERATORS.buttonByText(text);
    case 'link':
      return SELECTORS.SELECTOR_GENERATORS.linkByText(text);
    case 'input':
      return SELECTORS.SELECTOR_GENERATORS.inputByPlaceholder(text);
    default:
      return `text="${text}"`;
  }
}

/**
 * Mapeo de comandos en español a intenciones
 */
const INTENT_MAPPING = {
  // Búsqueda
  'busca': 'search',
  'buscar': 'search',
  'encuentra': 'search',
  'encontrar': 'search',
  'quiero': 'search',
  'dame': 'search',
  'muéstrame': 'search',
  'hay': 'search',
  'tienen': 'search',

  // Navegación
  'inicio': 'goToHome',
  'home': 'goToHome',
  'página principal': 'goToHome',
  'catálogo': 'goToCatalog',
  'carta': 'goToCatalog',
  'productos': 'goToCatalog',
  'carrito': 'goToCart',
  'mi carrito': 'goToCart',
  'perfil': 'goToProfile',
  'mi perfil': 'goToProfile',
  'contacto': 'goToContact',
  'contáctanos': 'goToContact',

  // Autenticación
  'iniciar sesión': 'login',
  'login': 'login',
  'ingresar': 'login',
  'entrar': 'login',
  'registrarse': 'register',
  'registro': 'register',
  'crear cuenta': 'register',
  'cerrar sesión': 'logout',
  'salir': 'logout',
  'logout': 'logout',

  // Acciones de carrito
  'agregar al carrito': 'addToCart',
  'añadir al carrito': 'addToCart',
  'comprar': 'addToCart',
  'aumentar': 'increaseQuantity',
  'aumentar cantidad': 'increaseQuantity',
  'más': 'increaseQuantity',
  'disminuir': 'decreaseQuantity',
  'disminuir cantidad': 'decreaseQuantity',
  'menos': 'decreaseQuantity',
  'eliminar': 'removeFromCart',
  'quitar': 'removeFromCart',
  'proceder al pago': 'proceedToPayment',
  'pagar': 'proceedToPayment',

  // Footer
  'términos': 'goToTerms',
  'términos y condiciones': 'goToTerms',
  'privacidad': 'goToPrivacy',
  'política de privacidad': 'goToPrivacy',
  'libro de reclamaciones': 'goToComplaints',
  'reclamaciones': 'goToComplaints',
  'quiénes somos': 'goToAbout',
  'sobre nosotros': 'goToAbout',
};

/**
 * Detecta intención desde comando en lenguaje natural
 * @param {string} command - Comando del usuario
 * @returns {string|null} Intención detectada
 */
export function detectIntent(command) {
  const lowerCommand = command.toLowerCase().trim();

  // Búsqueda exacta
  if (INTENT_MAPPING[lowerCommand]) {
    return INTENT_MAPPING[lowerCommand];
  }

  // Búsqueda parcial (comando contiene la clave)
  for (const [key, intent] of Object.entries(INTENT_MAPPING)) {
    if (lowerCommand.includes(key)) {
      return intent;
    }
  }

  return null;
}

/**
 * Exportar todo
 */
export default {
  getSelectorForIntent,
  getSelectorsWithFallbacks,
  isValidSelectorForContext,
  generateSelectorByText,
  detectIntent,
  SELECTORS, // Re-exportar selectores para conveniencia
};
