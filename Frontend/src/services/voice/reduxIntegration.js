/**
 * VoiceReduxBridge
 * Puente entre comandos de voz y Redux store
 * Maneja acciones de carrito, autenticación y lectura de estado
 */

import { clickActions } from './voiceActions.js';

class VoiceReduxBridge {
  constructor(store = null, ttsService = null) {
    this.store = store;
    this.ttsService = ttsService;

    if (!store) {
      console.warn('[Voice Redux Bridge] No Redux store provided. Some features may not work.');
    }

    if (!ttsService) {
      console.warn('[Voice Redux Bridge] No TTS service provided. Voice feedback disabled.');
    }
  }

  /**
   * Configurar store de Redux
   * @param {Object} store - Redux store
   */
  setStore(store) {
    if (!store) {
      console.error('[Voice Redux Bridge] Invalid store provided');
      return;
    }
    this.store = store;
    console.log('[Voice Redux Bridge] Store configured');
  }

  /**
   * Configurar servicio TTS
   * @param {Object} ttsService - Text-to-speech service
   */
  setTTSService(ttsService) {
    if (!ttsService) {
      console.error('[Voice Redux Bridge] Invalid TTS service provided');
      return;
    }
    this.ttsService = ttsService;
    console.log('[Voice Redux Bridge] TTS service configured');
  }

  /**
   * Verificar disponibilidad del store
   * @private
   */
  _checkStore() {
    if (!this.store) {
      console.error('[Voice Redux Bridge] Redux store not configured');
      return false;
    }
    return true;
  }

  /**
   * Hablar mensaje (helper)
   * @private
   */
  async _speak(message, options = {}) {
    if (this.ttsService && this.ttsService.speak) {
      return this.ttsService.speak(message, options);
    } else {
      console.log('[Voice Redux Bridge] TTS:', message);
    }
  }

  // ==================== CART ACTIONS ====================

  /**
   * Agregar producto al carrito por nombre
   * @param {String} productName - Nombre del producto a buscar
   * @param {Number} quantity - Cantidad a agregar (default 1)
   * @returns {Promise<Boolean>} - True si se agregó exitosamente
   */
  async addToCartByName(productName, quantity = 1) {
    try {
      if (!productName || typeof productName !== 'string') {
        await this._speak('No especificaste qué producto agregar');
        return false;
      }

      console.log('[Voice Redux Bridge] Adding to cart:', productName, 'x', quantity);

      // Buscar producto en el DOM
      const products = this.getProductsFromDOM();
      const normalizedSearch = productName.toLowerCase().trim();

      // Buscar coincidencia exacta o parcial
      const product = products.find(p => {
        const normalizedName = p.name.toLowerCase();
        return normalizedName === normalizedSearch ||
               normalizedName.includes(normalizedSearch) ||
               normalizedSearch.includes(normalizedName);
      });

      if (!product) {
        await this._speak(`No encontré el producto ${productName}`);
        return false;
      }

      // Buscar y hacer click en el botón "Agregar al carrito" del producto
      const productElement = product.element;
      const addButton = productElement.querySelector(
        'button[aria-label*="agregar"], button[aria-label*="añadir"], button.add-to-cart, .btn-add-cart'
      ) || productElement.querySelector('button');

      if (!addButton) {
        console.error('[Voice Redux Bridge] Add to cart button not found');
        await this._speak(`No puedo agregar ${product.name} al carrito`);
        return false;
      }

      // Si necesita cantidad > 1, ajustar antes de agregar
      if (quantity > 1) {
        const quantityInput = productElement.querySelector('input[type="number"], input.quantity');
        if (quantityInput) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          ).set;
          nativeInputValueSetter.call(quantityInput, quantity);
          quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
          quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      // Click en agregar
      clickActions.simulateReactClick(addButton);

      await this._speak(`Agregado ${product.name} al carrito`);
      console.log('[Voice Redux Bridge] Product added:', product.name);
      return true;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error adding to cart:', error);
      await this._speak('No pude agregar el producto al carrito');
      return false;
    }
  }

  /**
   * Agregar producto actual/enfocado al carrito
   * @param {Number} quantity - Cantidad a agregar
   * @returns {Promise<Boolean>}
   */
  async addCurrentProductToCart(quantity = 1) {
    try {
      // Buscar producto destacado o enfocado
      const highlightedProduct = document.querySelector('.voice-highlight[data-product-card]') ||
                                  document.querySelector('.voice-highlight .product-card') ||
                                  document.querySelector('.product-card:focus-within') ||
                                  document.querySelector('article:focus-within');

      if (!highlightedProduct) {
        await this._speak('No hay ningún producto seleccionado');
        return false;
      }

      // Extraer nombre del producto
      const nameElement = highlightedProduct.querySelector('h2, h3, h4, .product-name, .product-title');
      const productName = nameElement ? nameElement.textContent.trim() : 'producto actual';

      // Buscar botón de agregar
      const addButton = highlightedProduct.querySelector(
        'button[aria-label*="agregar"], button[aria-label*="añadir"], button.add-to-cart, .btn-add-cart'
      ) || highlightedProduct.querySelector('button');

      if (!addButton) {
        await this._speak('No puedo agregar este producto');
        return false;
      }

      // Ajustar cantidad si es necesario
      if (quantity > 1) {
        const quantityInput = highlightedProduct.querySelector('input[type="number"], input.quantity');
        if (quantityInput) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          ).set;
          nativeInputValueSetter.call(quantityInput, quantity);
          quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
          quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      clickActions.simulateReactClick(addButton);
      await this._speak(`Agregado ${productName} al carrito`);
      return true;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error adding current product:', error);
      await this._speak('No pude agregar el producto');
      return false;
    }
  }

  /**
   * Eliminar producto del carrito por índice (1-based)
   * @param {Number} index - Índice del producto (1, 2, 3...)
   * @returns {Promise<Boolean>}
   */
  async removeFromCartByIndex(index) {
    try {
      if (!index || index < 1) {
        await this._speak('Especifica qué producto eliminar');
        return false;
      }

      console.log('[Voice Redux Bridge] Removing cart item at index:', index);

      // Buscar items del carrito en el DOM
      const cartItems = document.querySelectorAll(
        '[data-cart-item], .cart-item, .carrito-item, .shopping-cart-item'
      );

      if (cartItems.length === 0) {
        await this._speak('El carrito está vacío');
        return false;
      }

      // Convertir a 0-based
      const targetIndex = index - 1;

      if (targetIndex >= cartItems.length) {
        await this._speak(`Solo hay ${cartItems.length} productos en el carrito`);
        return false;
      }

      const targetItem = cartItems[targetIndex];

      // Buscar botón de eliminar
      const removeButton = targetItem.querySelector(
        'button[aria-label*="eliminar"], button[aria-label*="quitar"], button.remove-item, .btn-remove, button[data-action="remove"]'
      ) || targetItem.querySelector('button[title*="eliminar"]');

      if (!removeButton) {
        console.error('[Voice Redux Bridge] Remove button not found');
        await this._speak('No puedo eliminar este producto');
        return false;
      }

      // Obtener nombre del producto antes de eliminarlo
      const nameElement = targetItem.querySelector('.product-name, .item-name, h3, h4');
      const productName = nameElement ? nameElement.textContent.trim() : `producto ${index}`;

      clickActions.simulateReactClick(removeButton);
      await this._speak(`Eliminado ${productName} del carrito`);
      return true;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error removing from cart:', error);
      await this._speak('No pude eliminar el producto');
      return false;
    }
  }

  /**
   * Actualizar cantidad de producto en carrito
   * @param {Number} index - Índice del producto (1-based)
   * @param {Number} newQuantity - Nueva cantidad
   * @returns {Promise<Boolean>}
   */
  async updateCartQuantity(index, newQuantity) {
    try {
      if (!index || index < 1 || !newQuantity || newQuantity < 0) {
        await this._speak('Datos inválidos para actualizar cantidad');
        return false;
      }

      console.log('[Voice Redux Bridge] Updating quantity:', index, 'to', newQuantity);

      // Buscar items del carrito
      const cartItems = document.querySelectorAll(
        '[data-cart-item], .cart-item, .carrito-item, .shopping-cart-item'
      );

      if (cartItems.length === 0) {
        await this._speak('El carrito está vacío');
        return false;
      }

      const targetIndex = index - 1;

      if (targetIndex >= cartItems.length) {
        await this._speak(`Solo hay ${cartItems.length} productos en el carrito`);
        return false;
      }

      const targetItem = cartItems[targetIndex];

      // Buscar input de cantidad
      const quantityInput = targetItem.querySelector(
        'input[type="number"], input.quantity, input[name*="quantity"], input[name*="cantidad"]'
      );

      if (!quantityInput) {
        console.error('[Voice Redux Bridge] Quantity input not found');
        await this._speak('No puedo cambiar la cantidad de este producto');
        return false;
      }

      // Actualizar cantidad (compatible con React)
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      ).set;
      nativeInputValueSetter.call(quantityInput, newQuantity);
      quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
      quantityInput.dispatchEvent(new Event('change', { bubbles: true }));

      await this._speak(`Cantidad actualizada a ${newQuantity}`);
      return true;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error updating quantity:', error);
      await this._speak('No pude actualizar la cantidad');
      return false;
    }
  }

  /**
   * Vaciar carrito completamente
   * @returns {Promise<Boolean>}
   */
  async clearCart() {
    try {
      console.log('[Voice Redux Bridge] Clearing cart');

      // Buscar botón de vaciar carrito
      const clearButton = document.querySelector(
        'button[aria-label*="vaciar"], button[aria-label*="limpiar"], button.clear-cart, .btn-clear-cart, button[data-action="clear"]'
      );

      if (clearButton) {
        clickActions.simulateReactClick(clearButton);
        await this._speak('Carrito vaciado');
        return true;
      }

      // Si no hay botón, eliminar todos los items uno por uno
      const cartItems = document.querySelectorAll(
        '[data-cart-item], .cart-item, .carrito-item, .shopping-cart-item'
      );

      if (cartItems.length === 0) {
        await this._speak('El carrito ya está vacío');
        return true;
      }

      // Eliminar cada item
      for (const item of cartItems) {
        const removeButton = item.querySelector(
          'button[aria-label*="eliminar"], button[aria-label*="quitar"], button.remove-item, .btn-remove'
        );
        if (removeButton) {
          clickActions.simulateReactClick(removeButton);
          // Pequeña pausa entre eliminaciones
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      await this._speak('Carrito vaciado');
      return true;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error clearing cart:', error);
      await this._speak('No pude vaciar el carrito');
      return false;
    }
  }

  // ==================== STATE READING ====================

  /**
   * Leer contenido completo del carrito
   * @returns {Promise<void>}
   */
  async readCart() {
    try {
      if (!this._checkStore()) {
        // Leer desde DOM si no hay store
        return this._readCartFromDOM();
      }

      const state = this.store.getState();
      const cart = state.cart || state.carrito || {};
      const items = cart.items || cart.productos || [];

      if (items.length === 0) {
        await this._speak('El carrito está vacío');
        return;
      }

      await this._speak(`Tienes ${items.length} productos en el carrito`);

      // Leer cada producto con pausa
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const name = item.name || item.nombre || item.product?.name || 'producto';
        const quantity = item.quantity || item.cantidad || 1;
        const price = item.price || item.precio || item.product?.price || 0;
        const subtotal = quantity * price;

        const message = `${i + 1}. ${name}, cantidad ${quantity}, subtotal ${subtotal} pesos`;
        await this._speak(message);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Leer total
      const total = cart.total || items.reduce((sum, item) => {
        const quantity = item.quantity || item.cantidad || 1;
        const price = item.price || item.precio || item.product?.price || 0;
        return sum + (quantity * price);
      }, 0);

      await this._speak(`Total a pagar: ${total} pesos`);

    } catch (error) {
      console.error('[Voice Redux Bridge] Error reading cart:', error);
      await this._speak('No pude leer el carrito');
    }
  }

  /**
   * Leer carrito desde DOM (fallback)
   * @private
   */
  async _readCartFromDOM() {
    try {
      const cartItems = document.querySelectorAll(
        '[data-cart-item], .cart-item, .carrito-item, .shopping-cart-item'
      );

      if (cartItems.length === 0) {
        await this._speak('El carrito está vacío');
        return;
      }

      await this._speak(`Tienes ${cartItems.length} productos en el carrito`);

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const nameElement = item.querySelector('.product-name, .item-name, h3, h4');
        const quantityElement = item.querySelector('.quantity, .cantidad, input[type="number"]');
        const priceElement = item.querySelector('.price, .precio, .subtotal');

        const name = nameElement ? nameElement.textContent.trim() : `producto ${i + 1}`;
        const quantity = quantityElement ?
          (quantityElement.value || quantityElement.textContent.trim()) : '1';
        const price = priceElement ? priceElement.textContent.trim() : '';

        const message = price ?
          `${i + 1}. ${name}, cantidad ${quantity}, ${price}` :
          `${i + 1}. ${name}, cantidad ${quantity}`;

        await this._speak(message);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Leer total si existe
      const totalElement = document.querySelector('.cart-total, .total, .precio-total');
      if (totalElement) {
        await this._speak(`Total: ${totalElement.textContent.trim()}`);
      }

    } catch (error) {
      console.error('[Voice Redux Bridge] Error reading cart from DOM:', error);
    }
  }

  /**
   * Leer solo el total del carrito
   * @returns {Promise<void>}
   */
  async readCartTotal() {
    try {
      if (!this._checkStore()) {
        // Leer desde DOM
        const totalElement = document.querySelector('.cart-total, .total, .precio-total');
        if (totalElement) {
          await this._speak(`Total: ${totalElement.textContent.trim()}`);
        } else {
          await this._speak('No pude encontrar el total');
        }
        return;
      }

      const state = this.store.getState();
      const cart = state.cart || state.carrito || {};
      const total = cart.total || 0;

      await this._speak(`Total a pagar: ${total} pesos`);

    } catch (error) {
      console.error('[Voice Redux Bridge] Error reading cart total:', error);
      await this._speak('No pude leer el total');
    }
  }

  /**
   * Leer cantidad de items en carrito
   * @returns {Promise<void>}
   */
  async readCartItemCount() {
    try {
      if (!this._checkStore()) {
        // Contar desde DOM
        const cartItems = document.querySelectorAll(
          '[data-cart-item], .cart-item, .carrito-item, .shopping-cart-item'
        );
        const count = cartItems.length;
        const message = count === 0 ? 'El carrito está vacío' :
                       count === 1 ? 'Tienes 1 producto en el carrito' :
                       `Tienes ${count} productos en el carrito`;
        await this._speak(message);
        return;
      }

      const state = this.store.getState();
      const cart = state.cart || state.carrito || {};
      const items = cart.items || cart.productos || [];
      const count = items.length;

      const message = count === 0 ? 'El carrito está vacío' :
                     count === 1 ? 'Tienes 1 producto en el carrito' :
                     `Tienes ${count} productos en el carrito`;

      await this._speak(message);

    } catch (error) {
      console.error('[Voice Redux Bridge] Error reading cart count:', error);
      await this._speak('No pude contar los productos');
    }
  }

  // ==================== AUTH ACTIONS ====================

  /**
   * Cerrar sesión
   * @returns {Promise<Boolean>}
   */
  async logoutUser() {
    try {
      console.log('[Voice Redux Bridge] Logging out user');

      if (this._checkStore()) {
        // Despachar acción de logout desde Redux
        // Nota: Esto requiere que la acción esté disponible en el store
        const state = this.store.getState();

        // Intentar encontrar y ejecutar acción de logout
        // (Esto dependerá de cómo esté estructurado Redux en la app)
        if (this.store.dispatch) {
          // Despachar acción genérica de logout
          this.store.dispatch({ type: 'auth/logout' });
          // También intentar otras variantes comunes
          this.store.dispatch({ type: 'LOGOUT' });
          this.store.dispatch({ type: 'USER_LOGOUT' });
        }
      }

      // También intentar hacer click en botón de cerrar sesión
      const logoutButton = document.querySelector(
        'button[aria-label*="cerrar sesión"], button[aria-label*="salir"], .logout-btn, .btn-logout, button[data-action="logout"]'
      ) || Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.toLowerCase().includes('cerrar sesión') ||
        btn.textContent.toLowerCase().includes('salir')
      );

      if (logoutButton) {
        clickActions.simulateReactClick(logoutButton);
        await this._speak('Cerrando sesión');
        return true;
      }

      await this._speak('Sesión cerrada');
      return true;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error logging out:', error);
      await this._speak('No pude cerrar sesión');
      return false;
    }
  }

  /**
   * Obtener información del usuario actual
   * @returns {Object|null} - User info o null
   */
  getUserInfo() {
    try {
      if (!this._checkStore()) {
        return null;
      }

      const state = this.store.getState();
      const user = state.auth?.user || state.user || state.usuario || null;

      console.log('[Voice Redux Bridge] User info:', user);
      return user;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error getting user info:', error);
      return null;
    }
  }

  /**
   * Verificar si hay usuario autenticado
   * @returns {Boolean}
   */
  isAuthenticated() {
    try {
      if (!this._checkStore()) {
        // Verificar desde DOM/localStorage
        const token = localStorage.getItem('token') ||
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('jwt');
        return !!token;
      }

      const state = this.store.getState();
      const isAuth = state.auth?.isAuthenticated ||
                    state.auth?.loggedIn ||
                    !!state.auth?.user ||
                    !!state.auth?.token ||
                    false;

      console.log('[Voice Redux Bridge] Is authenticated:', isAuth);
      return isAuth;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error checking auth:', error);
      return false;
    }
  }

  // ==================== HELPERS ====================

  /**
   * Obtener productos visibles del DOM
   * @returns {Array} - Array de { name, price, element }
   */
  getProductsFromDOM() {
    try {
      const productCards = document.querySelectorAll(
        '[data-product-card], .product-card, .producto-card, article[class*="product"]'
      );

      const products = [];

      productCards.forEach((card, index) => {
        // Verificar si es visible
        const rect = card.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;

        if (!isVisible) return;

        // Extraer nombre
        const nameElement = card.querySelector(
          'h2, h3, h4, .product-name, .product-title, .nombre-producto, [data-product-name]'
        );
        const name = nameElement ? nameElement.textContent.trim() : `Producto ${index + 1}`;

        // Extraer precio
        const priceElement = card.querySelector(
          '.price, .precio, .product-price, [data-product-price]'
        );
        const priceText = priceElement ? priceElement.textContent.trim() : '';
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0 : 0;

        products.push({
          name,
          price,
          element: card
        });
      });

      console.log('[Voice Redux Bridge] Found', products.length, 'products in DOM');
      return products;

    } catch (error) {
      console.error('[Voice Redux Bridge] Error getting products from DOM:', error);
      return [];
    }
  }

  /**
   * Obtener estado completo de Redux
   * @returns {Object|null}
   */
  getState() {
    try {
      if (!this._checkStore()) {
        return null;
      }

      return this.store.getState();

    } catch (error) {
      console.error('[Voice Redux Bridge] Error getting state:', error);
      return null;
    }
  }
}

// Exportar como singleton (se configurará en la app)
const voiceReduxBridge = new VoiceReduxBridge();

export default voiceReduxBridge;
