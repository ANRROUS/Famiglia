/**
 * Voice Actions
 * Funciones para ejecutar acciones en el DOM mediante comandos de voz
 * Incluye clicks, scroll, y manipulación de elementos
 */

// ============================================
// CLICK ACTIONS
// ============================================

const clickActions = {
  /**
   * Click en elemento por nombre accesible (aria-label o texto visible)
   * @param {String} name - Nombre del elemento a buscar
   * @returns {Boolean} - True si se hizo click exitosamente
   */
  clickByAccessibleName(name) {
    if (!name || typeof name !== 'string') {
      console.error('[Click Actions] Invalid name provided');
      return false;
    }

    const normalizedName = name.toLowerCase().trim();
    console.log('[Click Actions] Searching for element:', normalizedName);

    // Buscar por aria-label
    let element = document.querySelector(`[aria-label*="${normalizedName}" i]`);

    // Buscar por texto visible en botones
    if (!element) {
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
      element = buttons.find(btn =>
        btn.textContent.toLowerCase().includes(normalizedName) ||
        btn.innerText.toLowerCase().includes(normalizedName)
      );
    }

    // Buscar por texto visible en links
    if (!element) {
      const links = Array.from(document.querySelectorAll('a'));
      element = links.find(link =>
        link.textContent.toLowerCase().includes(normalizedName) ||
        link.innerText.toLowerCase().includes(normalizedName)
      );
    }

    // Buscar por texto visible en cualquier elemento clickeable
    if (!element) {
      const clickables = Array.from(document.querySelectorAll('[onclick], [role="button"]'));
      element = clickables.find(el =>
        el.textContent.toLowerCase().includes(normalizedName)
      );
    }

    if (element) {
      console.log('[Click Actions] Element found, clicking:', element);
      this.simulateReactClick(element);
      return true;
    }

    console.warn('[Click Actions] Element not found:', normalizedName);
    return false;
  },

  /**
   * Click en elemento por índice de un selector
   * @param {String} selector - Selector CSS
   * @param {Number} index - Índice del elemento (0-based)
   * @returns {Boolean} - True si se hizo click exitosamente
   */
  clickByIndex(selector, index) {
    if (!selector || typeof selector !== 'string') {
      console.error('[Click Actions] Invalid selector provided');
      return false;
    }

    if (typeof index !== 'number' || index < 0) {
      console.error('[Click Actions] Invalid index provided');
      return false;
    }

    console.log('[Click Actions] Searching for element:', selector, 'at index:', index);

    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      console.warn('[Click Actions] No elements found for selector:', selector);
      return false;
    }

    if (index >= elements.length) {
      console.warn('[Click Actions] Index out of bounds:', index, 'max:', elements.length - 1);
      return false;
    }

    const element = elements[index];
    console.log('[Click Actions] Element found, clicking:', element);
    this.simulateReactClick(element);
    return true;
  },

  /**
   * Click en producto del catálogo por nombre
   * @param {String} productName - Nombre del producto
   * @returns {Boolean} - True si se hizo click exitosamente
   */
  clickProduct(productName) {
    if (!productName || typeof productName !== 'string') {
      console.error('[Click Actions] Invalid product name provided');
      return false;
    }

    const normalizedName = productName.toLowerCase().trim();
    console.log('[Click Actions] Searching for product:', normalizedName);

    // Buscar por data attribute
    let productCard = document.querySelector(`[data-product-name*="${normalizedName}" i]`);

    // Buscar por clase de producto y texto
    if (!productCard) {
      const cards = Array.from(document.querySelectorAll('[data-product-card], .product-card, .producto-card'));
      productCard = cards.find(card => {
        const text = card.textContent.toLowerCase();
        return text.includes(normalizedName);
      });
    }

    // Buscar por nombre en heading dentro de cards
    if (!productCard) {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const heading = headings.find(h => h.textContent.toLowerCase().includes(normalizedName));
      if (heading) {
        productCard = heading.closest('[data-product-card], .product-card, .producto-card, article, .card');
      }
    }

    if (productCard) {
      console.log('[Click Actions] Product found, clicking:', productCard);

      // Buscar botón dentro de la card o hacer click en la card
      const button = productCard.querySelector('button, a');
      if (button) {
        this.simulateReactClick(button);
      } else {
        this.simulateReactClick(productCard);
      }
      return true;
    }

    console.warn('[Click Actions] Product not found:', normalizedName);
    return false;
  },

  /**
   * Simular click compatible con React
   * React usa eventos sintéticos, por lo que un click nativo puede no funcionar
   * @param {HTMLElement} element - Elemento a hacer click
   */
  simulateReactClick(element) {
    if (!element) {
      console.error('[Click Actions] No element provided to click');
      return;
    }

    try {
      // Scroll al elemento para asegurar que es visible
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Esperar un poco para que el scroll termine
      setTimeout(() => {
        // 1. Event nativo de mouse
        const mouseEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          composed: true
        });

        // 2. Eventos de React sintéticos
        const reactEvent = new Event('click', {
          bubbles: true,
          cancelable: true
        });

        // 3. Disparar ambos eventos
        element.dispatchEvent(mouseEvent);
        element.dispatchEvent(reactEvent);

        // 4. Click nativo como fallback
        element.click();

        console.log('[Click Actions] Click simulated on:', element);
      }, 300);
    } catch (error) {
      console.error('[Click Actions] Error simulating click:', error);
    }
  }
};

// ============================================
// SCROLL ACTIONS
// ============================================

const scrollActions = {
  /**
   * Desplazar hacia arriba
   * @param {Number} pixels - Cantidad de píxeles (default 300)
   */
  scrollUp(pixels = 300) {
    console.log('[Scroll Actions] Scrolling up:', pixels, 'px');
    window.scrollBy({
      top: -pixels,
      behavior: 'smooth'
    });
  },

  /**
   * Desplazar hacia abajo
   * @param {Number} pixels - Cantidad de píxeles (default 300)
   */
  scrollDown(pixels = 300) {
    console.log('[Scroll Actions] Scrolling down:', pixels, 'px');
    window.scrollBy({
      top: pixels,
      behavior: 'smooth'
    });
  },

  /**
   * Ir al inicio de la página
   */
  scrollToTop() {
    console.log('[Scroll Actions] Scrolling to top');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },

  /**
   * Ir al final de la página
   */
  scrollToBottom() {
    console.log('[Scroll Actions] Scrolling to bottom');
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  },

  /**
   * Scroll a elemento específico
   * @param {String} selector - Selector CSS del elemento
   * @returns {Boolean} - True si se encontró y scrolleó al elemento
   */
  scrollToElement(selector) {
    if (!selector || typeof selector !== 'string') {
      console.error('[Scroll Actions] Invalid selector provided');
      return false;
    }

    console.log('[Scroll Actions] Scrolling to element:', selector);

    const element = document.querySelector(selector);

    if (!element) {
      console.warn('[Scroll Actions] Element not found:', selector);
      return false;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    console.log('[Scroll Actions] Scrolled to element:', element);
    return true;
  },

  /**
   * Scroll a sección por nombre
   * @param {String} sectionName - Nombre de la sección
   * @returns {Boolean} - True si se encontró y scrolleó a la sección
   */
  scrollToSection(sectionName) {
    if (!sectionName || typeof sectionName !== 'string') {
      console.error('[Scroll Actions] Invalid section name provided');
      return false;
    }

    const normalizedName = sectionName.toLowerCase().trim();
    console.log('[Scroll Actions] Scrolling to section:', normalizedName);

    // Mapeo de nombres comunes a selectores
    const sectionMap = {
      'productos': '[data-section="products"], #productos, .productos-section',
      'categorías': '[data-section="categories"], #categorias, .categorias-section',
      'categorias': '[data-section="categories"], #categorias, .categorias-section',
      'filtros': '[data-section="filters"], #filtros, .filtros-section',
      'carrito': '[data-section="cart"], #carrito, .carrito-section',
      'footer': 'footer, #footer, .footer',
      'header': 'header, #header, .header',
      'navegación': 'nav, #nav, .navigation',
      'navegacion': 'nav, #nav, .navigation',
      'inicio': 'main, #main, .main-content'
    };

    // Intentar con el mapeo
    const selector = sectionMap[normalizedName];
    if (selector) {
      const selectors = selector.split(', ');
      for (const sel of selectors) {
        if (this.scrollToElement(sel)) {
          return true;
        }
      }
    }

    // Buscar por data-section
    if (this.scrollToElement(`[data-section="${normalizedName}"]`)) {
      return true;
    }

    // Buscar por ID
    if (this.scrollToElement(`#${normalizedName}`)) {
      return true;
    }

    // Buscar por heading con ese texto
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const heading = headings.find(h =>
      h.textContent.toLowerCase().includes(normalizedName)
    );

    if (heading) {
      heading.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      console.log('[Scroll Actions] Scrolled to heading:', heading);
      return true;
    }

    console.warn('[Scroll Actions] Section not found:', normalizedName);
    return false;
  }
};

// Exportar acciones
export { clickActions, scrollActions };
