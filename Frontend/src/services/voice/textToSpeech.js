/**
 * TextToSpeechService
 * Servicio para convertir texto a voz usando Web Speech API (SpeechSynthesis)
 * Configurado para español de México (es-MX)
 */

class TextToSpeechService {
  constructor() {
    // Verificar soporte del navegador
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.defaultRate = 0.95; // Velocidad ligeramente más lenta para accesibilidad
    this.defaultPitch = 1.0;
    this.defaultVolume = 1.0;
    this.lastMessage = ''; // Para la funcionalidad de "repetir"

    if (!this.synth) {
      console.error('[TTS] SpeechSynthesis API not supported');
      return;
    }

    // Cargar voces cuando estén disponibles
    this.loadVoices();

    // En Chrome, las voces se cargan de forma asíncrona
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  /**
   * Cargar y seleccionar voz en español
   */
  loadVoices() {
    this.voices = this.synth.getVoices();

    // Prioridad de selección: es-MX > es-ES > cualquier es > primera disponible
    const priorities = [
      (v) => v.lang === 'es-MX',
      (v) => v.lang === 'es-ES',
      (v) => v.lang.startsWith('es-'),
      (v) => v.lang.startsWith('es')
    ];

    for (const priorityFn of priorities) {
      const voice = this.voices.find(priorityFn);
      if (voice) {
        this.selectedVoice = voice;
        console.log('[TTS] Selected voice:', voice.name, voice.lang);
        break;
      }
    }

    // Si no hay voz en español, usar la primera disponible
    if (!this.selectedVoice && this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
      console.warn('[TTS] No Spanish voice found, using default:', this.selectedVoice.name);
    }
  }

  /**
   * Hablar texto con opciones personalizables
   * @param {String} text - Texto a hablar
   * @param {Object} options - Opciones de configuración (rate, pitch, volume, voice)
   * @returns {Promise} - Promesa que se resuelve cuando termina de hablar
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.error('[TTS] SpeechSynthesis not available');
        reject(new Error('Text-to-speech not available'));
        return;
      }

      if (!text || text.trim().length === 0) {
        console.warn('[TTS] Empty text provided');
        resolve();
        return;
      }

      // Cancelar cualquier habla en progreso
      this.cancel();

      // Guardar mensaje para "repetir"
      this.lastMessage = text;

      // Crear utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Configuración
      utterance.voice = options.voice || this.selectedVoice;
      utterance.rate = options.rate !== undefined ? options.rate : this.defaultRate;
      utterance.pitch = options.pitch !== undefined ? options.pitch : this.defaultPitch;
      utterance.volume = options.volume !== undefined ? options.volume : this.defaultVolume;
      utterance.lang = options.lang || 'es-MX';

      // Event handlers
      utterance.onend = () => {
        console.log('[TTS] Finished speaking');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('[TTS] Error:', event.error);
        reject(new Error(`TTS Error: ${event.error}`));
      };

      utterance.onstart = () => {
        console.log('[TTS] Started speaking:', text.substring(0, 50) + '...');
      };

      // Hablar
      this.synth.speak(utterance);
    });
  }

  /**
   * Confirmación rápida (velocidad y tono ligeramente aumentados)
   * @param {String} message - Mensaje de confirmación
   */
  async confirm(message) {
    return this.speak(message, {
      rate: 1.1,
      pitch: 1.05
    });
  }

  /**
   * Anuncio importante (tono aumentado)
   * @param {String} message - Mensaje de anuncio
   */
  async announce(message) {
    return this.speak(message, {
      pitch: 1.1
    });
  }

  /**
   * Mensaje de error (velocidad y tono reducidos)
   * @param {String} message - Mensaje de error
   */
  async error(message) {
    return this.speak(message, {
      rate: 0.85,
      pitch: 0.9
    });
  }

  /**
   * Leer lista de items con pausas
   * @param {Array} items - Lista de items a leer
   * @param {Number} pauseMs - Pausa entre items en milisegundos (default 500ms)
   */
  async readList(items, pauseMs = 500) {
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[TTS] Empty or invalid items list');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const text = typeof item === 'string' ? item : item.toString();

      await this.speak(text);

      // Pausa entre items (excepto después del último)
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, pauseMs));
      }
    }
  }

  /**
   * Pausar habla actual
   */
  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      console.log('[TTS] Paused');
    }
  }

  /**
   * Reanudar habla pausada
   */
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      console.log('[TTS] Resumed');
    }
  }

  /**
   * Cancelar habla actual
   */
  cancel() {
    if (this.synth) {
      this.synth.cancel();
      console.log('[TTS] Cancelled');
    }
  }

  /**
   * Verificar si está hablando
   * @returns {Boolean}
   */
  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  /**
   * Verificar si está pausado
   * @returns {Boolean}
   */
  isPaused() {
    return this.synth ? this.synth.paused : false;
  }

  /**
   * Repetir último mensaje
   */
  async repeat() {
    if (this.lastMessage) {
      return this.speak(this.lastMessage);
    } else {
      console.warn('[TTS] No previous message to repeat');
    }
  }

  /**
   * Cambiar voz manualmente
   * @param {SpeechSynthesisVoice} voice - Voz a usar
   */
  setVoice(voice) {
    if (voice && this.voices.includes(voice)) {
      this.selectedVoice = voice;
      console.log('[TTS] Voice changed to:', voice.name);
    } else {
      console.error('[TTS] Invalid voice provided');
    }
  }

  /**
   * Obtener todas las voces disponibles
   * @returns {Array<SpeechSynthesisVoice>}
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Obtener solo voces en español
   * @returns {Array<SpeechSynthesisVoice>}
   */
  getSpanishVoices() {
    return this.voices.filter(
      (voice) => voice.lang.startsWith('es-') || voice.lang.startsWith('es')
    );
  }

  /**
   * Obtener voz actual
   * @returns {SpeechSynthesisVoice}
   */
  getCurrentVoice() {
    return this.selectedVoice;
  }

  /**
   * Configurar velocidad por defecto
   * @param {Number} rate - Velocidad (0.1 a 10)
   */
  setDefaultRate(rate) {
    if (rate >= 0.1 && rate <= 10) {
      this.defaultRate = rate;
      console.log('[TTS] Default rate changed to:', rate);
    } else {
      console.error('[TTS] Invalid rate. Must be between 0.1 and 10');
    }
  }

  /**
   * Configurar tono por defecto
   * @param {Number} pitch - Tono (0 a 2)
   */
  setDefaultPitch(pitch) {
    if (pitch >= 0 && pitch <= 2) {
      this.defaultPitch = pitch;
      console.log('[TTS] Default pitch changed to:', pitch);
    } else {
      console.error('[TTS] Invalid pitch. Must be between 0 and 2');
    }
  }

  /**
   * Configurar volumen por defecto
   * @param {Number} volume - Volumen (0 a 1)
   */
  setDefaultVolume(volume) {
    if (volume >= 0 && volume <= 1) {
      this.defaultVolume = volume;
      console.log('[TTS] Default volume changed to:', volume);
    } else {
      console.error('[TTS] Invalid volume. Must be between 0 and 1');
    }
  }

  /**
   * Verificar si TTS está disponible
   * @returns {Boolean}
   */
  isAvailable() {
    return !!this.synth;
  }
}

// Exportar como singleton
const textToSpeechService = new TextToSpeechService();

export default textToSpeechService;
