/**
 * VoiceContext
 * Contexto global para control de voz
 * Integra reconocimiento de voz, TTS, API client y Redux bridge
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import textToSpeechService from '../services/voice/textToSpeech';
import voiceApiClient from '../services/api/voiceApiClient';

// Crear contexto
const VoiceContext = createContext(null);

/**
 * Hook para usar el contexto de voz
 * @returns {Object} - Contexto de voz
 */
export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice debe usarse dentro de un VoiceProvider');
  }
  return context;
};

/**
 * Provider del contexto de voz
 */
export const VoiceProvider = ({ children, store }) => {
  // ==================== ESTADOS ====================

  // Estado de escucha y reconocimiento
  const {
    isListening: recognitionListening,
    transcript,
    interimTranscript,
    error: recognitionError,
    isSupported,
    startListening: startRecognition,
    stopListening: stopRecognition,
    resetTranscript
  } = useVoiceRecognition();

  // Estados del contexto
  const [isActive, setIsActive] = useState(() => {
    // Restaurar estado de activación desde localStorage
    const saved = localStorage.getItem('famiglia_voice_active');
    return saved === 'true';
  });
  const [isProcessing, setIsProcessing] = useState(false); // Procesando comando
  const [isSpeaking, setIsSpeaking] = useState(false); // TTS hablando
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    // Restaurar preferencia de TTS
    const saved = localStorage.getItem('famiglia_voice_tts_enabled');
    return saved !== 'false'; // Por defecto true
  });
  const [lastCommand, setLastCommand] = useState(''); // Último comando procesado
  const [lastResponse, setLastResponse] = useState(''); // Última respuesta TTS
  const [commandHistory, setCommandHistory] = useState([]); // Historial de comandos
  const [error, setError] = useState(null); // Error actual

  // Preferencias de TTS
  const [ttsRate, setTtsRate] = useState(() => {
    const saved = localStorage.getItem('famiglia_voice_tts_rate');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [ttsVolume, setTtsVolume] = useState(() => {
    const saved = localStorage.getItem('famiglia_voice_tts_volume');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [showTranscript, setShowTranscript] = useState(() => {
    const saved = localStorage.getItem('famiglia_voice_show_transcript');
    return saved !== 'false'; // Por defecto true
  });

  // Referencias
  const processingRef = useRef(false); // Evitar procesamiento duplicado
  const lastTranscriptRef = useRef(''); // Último transcript procesado
  const commandCacheRef = useRef(new Map()); // Cache de respuestas de comandos
  const debounceTimerRef = useRef(null); // Timer para debounce

  // ==================== HOOKS ====================

  // Obtener ubicación actual (React Router)
  const location = useLocation();

  // Obtener estado de Redux (si está disponible)
  const reduxState = useSelector(state => state);

  // ==================== EFECTOS ====================

  /**
   * Limpiar cache de comandos expirados (cada minuto)
   */
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cache = commandCacheRef.current;

      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > 60000) { // 1 minuto
          cache.delete(key);
        }
      }
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  /**
   * Monitorear transcript y procesar comandos automáticamente con debounce
   */
  useEffect(() => {
    if (!isActive || !transcript || transcript.length === 0) {
      return;
    }

    // Evitar procesar el mismo transcript dos veces
    if (transcript === lastTranscriptRef.current) {
      return;
    }

    // Evitar procesar si ya está procesando
    if (processingRef.current) {
      return;
    }

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce de 300ms
    debounceTimerRef.current = setTimeout(() => {
      lastTranscriptRef.current = transcript;
      handleProcessCommand(transcript);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };

  }, [transcript, isActive]);

  /**
   * Monitorear estado de TTS
   */
  useEffect(() => {
    const checkTTSStatus = setInterval(() => {
      setIsSpeaking(textToSpeechService.isSpeaking());
    }, 200);

    return () => clearInterval(checkTTSStatus);
  }, []);

  /**
   * Sincronizar errores de reconocimiento
   */
  useEffect(() => {
    if (recognitionError) {
      setError(recognitionError);
    }
  }, [recognitionError]);

  /**
   * Persistir estado de activación en localStorage
   */
  useEffect(() => {
    localStorage.setItem('famiglia_voice_active', isActive.toString());
  }, [isActive]);

  /**
   * Persistir preferencia de TTS en localStorage
   */
  useEffect(() => {
    localStorage.setItem('famiglia_voice_tts_enabled', ttsEnabled.toString());
  }, [ttsEnabled]);

  /**
   * Persistir configuración de TTS rate
   */
  useEffect(() => {
    localStorage.setItem('famiglia_voice_tts_rate', ttsRate.toString());
  }, [ttsRate]);

  /**
   * Persistir configuración de TTS volume
   */
  useEffect(() => {
    localStorage.setItem('famiglia_voice_tts_volume', ttsVolume.toString());
  }, [ttsVolume]);

  /**
   * Persistir preferencia de mostrar transcripción
   */
  useEffect(() => {
    localStorage.setItem('famiglia_voice_show_transcript', showTranscript.toString());
  }, [showTranscript]);

  /**
   * Auto-activar asistente si estaba activo previamente
   */
  useEffect(() => {
    const wasActive = localStorage.getItem('famiglia_voice_active') === 'true';

    if (wasActive && isSupported && !isActive) {
      // Activar automáticamente después de 1 segundo
      const autoActivateTimeout = setTimeout(() => {
        console.log('[Voice Context] Auto-activating from previous session');
        activate();
      }, 1000);

      return () => clearTimeout(autoActivateTimeout);
    }
  }, [isSupported]); // Solo ejecutar una vez al montar

  // ==================== FUNCIONES ====================

  /**
   * Activar asistente de voz
   */
  const activate = useCallback(async () => {
    if (!isSupported) {
      setError('Tu navegador no soporta reconocimiento de voz');
      return false;
    }

    try {
      setIsActive(true);
      setError(null);

      const started = startRecognition();

      if (started && ttsEnabled) {
        await textToSpeechService.announce('Asistente de voz activado');
      }

      console.log('[Voice Context] Voice assistant activated');
      return true;

    } catch (err) {
      console.error('[Voice Context] Error activating:', err);
      setError('No se pudo activar el asistente de voz');
      setIsActive(false);
      return false;
    }
  }, [isSupported, startRecognition, ttsEnabled]);

  /**
   * Desactivar asistente de voz
   */
  const deactivate = useCallback(async () => {
    try {
      setIsActive(false);
      stopRecognition();
      textToSpeechService.cancel();

      if (ttsEnabled) {
        await textToSpeechService.announce('Asistente de voz desactivado');
      }

      console.log('[Voice Context] Voice assistant deactivated');
      return true;

    } catch (err) {
      console.error('[Voice Context] Error deactivating:', err);
      return false;
    }
  }, [stopRecognition, ttsEnabled]);

  /**
   * Alternar asistente de voz
   */
  const toggle = useCallback(async () => {
    if (isActive) {
      return await deactivate();
    } else {
      return await activate();
    }
  }, [isActive, activate, deactivate]);

  /**
   * Procesar comando de voz
   * @param {String} commandText - Texto del comando
   */
  const handleProcessCommand = useCallback(async (commandText) => {
    if (!commandText || typeof commandText !== 'string' || commandText.trim().length === 0) {
      return;
    }

    if (processingRef.current) {
      console.log('[Voice Context] Already processing a command, skipping...');
      return;
    }

    try {
      processingRef.current = true;
      setIsProcessing(true);
      setError(null);

      console.log('[Voice Context] Processing command:', commandText);

      // Construir contexto
      const context = buildContext();

      // Crear cache key
      const cacheKey = `${commandText.trim().toLowerCase()}_${context.currentPage}`;
      const cache = commandCacheRef.current;
      const now = Date.now();

      // Verificar cache
      const cached = cache.get(cacheKey);
      let result;

      if (cached && (now - cached.timestamp) < 60000) {
        // Usar respuesta cacheada
        console.log('[Voice Context] Using cached response');
        result = cached.result;
      } else {
        // Enviar comando al backend para interpretación
        result = await voiceApiClient.processCommand(commandText, context);

        // Guardar en cache
        cache.set(cacheKey, {
          result,
          timestamp: now
        });

        // Limitar tamaño del cache
        if (cache.size > 50) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }

      console.log('[Voice Context] Command result:', result);

      // Guardar en historial
      setCommandHistory(prev => [
        ...prev.slice(-19), // Mantener últimos 20
        {
          command: commandText,
          intent: result.intent,
          timestamp: new Date().toISOString(),
          success: result.success
        }
      ]);

      setLastCommand(commandText);
      setLastResponse(result.ttsResponse || '');

      // Hablar respuesta si TTS está activado
      if (ttsEnabled && result.ttsResponse) {
        await textToSpeechService.speak(result.ttsResponse);
      }

      // Limpiar transcript después de procesar
      resetTranscript();

    } catch (err) {
      console.error('[Voice Context] Error processing command:', err);
      setError('Error al procesar el comando');

      if (ttsEnabled) {
        await textToSpeechService.error('No pude procesar tu comando. Intenta de nuevo.');
      }

    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [ttsEnabled, resetTranscript, location, reduxState]);

  /**
   * Construir contexto para enviar al backend
   * @private
   */
  const buildContext = useCallback(() => {
    // Determinar página actual desde la ruta
    const pathname = location.pathname;
    let currentPage = 'home';

    if (pathname.includes('/carta') || pathname.includes('/catalog')) {
      currentPage = 'catalog';
    } else if (pathname.includes('/carrito') || pathname.includes('/cart')) {
      currentPage = 'cart';
    } else if (pathname.includes('/checkout') || pathname.includes('/pago')) {
      currentPage = 'checkout';
    } else if (pathname.includes('/payment')) {
      currentPage = 'payment';
    } else if (pathname.includes('/test') || pathname.includes('/preferencias')) {
      currentPage = 'test';
    } else if (pathname.includes('/perfil') || pathname.includes('/profile')) {
      currentPage = 'profile';
    } else if (pathname.includes('/login') || pathname.includes('/signin')) {
      currentPage = 'login';
    } else if (pathname.includes('/register') || pathname.includes('/signup')) {
      currentPage = 'register';
    } else if (pathname.includes('/admin')) {
      currentPage = 'admin';
    }

    // Extraer datos del carrito si está disponible
    const cart = reduxState?.cart || reduxState?.carrito || {};
    const cartItems = cart.items || cart.productos || [];
    const cartItemsCount = cartItems.length || 0;

    // Extraer rol del usuario
    const auth = reduxState?.auth || {};
    const user = auth.user || auth.usuario || {};
    const userRole = user.role || user.rol || (auth.isAuthenticated ? 'cliente' : 'visitante');

    // Contar productos visibles en el DOM (si estamos en catálogo)
    let productCount = 0;
    if (currentPage === 'catalog') {
      const productCards = document.querySelectorAll(
        '[data-product-card], .product-card, .producto-card, article[class*="product"]'
      );
      productCount = productCards.length;
    }

    return {
      currentPage,
      userRole,
      cartItemsCount,
      productCount
    };
  }, [location, reduxState]);

  /**
   * Hablar mensaje (TTS manual)
   * @param {String} message - Mensaje a hablar
   * @param {Object} options - Opciones de TTS
   */
  const speak = useCallback(async (message, options = {}) => {
    if (!ttsEnabled) {
      console.log('[Voice Context] TTS disabled, skipping speech');
      return;
    }

    try {
      await textToSpeechService.speak(message, options);
      setLastResponse(message);
    } catch (err) {
      console.error('[Voice Context] Error speaking:', err);
    }
  }, [ttsEnabled]);

  /**
   * Confirmar acción (TTS rápido)
   */
  const confirm = useCallback(async (message) => {
    if (!ttsEnabled) return;
    try {
      await textToSpeechService.confirm(message);
      setLastResponse(message);
    } catch (err) {
      console.error('[Voice Context] Error confirming:', err);
    }
  }, [ttsEnabled]);

  /**
   * Anunciar mensaje importante
   */
  const announce = useCallback(async (message) => {
    if (!ttsEnabled) return;
    try {
      await textToSpeechService.announce(message);
      setLastResponse(message);
    } catch (err) {
      console.error('[Voice Context] Error announcing:', err);
    }
  }, [ttsEnabled]);

  /**
   * Cancelar habla actual
   */
  const cancelSpeech = useCallback(() => {
    textToSpeechService.cancel();
    setIsSpeaking(false);
  }, []);

  /**
   * Repetir último mensaje
   */
  const repeatLast = useCallback(async () => {
    if (!lastResponse) {
      await speak('No hay mensaje para repetir');
      return;
    }
    await textToSpeechService.repeat();
  }, [lastResponse, speak]);

  /**
   * Activar/desactivar TTS
   */
  const toggleTTS = useCallback(() => {
    setTtsEnabled(prev => !prev);
    console.log('[Voice Context] TTS toggled:', !ttsEnabled);
  }, [ttsEnabled]);

  /**
   * Actualizar velocidad de TTS
   */
  const updateTTSRate = useCallback((rate) => {
    const normalizedRate = Math.max(0.5, Math.min(2.0, rate));
    setTtsRate(normalizedRate);
    textToSpeechService.setRate(normalizedRate);
    console.log('[Voice Context] TTS rate updated:', normalizedRate);
  }, []);

  /**
   * Actualizar volumen de TTS
   */
  const updateTTSVolume = useCallback((volume) => {
    const normalizedVolume = Math.max(0, Math.min(1.0, volume));
    setTtsVolume(normalizedVolume);
    textToSpeechService.setVolume(normalizedVolume);
    console.log('[Voice Context] TTS volume updated:', normalizedVolume);
  }, []);

  /**
   * Activar/desactivar transcripción visual
   */
  const toggleShowTranscript = useCallback(() => {
    setShowTranscript(prev => !prev);
    console.log('[Voice Context] Show transcript toggled:', !showTranscript);
  }, [showTranscript]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar historial de comandos
   */
  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    setLastCommand('');
    setLastResponse('');
  }, []);

  /**
   * Obtener capacidades de voz según contexto actual
   */
  const getCapabilities = useCallback(async () => {
    try {
      const context = buildContext();
      const capabilities = await voiceApiClient.getCapabilities(
        context.currentPage,
        context.userRole
      );
      return capabilities;
    } catch (err) {
      console.error('[Voice Context] Error getting capabilities:', err);
      return null;
    }
  }, [buildContext]);

  /**
   * Describir página actual
   */
  const describePage = useCallback(async () => {
    try {
      const context = buildContext();
      const description = await voiceApiClient.describePage(
        context.currentPage,
        context
      );

      if (ttsEnabled && description.ttsResponse) {
        await speak(description.ttsResponse);
      }

      return description;
    } catch (err) {
      console.error('[Voice Context] Error describing page:', err);
      return null;
    }
  }, [buildContext, ttsEnabled, speak]);

  // ==================== VALOR DEL CONTEXTO ====================

  const contextValue = {
    // Estados
    isActive,
    isListening: recognitionListening,
    isProcessing,
    isSpeaking,
    ttsEnabled,
    isSupported,
    transcript: interimTranscript || transcript,
    finalTranscript: transcript,
    interimTranscript,
    lastCommand,
    lastResponse,
    commandHistory,
    error,

    // Preferencias
    ttsRate,
    ttsVolume,
    showTranscript,

    // Funciones de control
    activate,
    deactivate,
    toggle,
    processCommand: handleProcessCommand,

    // Funciones de TTS
    speak,
    confirm,
    announce,
    cancelSpeech,
    repeatLast,
    toggleTTS,

    // Funciones de preferencias
    updateTTSRate,
    updateTTSVolume,
    toggleShowTranscript,

    // Utilidades
    clearError,
    clearHistory,
    getCapabilities,
    describePage,

    // Servicios (para uso avanzado)
    ttsService: textToSpeechService,
    apiClient: voiceApiClient
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

export default VoiceContext;
