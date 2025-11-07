/**
 * VoiceCommandExecutor
 * Ejecutor de comandos de voz
 * Mapea intenciones a acciones concretas en la aplicación
 */

import { clickActions, scrollActions, formActions, readActions, ListNavigator, modalActions, focusActions } from './voiceActions.js';
import voiceReduxBridge from './reduxIntegration.js';
import homeCommands from './commands/homeCommands.js';
import catalogCommands from './commands/catalogCommands.js';
import cartCommands from './commands/cartCommands.js';
import testCommands from './commands/testCommands.js';
import profileCommands from './commands/profileCommands.js';
import adminCommands from './commands/adminCommands.js';

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

    // Contador de errores consecutivos
    this.consecutiveErrors = 0;
    this.lastErrorTime = null;

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
   * Manejar error y proporcionar feedback
   * @private
   */
  async _handleError(error, context = {}) {
    this.consecutiveErrors++;
    this.lastErrorTime = Date.now();

    console.error('[Voice Command Executor] Error:', {
      message: error.message,
      context,
      consecutiveErrors: this.consecutiveErrors,
      timestamp: new Date().toISOString()
    });

    // Mensajes de error específicos
    let errorMessage = '';

    if (error.message.includes('not found') || error.message.includes('No encontr')) {
      errorMessage = 'No encontré ese elemento. ';
    } else if (error.message.includes('page') || error.message.includes('página')) {
      errorMessage = 'Este comando no está disponible en esta página. ';
    } else if (error.message.includes('Navigate')) {
      errorMessage = 'No puedo navegar a esa página. ';
    } else {
      errorMessage = 'Hubo un error al ejecutar el comando. ';
    }

    // Ofrecer ayuda si hay muchos errores consecutivos
    if (this.consecutiveErrors >= 3) {
      errorMessage += 'Parece que tienes problemas. Di "ayuda" para ver los comandos disponibles.';
      this.consecutiveErrors = 0; // Reset
    } else {
      errorMessage += 'Intenta de nuevo o di "ayuda".';
    }

    await this._speak(errorMessage);

    return {
      success: false,
      error: error.message,
      consecutiveErrors: this.consecutiveErrors
    };
  }

  /**
   * Resetear contador de errores (llamar en éxito)
   * @private
   */
  _resetErrors() {
    if (this.consecutiveErrors > 0) {
      console.log('[Voice Command Executor] Resetting error count');
      this.consecutiveErrors = 0;
    }
  }

  /**
   * Verificar si el comando está disponible en la página actual
   * @private
   */
  _isCommandAvailableOnPage(intent) {
    const currentPath = window.location.pathname;

    const pageRestrictions = {
      // Comandos solo de catálogo
      'filter_category': ['/carta', '/catalog'],
      'filter_price_max': ['/carta', '/catalog'],
      'filter_price_min': ['/carta', '/catalog'],
      'next_item': ['/carta', '/catalog'],
      'previous_item': ['/carta', '/catalog'],

      // Comandos solo de carrito
      'remove_from_cart': ['/cart', '/carrito'],
      'update_quantity': ['/cart', '/carrito'],
      'read_cart': ['/cart', '/carrito', '/payment'],

      // Comandos solo de pago
      'select_payment_method': ['/payment', '/pago'],
      'finalize_purchase': ['/payment', '/pago'],

      // Comandos solo de test
      'answer_question': ['/test', '/preferencias'],
      'read_result': ['/test', '/preferencias'],

      // Comandos solo de perfil
      'view_order_history': ['/profile', '/perfil'],
      'read_orders': ['/profile', '/perfil'],

      // Comandos solo de admin
      'view_admin_products': ['/admin'],
      'change_order_status': ['/admin']
    };

    const requiredPages = pageRestrictions[intent];

    if (!requiredPages) {
      return true; // Sin restricciones
    }

    return requiredPages.some(page => currentPath.includes(page));
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

      // Verificar si el comando está disponible en la página actual
      if (!this._isCommandAvailableOnPage(intent)) {
        const currentPage = window.location.pathname;
        console.warn('[Voice Command Executor] Command not available on page:', currentPage);

        await this._speak(`Este comando no está disponible en esta página. Intenta ir a la página correcta primero.`);

        return {
          success: false,
          action: 'unavailable',
          intent,
          reason: 'Command not available on current page'
        };
      }

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
        case 'filter_price_max':
        case 'filter_price_less_than':
          return await this.filterPriceLessThan(params.precio);
        case 'filter_price_min':
        case 'filter_price_greater_than':
          return await this.filterPriceGreaterThan(params.precio);
        case 'clear_filters':
          return await this.clearFilters();

        // ==================== CARRITO ====================
        case 'add_to_cart':
          return await this.addToCart(params.producto, params.cantidad);
        case 'remove_from_cart':
          return await this.removeFromCart(params.numero);
        case 'update_quantity':
        case 'modify_quantity':
          return await this.updateQuantity(params.numero, params.cantidad);
        case 'clear_cart':
          return await this.clearCart();
        case 'checkout':
        case 'proceed_to_checkout':
          return await this.navigateCheckout();
        case 'select_payment_method':
          return await this.selectPaymentMethod(params.metodo);
        case 'activate_dictation':
        case 'enter_data':
          return await this.activateDictation();
        case 'finalize_purchase':
        case 'complete_order':
          return await this.finalizePurchase();
        case 'apply_coupon':
          return await this.applyCoupon(params.cupon);

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
        case 'start_test':
        case 'new_test':
          return await this.requestTest();
        case 'view_result':
        case 'show_result':
          return await this.viewTestResult();
        case 'read_result':
          return await this.readTestResult();
        case 'add_recommended':
          return await this.addRecommendedToCart(params.numero);
        case 'restart_test':
        case 'repeat_test':
          return await this.restartTest();
        case 'answer_question':
        case 'select_option':
          return await this.answerTestQuestion(params.opcion);

        // ==================== AUTH ====================
        case 'logout':
          return await this.logout();

        // ==================== ESPECÍFICOS DE PERFIL ====================
        case 'view_profile':
        case 'profile_info':
          return await this.viewProfileInfo();
        case 'view_order_history':
        case 'my_orders':
          return await this.viewOrderHistory();
        case 'read_orders':
          return await this.readOrderHistory();
        case 'view_test_history':
        case 'my_tests':
          return await this.viewTestHistory();
        case 'read_tests':
          return await this.readTestHistory();

        // ==================== ESPECÍFICOS DE ADMIN ====================
        case 'view_admin_products':
          return await this.viewAdminProducts();
        case 'search_admin_product':
          return await this.searchAdminProduct(params.producto);
        case 'filter_admin_category':
          return await this.filterAdminByCategory(params.categoria);
        case 'view_delivered_orders':
          return await this.viewDeliveredOrders();
        case 'view_reserved_orders':
        case 'view_pending_orders':
          return await this.viewReservedOrders();
        case 'search_order_ticket':
          return await this.searchOrderByTicket(params.ticket);
        case 'change_order_status':
          return await this.changeOrderStatus(params.estado);

        // ==================== DESCONOCIDO ====================
        default:
          console.warn('[Voice Command Executor] Unknown intent:', intent);
          this.consecutiveErrors++;

          if (this.consecutiveErrors >= 3) {
            await this._speak('Parece que no entiendo tus comandos. Di "ayuda" para ver todos los comandos disponibles.');
            this.consecutiveErrors = 0;
          } else {
            await this._speak('No entendí ese comando. Di "ayuda" para ver los comandos disponibles.');
          }

          return { success: false, action: 'unknown', intent, consecutiveErrors: this.consecutiveErrors };
      }

      // Si llegamos aquí, el comando fue exitoso
      this._resetErrors();

    } catch (error) {
      console.error('[Voice Command Executor] Error executing command:', error);
      return await this._handleError(error, { intent, params });
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
    return await catalogCommands.searchProduct(productName, this.ttsService);
  }

  async filterCategory(category) {
    return await catalogCommands.filterByCategory(category, this.ttsService);
  }

  async filterPriceLessThan(maxPrice) {
    return await catalogCommands.filterPriceLessThan(maxPrice, this.ttsService);
  }

  async filterPriceGreaterThan(minPrice) {
    return await catalogCommands.filterPriceGreaterThan(minPrice, this.ttsService);
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
    return await cartCommands.removeFromCart(index, this.ttsService);
  }

  async updateQuantity(index, newQuantity) {
    return await cartCommands.updateCartQuantity(index, newQuantity, this.ttsService);
  }

  async clearCart() {
    return await cartCommands.clearCart(this.ttsService);
  }

  async selectPaymentMethod(method) {
    return await cartCommands.selectPaymentMethod(method, this.ttsService);
  }

  async activateDictation() {
    return await cartCommands.activateDictationMode(this.ttsService);
  }

  async finalizePurchase() {
    return await cartCommands.finalizePurchase(this.ttsService);
  }

  async applyCoupon(couponCode) {
    return await cartCommands.applyCoupon(couponCode, this.ttsService);
  }

  // ==================== COMANDOS DE LECTURA ====================

  async readProducts() {
    return await catalogCommands.readAllProducts(this.ttsService);
  }

  async readCart() {
    return await cartCommands.readCart(this.ttsService);
  }

  async readCartTotal() {
    return await cartCommands.readCartTotal(this.ttsService);
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
    return await catalogCommands.nextProduct(this.ttsService);
  }

  async previousItem() {
    return await catalogCommands.previousProduct(this.ttsService);
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
    return await testCommands.requestNewTest(this.navigate, this.ttsService);
  }

  async viewTestResult() {
    return await testCommands.viewTestResult(this.ttsService);
  }

  async readTestResult() {
    return await testCommands.readTestResult(this.ttsService);
  }

  async addRecommendedToCart(index = 1) {
    return await testCommands.addRecommendedToCart(index, this.ttsService);
  }

  async restartTest() {
    return await testCommands.restartTest(this.ttsService);
  }

  async answerTestQuestion(optionIndex) {
    return await testCommands.answerTestQuestion(optionIndex, this.ttsService);
  }

  // ==================== COMANDOS ESPECÍFICOS DE PERFIL ====================

  async viewProfileInfo() {
    return await profileCommands.viewProfileInfo(this.ttsService);
  }

  async viewOrderHistory() {
    return await profileCommands.viewOrderHistory(this.ttsService);
  }

  async readOrderHistory() {
    return await profileCommands.readOrderHistory(this.ttsService);
  }

  async viewTestHistory() {
    return await profileCommands.viewTestHistory(this.ttsService);
  }

  async readTestHistory() {
    return await profileCommands.readTestHistory(this.ttsService);
  }

  // ==================== COMANDOS ESPECÍFICOS DE ADMIN ====================

  async viewAdminProducts() {
    return await adminCommands.viewAdminProducts(this.ttsService);
  }

  async searchAdminProduct(productName) {
    return await adminCommands.searchAdminProduct(productName, this.ttsService);
  }

  async filterAdminByCategory(category) {
    return await adminCommands.filterAdminByCategory(category, this.ttsService);
  }

  async viewDeliveredOrders() {
    return await adminCommands.viewDeliveredOrders(this.ttsService);
  }

  async viewReservedOrders() {
    return await adminCommands.viewReservedOrders(this.ttsService);
  }

  async searchOrderByTicket(ticketNumber) {
    return await adminCommands.searchOrderByTicket(ticketNumber, this.ttsService);
  }

  async changeOrderStatus(newStatus) {
    return await adminCommands.changeOrderStatus(newStatus, this.ttsService);
  }
}

export default VoiceCommandExecutor;
