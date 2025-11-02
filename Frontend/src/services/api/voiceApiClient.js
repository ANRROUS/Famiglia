/**
 * VoiceApiClient
 * Cliente para comunicarse con el backend de comandos de voz
 * Maneja la interpretación de comandos y obtención de capacidades
 */

class VoiceApiClient {
  constructor() {
    // Configurar baseURL desde variable de entorno o usar default
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.apiPath = '/api/voice';
    this.timeout = 10000; // 10 segundos de timeout
  }

  /**
   * Realizar petición HTTP genérica
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseURL}${this.apiPath}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      // Parsear respuesta JSON
      const data = await response.json();

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Manejar diferentes tipos de errores
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Verifica tu conexión a internet.');
      }

      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }

      throw error;
    }
  }

  /**
   * Procesar comando de voz
   * @param {String} text - Texto del comando de voz
   * @param {Object} context - Contexto actual
   * @returns {Promise<Object>} - { success, intent, params, confidence, ttsResponse, language }
   */
  async processCommand(text, context = {}) {
    try {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('El texto del comando es requerido');
      }

      console.log('[Voice API Client] Processing command:', text);
      console.log('[Voice API Client] Context:', context);

      const data = await this._request('/command', {
        method: 'POST',
        body: JSON.stringify({
          text: text.trim(),
          context: {
            currentPage: context.currentPage || 'home',
            userRole: context.userRole || 'visitante',
            cartItemsCount: context.cartItemsCount || 0,
            productCount: context.productCount || 0
          }
        })
      });

      console.log('[Voice API Client] Command processed:', data);

      return {
        success: data.success || false,
        intent: data.intent || 'unknown',
        params: data.params || {},
        confidence: data.confidence || 0.0,
        ttsResponse: data.ttsResponse || 'No pude procesar el comando',
        language: data.language || 'es-MX',
        suggestion: data.suggestion || null
      };
    } catch (error) {
      console.error('[Voice API Client] Error processing command:', error);

      // Retornar error estructurado
      return {
        success: false,
        intent: 'error',
        params: {},
        confidence: 0.0,
        ttsResponse: error.message || 'Lo siento, hubo un error al procesar tu comando.',
        language: 'es-MX',
        error: error.message
      };
    }
  }

  /**
   * Obtener comandos disponibles según contexto
   * @param {String} context - Contexto actual (home, catalog, cart, etc.)
   * @param {String} userRole - Rol del usuario (visitante, cliente, admin)
   * @returns {Promise<Object>} - { success, context, userRole, commands }
   */
  async getCapabilities(context = 'home', userRole = 'visitante') {
    try {
      console.log('[Voice API Client] Getting capabilities for:', context, userRole);

      const data = await this._request(
        `/capabilities?context=${encodeURIComponent(context)}&userRole=${encodeURIComponent(userRole)}`,
        {
          method: 'GET'
        }
      );

      console.log('[Voice API Client] Capabilities retrieved:', data);

      return {
        success: data.success || false,
        context: data.context || context,
        userRole: data.userRole || userRole,
        commands: {
          global: data.commands?.global || [],
          contextual: data.commands?.contextual || [],
          roleSpecific: data.commands?.roleSpecific || []
        }
      };
    } catch (error) {
      console.error('[Voice API Client] Error getting capabilities:', error);

      // Retornar error estructurado
      return {
        success: false,
        context,
        userRole,
        commands: {
          global: [],
          contextual: [],
          roleSpecific: []
        },
        error: error.message
      };
    }
  }

  /**
   * Describir página actual
   * @param {String} page - Nombre de la página actual
   * @param {Object} context - Contexto adicional
   * @returns {Promise<Object>} - { success, page, title, description, details, ttsResponse }
   */
  async describePage(page, context = {}) {
    try {
      if (!page || typeof page !== 'string') {
        throw new Error('El nombre de la página es requerido');
      }

      console.log('[Voice API Client] Describing page:', page);
      console.log('[Voice API Client] Context:', context);

      const data = await this._request('/describe', {
        method: 'POST',
        body: JSON.stringify({
          page: page.toLowerCase(),
          context: {
            productCount: context.productCount || 0,
            cartItemsCount: context.cartItemsCount || 0,
            cartTotal: context.cartTotal || 0
          }
        })
      });

      console.log('[Voice API Client] Page described:', data);

      return {
        success: data.success || false,
        page: data.page || page,
        title: data.title || 'Página',
        description: data.description || '',
        details: data.details || '',
        ttsResponse: data.ttsResponse || 'Estás en una página de Famiglia.'
      };
    } catch (error) {
      console.error('[Voice API Client] Error describing page:', error);

      // Retornar error estructurado
      return {
        success: false,
        page,
        title: 'Error',
        description: 'No se pudo describir la página',
        details: '',
        ttsResponse: 'Lo siento, no puedo describir esta página en este momento.',
        error: error.message
      };
    }
  }

  /**
   * Verificar conexión con el servidor
   * @returns {Promise<Boolean>}
   */
  async checkConnection() {
    try {
      await this._request('/capabilities?context=home&userRole=visitante', {
        method: 'GET'
      });
      return true;
    } catch (error) {
      console.error('[Voice API Client] Connection check failed:', error);
      return false;
    }
  }

  /**
   * Configurar timeout personalizado
   * @param {Number} timeout - Timeout en milisegundos
   */
  setTimeout(timeout) {
    if (typeof timeout === 'number' && timeout > 0) {
      this.timeout = timeout;
      console.log('[Voice API Client] Timeout set to:', timeout, 'ms');
    } else {
      console.error('[Voice API Client] Invalid timeout value');
    }
  }

  /**
   * Configurar baseURL personalizado
   * @param {String} baseURL - URL base del backend
   */
  setBaseURL(baseURL) {
    if (typeof baseURL === 'string' && baseURL.length > 0) {
      this.baseURL = baseURL;
      console.log('[Voice API Client] Base URL set to:', baseURL);
    } else {
      console.error('[Voice API Client] Invalid base URL');
    }
  }

  /**
   * Obtener configuración actual
   * @returns {Object}
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      apiPath: this.apiPath,
      timeout: this.timeout,
      fullURL: `${this.baseURL}${this.apiPath}`
    };
  }
}

// Exportar como singleton
const voiceApiClient = new VoiceApiClient();

export default voiceApiClient;
