/**
 * VoiceCommandExecutor
 * Ejecutor de comandos de voz
 * Mapea intenciones a acciones concretas en la aplicación
 */

import { clickActions, scrollActions, formActions, readActions, ListNavigator, modalActions, focusActions } from './voiceActions.js';
import voiceReduxBridge from './reduxIntegration.js';
import homeCommands from './commands/homeCommands.js';

class VoiceCommandExecutor {
  /**
   * Constructor
   * @param {Object} store - Redux store
   * @param {Function} navigate - React Router navigate function
   * @param {Object} ttsService - Text-to-speech service
   */
  constructor(store = null, navigate = null, ttsService = null) {
    this.store = store;
    this.navigate = navigate;
    this.ttsService = ttsService;

    // Configurar Redux bridge
    if (store) {
      voiceReduxBridge.setStore(store);
    }
    if (ttsService) {
      voiceReduxBridge.setTTSService(ttsService);
    }

    // Navegador de listas (para productos, etc.)
    this.listNavigator = null;

    console.log('[Voice Command Executor] Initialized');
  }

  /**
   * Configurar store de Redux
   * @param {Object} store - Redux store
   */
  setStore(store) {
    this.store = store;
    voiceReduxBridge.setStore(store);
  }

  /**
   * Configurar función de navegación
   * @param {Function} navigate - React Router navigate
   */
  setNavigate(navigate) {
    this.navigate = navigate;
  }

  /**
   * Configurar servicio TTS
   * @param {Object} ttsService - TTS service
   */
  setTTSService(ttsService) {
    this.ttsService = ttsService;
    voiceReduxBridge.setTTSService(ttsService);
  }

  /**
   * Hablar mensaje (helper)
   * @private
   */
  async _speak(message, options = {}) {
    if (this.ttsService && this.ttsService.speak) {
      return this.ttsService.speak(message, options);
    } else {
      console.log('[Voice Command Executor] TTS:', message);
    }
  }

  /**
   * Ejecutar comando según intención
   * @param {String} intent - Intención detectada
   * @param {Object} params - Parámetros extraídos
   * @returns {Promise<Object>} - Resultado de la ejecución
   */
  async executeCommand(intent, params = {}) {
    try {
      console.log('[Voice Command Executor] Executing:', intent, params);

      // Router de comandos
      switch (intent) {
        // ==================== NAVEGACIÓN ====================
        case 'navigate_home':
          return await this.navigateHome();
        case 'navigate_catalog':
          return await this.navigateCatalog();
        case 'navigate_cart':
          return await this.navigateCart();
        case 'navigate_checkout':
          return await this.navigateCheckout();
        case 'navigate_profile':
          return await this.navigateProfile();
        case 'navigate_login':
          return await this.navigateLogin();
        case 'navigate_register':
          return await this.navigateRegister();

        // ==================== BÚSQUEDA Y FILTROS ====================
        case 'search_product':
          return await this.searchProduct(params.producto);
        case 'filter_category':
          return await this.filterCategory(params.categoria);
        case 'clear_filters':
          return await this.clearFilters();

        // ==================== CARRITO ====================
        case 'add_to_cart':
          return await this.addToCart(params.producto, params.cantidad);
        case 'remove_from_cart':
          return await this.removeFromCart(params.numero);
        case 'update_quantity':
          return await this.updateQuantity(params.numero, params.cantidad);
        case 'clear_cart':
          return await this.clearCart();
        case 'checkout':
          return await this.navigateCheckout();

        // ==================== LECTURA ====================
        case 'read_products':
          return await this.readProducts();
        case 'read_cart':
          return await this.readCart();
        case 'read_page':
          return await this.readPage();
        case 'read_total':
          return await this.readCartTotal();

        // ==================== NAVEGACIÓN DE LISTAS ====================
        case 'next_item':
          return await this.nextItem();
        case 'previous_item':
          return await this.previousItem();
        case 'first_item':
          return await this.firstItem();
        case 'last_item':
          return await this.lastItem();
        case 'select_item':
          return await this.selectItem();

        // ==================== SCROLL ====================
        case 'scroll_up':
          return await this.scrollUp();
        case 'scroll_down':
          return await this.scrollDown();
        case 'scroll_top':
          return await this.scrollTop();
        case 'scroll_bottom':
          return await this.scrollBottom();

        // ==================== FORMULARIOS ====================
        case 'fill_field':
          return await this.fillField(params.campo, params.valor);
        case 'submit_form':
          return await this.submitForm();

        // ==================== MODALES ====================
        case 'open_modal':
          return await this.openModal(params.modal);
        case 'close_modal':
          return await this.closeModal();

        // ==================== SISTEMA ====================
        case 'help':
          return await this.showHelp();
        case 'repeat':
          return { success: true, action: 'repeat' };

        // ==================== ESPECÍFICOS DE HOME ====================
        case 'rappi':
          return await this.openRappi();
        case 'whatsapp':
          return await this.openWhatsapp();
        case 'about':
        case 'quienes_somos':
          return await this.scrollToAbout();
        case 'location':
        case 'ubicacion':
          return await this.scrollToLocation();
        case 'terms':
        case 'terminos':
          return await this.openTerms();
        case 'privacy':
        case 'privacidad':
          return await this.openPrivacy();
        case 'contact':
        case 'contacto':
          return await this.readContactInfo();

        // ==================== ESPECÍFICOS DE TEST ====================
        case 'request_test':
          return await this.requestTest();
        case 'view_result':
          return await this.viewTestResult();

        // ==================== AUTH ====================
        case 'logout':
          return await this.logout();

        // ==================== DESCONOCIDO ====================
        default:
          console.warn('[Voice Command Executor] Unknown intent:', intent);
          await this._speak('No entendí ese comando. Di "ayuda" para ver los comandos disponibles.');
          return { success: false, action: 'unknown', intent };
      }

    } catch (error) {
      console.error('[Voice Command Executor] Error executing command:', error);
      await this._speak('Hubo un error al ejecutar el comando');
      return { success: false, error: error.message };
    }
  }

  // ==================== COMANDOS DE NAVEGACIÓN ====================

  async navigateHome() {
    if (this.navigate) {
      this.navigate('/');
      await this._speak('Ir a inicio');
      return { success: true, action: 'navigate', page: 'home' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  async navigateCatalog() {
    if (this.navigate) {
      this.navigate('/carta');
      await this._speak('Ir a la carta');
      return { success: true, action: 'navigate', page: 'catalog' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  async navigateCart() {
    if (this.navigate) {
      this.navigate('/carrito');
      await this._speak('Ir al carrito');
      return { success: true, action: 'navigate', page: 'cart' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  async navigateCheckout() {
    if (this.navigate) {
      this.navigate('/payment');
      await this._speak('Proceder al pago');
      return { success: true, action: 'navigate', page: 'checkout' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  async navigateProfile() {
    if (this.navigate) {
      this.navigate('/profile');
      await this._speak('Ir a mi perfil');
      return { success: true, action: 'navigate', page: 'profile' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  async navigateLogin() {
    if (this.navigate) {
      this.navigate('/auth/login');
      await this._speak('Ir a iniciar sesión');
      return { success: true, action: 'navigate', page: 'login' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  async navigateRegister() {
    if (this.navigate) {
      this.navigate('/auth/register');
      await this._speak('Ir a registro');
      return { success: true, action: 'navigate', page: 'register' };
    }
    return { success: false, error: 'Navigate function not available' };
  }

  // ==================== COMANDOS DE BÚSQUEDA Y FILTROS ====================

  async searchProduct(productName) {
    if (!productName) {
      await this._speak('¿Qué producto quieres buscar?');
      return { success: false, error: 'No product name provided' };
    }

    // Buscar input de búsqueda
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="buscar" i], input[name*="search" i]');

    if (searchInput) {
      formActions.fillInput('buscar', productName);
      await this._speak(`Buscando ${productName}`);
      return { success: true, action: 'search', product: productName };
    }

    await this._speak('No encontré el campo de búsqueda');
    return { success: false, error: 'Search input not found' };
  }

  async filterCategory(category) {
    if (!category) {
      await this._speak('¿Por qué categoría quieres filtrar?');
      return { success: false, error: 'No category provided' };
    }

    // Buscar botón de categoría
    const categoryButton = clickActions.clickByAccessibleName(category);

    if (categoryButton) {
      await this._speak(`Filtrando por ${category}`);
      return { success: true, action: 'filter', category };
    }

    await this._speak(`No encontré la categoría ${category}`);
    return { success: false, error: 'Category not found' };
  }

  async clearFilters() {
    const clearButton = clickActions.clickByAccessibleName('limpiar filtros') ||
                       clickActions.clickByAccessibleName('quitar filtros') ||
                       clickActions.clickByAccessibleName('todos');

    if (clearButton) {
      await this._speak('Filtros limpiados');
      return { success: true, action: 'clear_filters' };
    }

    await this._speak('No encontré el botón de limpiar filtros');
    return { success: false, error: 'Clear filters button not found' };
  }

  // ==================== COMANDOS DE CARRITO ====================

  async addToCart(productName, quantity = 1) {
    if (productName) {
      // Agregar producto específico por nombre
      const success = await voiceReduxBridge.addToCartByName(productName, quantity);
      return { success, action: 'add_to_cart', product: productName, quantity };
    } else {
      // Agregar producto actual/destacado
      const success = await voiceReduxBridge.addCurrentProductToCart(quantity);
      return { success, action: 'add_to_cart', quantity };
    }
  }

  async removeFromCart(index) {
    if (!index || index < 1) {
      await this._speak('¿Qué producto quieres eliminar?');
      return { success: false, error: 'No index provided' };
    }

    const success = await voiceReduxBridge.removeFromCartByIndex(index);
    return { success, action: 'remove_from_cart', index };
  }

  async updateQuantity(index, newQuantity) {
    if (!index || index < 1 || !newQuantity) {
      await this._speak('Especifica el producto y la nueva cantidad');
      return { success: false, error: 'Invalid parameters' };
    }

    const success = await voiceReduxBridge.updateCartQuantity(index, newQuantity);
    return { success, action: 'update_quantity', index, quantity: newQuantity };
  }

  async clearCart() {
    const success = await voiceReduxBridge.clearCart();
    return { success, action: 'clear_cart' };
  }

  // ==================== COMANDOS DE LECTURA ====================

  async readProducts() {
    const products = readActions.readProducts();

    if (products.length === 0) {
      await this._speak('No hay productos para leer');
      return { success: false, action: 'read_products' };
    }

    await this._speak(`Hay ${products.length} productos disponibles`);

    // Leer primeros 5 productos
    const productsToRead = products.slice(0, 5);
    for (const product of productsToRead) {
      const message = `${product.name}, ${product.price}`;
      await this._speak(message);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (products.length > 5) {
      await this._speak(`Y ${products.length - 5} productos más`);
    }

    return { success: true, action: 'read_products', count: products.length };
  }

  async readCart() {
    await voiceReduxBridge.readCart();
    return { success: true, action: 'read_cart' };
  }

  async readCartTotal() {
    await voiceReduxBridge.readCartTotal();
    return { success: true, action: 'read_total' };
  }

  async readPage() {
    const headings = readActions.readHeadings();

    if (headings.length === 0) {
      await this._speak('No encontré encabezados en esta página');
      return { success: false, action: 'read_page' };
    }

    await this._speak('Leyendo página');

    for (const heading of headings.slice(0, 5)) {
      await this._speak(heading);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    return { success: true, action: 'read_page', headings: headings.length };
  }

  // ==================== COMANDOS DE NAVEGACIÓN DE LISTAS ====================

  async nextItem() {
    if (!this.listNavigator) {
      this.listNavigator = new ListNavigator('[data-product-card], .product-card, article');
    }

    const element = this.listNavigator.next();

    if (element) {
      const info = this.listNavigator.getCurrentInfo();
      await this._speak(`Producto ${info.index + 1} de ${info.total}`);
      return { success: true, action: 'next_item', index: info.index };
    }

    await this._speak('No hay elementos para navegar');
    return { success: false, action: 'next_item' };
  }

  async previousItem() {
    if (!this.listNavigator) {
      this.listNavigator = new ListNavigator('[data-product-card], .product-card, article');
    }

    const element = this.listNavigator.previous();

    if (element) {
      const info = this.listNavigator.getCurrentInfo();
      await this._speak(`Producto ${info.index + 1} de ${info.total}`);
      return { success: true, action: 'previous_item', index: info.index };
    }

    await this._speak('No hay elementos para navegar');
    return { success: false, action: 'previous_item' };
  }

  async firstItem() {
    if (!this.listNavigator) {
      this.listNavigator = new ListNavigator('[data-product-card], .product-card, article');
    }

    const element = this.listNavigator.first();

    if (element) {
      await this._speak('Primer producto');
      return { success: true, action: 'first_item' };
    }

    await this._speak('No hay productos');
    return { success: false, action: 'first_item' };
  }

  async lastItem() {
    if (!this.listNavigator) {
      this.listNavigator = new ListNavigator('[data-product-card], .product-card, article');
    }

    const element = this.listNavigator.last();

    if (element) {
      await this._speak('Último producto');
      return { success: true, action: 'last_item' };
    }

    await this._speak('No hay productos');
    return { success: false, action: 'last_item' };
  }

  async selectItem() {
    if (!this.listNavigator) {
      await this._speak('Primero navega a un producto');
      return { success: false, action: 'select_item', error: 'No navigator initialized' };
    }

    const success = this.listNavigator.selectCurrent();

    if (success) {
      await this._speak('Abriendo producto');
      return { success: true, action: 'select_item' };
    }

    await this._speak('No hay producto seleccionado');
    return { success: false, action: 'select_item' };
  }

  // ==================== COMANDOS DE SCROLL ====================

  async scrollUp() {
    scrollActions.scrollUp();
    return { success: true, action: 'scroll_up' };
  }

  async scrollDown() {
    scrollActions.scrollDown();
    return { success: true, action: 'scroll_down' };
  }

  async scrollTop() {
    scrollActions.scrollToTop();
    await this._speak('Ir arriba');
    return { success: true, action: 'scroll_top' };
  }

  async scrollBottom() {
    scrollActions.scrollToBottom();
    await this._speak('Ir abajo');
    return { success: true, action: 'scroll_bottom' };
  }

  // ==================== COMANDOS DE FORMULARIOS ====================

  async fillField(field, value) {
    if (!field || !value) {
      await this._speak('Especifica el campo y el valor');
      return { success: false, error: 'Missing field or value' };
    }

    const success = formActions.fillInput(field, value);

    if (success) {
      await this._speak(`Campo ${field} llenado`);
      return { success: true, action: 'fill_field', field, value };
    }

    await this._speak(`No encontré el campo ${field}`);
    return { success: false, action: 'fill_field', field };
  }

  async submitForm() {
    const success = formActions.submitForm();

    if (success) {
      await this._speak('Enviando formulario');
      return { success: true, action: 'submit_form' };
    }

    await this._speak('No encontré el formulario');
    return { success: false, action: 'submit_form' };
  }

  // ==================== COMANDOS DE MODALES ====================

  async openModal(modalId) {
    if (!modalId) {
      await this._speak('¿Qué modal quieres abrir?');
      return { success: false, error: 'No modal ID provided' };
    }

    const success = modalActions.openModal(modalId);

    if (success) {
      await this._speak(`Abriendo ${modalId}`);
      return { success: true, action: 'open_modal', modal: modalId };
    }

    await this._speak(`No encontré el modal ${modalId}`);
    return { success: false, action: 'open_modal', modal: modalId };
  }

  async closeModal() {
    const success = modalActions.closeModal();

    if (success) {
      await this._speak('Cerrando');
      return { success: true, action: 'close_modal' };
    }

    await this._speak('No hay modal abierto');
    return { success: false, action: 'close_modal' };
  }

  // ==================== COMANDOS DE SISTEMA ====================

  async showHelp() {
    await this._speak('Puedes decir: ir a inicio, ir a carta, agregar al carrito, leer productos, siguiente, anterior, subir, bajar, y más. Di "leer página" para escuchar los comandos disponibles.');
    return { success: true, action: 'help' };
  }

  async logout() {
    const success = await voiceReduxBridge.logoutUser();
    return { success, action: 'logout' };
  }

  // ==================== COMANDOS ESPECÍFICOS DE HOME ====================

  async openRappi() {
    return await homeCommands.openRappi(this.ttsService);
  }

  async openWhatsapp() {
    return await homeCommands.openWhatsapp(this.ttsService);
  }

  async scrollToAbout() {
    return await homeCommands.goToAboutUs(this.ttsService);
  }

  async scrollToLocation() {
    return await homeCommands.goToLocation(this.ttsService);
  }

  async openTerms() {
    return await homeCommands.openTerms(this.ttsService);
  }

  async openPrivacy() {
    return await homeCommands.openPrivacy(this.ttsService);
  }

  async readContactInfo() {
    return await homeCommands.readContactInfo(this.ttsService);
  }

  // ==================== COMANDOS ESPECÍFICOS DE TEST ====================

  async requestTest() {
    const testButton = clickActions.clickByAccessibleName('solicitar test') ||
                      clickActions.clickByAccessibleName('hacer test') ||
                      clickActions.clickByAccessibleName('comenzar test');

    if (testButton) {
      await this._speak('Iniciando test de preferencias');
      return { success: true, action: 'request_test' };
    }

    // Intentar navegar a la página de test
    if (this.navigate) {
      this.navigate('/test');
      await this._speak('Ir al test de preferencias');
      return { success: true, action: 'request_test' };
    }

    await this._speak('No encontré el test');
    return { success: false, action: 'request_test' };
  }

  async viewTestResult() {
    const resultButton = clickActions.clickByAccessibleName('ver resultado') ||
                        clickActions.clickByAccessibleName('mi resultado') ||
                        clickActions.clickByAccessibleName('resultado');

    if (resultButton) {
      await this._speak('Mostrando resultado');
      return { success: true, action: 'view_result' };
    }

    await this._speak('No encontré el resultado');
    return { success: false, action: 'view_result' };
  }
}

export default VoiceCommandExecutor;
