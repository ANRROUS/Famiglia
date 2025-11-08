/**
 * Servicio de Mapeo de Selectores CSS
 * Proporciona selectores precisos y con fallbacks para todas las páginas de Famiglia
 * Basado en SELECTORS_REFERENCE.md
 */

/**
 * Selectores del Header (Común a todas las páginas)
 */
export const HEADER_SELECTORS = {
  // Logo
  logo: 'img[alt="Panadería Famiglia"]',

  // Navegación principal
  nav: {
    home: 'span:has-text("Home")',
    carta: 'span:has-text("Carta")',
    delivery: 'span:has-text("Delivery")',
    test: 'span:has-text("Test")',
    contacto: 'span:has-text("Contáctanos")',
  },

  // Autenticación (usuario NO autenticado)
  auth: {
    registrarse: 'button:has-text("Registrarse"), .MuiButton-contained',
    iniciarSesion: 'button:has-text("Iniciar Sesión"), .MuiButton-outlined',
  },

  // Usuario autenticado
  user: {
    carrito: 'button:has(svg[data-testid="ShoppingCartIcon"])',
    carritoIcon: 'svg[data-testid="ShoppingCartIcon"]',
    perfil: 'button:has(svg[data-testid="AccountCircleIcon"])',
    perfilIcon: 'svg[data-testid="AccountCircleIcon"]',
    nombreUsuario: 'span.text-sm.font-medium.text-[#8b3e3e]',
    cerrarSesion: 'button:has-text("Cerrar Sesión")',
  },

  // Menú móvil
  mobile: {
    hamburgerIcon: 'button:has(svg[data-testid="MenuIcon"])',
    closeIcon: 'button:has(svg[data-testid="CloseIcon"])',
    menu: '.flex.flex-col.items-center.bg-white',
  },
};

/**
 * Selectores del Login Form (Modal)
 */
export const LOGIN_FORM_SELECTORS = {
  // Campos
  correo: 'input[name="correo"], input[type="email"]',
  contraseña: 'input[name="contraseña"], input[type="password"]',

  // Botones
  ingresar: 'button[type="submit"]:has-text("Ingresar")',
  registrarseLink: 'span:has-text("Regístrate aquí")',

  // Mensajes de error
  errorGeneral: '.bg-red-100.border-red-400.text-red-700',
  errorCampo: '.text-red-600.text-sm.mt-1',

  // Placeholders (para referencia)
  placeholders: {
    correo: 'Ej. maria@gmail.com',
    contraseña: '********',
  },
};

/**
 * Selectores del Register Form (Modal)
 */
export const REGISTER_FORM_SELECTORS = {
  // Campos personales
  nombre: 'input[name="nombre"]',
  apellidoPaterno: 'input[name="apellido_paterno"]',
  apellidoMaterno: 'input[name="apellido_materno"]',
  correo: 'input[name="correo"], input[type="email"]',
  telefono: 'input[name="telefono"], input[type="tel"]',
  dni: 'input[name="dni"]',

  // Contraseñas
  contraseña: 'input[name="contraseña"], input[type="password"]',
  confirmarContraseña: 'input[name="confirmar_contraseña"]',

  // Checkbox términos
  checkboxTerminos: 'input[type="checkbox"][name="terminos"]',
  labelTerminos: 'label:has-text("Acepto los términos y condiciones")',

  // Botones
  registrarse: 'button[type="submit"]:has-text("Registrarse")',
  iniciarSesionLink: 'span:has-text("Inicia sesión aquí")',
};

/**
 * Selectores del Carrito (/cart)
 */
export const CART_SELECTORS = {
  // Selector de cantidad (QuantitySelector component)
  quantity: {
    decrease: 'button:has(svg[data-testid="RemoveIcon"])',
    display: '.MuiTypography-root',
    increase: 'button:has(svg[data-testid="AddIcon"])',
    container: '.flex.items-center.border-[#ff9c9c].rounded-lg.w-70px.h-32px',
  },

  // Botón eliminar
  eliminar: 'button:has(svg[data-testid="CloseIcon"])',

  // Resumen
  total: '.text-2xl.font-bold',
  procederAlPago: 'button:has-text("Proceder al pago")',

  // Estado vacío
  vacio: {
    icon: 'svg[data-testid="SentimentDissatisfiedOutlinedIcon"]',
    mensaje: '.text-2xl.font-bold.text-[#8b3e3e]',
  },

  // Helpers para productos específicos (por índice)
  getProductCard: (index) => `.MuiCard-root:nth-of-type(${index})`,
  getProductIncrease: (index) => `.MuiCard-root:nth-of-type(${index}) button:has(svg[data-testid="AddIcon"])`,
  getProductDecrease: (index) => `.MuiCard-root:nth-of-type(${index}) button:has(svg[data-testid="RemoveIcon"])`,
  getProductRemove: (index) => `.MuiCard-root:nth-of-type(${index}) button:has(svg[data-testid="CloseIcon"])`,

  // Helper con data-item-id (si está disponible)
  getItemById: (itemId) => `[data-item-id="${itemId}"]`,
};

/**
 * Selectores de Payment Page (/payment)
 */
export const PAYMENT_SELECTORS = {
  // Información de delivery
  delivery: {
    direccion: 'input[name="direccion"]',
    telefono: 'input[name="telefono"]',
    referencia: 'input[name="referencia"]',
  },

  // Métodos de pago (radio buttons)
  metodoPago: {
    yape: 'input[type="radio"][name="metodoPago"][value="yape"]',
    tarjeta: 'input[type="radio"][name="metodoPago"][value="tarjeta"]',
    efectivo: 'input[type="radio"][name="metodoPago"][value="efectivo"]',
  },

  // Campos condicionales (Yape/Transferencia)
  yapeFields: {
    numeroYape: 'input[name="numeroYape"]',
    codigoConfirmacion: 'input[name="codigo"]',
  },

  // Resumen de pedido
  resumen: {
    subtotal: '.text-lg:contains("Subtotal")',
    delivery: '.text-lg:contains("Delivery")',
    total: '.text-2xl.font-bold',
  },

  // Botones de acción
  volverAlCarrito: 'button:has-text("Volver al carrito")',
  confirmarPedido: 'button[type="submit"]:has-text("Confirmar")',
};

/**
 * Selectores de Profile Page (/profile)
 */
export const PROFILE_SELECTORS = {
  // Tabs de navegación
  tabs: {
    misDatos: 'button:has-text("Mis Datos")',
    misPedidos: 'button:has-text("Mis Pedidos")',
    cambiarContraseña: 'button:has-text("Cambiar Contraseña")',
  },

  // Tab 1: Mis Datos
  misDatos: {
    nombre: 'input[name="nombre"]',
    apellidoPaterno: 'input[name="apellido_paterno"]',
    apellidoMaterno: 'input[name="apellido_materno"]',
    email: 'input[name="email"], input[type="email"]',
    telefono: 'input[name="telefono"]',
    dni: 'input[name="dni"]', // disabled
    guardarCambios: 'button:has-text("Guardar Cambios")',
    cancelar: 'button:has-text("Cancelar")',
  },

  // Tab 2: Mis Pedidos
  misPedidos: {
    listaPedidos: '.MuiPaper-root',
    fecha: '.text-sm.text-gray-600',
    total: '.text-lg.font-bold',
    estado: '.px-3.py-1.rounded-full',
    verDetalles: 'button:has-text("Ver Detalles")',
  },

  // Tab 3: Cambiar Contraseña
  cambiarContraseña: {
    contraseñaActual: 'input[name="currentPassword"]',
    nuevaContraseña: 'input[name="newPassword"]',
    confirmarContraseña: 'input[name="confirmPassword"]',
    cambiar: 'button[type="submit"]:has-text("Cambiar Contraseña")',
  },
};

/**
 * Selectores del Catalog Page (/carta)
 */
export const CATALOG_SELECTORS = {
  // Buscador
  search: {
    input: '#search-products, input[name="search"], input[data-testid="search-input"], input[aria-label="Buscar productos"]',
    inputId: '#search-products',
  },

  // Filtros (Sidebar)
  filtros: {
    categoriaButton: (nombre) => `button:has-text("${nombre}")`,
    categoriaChip: '.MuiChip-root',
    precioSlider: '.MuiSlider-root',
    precioMin: '.text-[#6b2c2c]:first-of-type',
    precioMax: '.text-[#6b2c2c]:last-of-type',
  },

  // Grid de productos
  productos: {
    card: '.MuiCard-root',
    imagen: 'img',
    nombre: '.text-lg.font-semibold',
    precio: '.text-xl.font-bold',
    agregar: 'button:has-text("Agregar")',
    firstCard: '.MuiCard-root:first-of-type',
  },

  // Ordenamiento
  ordenar: {
    select: 'select[name="ordenar"]',
    priceAsc: 'price-asc',
    priceDesc: 'price-desc',
    name: 'name',
  },
};

/**
 * Selectores del Footer (Común a todas las páginas)
 */
export const FOOTER_SELECTORS = {
  // Links importantes (usar text= para auto-scroll en Playwright)
  terminos: 'text="Términos y condiciones"',
  privacidad: 'text="Política de privacidad"',
  libroReclamaciones: 'text="Libro de Reclamaciones"',
  quienesSomos: 'text="Quiénes somos"',
  ubicacion: 'text="Ubicación"',
  contacto: 'text="Contacto"',

  // Redes sociales
  redes: {
    facebook: 'svg[data-testid="FacebookIcon"]',
    instagram: 'svg[data-testid="InstagramIcon"]',
    whatsapp: 'svg[data-testid="WhatsAppIcon"]',
  },
};

/**
 * Generadores de selectores dinámicos
 */
export const SELECTOR_GENERATORS = {
  /**
   * Genera selector para producto en catálogo por posición
   */
  productByIndex: (index) => `.MuiCard-root:nth-of-type(${index + 1})`,

  /**
   * Genera selector para botón "Agregar" de producto específico
   */
  addToCartByIndex: (index) => `.MuiCard-root:nth-of-type(${index + 1}) button:has-text("Agregar")`,

  /**
   * Genera selector para input por placeholder
   */
  inputByPlaceholder: (placeholder) => `input[placeholder="${placeholder}"]`,

  /**
   * Genera selector para botón por texto con fallbacks
   */
  buttonByText: (text) => `button:has-text("${text}"), [role="button"]:has-text("${text}")`,

  /**
   * Genera selector para link por texto (con auto-scroll)
   */
  linkByText: (text) => `text="${text}"`,
};

/**
 * Utilidades para construcción de selectores con fallbacks
 */
export const SELECTOR_UTILS = {
  /**
   * Combina múltiples selectores con coma (Playwright intentará cada uno)
   */
  withFallbacks: (...selectors) => selectors.filter(Boolean).join(', '),

  /**
   * Genera selector CSS seguro escapando caracteres especiales
   */
  escapeCss: (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&'),

  /**
   * Genera selector de atributo data-*
   */
  dataAttr: (name, value) => `[data-${name}="${value}"]`,
};

/**
 * Mapeo de rutas de la aplicación
 */
export const ROUTES = {
  home: '/',
  carta: '/carta',
  delivery: '/delivery',
  contacto: '/contact-us',
  cart: '/cart',
  profile: '/profile',
  payment: '/payment',
  quienesSomos: '/quienes-somos',
  terminos: '/terminos',
  privacidad: '/privacidad',
  complaints: '/complaints',
};

/**
 * Obtiene el selector apropiado según el contexto
 * @param {string} element - Nombre del elemento (ej: "search.input", "cart.increase")
 * @param {string} currentUrl - URL actual para determinar contexto
 * @returns {string} Selector CSS apropiado
 */
export function getSelector(element, currentUrl = '/') {
  const parts = element.split('.');

  // Determinar de qué sección obtener el selector
  if (currentUrl.includes('/cart')) {
    if (parts[0] === 'cart') {
      return getNestedValue(CART_SELECTORS, parts.slice(1));
    }
  } else if (currentUrl.includes('/payment')) {
    if (parts[0] === 'payment') {
      return getNestedValue(PAYMENT_SELECTORS, parts.slice(1));
    }
  } else if (currentUrl.includes('/profile')) {
    if (parts[0] === 'profile') {
      return getNestedValue(PROFILE_SELECTORS, parts.slice(1));
    }
  } else if (currentUrl.includes('/carta')) {
    if (parts[0] === 'catalog') {
      return getNestedValue(CATALOG_SELECTORS, parts.slice(1));
    }
  }

  // Header y footer están en todas las páginas
  if (parts[0] === 'header') {
    return getNestedValue(HEADER_SELECTORS, parts.slice(1));
  } else if (parts[0] === 'footer') {
    return getNestedValue(FOOTER_SELECTORS, parts.slice(1));
  }

  return null;
}

/**
 * Helper para obtener valor anidado de objeto
 */
function getNestedValue(obj, path) {
  return path.reduce((acc, key) => acc?.[key], obj);
}

/**
 * Exportar todo como objeto único para fácil acceso
 */
export default {
  HEADER_SELECTORS,
  LOGIN_FORM_SELECTORS,
  REGISTER_FORM_SELECTORS,
  CART_SELECTORS,
  PAYMENT_SELECTORS,
  PROFILE_SELECTORS,
  CATALOG_SELECTORS,
  FOOTER_SELECTORS,
  SELECTOR_GENERATORS,
  SELECTOR_UTILS,
  ROUTES,
  getSelector,
};
