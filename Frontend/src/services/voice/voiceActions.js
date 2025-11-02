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

// ============================================
// FORM ACTIONS
// ============================================

const formActions = {
  /**
   * Llenar input por label (compatible con React)
   * @param {String} labelText - Texto del label
   * @param {String} value - Valor a escribir
   * @returns {Boolean} - True si se llenó exitosamente
   */
  fillInput(labelText, value) {
    if (!labelText || typeof labelText !== 'string') {
      console.error('[Form Actions] Invalid label text provided');
      return false;
    }

    if (value === undefined || value === null) {
      console.error('[Form Actions] Invalid value provided');
      return false;
    }

    const normalizedLabel = labelText.toLowerCase().trim();
    console.log('[Form Actions] Filling input with label:', normalizedLabel, 'value:', value);

    // Buscar label por texto
    const labels = Array.from(document.querySelectorAll('label'));
    const label = labels.find(l =>
      l.textContent.toLowerCase().includes(normalizedLabel)
    );

    let input = null;

    if (label) {
      // Buscar input asociado al label
      const labelFor = label.getAttribute('for');
      if (labelFor) {
        input = document.getElementById(labelFor);
      }

      // Si no tiene 'for', buscar input dentro del label
      if (!input) {
        input = label.querySelector('input, textarea');
      }

      // Buscar input siguiente al label
      if (!input) {
        let next = label.nextElementSibling;
        while (next && !input) {
          if (next.tagName === 'INPUT' || next.tagName === 'TEXTAREA') {
            input = next;
          } else {
            input = next.querySelector('input, textarea');
          }
          next = next.nextElementSibling;
        }
      }
    }

    // Buscar por placeholder
    if (!input) {
      input = document.querySelector(`input[placeholder*="${normalizedLabel}" i], textarea[placeholder*="${normalizedLabel}" i]`);
    }

    // Buscar por name attribute
    if (!input) {
      input = document.querySelector(`input[name*="${normalizedLabel}" i], textarea[name*="${normalizedLabel}" i]`);
    }

    if (input) {
      console.log('[Form Actions] Input found:', input);

      // Para React, necesitamos disparar eventos nativos y sintéticos
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set;

      // Establecer valor con el setter nativo
      nativeInputValueSetter.call(input, value);

      // Disparar eventos para React
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });

      input.dispatchEvent(inputEvent);
      input.dispatchEvent(changeEvent);

      // Focus y blur para asegurar validaciones
      input.focus();
      setTimeout(() => input.blur(), 100);

      console.log('[Form Actions] Input filled successfully');
      return true;
    }

    console.warn('[Form Actions] Input not found for label:', normalizedLabel);
    return false;
  },

  /**
   * Seleccionar opción en select
   * @param {String} selectLabel - Label del select
   * @param {String} optionText - Texto de la opción a seleccionar
   * @returns {Boolean} - True si se seleccionó exitosamente
   */
  selectOption(selectLabel, optionText) {
    if (!selectLabel || typeof selectLabel !== 'string') {
      console.error('[Form Actions] Invalid select label provided');
      return false;
    }

    if (!optionText || typeof optionText !== 'string') {
      console.error('[Form Actions] Invalid option text provided');
      return false;
    }

    const normalizedLabel = selectLabel.toLowerCase().trim();
    const normalizedOption = optionText.toLowerCase().trim();
    console.log('[Form Actions] Selecting option:', normalizedOption, 'in select:', normalizedLabel);

    // Buscar select por label
    const labels = Array.from(document.querySelectorAll('label'));
    const label = labels.find(l =>
      l.textContent.toLowerCase().includes(normalizedLabel)
    );

    let select = null;

    if (label) {
      const labelFor = label.getAttribute('for');
      if (labelFor) {
        select = document.getElementById(labelFor);
      }

      if (!select) {
        select = label.querySelector('select');
      }

      if (!select) {
        let next = label.nextElementSibling;
        while (next && !select) {
          if (next.tagName === 'SELECT') {
            select = next;
          } else {
            select = next.querySelector('select');
          }
          next = next.nextElementSibling;
        }
      }
    }

    // Buscar todos los selects si no encontramos por label
    if (!select) {
      const selects = Array.from(document.querySelectorAll('select'));
      select = selects.find(s => {
        const text = s.textContent || s.getAttribute('aria-label') || '';
        return text.toLowerCase().includes(normalizedLabel);
      });
    }

    if (select) {
      console.log('[Form Actions] Select found:', select);

      // Buscar la opción
      const options = Array.from(select.options);
      const option = options.find(opt =>
        opt.textContent.toLowerCase().includes(normalizedOption) ||
        opt.value.toLowerCase().includes(normalizedOption)
      );

      if (option) {
        select.value = option.value;

        // Disparar eventos para React
        const changeEvent = new Event('change', { bubbles: true });
        select.dispatchEvent(changeEvent);

        console.log('[Form Actions] Option selected:', option.textContent);
        return true;
      }

      console.warn('[Form Actions] Option not found:', normalizedOption);
      return false;
    }

    console.warn('[Form Actions] Select not found for label:', normalizedLabel);
    return false;
  },

  /**
   * Marcar/desmarcar checkbox
   * @param {String} labelText - Texto del label del checkbox
   * @param {Boolean} checked - True para marcar, false para desmarcar
   * @returns {Boolean} - True si se modificó exitosamente
   */
  toggleCheckbox(labelText, checked = true) {
    if (!labelText || typeof labelText !== 'string') {
      console.error('[Form Actions] Invalid label text provided');
      return false;
    }

    const normalizedLabel = labelText.toLowerCase().trim();
    console.log('[Form Actions] Toggling checkbox:', normalizedLabel, 'checked:', checked);

    // Buscar label
    const labels = Array.from(document.querySelectorAll('label'));
    const label = labels.find(l =>
      l.textContent.toLowerCase().includes(normalizedLabel)
    );

    let checkbox = null;

    if (label) {
      const labelFor = label.getAttribute('for');
      if (labelFor) {
        checkbox = document.getElementById(labelFor);
      }

      if (!checkbox) {
        checkbox = label.querySelector('input[type="checkbox"]');
      }
    }

    // Buscar directamente
    if (!checkbox) {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      checkbox = checkboxes.find(cb => {
        const associatedLabel = document.querySelector(`label[for="${cb.id}"]`);
        if (associatedLabel) {
          return associatedLabel.textContent.toLowerCase().includes(normalizedLabel);
        }
        return false;
      });
    }

    if (checkbox) {
      console.log('[Form Actions] Checkbox found:', checkbox);

      if (checkbox.checked !== checked) {
        checkbox.checked = checked;

        // Disparar eventos para React
        const changeEvent = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(changeEvent);

        console.log('[Form Actions] Checkbox toggled to:', checked);
      }

      return true;
    }

    console.warn('[Form Actions] Checkbox not found for label:', normalizedLabel);
    return false;
  },

  /**
   * Enviar formulario
   * @param {String} formSelector - Selector del formulario (opcional)
   * @returns {Boolean} - True si se envió exitosamente
   */
  submitForm(formSelector = 'form') {
    console.log('[Form Actions] Submitting form:', formSelector);

    const form = document.querySelector(formSelector);

    if (!form) {
      console.warn('[Form Actions] Form not found:', formSelector);
      return false;
    }

    // Buscar botón de submit dentro del formulario
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

    if (submitButton) {
      console.log('[Form Actions] Clicking submit button');
      submitButton.click();
    } else {
      console.log('[Form Actions] No submit button found, dispatching submit event');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }

    return true;
  }
};

// ============================================
// READ ACTIONS
// ============================================

const readActions = {
  /**
   * Leer encabezados de la página
   * @returns {Array<String>} - Lista de textos de encabezados
   */
  readHeadings() {
    console.log('[Read Actions] Reading headings');

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const texts = headings
      .filter(h => h.textContent.trim().length > 0)
      .map(h => h.textContent.trim());

    console.log('[Read Actions] Found', texts.length, 'headings');
    return texts;
  },

  /**
   * Leer productos del catálogo
   * @returns {Array<Object>} - Lista de productos con nombre y precio
   */
  readProducts() {
    console.log('[Read Actions] Reading products');

    // Buscar cards de productos
    const productCards = Array.from(document.querySelectorAll('[data-product-card], .product-card, .producto-card, article'));

    const products = productCards
      .map(card => {
        // Buscar nombre (puede estar en data attribute o en heading)
        let name = card.getAttribute('data-product-name');

        if (!name) {
          const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
          name = heading ? heading.textContent.trim() : null;
        }

        // Buscar precio
        let price = card.getAttribute('data-price');

        if (!price) {
          const priceElement = card.querySelector('[data-price], .price, .precio, .product-price');
          price = priceElement ? priceElement.textContent.trim() : null;
        }

        return {
          name: name || 'Producto sin nombre',
          price: price || 'Precio no disponible',
          element: card
        };
      })
      .filter(p => p.name !== 'Producto sin nombre');

    console.log('[Read Actions] Found', products.length, 'products');
    return products;
  },

  /**
   * Leer elemento específico
   * @param {String} selector - Selector CSS del elemento
   * @returns {String|null} - Texto del elemento
   */
  readElement(selector) {
    if (!selector || typeof selector !== 'string') {
      console.error('[Read Actions] Invalid selector provided');
      return null;
    }

    console.log('[Read Actions] Reading element:', selector);

    const element = document.querySelector(selector);

    if (!element) {
      console.warn('[Read Actions] Element not found:', selector);
      return null;
    }

    const text = element.textContent.trim();
    console.log('[Read Actions] Element text:', text);
    return text;
  },

  /**
   * Leer enlaces de navegación
   * @returns {Array<String>} - Lista de textos de enlaces
   */
  readLinks() {
    console.log('[Read Actions] Reading links');

    const links = Array.from(document.querySelectorAll('nav a, [role="navigation"] a'));
    const texts = links
      .filter(link => link.textContent.trim().length > 0)
      .map(link => link.textContent.trim());

    console.log('[Read Actions] Found', texts.length, 'links');
    return texts;
  },

  /**
   * Leer botones visibles
   * @returns {Array<String>} - Lista de textos de botones
   */
  readButtons() {
    console.log('[Read Actions] Reading buttons');

    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    const texts = buttons
      .filter(btn => {
        const text = btn.textContent.trim() || btn.getAttribute('aria-label');
        return text && text.length > 0;
      })
      .map(btn => btn.textContent.trim() || btn.getAttribute('aria-label'));

    console.log('[Read Actions] Found', texts.length, 'buttons');
    return texts;
  },

  /**
   * Obtener texto visible completo de la página
   * @returns {String} - Texto visible de la página
   */
  getPageText() {
    console.log('[Read Actions] Getting page text');

    // Obtener texto del main content (evitar header, nav, footer)
    const main = document.querySelector('main, [role="main"], .main-content');

    if (main) {
      return main.textContent.trim();
    }

    // Si no hay main, obtener todo el body excluyendo scripts y styles
    const body = document.body.cloneNode(true);

    // Remover scripts y styles
    body.querySelectorAll('script, style, noscript').forEach(el => el.remove());

    return body.textContent.trim();
  }
};

// ============================================
// LIST NAVIGATOR
// ============================================

class ListNavigator {
  /**
   * Constructor
   * @param {String} selector - Selector CSS para los elementos de la lista
   */
  constructor(selector) {
    this.selector = selector;
    this.currentIndex = -1;
    this.elements = [];
    this.updateElements();
  }

  /**
   * Actualizar lista de elementos
   */
  updateElements() {
    this.elements = Array.from(document.querySelectorAll(this.selector));
    console.log('[List Navigator] Updated elements:', this.elements.length, 'items');
  }

  /**
   * Ir al siguiente elemento
   * @returns {HTMLElement|null} - Elemento actual o null
   */
  next() {
    this.updateElements();

    if (this.elements.length === 0) {
      console.warn('[List Navigator] No elements found');
      return null;
    }

    this.currentIndex = (this.currentIndex + 1) % this.elements.length;
    const element = this.elements[this.currentIndex];

    console.log('[List Navigator] Next - Index:', this.currentIndex, '/', this.elements.length);
    this.highlightElement(element);

    return element;
  }

  /**
   * Ir al elemento anterior
   * @returns {HTMLElement|null} - Elemento actual o null
   */
  previous() {
    this.updateElements();

    if (this.elements.length === 0) {
      console.warn('[List Navigator] No elements found');
      return null;
    }

    this.currentIndex = this.currentIndex <= 0 ? this.elements.length - 1 : this.currentIndex - 1;
    const element = this.elements[this.currentIndex];

    console.log('[List Navigator] Previous - Index:', this.currentIndex, '/', this.elements.length);
    this.highlightElement(element);

    return element;
  }

  /**
   * Ir al primer elemento
   * @returns {HTMLElement|null} - Elemento actual o null
   */
  first() {
    this.updateElements();

    if (this.elements.length === 0) {
      console.warn('[List Navigator] No elements found');
      return null;
    }

    this.currentIndex = 0;
    const element = this.elements[this.currentIndex];

    console.log('[List Navigator] First element');
    this.highlightElement(element);

    return element;
  }

  /**
   * Ir al último elemento
   * @returns {HTMLElement|null} - Elemento actual o null
   */
  last() {
    this.updateElements();

    if (this.elements.length === 0) {
      console.warn('[List Navigator] No elements found');
      return null;
    }

    this.currentIndex = this.elements.length - 1;
    const element = this.elements[this.currentIndex];

    console.log('[List Navigator] Last element');
    this.highlightElement(element);

    return element;
  }

  /**
   * Hacer click en el elemento actual
   * @returns {Boolean} - True si se hizo click exitosamente
   */
  selectCurrent() {
    if (this.currentIndex < 0 || this.currentIndex >= this.elements.length) {
      console.warn('[List Navigator] No current element selected');
      return false;
    }

    const element = this.elements[this.currentIndex];
    console.log('[List Navigator] Selecting current element:', element);

    clickActions.simulateReactClick(element);
    return true;
  }

  /**
   * Obtener información del elemento actual
   * @returns {Object|null} - Info del elemento o null
   */
  getCurrentInfo() {
    if (this.currentIndex < 0 || this.currentIndex >= this.elements.length) {
      return null;
    }

    const element = this.elements[this.currentIndex];

    return {
      index: this.currentIndex,
      total: this.elements.length,
      element: element,
      text: element.textContent.trim(),
      tag: element.tagName.toLowerCase()
    };
  }

  /**
   * Ir a índice específico
   * @param {Number} index - Índice (0-based)
   * @returns {HTMLElement|null} - Elemento o null
   */
  goToIndex(index) {
    this.updateElements();

    if (index < 0 || index >= this.elements.length) {
      console.warn('[List Navigator] Index out of bounds:', index);
      return null;
    }

    this.currentIndex = index;
    const element = this.elements[this.currentIndex];

    console.log('[List Navigator] Go to index:', index);
    this.highlightElement(element);

    return element;
  }

  /**
   * Resaltar elemento visualmente
   * @param {HTMLElement} element - Elemento a resaltar
   */
  highlightElement(element) {
    if (!element) return;

    // Remover highlights previos
    document.querySelectorAll('.voice-highlight').forEach(el => {
      el.classList.remove('voice-highlight');
    });

    // Agregar highlight al elemento actual
    element.classList.add('voice-highlight');

    // Scroll al elemento
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Remover highlight después de 3 segundos
    setTimeout(() => {
      element.classList.remove('voice-highlight');
    }, 3000);

    console.log('[List Navigator] Element highlighted:', element);
  }

  /**
   * Resetear navegador
   */
  reset() {
    this.currentIndex = -1;
    console.log('[List Navigator] Reset');
  }
}

// ============================================
// MODAL ACTIONS
// ============================================

const modalActions = {
  /**
   * Abrir modal por ID o selector
   * @param {String} modalId - ID o selector del modal
   * @returns {Boolean} - True si se abrió exitosamente
   */
  openModal(modalId) {
    if (!modalId || typeof modalId !== 'string') {
      console.error('[Modal Actions] Invalid modal ID provided');
      return false;
    }

    console.log('[Modal Actions] Opening modal:', modalId);

    // Buscar modal por ID
    let modal = document.getElementById(modalId);

    // Buscar por selector
    if (!modal) {
      modal = document.querySelector(modalId);
    }

    // Buscar por data attribute
    if (!modal) {
      modal = document.querySelector(`[data-modal="${modalId}"]`);
    }

    if (modal) {
      // Métodos comunes para abrir modales

      // 1. Remover clase hidden/d-none
      modal.classList.remove('hidden', 'd-none');

      // 2. Agregar clase show/open
      modal.classList.add('show', 'open');

      // 3. Establecer display block
      if (modal.style.display === 'none') {
        modal.style.display = 'block';
      }

      // 4. Buscar botón de abrir dentro del documento
      const openButton = document.querySelector(`[data-modal-open="${modalId}"], [data-target="${modalId}"]`);
      if (openButton) {
        openButton.click();
      }

      console.log('[Modal Actions] Modal opened:', modal);
      return true;
    }

    console.warn('[Modal Actions] Modal not found:', modalId);
    return false;
  },

  /**
   * Cerrar modal visible
   * @returns {Boolean} - True si se cerró exitosamente
   */
  closeModal() {
    console.log('[Modal Actions] Closing visible modal');

    // Buscar modales visibles
    const visibleModals = Array.from(document.querySelectorAll('[role="dialog"], .modal, [data-modal]'))
      .filter(modal => {
        const style = window.getComputedStyle(modal);
        return style.display !== 'none' &&
               !modal.classList.contains('hidden') &&
               !modal.classList.contains('d-none');
      });

    if (visibleModals.length === 0) {
      console.warn('[Modal Actions] No visible modal found');
      return false;
    }

    // Cerrar el último modal visible (el de arriba)
    const modal = visibleModals[visibleModals.length - 1];

    // Métodos comunes para cerrar modales

    // 1. Buscar botón de cerrar dentro del modal
    const closeButton = modal.querySelector('[data-modal-close], .close, .modal-close, button[aria-label*="close" i]');
    if (closeButton) {
      closeButton.click();
      console.log('[Modal Actions] Clicked close button');
      return true;
    }

    // 2. Remover clases show/open
    modal.classList.remove('show', 'open');

    // 3. Agregar clases hidden/d-none
    modal.classList.add('hidden');

    // 4. Establecer display none
    modal.style.display = 'none';

    console.log('[Modal Actions] Modal closed:', modal);
    return true;
  },

  /**
   * Cerrar modal con tecla Escape
   * @returns {Boolean} - True si se simuló exitosamente
   */
  closeModalByEscape() {
    console.log('[Modal Actions] Simulating Escape key');

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      code: 'Escape',
      which: 27,
      bubbles: true,
      cancelable: true
    });

    document.dispatchEvent(escapeEvent);

    // Dispatch en el body también
    document.body.dispatchEvent(escapeEvent);

    return true;
  }
};

// ============================================
// FOCUS ACTIONS
// ============================================

const focusActions = {
  /**
   * Obtener elementos focusables
   * @returns {Array<HTMLElement>} - Lista de elementos focusables
   */
  getFocusableElements() {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const elements = Array.from(document.querySelectorAll(selector))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

    console.log('[Focus Actions] Found', elements.length, 'focusable elements');
    return elements;
  },

  /**
   * Enfocar siguiente elemento interactivo
   * @returns {Boolean} - True si se enfocó exitosamente
   */
  focusNext() {
    const focusableElements = this.getFocusableElements();

    if (focusableElements.length === 0) {
      console.warn('[Focus Actions] No focusable elements found');
      return false;
    }

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    const nextElement = focusableElements[nextIndex];

    nextElement.focus();
    console.log('[Focus Actions] Focused next element:', nextElement);

    return true;
  },

  /**
   * Enfocar elemento anterior interactivo
   * @returns {Boolean} - True si se enfocó exitosamente
   */
  focusPrevious() {
    const focusableElements = this.getFocusableElements();

    if (focusableElements.length === 0) {
      console.warn('[Focus Actions] No focusable elements found');
      return false;
    }

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    const previousElement = focusableElements[previousIndex];

    previousElement.focus();
    console.log('[Focus Actions] Focused previous element:', previousElement);

    return true;
  },

  /**
   * Enfocar elemento específico
   * @param {String} selector - Selector CSS del elemento
   * @returns {Boolean} - True si se enfocó exitosamente
   */
  focusElement(selector) {
    if (!selector || typeof selector !== 'string') {
      console.error('[Focus Actions] Invalid selector provided');
      return false;
    }

    console.log('[Focus Actions] Focusing element:', selector);

    const element = document.querySelector(selector);

    if (!element) {
      console.warn('[Focus Actions] Element not found:', selector);
      return false;
    }

    element.focus();
    console.log('[Focus Actions] Element focused:', element);

    return true;
  },

  /**
   * Guardar foco actual
   */
  saveFocus() {
    this.savedFocusElement = document.activeElement;
    console.log('[Focus Actions] Focus saved:', this.savedFocusElement);
  },

  /**
   * Restaurar foco guardado
   * @returns {Boolean} - True si se restauró exitosamente
   */
  restoreFocus() {
    if (this.savedFocusElement) {
      this.savedFocusElement.focus();
      console.log('[Focus Actions] Focus restored:', this.savedFocusElement);
      return true;
    }

    console.warn('[Focus Actions] No saved focus to restore');
    return false;
  }
};

// Agregar estilos CSS para highlight
if (typeof document !== 'undefined') {
  const styleId = 'voice-highlight-styles';

  // Solo agregar si no existe
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .voice-highlight {
        outline: 3px solid #10b981 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2) !important;
        transition: outline 0.3s ease, box-shadow 0.3s ease !important;
        animation: voice-pulse 1.5s ease-in-out infinite;
      }

      @keyframes voice-pulse {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.4);
        }
      }
    `;
    document.head.appendChild(style);
    console.log('[Voice Actions] Highlight styles added');
  }
}

// Exportar acciones
export { clickActions, scrollActions, formActions, readActions, ListNavigator, modalActions, focusActions };
