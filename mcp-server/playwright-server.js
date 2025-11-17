import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { chromium } from '@playwright/test';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar selectores mapeados
let SELECTORS = null;
try {
  const selectorPath = path.resolve(__dirname, '../Backend/services/selectorMappingService.js');
  // Convertir ruta de Windows a URL file:// para ESM loader
  const selectorUrl = new URL('file:///' + selectorPath.replace(/\\/g, '/'));
  const selectorsModule = await import(selectorUrl.href);
  SELECTORS = selectorsModule.default;
  console.error('[MCP Playwright] ✓ Selectores mapeados cargados');
} catch (error) {
  console.error('[MCP Playwright] ⚠️ No se pudieron cargar selectores mapeados:', error.message);
  SELECTORS = null;
}

/**
 * MCP Playwright Server para Famiglia
 * Servidor que expone herramientas de Playwright para navegación por voz
 * Gemini usa estas herramientas como "manos" para interactuar con la UI
 */

// Estado del navegador
let browser = null;
let context = null;
let page = null;

// Configuración
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const CDP_URL = process.env.CDP_URL || 'http://localhost:9222';
const SLOW_MO = parseInt(process.env.SLOW_MO || '100');

/**
 * Inicializa conexión al navegador del usuario usando CDP
 * Se conecta al navegador donde el usuario ya está navegando
 */
async function initBrowser() {
  if (!browser) {
    const CDP_URL = process.env.CDP_URL || 'http://localhost:9222';

    console.error('[MCP Playwright] Conectando al navegador del usuario via CDP...');
    console.error(`[MCP Playwright] CDP URL: ${CDP_URL}`);

    try {
      // Conectar al navegador existente via Chrome DevTools Protocol
      browser = await chromium.connectOverCDP(CDP_URL);

      // Obtener contextos existentes
      const contexts = browser.contexts();

      if (contexts.length === 0) {
        throw new Error('No hay contextos de navegador disponibles');
      }

      // Usar el primer contexto (el del usuario)
      context = contexts[0];

      // Obtener todas las páginas abiertas
      const pages = context.pages();

      if (pages.length === 0) {
        // Si no hay páginas, crear una nueva
        page = await context.newPage();
        await page.goto(APP_URL);
      } else {
        // Buscar la página de la aplicación (no DevTools)
        // Filtrar páginas que NO sean devtools y que contengan localhost:5173
        const appPages = pages.filter(p => {
          const url = p.url();
          return !url.includes('devtools://') &&
                 !url.includes('chrome://') &&
                 !url.includes('about:blank');
        });

        if (appPages.length > 0) {
          // Preferir la página que sea localhost:5173
          const localPage = appPages.find(p => p.url().includes('localhost:5173'));
          page = localPage || appPages[appPages.length - 1];
        } else {
          // Si todas las páginas son devtools, crear una nueva
          console.error('[MCP Playwright] ⚠️ No se encontró página de aplicación, creando nueva...');
          page = await context.newPage();
          await page.goto(APP_URL);
        }

        console.error(`[MCP Playwright] Conectado a página: ${page.url()}`);
      }

      console.error('[MCP Playwright] ✓ Conectado al navegador del usuario');

    } catch (error) {
      console.error('[MCP Playwright] ✗ Error conectando via CDP:', error.message);
      console.error('[MCP Playwright] Instrucciones:');
      console.error('  1. Abre Chrome/Edge con: --remote-debugging-port=9222');
      console.error('  2. O inicia con: chrome.exe --remote-debugging-port=9222');
      throw error;
    }
  }

  return page;
}

/**
 * Definición de todas las herramientas MCP disponibles
 */
const TOOLS = [
  {
    name: 'navigate',
    description: 'Navega a una URL específica de la aplicación Famiglia',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Ruta relativa (ej: /carta, /cart, /profile, /contact-us)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'click',
    description: 'Hace clic en un elemento de la página',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS o texto del elemento'
        },
        timeout: {
          type: 'number',
          description: 'Timeout en ms (default: 5000)'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'fill',
    description: 'Llena un campo de texto',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS del input'
        },
        text: {
          type: 'string',
          description: 'Texto a escribir'
        }
      },
      required: ['selector', 'text']
    }
  },
  {
    name: 'select',
    description: 'Selecciona una opción de un dropdown',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector del select'
        },
        option: {
          type: 'string',
          description: 'Valor o texto de la opción'
        }
      },
      required: ['selector', 'option']
    }
  },
  {
    name: 'getText',
    description: 'Obtiene el texto de un elemento',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS del elemento'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'getProducts',
    description: 'Obtiene lista de productos visibles en la página actual',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Número máximo de productos (default: 10)'
        }
      }
    }
  },
  {
    name: 'search',
    description: 'Busca productos usando el buscador',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Término de búsqueda'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'filterByCategory',
    description: 'Filtra productos por categoría',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Nombre de la categoría (Pan, Postres, Galletas, etc)'
        }
      },
      required: ['category']
    }
  },
  {
    name: 'filterByPrice',
    description: 'Filtra productos por rango de precio',
    inputSchema: {
      type: 'object',
      properties: {
        min: {
          type: 'number',
          description: 'Precio mínimo'
        },
        max: {
          type: 'number',
          description: 'Precio máximo'
        }
      }
    }
  },
  {
    name: 'sortBy',
    description: 'Ordena productos',
    inputSchema: {
      type: 'object',
      properties: {
        field: {
          type: 'string',
          description: 'Campo por el cual ordenar (price, name, popularity)'
        },
        order: {
          type: 'string',
          description: 'Orden: asc o desc'
        }
      },
      required: ['field', 'order']
    }
  },
  {
    name: 'addToCart',
    description: 'Agrega producto al carrito',
    inputSchema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'ID del producto (opcional si ya está en la página del producto)'
        },
        quantity: {
          type: 'number',
          description: 'Cantidad (default: 1)'
        }
      }
    }
  },
  {
    name: 'updateCartQuantity',
    description: 'Actualiza cantidad de un item en el carrito',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'ID del item en el carrito'
        },
        quantity: {
          type: 'number',
          description: 'Nueva cantidad'
        }
      },
      required: ['itemId', 'quantity']
    }
  },
  {
    name: 'removeFromCart',
    description: 'Elimina un item del carrito',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'ID del item a eliminar'
        }
      },
      required: ['itemId']
    }
  },
  {
    name: 'getCartState',
    description: 'Obtiene el estado actual del carrito',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'checkout',
    description: 'Navega a la página de checkout/pago',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'fillPaymentForm',
    description: 'Llena el formulario de pago',
    inputSchema: {
      type: 'object',
      properties: {
        direccion: {
          type: 'string',
          description: 'Dirección de entrega'
        },
        metodoPago: {
          type: 'string',
          description: 'Método de pago (efectivo o tarjeta)'
        }
      },
      required: ['direccion', 'metodoPago']
    }
  },
  {
    name: 'confirmPayment',
    description: 'Confirma el pago final',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'screenshot',
    description: 'Toma captura de pantalla',
    inputSchema: {
      type: 'object',
      properties: {
        fullPage: {
          type: 'boolean',
          description: 'Capturar página completa (default: false)'
        }
      }
    }
  },
  {
    name: 'wait',
    description: 'Espera un tiempo determinado',
    inputSchema: {
      type: 'object',
      properties: {
        ms: {
          type: 'number',
          description: 'Milisegundos a esperar'
        }
      },
      required: ['ms']
    }
  },
  {
    name: 'waitForSelector',
    description: 'Espera a que aparezca un elemento',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS'
        },
        timeout: {
          type: 'number',
          description: 'Timeout en ms (default: 5000)'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'getPageState',
    description: 'Obtiene estado completo de la página',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'getPageElements',
    description: 'Extrae todos los elementos interactivos de la página actual (botones, links, inputs, etc.) para que Gemini pueda generar selectores dinámicos',
    inputSchema: {
      type: 'object',
      properties: {
        types: {
          type: 'array',
          description: 'Tipos de elementos a extraer (default: ["button", "link", "input", "select"])',
          items: {
            type: 'string',
            enum: ['button', 'link', 'input', 'select', 'textarea', 'all']
          }
        }
      }
    }
  },
  {
    name: 'check',
    description: 'Marca un checkbox (input[type="checkbox"])',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS del checkbox a marcar'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'uncheck',
    description: 'Desmarca un checkbox (input[type="checkbox"])',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS del checkbox a desmarcar'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'selectRadio',
    description: 'Selecciona un radio button por valor o label',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Selector CSS del radio button o su contenedor'
        },
        value: {
          type: 'string',
          description: 'Valor del radio button a seleccionar (opcional)'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'fillForm',
    description: 'Llena múltiples campos de un formulario simultáneamente',
    inputSchema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          description: 'Array de objetos con selector y text para cada campo',
          items: {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              text: { type: 'string' }
            },
            required: ['selector', 'text']
          }
        }
      },
      required: ['fields']
    }
  }
];

/**
 * Implementación de cada herramienta
 */
const toolHandlers = {
  // NAVEGACIÓN
  async navigate({ url }) {
    const p = await initBrowser();
    const fullUrl = url.startsWith('http') ? url : `${APP_URL}${url}`;

    // NO usar page.goto() - esto recarga toda la página y pierde el estado de React
    // En su lugar, usar el router de React via JavaScript
    
    // Si la URL es completa (con http), navegar normalmente
    if (url.startsWith('http')) {
      await p.goto(fullUrl, { waitUntil: 'networkidle' });
    } else {
      // Para rutas relativas, usar React Router sin recargar
      // Ejecutar código JS que llame a window.__navigateViaReactRouter
      await p.evaluate((route) => {
        // Usar React Router sin recargar la página
        // El frontend debe exponer esta función en window
        if (window.__navigateViaReactRouter) {
          window.__navigateViaReactRouter(route);
        } else {
          // Fallback: usar history API (menos óptimo pero funciona)
          window.history.pushState({}, '', route);
          // Disparar evento popstate para que React Router detecte el cambio
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }, url);
      
      // Esperar a que el DOM se actualice
      await p.waitForTimeout(500);
    }

    return {
      success: true,
      currentUrl: p.url(),
      title: await p.title()
    };
  },

  // INTERACCIÓN CON ELEMENTOS
  async click({ selector, timeout = 5000 }) {
    const p = await initBrowser();

    // Usar selectores mapeados si están disponibles y el selector no es específico
    let effectiveSelector = selector;
    
    // Si el selector es genérico, intentar enriquecerlo con selectores mapeados
    if (SELECTORS && selector && !selector.includes('[') && !selector.includes(':has')) {
      // Intentar mapear texto simple a selector más robusto
      const selectorText = selector.toLowerCase();
      
      if (selectorText.includes('iniciar sesión') || selectorText === 'login') {
        effectiveSelector = SELECTORS.HEADER_SELECTORS?.auth?.iniciarSesion || selector;
      } else if (selectorText.includes('registrarse') || selectorText === 'register') {
        effectiveSelector = SELECTORS.HEADER_SELECTORS?.auth?.registrarse || selector;
      } else if (selectorText.includes('cerrar sesión') || selectorText === 'logout') {
        effectiveSelector = SELECTORS.HEADER_SELECTORS?.user?.cerrarSesion || selector;
      } else if (selectorText.includes('carrito') || selectorText === 'cart') {
        effectiveSelector = SELECTORS.HEADER_SELECTORS?.user?.carrito || selector;
      } else if (selectorText.includes('perfil') || selectorText === 'profile') {
        effectiveSelector = SELECTORS.HEADER_SELECTORS?.user?.perfil || selector;
      } else if (selectorText.includes('continuar')) {
        effectiveSelector = SELECTORS.CART_SELECTORS?.continuar || selector;
      }
      
      console.error(`[click] Selector enriquecido: ${selector} → ${effectiveSelector}`);
    }

    // Estrategias de click (en orden de prioridad)
    const strategies = [
      effectiveSelector,                    // Selector original o enriquecido
      `text="${selector}"`,                 // Texto exacto con comillas
      `text=${selector}`,                   // Texto exacto sin comillas
      `text=/.*${selector}.*/i`,            // Texto parcial (case-insensitive)
      `[role="button"]:has-text("${selector}")`, // Role button con texto
      `button:has-text("${selector}")`,     // Button con texto
      `[data-testid*="${selector.toLowerCase().replace(/\s+/g, '-')}"]`, // data-testid
    ];

    let lastError;
    for (const strategy of strategies) {
      try {
        await p.click(strategy, { timeout: 2000 }); // Timeout más corto por estrategia
        console.error(`[click] ✅ Click exitoso con estrategia: ${strategy}`);
        return { success: true, clicked: strategy };
      } catch (error) {
        lastError = error;
        console.error(`[click] ❌ Estrategia falló: ${strategy}`);
        continue;
      }
    }

    throw new Error(`No se pudo hacer clic en: ${selector} (probadas ${strategies.length} estrategias)`);
  },

  async fill({ selector, text }) {
    const p = await initBrowser();
    await p.fill(selector, text);

    return {
      success: true,
      filled: selector,
      value: text
    };
  },

  async select({ selector, option }) {
    const p = await initBrowser();
    await p.selectOption(selector, option);

    return {
      success: true,
      selected: option
    };
  },

  async getText({ selector }) {
    const p = await initBrowser();
    const text = await p.textContent(selector);

    return {
      success: true,
      text: text ? text.trim() : ''
    };
  },

  // PRODUCTOS
  async getProducts({ limit = 10 }) {
    const p = await initBrowser();

    const products = await p.evaluate((lim) => {
      const productCards = Array.from(document.querySelectorAll('.product-card, [data-product], .producto'));

      return productCards.slice(0, lim).map((card, idx) => {
        // Intentar extraer información del producto
        const nameEl = card.querySelector('.product-name, .nombre, h3, h4');
        const priceEl = card.querySelector('.product-price, .precio, .price');
        const imgEl = card.querySelector('img');

        return {
          id: card.dataset.productId || card.dataset.id || `product-${idx}`,
          name: nameEl ? nameEl.textContent.trim() : 'Producto sin nombre',
          price: priceEl ? parseFloat(priceEl.textContent.replace(/[^\d.]/g, '')) : 0,
          image: imgEl ? imgEl.src : null,
          inStock: !card.classList.contains('out-of-stock') && !card.classList.contains('agotado')
        };
      });
    }, limit);

    return {
      success: true,
      products,
      count: products.length
    };
  },

  async search({ query }) {
    const p = await initBrowser();

    // Usar selectores mapeados si están disponibles
    const searchSelector = SELECTORS?.CATALOG_SELECTORS?.search?.input ||
      '#search-products, input[name="search"], input[data-testid="search-input"], input[aria-label="Buscar productos"]';

    console.error(`[search] Usando selector: ${searchSelector}`);

    try {
      // Intentar llenar el campo de búsqueda
      await p.fill(searchSelector, query);

      // Esperar a que se apliquen los filtros (Material-UI filtra automáticamente en onChange)
      await p.waitForTimeout(500);

      // Verificar si hay resultados usando selectores mapeados
      const productSelector = SELECTORS?.CATALOG_SELECTORS?.productos?.card || '.MuiCard-root';
      const productsVisible = await p.$$(productSelector);

      console.error(`[search] ✓ Búsqueda exitosa. Productos encontrados: ${productsVisible.length}`);

      return {
        success: true,
        query,
        resultsLoaded: true,
        productsFound: productsVisible.length
      };
    } catch (error) {
      console.error(`[search] ✗ Error en búsqueda:`, error.message);

      // Fallback: listar inputs disponibles para debugging
      try {
        const allInputs = await p.$$('input');
        const inputsInfo = [];
        for (const input of allInputs.slice(0, 5)) {
          const attrs = await input.evaluate(el => ({
            type: el.type,
            name: el.name,
            placeholder: el.placeholder,
            id: el.id,
            class: el.className
          }));
          inputsInfo.push(JSON.stringify(attrs));
        }
        console.error(`[search] Inputs disponibles: ${inputsInfo.join(', ')}`);
      } catch (e) {}

      throw new Error(`No se pudo realizar la búsqueda: ${error.message}`);
    }
  },

  async filterByCategory({ category }) {
    const p = await initBrowser();

    // Generar selector usando helper o fallback
    const categorySelector = SELECTORS?.CATALOG_SELECTORS?.filtros?.categoriaButton
      ? SELECTORS.CATALOG_SELECTORS.filtros.categoriaButton(category)
      : `button:has-text("${category}")`;

    console.error(`[filterByCategory] Filtrando por: ${category}`);
    console.error(`[filterByCategory] Selector: ${categorySelector}`);

    // Intentar hacer clic en el botón de categoría
    const fallbackSelectors = [
      categorySelector,
      `[data-category="${category}"]`,
      `a:has-text("${category}")`,
      `.category-${category.toLowerCase()}`
    ];

    for (const selector of fallbackSelectors) {
      try {
        await p.click(selector, { timeout: 2000 });
        await p.waitForTimeout(500);
        
        console.error(`[filterByCategory] ✓ Filtro aplicado con selector: ${selector}`);
        
        return {
          success: true,
          category,
          filtered: true,
          selector
        };
      } catch (e) {
        continue;
      }
    }

    console.error(`[filterByCategory] ✗ No se encontró la categoría: ${category}`);
    throw new Error(`No se encontró la categoría: ${category}`);
  },

  async filterByPrice({ minPrice, maxPrice }) {
    const p = await initBrowser();

    // Usar minPrice y maxPrice en lugar de min y max
    const min = minPrice !== undefined ? minPrice : 0;
    const max = maxPrice !== undefined ? maxPrice : 100;

    console.error(`[MCP Playwright] Filtrando precios: ${min} - ${max}`);

    // El slider de MUI es complejo, mejor usar evaluate para cambiar el state directamente
    try {
      await p.evaluate(([minVal, maxVal]) => {
        // Buscar el slider de MUI en el DOM
        const slider = document.querySelector('.MuiSlider-root');

        if (slider) {
          // Disparar evento de cambio manualmente simulando interacción del usuario
          // MUI Slider tiene dos thumbs (min y max)
          const thumbs = slider.querySelectorAll('.MuiSlider-thumb');

          if (thumbs.length === 2) {
            // Crear y disparar eventos de cambio
            const changeEvent = new Event('change', { bubbles: true });

            // Simular arrastre del slider
            // El componente FiltroPrecio escucha onChange
            // Buscar el componente React y actualizar directamente

            // Alternativa: Disparar evento personalizado que React escucha
            window.dispatchEvent(new CustomEvent('setPriceRange', {
              detail: { min: minVal, max: maxVal }
            }));
          }
        }

        // Otra alternativa: buscar inputs ocultos del slider
        const inputs = document.querySelectorAll('input[type="hidden"]');
        inputs.forEach(input => {
          if (input.getAttribute('aria-label')?.includes('Minimum price')) {
            input.value = minVal;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (input.getAttribute('aria-label')?.includes('Maximum price')) {
            input.value = maxVal;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        console.log(`[Price Filter] Valores establecidos: ${minVal} - ${maxVal}`);
      }, [min, max]);

      // Esperar a que se aplique el filtro
      await p.waitForTimeout(1000);

      console.error('[MCP Playwright] ✓ Filtro de precio aplicado');

      return {
        success: true,
        minPrice: min,
        maxPrice: max,
        filtered: true
      };
    } catch (error) {
      console.error('[MCP Playwright] Error filtrando por precio:', error);
      throw error;
    }
  },

  async sortBy({ field, order }) {
    const p = await initBrowser();

    // Buscar selector de ordenamiento
    const sortValue = `${field}-${order}`;

    try {
      await p.selectOption('select[name="sortBy"], select[name="ordenar"]', sortValue);
    } catch (e) {
      // Intentar con botones
      await p.click(`button[data-sort="${sortValue}"]`);
    }

    await p.waitForTimeout(500);

    return {
      success: true,
      field,
      order,
      sorted: true
    };
  },

  // CARRITO
  async addToCart({ productId, quantity = 1 }) {
    const p = await initBrowser();

    // Si hay cantidad > 1, llenar el input de cantidad
    if (quantity > 1) {
      const quantitySelectors = [
        'input[name="cantidad"]',
        'input[name="quantity"]',
        'input[type="number"]'
      ];

      for (const selector of quantitySelectors) {
        try {
          const input = await p.$(selector);
          if (input) {
            await input.fill(quantity.toString());
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Hacer clic en "Agregar al carrito" usando selectores mapeados
    const addButtonSelector = SELECTORS?.CATALOG_SELECTORS?.productos?.agregar ||
      'button:has-text("Agregar al carrito"), button:has-text("Agregar"), button:has-text("Añadir al carrito")';
    
    console.error(`[addToCart] Usando selector: ${addButtonSelector}`);

    try {
      await p.click(addButtonSelector, { timeout: 3000 });
      await p.waitForTimeout(500);

      console.error('[addToCart] ✓ Producto agregado al carrito');

      return {
        success: true,
        productId,
        quantity,
        addedToCart: true
      };
    } catch (error) {
      console.error('[addToCart] ✗ Error agregando al carrito:', error.message);
      throw new Error('No se encontró el botón para agregar al carrito');
    }
  },

  async updateCartQuantity({ itemId, quantity }) {
    const p = await initBrowser();

    try {
      // Opción 1: Intentar con input directo (menos común en esta app)
      const input = await p.$(`[data-item-id="${itemId}"] input[type="number"]`);

      if (input) {
        await input.fill(quantity.toString());
        await p.waitForTimeout(500);
        console.error(`[MCP Playwright] ✓ Cantidad actualizada via input: ${quantity}`);

        return {
          success: true,
          itemId,
          newQuantity: quantity,
          method: 'input'
        };
      }

      // Opción 2: Usar botones + y - (patrón de esta app)
      // Obtener cantidad actual
      const currentQuantity = await p.evaluate((id) => {
        const quantityText = document.querySelector(`[data-item-id="${id}"] .MuiTypography-root`);
        return quantityText ? parseInt(quantityText.textContent) : 1;
      }, itemId);

      console.error(`[MCP Playwright] Cantidad actual: ${currentQuantity}, objetivo: ${quantity}`);

      const difference = quantity - currentQuantity;

      if (difference > 0) {
        // Aumentar: hacer clic en botón "+"
        const plusButton = `[data-item-id="${itemId}"] button:has(svg[data-testid="AddIcon"])`;
        for (let i = 0; i < difference; i++) {
          await p.click(plusButton);
          await p.waitForTimeout(300);
        }
        console.error(`[MCP Playwright] ✓ Cantidad aumentada ${difference} veces`);
      } else if (difference < 0) {
        // Disminuir: hacer clic en botón "-"
        const minusButton = `[data-item-id="${itemId}"] button:has(svg[data-testid="RemoveIcon"])`;
        for (let i = 0; i < Math.abs(difference); i++) {
          await p.click(minusButton);
          await p.waitForTimeout(300);
        }
        console.error(`[MCP Playwright] ✓ Cantidad disminuida ${Math.abs(difference)} veces`);
      } else {
        console.error(`[MCP Playwright] ℹ Cantidad ya es ${quantity}`);
      }

      return {
        success: true,
        itemId,
        newQuantity: quantity,
        method: 'buttons',
        clicks: Math.abs(difference)
      };

    } catch (error) {
      console.error('[MCP Playwright] Error actualizando cantidad:', error);
      throw error;
    }
  },

  async removeFromCart({ itemId }) {
    const p = await initBrowser();

    // Buscar botón de eliminar (CloseIcon en esta app)
    const removeSelectors = [
      `[data-item-id="${itemId}"] button:has(svg[data-testid="CloseIcon"])`, // MUI CloseIcon
      `[data-item-id="${itemId}"] button[aria-label="delete"]`,
      `[data-item-id="${itemId}"] button[aria-label="remove"]`,
      `[data-item-id="${itemId}"] button:has-text("Eliminar")`,
      `[data-item-id="${itemId}"] .remove-item`,
      `button[data-remove-item="${itemId}"]`
    ];

    for (const selector of removeSelectors) {
      try {
        await p.click(selector, { timeout: 2000 });
        await p.waitForTimeout(500);

        console.error(`[MCP Playwright] ✓ Item eliminado del carrito: ${itemId}`);

        return {
          success: true,
          itemId,
          removed: true,
          selector
        };
      } catch (e) {
        continue;
      }
    }

    throw new Error(`No se pudo eliminar el item: ${itemId}`);
  },

  async getCartState() {
    const p = await initBrowser();

    const cartState = await p.evaluate(() => {
      // Intentar obtener del badge del carrito
      const badge = document.querySelector('.cart-badge, .cart-count, [data-cart-count]');
      const totalEl = document.querySelector('.cart-total, .total-price');

      return {
        itemCount: badge ? parseInt(badge.textContent) : 0,
        total: totalEl ? parseFloat(totalEl.textContent.replace(/[^\d.]/g, '')) : 0,
        url: window.location.pathname
      };
    });

    return {
      success: true,
      ...cartState
    };
  },

  async checkout() {
    const p = await initBrowser();

    // Ir a la página del carrito primero
    await p.goto(`${APP_URL}/cart`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);

    // Hacer clic en "Proceder al pago" usando selectores mapeados
    const checkoutSelector = SELECTORS?.CART_SELECTORS?.procederAlPago ||
      'button:has-text("Proceder al pago")';

    console.error(`[checkout] Usando selector: ${checkoutSelector}`);

    const fallbackSelectors = [
      checkoutSelector,
      'button:has-text("Pagar")',
      'a[href="/payment"]',
      '.checkout-button'
    ];

    for (const selector of fallbackSelectors) {
      try {
        await p.click(selector, { timeout: 2000 });
        await p.waitForTimeout(1000);

        console.error('[checkout] ✓ Navegado a checkout');

        return {
          success: true,
          currentUrl: p.url(),
          navigatedToCheckout: true
        };
      } catch (e) {
        continue;
      }
    }

    console.error('[checkout] ✗ No se encontró el botón de checkout');
    throw new Error('No se encontró el botón de checkout');
  },

  async fillPaymentForm({ direccion, metodoPago }) {
    const p = await initBrowser();

    // Llenar dirección usando selectores mapeados
    const addressSelector = SELECTORS?.PAYMENT_SELECTORS?.delivery?.direccion ||
      'input[name="direccion"], textarea[name="direccion"], input[name="address"]';

    console.error(`[fillPaymentForm] Llenando dirección: ${direccion}`);
    console.error(`[fillPaymentForm] Selector dirección: ${addressSelector}`);

    const addressSelectors = addressSelector.split(',').map(s => s.trim());

    for (const selector of addressSelectors) {
      try {
        const input = await p.$(selector);
        if (input) {
          await input.fill(direccion);
          console.error(`[fillPaymentForm] ✓ Dirección llenada con: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Seleccionar método de pago usando selectores mapeados
    let paymentMethodSelector;
    if (SELECTORS?.PAYMENT_SELECTORS?.metodoPago) {
      paymentMethodSelector = SELECTORS.PAYMENT_SELECTORS.metodoPago[metodoPago];
    }
    
    if (!paymentMethodSelector) {
      paymentMethodSelector = `input[value="${metodoPago}"]`;
    }

    console.error(`[fillPaymentForm] Método de pago: ${metodoPago}`);
    console.error(`[fillPaymentForm] Selector método: ${paymentMethodSelector}`);

    const paymentSelectors = [
      paymentMethodSelector,
      `button:has-text("${metodoPago}")`,
      `[data-payment="${metodoPago}"]`
    ];

    for (const selector of paymentSelectors) {
      try {
        await p.click(selector, { timeout: 2000 });
        console.error(`[fillPaymentForm] ✓ Método de pago seleccionado: ${metodoPago}`);
        break;
      } catch (e) {
        continue;
      }
    }

    await p.waitForTimeout(500);

    console.error('[fillPaymentForm] ✓ Formulario de pago llenado');

    return {
      success: true,
      direccion,
      metodoPago,
      formFilled: true
    };
  },

  async confirmPayment() {
    const p = await initBrowser();

    // Hacer clic en confirmar pago
    const confirmSelectors = [
      'button:has-text("Confirmar pago")',
      'button:has-text("Confirmar")',
      'button[type="submit"]',
      '.confirm-payment'
    ];

    for (const selector of confirmSelectors) {
      try {
        await p.click(selector, { timeout: 2000 });
        await p.waitForTimeout(2000);

        // Intentar extraer número de orden
        const pageText = await p.textContent('body');
        const orderMatch = pageText.match(/ORD-\d+-\d+|Pedido #\d+/);

        return {
          success: true,
          orderId: orderMatch ? orderMatch[0] : 'unknown',
          paymentConfirmed: true
        };
      } catch (e) {
        continue;
      }
    }

    throw new Error('No se pudo confirmar el pago');
  },

  // UTILIDADES
  async screenshot({ fullPage = false }) {
    const p = await initBrowser();
    const screenshot = await p.screenshot({
      fullPage,
      encoding: 'base64'
    });

    return {
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
      fullPage
    };
  },

  async wait({ ms }) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return {
      success: true,
      waited: ms
    };
  },

  async waitForSelector({ selector, timeout = 5000 }) {
    const p = await initBrowser();

    try {
      await p.waitForSelector(selector, { timeout });
      return {
        success: true,
        found: true,
        selector
      };
    } catch (e) {
      return {
        success: false,
        found: false,
        selector,
        error: 'Timeout esperando elemento'
      };
    }
  },

  async getPageState() {
    const p = await initBrowser();

    const state = await p.evaluate(() => {
      // Detectar si está autenticado
      const isAuth = !!document.querySelector('.user-menu, .user-profile, [data-user-authenticated]');

      // Obtener items en carrito
      const cartBadge = document.querySelector('.cart-badge, .cart-count');
      const cartCount = cartBadge ? parseInt(cartBadge.textContent) : 0;

      return {
        url: window.location.href,
        pathname: window.location.pathname,
        title: document.title,
        isAuthenticated: isAuth,
        cartItemCount: cartCount,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    return {
      success: true,
      ...state
    };
  },

  async getPageElements({ types = ['button', 'link', 'input', 'select'] }) {
    const p = await initBrowser();

    const elements = await p.evaluate((typesToExtract) => {
      const results = {
        buttons: [],
        links: [],
        inputs: [],
        selects: [],
        textareas: []
      };

      const shouldExtract = (type) => typesToExtract.includes(type) || typesToExtract.includes('all');

      // Extraer botones
      if (shouldExtract('button')) {
        const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
        results.buttons = Array.from(buttons).map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || btn.value || '',
          id: btn.id || null,
          className: btn.className || '',
          ariaLabel: btn.getAttribute('aria-label') || null,
          type: btn.type || 'button',
          visible: btn.offsetParent !== null,
          disabled: btn.disabled || false,
          innerHTML: btn.innerHTML.substring(0, 100) // Limitar para no enviar demasiado
        })).filter(b => b.text || b.ariaLabel); // Solo botones con texto o aria-label
      }

      // Extraer links
      if (shouldExtract('link')) {
        const links = document.querySelectorAll('a');
        results.links = Array.from(links).map((link, index) => ({
          index,
          text: link.textContent?.trim() || '',
          href: link.href || '',
          id: link.id || null,
          className: link.className || '',
          ariaLabel: link.getAttribute('aria-label') || null,
          visible: link.offsetParent !== null
        })).filter(l => l.text || l.ariaLabel);
      }

      // Extraer inputs
      if (shouldExtract('input')) {
        const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea');
        results.inputs = Array.from(inputs).map((input, index) => ({
          index,
          type: input.type || 'text',
          name: input.name || null,
          id: input.id || null,
          placeholder: input.placeholder || null,
          ariaLabel: input.getAttribute('aria-label') || null,
          className: input.className || '',
          value: input.type === 'password' ? '***' : (input.value || ''),
          visible: input.offsetParent !== null,
          disabled: input.disabled || false
        }));
      }

      // Extraer selects
      if (shouldExtract('select')) {
        const selects = document.querySelectorAll('select');
        results.selects = Array.from(selects).map((select, index) => ({
          index,
          name: select.name || null,
          id: select.id || null,
          className: select.className || '',
          options: Array.from(select.options).map(opt => ({
            text: opt.text,
            value: opt.value
          })),
          selectedIndex: select.selectedIndex,
          visible: select.offsetParent !== null
        }));
      }

      return results;
    }, types);

    // Contar elementos
    const totalElements =
      elements.buttons.length +
      elements.links.length +
      elements.inputs.length +
      elements.selects.length +
      elements.textareas.length;

    return {
      success: true,
      totalElements,
      elements,
      timestamp: new Date().toISOString()
    };
  },

  // NUEVAS HERRAMIENTAS

  async check({ selector }) {
    const p = await initBrowser();

    try {
      const checkbox = await p.$(selector);
      if (!checkbox) {
        throw new Error(`No se encontró el checkbox: ${selector}`);
      }

      // Verificar si ya está marcado
      const isChecked = await checkbox.isChecked();

      if (!isChecked) {
        await checkbox.check();
        console.error(`[MCP Playwright] ✓ Checkbox marcado: ${selector}`);
      } else {
        console.error(`[MCP Playwright] ℹ Checkbox ya estaba marcado: ${selector}`);
      }

      return {
        success: true,
        selector,
        checked: true,
        wasAlreadyChecked: isChecked
      };
    } catch (error) {
      console.error('[MCP Playwright] Error marcando checkbox:', error);
      throw error;
    }
  },

  async uncheck({ selector }) {
    const p = await initBrowser();

    try {
      const checkbox = await p.$(selector);
      if (!checkbox) {
        throw new Error(`No se encontró el checkbox: ${selector}`);
      }

      // Verificar si ya está desmarcado
      const isChecked = await checkbox.isChecked();

      if (isChecked) {
        await checkbox.uncheck();
        console.error(`[MCP Playwright] ✓ Checkbox desmarcado: ${selector}`);
      } else {
        console.error(`[MCP Playwright] ℹ Checkbox ya estaba desmarcado: ${selector}`);
      }

      return {
        success: true,
        selector,
        checked: false,
        wasAlreadyUnchecked: !isChecked
      };
    } catch (error) {
      console.error('[MCP Playwright] Error desmarcando checkbox:', error);
      throw error;
    }
  },

  async selectRadio({ selector, value }) {
    const p = await initBrowser();

    try {
      // Si se proporciona un valor, buscar el radio button con ese valor
      if (value) {
        const radioSelector = `${selector}[value="${value}"]`;
        await p.click(radioSelector);
        console.error(`[MCP Playwright] ✓ Radio button seleccionado: ${radioSelector}`);

        return {
          success: true,
          selector: radioSelector,
          value,
          selected: true
        };
      } else {
        // Si no hay valor, hacer click directo en el selector
        await p.click(selector);
        console.error(`[MCP Playwright] ✓ Radio button seleccionado: ${selector}`);

        return {
          success: true,
          selector,
          selected: true
        };
      }
    } catch (error) {
      console.error('[MCP Playwright] Error seleccionando radio button:', error);
      throw error;
    }
  },

  async fillForm({ fields }) {
    const p = await initBrowser();
    const results = [];

    try {
      for (const field of fields) {
        const { selector, text } = field;

        try {
          const element = await p.$(selector);
          if (!element) {
            console.error(`[MCP Playwright] ⚠️ Campo no encontrado: ${selector}`);
            results.push({
              selector,
              success: false,
              error: 'Campo no encontrado'
            });
            continue;
          }

          await element.fill(text);
          console.error(`[MCP Playwright] ✓ Campo llenado: ${selector} = "${text}"`);

          results.push({
            selector,
            text,
            success: true
          });

          // Pequeña pausa entre campos para simular entrada humana
          await p.waitForTimeout(100);
        } catch (fieldError) {
          console.error(`[MCP Playwright] ✗ Error en campo ${selector}:`, fieldError.message);
          results.push({
            selector,
            success: false,
            error: fieldError.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      console.error(`[MCP Playwright] Formulario llenado: ${successCount}/${totalCount} campos`);

      return {
        success: successCount === totalCount,
        totalFields: totalCount,
        successfulFields: successCount,
        failedFields: totalCount - successCount,
        results
      };
    } catch (error) {
      console.error('[MCP Playwright] Error llenando formulario:', error);
      throw error;
    }
  }
};

/**
 * Crear servidor MCP
 */
const server = new Server(
  {
    name: 'famiglia-playwright-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler para listar herramientas disponibles
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

/**
 * Handler para ejecutar herramientas
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[MCP Playwright] Ejecutando tool: ${name}`);

  try {
    if (!toolHandlers[name]) {
      throw new Error(`Herramienta desconocida: ${name}`);
    }

    const result = await toolHandlers[name](args || {});

    console.error(`[MCP Playwright] ✓ Tool ${name} ejecutado exitosamente`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };

  } catch (error) {
    console.error(`[MCP Playwright] ✗ Error en tool ${name}:`, error.message);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            tool: name
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

/**
 * Iniciar servidor MCP
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('  MCP Playwright Server - Famiglia');
  console.error('  Modo: Chrome DevTools Protocol (CDP)');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(`  App URL: ${APP_URL}`);
  console.error(`  CDP URL: ${CDP_URL}`);
  console.error(`  Slow Motion: ${SLOW_MO}ms`);
  console.error(`  Tools disponibles: ${TOOLS.length}`);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('  IMPORTANTE: Inicia Chrome con:');
  console.error('  chrome.exe --remote-debugging-port=9222');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('  Servidor iniciado y listo 🚀');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Cleanup al cerrar
 */
async function cleanup() {
  console.error('\n[MCP Playwright] Cerrando navegador...');

  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    page = null;
  }

  console.error('[MCP Playwright] Navegador cerrado. Adiós! 👋');
  process.exit(0);
}

// Manejar señales de cierre
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Iniciar servidor
main().catch((error) => {
  console.error('[MCP Playwright] Error fatal:', error);
  process.exit(1);
});
