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
  const [isActive, setIsActive] = useState(false); // Control general activado/desactivado
  const [isProcessing, setIsProcessing] = useState(false); // Procesando comando
  const [isSpeaking, setIsSpeaking] = useState(false); // TTS hablando
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS activado/desactivado
  const [lastCommand, setLastCommand] = useState(''); // Último comando procesado
  const [lastResponse, setLastResponse] = useState(''); // Última respuesta TTS
  const [commandHistory, setCommandHistory] = useState([]); // Historial de comandos
  const [error, setError] = useState(null); // Error actual

  // Referencias
  const processingRef = useRef(false); // Evitar procesamiento duplicado
  const lastTranscriptRef = useRef(''); // Último transcript procesado

  // ==================== HOOKS ====================

  // Obtener ubicación actual (React Router)
  const location = useLocation();

  // Obtener estado de Redux (si está disponible)
  const reduxState = useSelector(state => state);

  // ==================== EFECTOS ====================

  /**
   * Monitorear transcript y procesar comandos automáticamente
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

    // Procesar comando
    lastTranscriptRef.current = transcript;
    handleProcessCommand(transcript);

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

      // Enviar comando al backend para interpretación
      const result = await voiceApiClient.processCommand(commandText, context);

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
