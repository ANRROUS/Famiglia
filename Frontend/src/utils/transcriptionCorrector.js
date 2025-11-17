/**
 * Corrector de transcripciones de voz
 * DESHABILITADO: Ya NO hace conversiones, solo normaliza el texto
 * Gemini procesa el comando completo sin filtros intermedios
 */

/**
 * Diccionario de correcciones comunes - DESHABILITADO
 * Se eliminaron todas las conversiones para que Gemini procese texto RAW
 */
const commonCorrections = {
  // ============================================
  // NAVEGACIÓN - QUIÉNES SOMOS (casos críticos)
  // ============================================
  'a quién estamos': 'a quiénes somos',
  'a quienes somos': 'a quiénes somos',
  'a quién es somos': 'a quiénes somos',
  'quién estamos': 'quiénes somos',
  'quiénes estamos': 'quiénes somos',
  'a quién somos': 'a quiénes somos',
  'quien somos': 'quiénes somos',
  'a quien somos': 'a quiénes somos',
  'quienes somos': 'quiénes somos',
  'quien es somos': 'quiénes somos',
  'a quien es somos': 'a quiénes somos',
  
  // ============================================
  // PÁGINAS PRINCIPALES
  // ============================================
  // Inicio
  'inicio': 'inicio',
  'home': 'inicio',
  'principal': 'inicio',
  'página principal': 'inicio',
  
  // Carta/Catálogo
  'carta': 'carta',
  'catálogo': 'carta',
  'catalogo': 'carta',
  'menú': 'carta',
  'menu': 'carta',
  'productos': 'carta',
  'producto': 'carta',
  
  // Carrito
  'carrito': 'carrito',
  'carro': 'carrito',
  'mi carrito': 'carrito',
  'compras': 'carrito',
  
  // Contacto
  'contacto': 'contacto',
  'contactanos': 'contacto',
  'contáctanos': 'contacto',
  'contactar': 'contacto',
  'escribir': 'contacto',
  'mensaje': 'contacto',
  
  // Perfil
  'perfil': 'perfil',
  'mi perfil': 'perfil',
  'cuenta': 'perfil',
  'mi cuenta': 'perfil',
  'datos': 'perfil',
  'información': 'perfil',
  
  // Delivery
  'delivery': 'delivery',
  'entrega': 'delivery',
  'entregas': 'delivery',
  'envío': 'delivery',
  'envio': 'delivery',
  'repartir': 'delivery',
  
  // Quejas
  'quejas': 'quejas',
  'queja': 'quejas',
  'reclamo': 'quejas',
  'reclamos': 'quejas',
  'reclamaciones': 'quejas',
  'complaint': 'quejas',
  'complaints': 'quejas',
  
  // Términos y Privacidad
  'términos': 'términos',
  'terminos': 'términos',
  'términos y condiciones': 'términos',
  'privacidad': 'privacidad',
  'política de privacidad': 'privacidad',
  'politica de privacidad': 'privacidad',
  
  // Pago
  'pago': 'pago',
  'payment': 'pago',
  'pagar': 'pago',
  'checkout': 'pago',
  'finalizar compra': 'pago',
  
  // Confirmación
  'confirmación': 'confirmación',
  'confirmacion': 'confirmación',
  'pedido confirmado': 'confirmación',
  'orden confirmada': 'confirmación',
  
  // ============================================
  // COMANDOS DE CLICK (variaciones comunes)
  // ============================================
  'da clic': 'da click',
  'da clip': 'da click',
  'da clik': 'da click',
  'dar click': 'da click',
  'dar clic': 'da click',
  
  'has clic': 'haz click',
  'haz clic': 'haz click',
  'haz clip': 'haz click',
  'has click': 'haz click',
  'hacer click': 'haz click',
  'hacer clic': 'haz click',
  
  'click en': 'click en',
  'clic en': 'click en',
  'clip en': 'click en',
  
  // ============================================
  // ACCIONES CON CARRITO
  // ============================================
  'agrega': 'agrega',
  'agregar': 'agrega',
  'añade': 'agrega',
  'añadir': 'agrega',
  'pon': 'agrega',
  'poner': 'agrega',
  'mete': 'agrega',
  'meter': 'agrega',
  
  'elimina': 'elimina',
  'eliminar': 'elimina',
  'quita': 'quita',
  'quitar': 'quita',
  'saca': 'quita',
  'sacar': 'quita',
  'borra': 'elimina',
  'borrar': 'elimina',
  'remueve': 'elimina',
  'remover': 'elimina',
  
  // ============================================
  // BÚSQUEDA Y FILTROS
  // ============================================
  'busca': 'busca',
  'buscar': 'busca',
  'encuentra': 'busca',
  'encontrar': 'busca',
  'búscame': 'busca',
  'buscame': 'busca',
  'filtrar': 'filtra',
  'filtra': 'filtra',
  'mostrar': 'muestra',
  'muestra': 'muestra',
  'muéstrame': 'muestra',
  'muestrame': 'muestra',
  'ver': 've',
  've': 've',
  'dame': 'dame', // Mantener "dame" original (diferente a "muestra")
  // 'dime' se mantiene original - tiene significado conversacional distinto a "muestra"
  
  // ============================================
  // NAVEGACIÓN
  // ============================================
  've a': 've a',
  'ir a': 'ir a',
  'anda a': 'ir a',
  'vaya a': 'ir a',
  'vete a': 've a',
  'abre': 'abre',
  'abrir': 'abre',
  'navega a': 'ir a',
  'navegar a': 'ir a',
  
  // Volver/Regresar
  'volver': 'volver',
  'regresar': 'volver',
  'regresa': 'volver',
  'vuelve': 'volver',
  'atrás': 'atrás',
  'atras': 'atrás',
  'back': 'atrás',
  
  // ============================================
  // SESIÓN
  // ============================================
  'cierra sesión': 'cierra sesión',
  'cerrar sesión': 'cierra sesión',
  'salir': 'cierra sesión',
  'logout': 'cierra sesión',
  'desconectar': 'cierra sesión',
  'desconectarse': 'cierra sesión',
  
  'iniciar sesión': 'iniciar sesión',
  'inicia sesión': 'iniciar sesión',
  'login': 'iniciar sesión',
  'entrar': 'iniciar sesión',
  'conectar': 'iniciar sesión',
  
  'registrar': 'registrar',
  'registro': 'registrar',
  'registrarse': 'registrar',
  'crear cuenta': 'registrar',
  'nueva cuenta': 'registrar',
  
  // ============================================
  // PRODUCTOS (nombres comunes)
  // ============================================
  'torta': 'torta',
  'pan': 'pan',
  'panes': 'pan',
  'galleta': 'galleta',
  'galletas': 'galleta',
  'dona': 'dona',
  'donas': 'dona',
  'donut': 'dona',
  'donuts': 'dona',
  'empanada': 'empanada',
  'empanadas': 'empanada',
  'pastel': 'pastel',
  'pasteles': 'pastel',
  'cake': 'pastel',
  'cakes': 'pastel',
  'croissant': 'croissant',
  'croasan': 'croissant',
  'magdalena': 'magdalena',
  'magdalenas': 'magdalena',
  'muffin': 'muffin',
  'muffins': 'muffin',
  'cookie': 'galleta',
  'cookies': 'galleta',
  'brownie': 'brownie',
  'brownies': 'brownie',
  'tartaleta': 'tartaleta',
  'tartaletas': 'tartaleta',
  'tarta': 'tarta',
  'tartas': 'tarta',
  
  // ============================================
  // CATEGORÍAS
  // ============================================
  'dulces': 'dulces',
  'dulce': 'dulces',
  'salados': 'salados',
  'salado': 'salados',
  'especiales': 'especiales',
  'especial': 'especiales',
  'vegano': 'vegano',
  'veganos': 'vegano',
  'sin gluten': 'sin gluten',
  'gluten free': 'sin gluten',
  
  // ============================================
  // CANTIDADES Y NÚMEROS
  // ============================================
  'uno': '1',
  'una': '1',
  'dos': '2',
  'tres': '3',
  'cuatro': '4',
  'cinco': '5',
  'seis': '6',
  'siete': '7',
  'ocho': '8',
  'nueve': '9',
  'diez': '10',
  
  // ============================================
  // ACCIONES GENERALES
  // ============================================
  'ayuda': 'ayuda',
  'help': 'ayuda',
  'cancelar': 'cancelar',
  'cancel': 'cancelar',
  'detener': 'detener',
  'stop': 'detener',
  'para': 'detener',
  'cerrar': 'cerrar',
  'close': 'cerrar',
  'confirmar': 'confirmar',
  'confirm': 'confirmar',
  'aceptar': 'aceptar',
  'ok': 'aceptar',
  'sí': 'sí',
  'si': 'sí',
  'no': 'no',
};

/**
 * Patrones de regex para correcciones más complejas
 */
const regexPatterns = [
  // ============================================
  // QUIÉNES SOMOS - Todas las variaciones críticas
  // ============================================
  {
    pattern: /\b(a\s+)?quié?n\s+(es\s+)?somos\b/gi,
    replacement: 'a quiénes somos'
  },
  {
    pattern: /\b(a\s+)?quié?n(es)?\s+esta?(mos|n)\b/gi,
    replacement: 'a quiénes somos'
  },
  {
    pattern: /\bquié?n\s+somos\b/gi,
    replacement: 'quiénes somos'
  },
  
  // ============================================
  // DA/HAZ CLICK + QUIÉNES SOMOS
  // ============================================
  {
    pattern: /(da|has|haz)\s+(clic|clip|click|clik)\s+(a|en)\s+(quié?n|quienes)\s+(estamos|somos|es\s+somos)/gi,
    replacement: 'da click a quiénes somos'
  },
  
  // ============================================
  // NORMALIZAR "DA/HAZ CLICK A/EN [página]"
  // ============================================
  {
    pattern: /(da|has|haz)\s+(clic|clip|click|clik)\s+(a|en)\s+(inicio|carta|carrito|contacto|perfil|delivery|quejas|términos|privacidad|pago)/gi,
    replacement: (match, action, clickVar, prep, page) => {
      return `da click ${prep} ${page.toLowerCase()}`;
    }
  },
  
  // ============================================
  // NORMALIZAR SOLO "DA/HAZ CLICK"
  // ============================================
  {
    pattern: /(da|has|haz)\s+(clic|clip|click|clik)/gi,
    replacement: 'da click'
  },
  
  // ============================================
  // VE/IR A [página]
  // ============================================
  {
    pattern: /(ve|ir|vete|anda|navega)\s+a\s+(inicio|home|carta|catálogo|carrito|contacto|perfil|delivery|quejas|pago)/gi,
    replacement: (match, action, page) => {
      const normalizedPage = page.toLowerCase() === 'home' ? 'inicio' : page.toLowerCase();
      return `ir a ${normalizedPage}`;
    }
  },
  
  // ============================================
  // ABRE [página]
  // ============================================
  {
    pattern: /abre\s+(inicio|carta|catálogo|carrito|contacto|perfil|delivery|quejas|pago)/gi,
    replacement: (match, page) => {
      return `abre ${page.toLowerCase()}`;
    }
  },
  
  // ============================================
  // BUSCA/MUESTRA [producto]
  // ============================================
  {
    pattern: /(busca|buscar|encuentra|muestra|muéstrame|ver|dame)\s+(tortas?|panes?|galletas?|donas?|empanadas?|pasteles?|croissants?|brownies?)/gi,
    replacement: (match, action, producto) => {
      const normalizedAction = action.toLowerCase().includes('busca') || action.toLowerCase().includes('encuentra') ? 'busca' : 'muestra';
      return `${normalizedAction} ${producto.toLowerCase()}`;
    }
  },
  
  // ============================================
  // AGREGA/AÑADE [cantidad] [producto]
  // ============================================
  {
    pattern: /(agrega|agregar|añade|añadir|pon|poner|mete)\s+(uno|una|dos|tres|cuatro|cinco|1|2|3|4|5)?\s*(tortas?|panes?|galletas?|donas?|empanadas?|pasteles?)/gi,
    replacement: (match, action, cantidad, producto) => {
      return `agrega ${cantidad || ''} ${producto.toLowerCase()}`.trim();
    }
  },
  
  // ============================================
  // ELIMINA/QUITA [producto] DEL CARRITO
  // ============================================
  {
    pattern: /(elimina|eliminar|quita|quitar|saca|sacar|borra|remueve)\s+(tortas?|panes?|galletas?|donas?|empanadas?|pasteles?|el\s+producto|esto)(\s+del\s+carrito)?/gi,
    replacement: (match, action, producto) => {
      return `elimina ${producto.toLowerCase()}`;
    }
  },
  
  // ============================================
  // FILTRAR POR CATEGORÍA
  // ============================================
  {
    pattern: /(filtra|filtrar|muestra|muéstrame)\s+(productos?\s+)?(dulces?|salados?|veganos?|sin\s+gluten|especiales?)/gi,
    replacement: (match, action, extra, categoria) => {
      return `filtra ${categoria.toLowerCase()}`;
    }
  },
  
  // ============================================
  // SESIÓN (iniciar, cerrar)
  // ============================================
  {
    pattern: /(cierra|cerrar|salir|logout|desconectar)\s+(sesión|la\s+sesión)?/gi,
    replacement: 'cierra sesión'
  },
  {
    pattern: /(inicia|iniciar|login|entrar|conectar)\s+(sesión|la\s+sesión)?/gi,
    replacement: 'iniciar sesión'
  },
  
  // ============================================
  // CONFIRMAR/CANCELAR ACCIONES
  // ============================================
  {
    pattern: /(confirma|confirmar|acepta|aceptar)\s+(el\s+)?(pedido|compra|pago|orden)?/gi,
    replacement: 'confirmar'
  },
  {
    pattern: /(cancela|cancelar|detener|stop|para)\s+(el\s+)?(pedido|compra|pago|orden)?/gi,
    replacement: 'cancelar'
  },
  
  // ============================================
  // VOLVER/ATRÁS
  // ============================================
  {
    pattern: /(volver|regresar|regresa|vuelve|atrás|atras|back)/gi,
    replacement: 'atrás'
  },
  
  // ============================================
  // NÚMEROS A TEXTO
  // ============================================
  {
    pattern: /\b1\b/g,
    replacement: 'uno'
  },
  {
    pattern: /\b2\b/g,
    replacement: 'dos'
  },
  {
    pattern: /\b3\b/g,
    replacement: 'tres'
  },
  {
    pattern: /\b4\b/g,
    replacement: 'cuatro'
  },
  {
    pattern: /\b5\b/g,
    replacement: 'cinco'
  },
];

/**
 * Corrige una transcripción aplicando reglas y diccionario
 * @param {string} transcript - Texto transcrito original
 * @returns {string} - Texto corregido
 */
export function correctTranscription(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return transcript;
  }

  let corrected = transcript.toLowerCase().trim();
  const corrections = [];
  
  console.log('%c[Transcription Corrector] Original:', 'color: #888; font-weight: bold', transcript);

  // 1. Aplicar correcciones del diccionario (coincidencia exacta)
  for (const [wrong, correct] of Object.entries(commonCorrections)) {
    if (corrected === wrong || corrected.includes(wrong)) {
      const before = corrected;
      corrected = corrected.replace(new RegExp(wrong, 'gi'), correct);
      if (before !== corrected) {
        corrections.push({ type: 'diccionario', from: wrong, to: correct });
        console.log('%c[Corrección Diccionario]', 'color: #4CAF50', `"${wrong}" → "${correct}"`);
      }
    }
  }

  // 2. Aplicar patrones de regex
  for (const { pattern, replacement } of regexPatterns) {
    if (pattern.test(corrected)) {
      const before = corrected;
      corrected = corrected.replace(pattern, replacement);
      if (before !== corrected) {
        corrections.push({ type: 'regex', from: before, to: corrected });
        console.log('%c[Corrección Regex]', 'color: #2196F3', `"${before}" → "${corrected}"`);
      }
    }
  }

  // 3. Normalizar espacios múltiples
  corrected = corrected.replace(/\s+/g, ' ').trim();

  if (corrected !== transcript.toLowerCase().trim()) {
    console.log(
      '%c[Transcription Corrector] ✓ Resultado final:', 
      'color: #8BC34A; font-weight: bold; font-size: 14px', 
      corrected
    );
    console.log(`%c${corrections.length} corrección(es) aplicada(s)`, 'color: #FF9800; font-weight: bold');
  } else {
    console.log('%c[Transcription Corrector] Sin cambios necesarios', 'color: #9E9E9E');
  }

  return corrected;
}

/**
 * Obtiene la mejor transcripción de múltiples alternativas
 * @param {SpeechRecognitionAlternative[]} alternatives - Array de alternativas
 * @param {Object} context - Contexto actual (página, etc.)
 * @returns {string} - Mejor transcripción
 */
export function getBestAlternative(alternatives, context = {}) {
  if (!alternatives || alternatives.length === 0) {
    return '';
  }

  // Si solo hay una alternativa, usarla
  if (alternatives.length === 1) {
    return alternatives[0].transcript;
  }

  // Palabras clave según el contexto (para scoring de alternativas)
  const contextKeywords = {
    '/': ['inicio', 'home', 'principal', 'bienvenido', 'familia'],
    '/home': ['inicio', 'home', 'principal'],
    '/carta': ['catálogo', 'carta', 'productos', 'menú', 'busca', 'pan', 'torta', 'galleta', 'dona', 'pastel', 'dulce', 'salado'],
    '/cart': ['carrito', 'compra', 'pedido', 'pago', 'elimina', 'quita', 'agrega', 'producto'],
    '/profile': ['perfil', 'cuenta', 'datos', 'sesión', 'información', 'usuario'],
    '/contact-us': ['contacto', 'mensaje', 'escribir', 'email', 'teléfono', 'dirección'],
    '/quienes-somos': ['quiénes', 'somos', 'nosotros', 'familia', 'historia', 'equipo'],
    '/delivery': ['delivery', 'entrega', 'envío', 'repartir', 'domicilio', 'pedido'],
    '/complaints': ['quejas', 'reclamo', 'problema', 'inconveniente', 'sugerencia'],
    '/terminos': ['términos', 'condiciones', 'legal', 'políticas'],
    '/privacidad': ['privacidad', 'datos', 'información', 'protección'],
    '/payment': ['pago', 'tarjeta', 'efectivo', 'confirmar', 'compra'],
    '/order-confirmation': ['confirmación', 'pedido', 'orden', 'gracias', 'éxito'],
    '/catalogo-admin': ['admin', 'administrador', 'productos', 'editar', 'crear'],
    '/pedidos-admin': ['admin', 'pedidos', 'órdenes', 'gestión', 'estado'],
  };

  const currentPath = context.pathname || context.page || '/';
  const relevantKeywords = contextKeywords[currentPath] || [];

  // Evaluar cada alternativa
  const scored = alternatives.map((alt, index) => {
    let score = alt.confidence || 0;
    const text = alt.transcript.toLowerCase();

    // ============================================
    // SUPER BONUS - Casos críticos reportados
    // ============================================
    
    // QUIÉNES SOMOS - Gran bonus (problema común reportado)
    if (text.match(/quié?n(es)?\s+(somos|estamos)/i)) {
      score += 0.5; // Gran bonus
    }

    // DA CLICK - Comando muy común
    if (text.match(/(da|haz)\s+click/i)) {
      score += 0.3;
    }

    // IR A / VE A - Navegación explícita
    if (text.match(/(ir|ve)\s+a\s+/i)) {
      score += 0.3;
    }

    // BUSCA/MUESTRA - Búsqueda de productos
    if (text.match(/(busca|muestra|encuentra)/i)) {
      score += 0.25;
    }

    // AGREGA/ELIMINA - Acciones de carrito
    if (text.match(/(agrega|elimina|quita|añade)/i)) {
      score += 0.25;
    }

    // ============================================
    // BONUS POR CONTEXTO
    // ============================================
    
    // Bonus por palabras clave del contexto actual
    for (const keyword of relevantKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }

    // ============================================
    // BONUS POR COMANDOS COMUNES
    // ============================================
    const commonCommands = [
      'da click', 'haz click',
      'busca', 'muestra', 'encuentra',
      'agrega', 'añade', 'elimina', 'quita',
      'ir a', 've a', 'abre',
      'cierra sesión', 'iniciar sesión',
      'confirmar', 'cancelar',
      'volver', 'atrás'
    ];
    
    for (const cmd of commonCommands) {
      if (text.includes(cmd)) {
        score += 0.15;
      }
    }

    // ============================================
    // BONUS POR PÁGINAS CONOCIDAS
    // ============================================
    const knownPages = [
      'inicio', 'home', 'carta', 'catálogo', 'carrito',
      'contacto', 'perfil', 'delivery', 'quejas',
      'quiénes somos', 'términos', 'privacidad', 'pago'
    ];
    
    for (const page of knownPages) {
      if (text.includes(page)) {
        score += 0.15;
      }
    }

    // ============================================
    // BONUS POR PRODUCTOS CONOCIDOS
    // ============================================
    const knownProducts = [
      'torta', 'pan', 'galleta', 'dona', 'empanada',
      'pastel', 'croissant', 'brownie', 'muffin'
    ];
    
    for (const product of knownProducts) {
      if (text.includes(product)) {
        score += 0.1;
      }
    }

    // ============================================
    // PENALIZACIONES
    // ============================================
    
    // Penalización por ser alternativa menos probable (índice alto)
    score -= index * 0.05;

    // Penalización por transcripciones muy cortas (probablemente incompletas)
    if (text.length < 3) {
      score -= 0.2;
    }

    return { alternative: alt, score, text };
  });

  // Ordenar por score descendente
  scored.sort((a, b) => b.score - a.score);

  // Logging mejorado con colores y formato
  console.log('%c[Best Alternative] Evaluando alternativas:', 'color: #9C27B0; font-weight: bold; font-size: 13px');
  console.table(scored.map((s, i) => ({ 
    '🏆': i === 0 ? '✓' : '',
    'Transcripción': s.text, 
    'Confianza': `${(s.alternative.confidence * 100).toFixed(1)}%`,
    'Score Final': s.score.toFixed(3),
    'Orden': i + 1
  })));

  const winner = scored[0];
  console.log(
    '%c[Best Alternative] ✓ Seleccionada:', 
    'color: #4CAF50; font-weight: bold',
    `"${winner.text}" (score: ${winner.score.toFixed(3)})`
  );

  return winner.alternative.transcript;
}

export default {
  correctTranscription,
  getBestAlternative
};
