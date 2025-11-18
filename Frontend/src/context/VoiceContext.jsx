import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { processVoiceCommand, checkVoiceAvailability, captureScreenshot } from '../services/api/voiceApiClient';
import { useLoginModal } from './LoginModalContext';
import { authAPI } from '../services/api';

/**
 * Contexto global para el sistema de navegación por voz
 * Centraliza el estado y las funciones de voz en toda la aplicación
 */
const VoiceContext = createContext(null);

/**
 * Estados posibles del sistema de voz
 */
export const VoiceState = {
  IDLE: 'idle',              // Inactivo, esperando
  LISTENING: 'listening',    // Escuchando al usuario
  PROCESSING: 'processing',  // Procesando comando con IA
  EXECUTING: 'executing',    // Ejecutando acciones
  ERROR: 'error'             // Error ocurrió
};

/**
 * Provider del contexto de voz
 */
export function VoiceProvider({ children }) {
  // 🔐 Estado de autenticación desde Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { openLoginModal } = useLoginModal();
  
  // Hooks de voz con contexto de página actual
  const voiceRecognition = useVoiceRecognition({
    language: 'es-ES',
    continuous: false,
    interimResults: true,
    context: {
      pathname: window.location.pathname,
      page: window.location.pathname,
      isAuthenticated, // 🆕 Incluir estado de auth en contexto
      user: user ? { id: user.id, nombre: user.nombre, rol: user.rol } : null
    }
  });

  // Hook de Text-to-Speech
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  // Estado global
  const [state, setState] = useState(VoiceState.IDLE);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [commandHistory, setCommandHistory] = useState(() => {
    // Cargar historial desde localStorage al iniciar
    try {
      const saved = localStorage.getItem('voice_command_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('[Voice Context] Error cargando historial:', error);
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 = no navegando historial
  const [isEnabled, setIsEnabled] = useState(true);

  // Estado para comandos registrados por página
  const [registeredCommands, setRegisteredCommands] = useState({});
  const currentPath = window.location.pathname;

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('voice_command_history', JSON.stringify(commandHistory));
    } catch (error) {
      console.error('[Voice Context] Error guardando historial:', error);
    }
  }, [commandHistory]);

  // Verificar disponibilidad al cargar
  useEffect(() => {
    const availability = checkVoiceAvailability();
    console.log('[Voice Context] Disponibilidad:', availability);

    if (!availability.isFullySupported) {
      setError('Tu navegador no soporta navegación por voz completamente');
    }
  }, []);

  // Sincronizar estado con voiceRecognition
  useEffect(() => {
    if (voiceRecognition.isListening) {
      setState(VoiceState.LISTENING);
      setError(null);
    } else if (state === VoiceState.LISTENING) {
      // Si dejó de escuchar y tenemos transcript, procesarlo
      if (voiceRecognition.transcript) {
        handleVoiceCommand(voiceRecognition.transcript);
      } else {
        setState(VoiceState.IDLE);
      }
    }
  }, [voiceRecognition.isListening, voiceRecognition.transcript]);

  // Manejar errores de reconocimiento de voz
  useEffect(() => {
    if (voiceRecognition.error) {
      // Mensajes de error más específicos
      const errorMessages = {
        'no-speech': 'No te escuché. Por favor, intenta de nuevo.',
        'audio-capture': 'No se pudo acceder al micrófono. Verifica los permisos.',
        'not-allowed': 'Permiso denegado. Habilita el micrófono en la configuración del navegador.',
        'network': 'Error de conexión. Verifica tu internet.',
        'aborted': 'Reconocimiento cancelado.',
        'bad-grammar': 'Error en el procesamiento del audio.',
      };
      
      const errorType = voiceRecognition.error.toLowerCase();
      const specificMessage = errorMessages[errorType] || voiceRecognition.error;
      
      setError(specificMessage);
      setLastResponse(specificMessage);
      setState(VoiceState.ERROR);
    }
  }, [voiceRecognition.error]);

  /**
   * Procesa un comando de voz enviándolo al backend
   */
  const handleVoiceCommand = useCallback(async (transcript) => {
    if (!transcript || transcript.trim() === '') {
      return;
    }

    try {
      console.log('[Voice Context] Procesando comando:', transcript);
      const normalizedTranscript = transcript.toLowerCase().trim();

      // 🔐 COMANDOS GLOBALES DE AUTENTICACIÓN (prioridad máxima)
      const globalAuthCommands = {
        'iniciar sesión': () => {
          if (isAuthenticated) {
            speak('Ya has iniciado sesión');
          } else {
            speak('Abriendo formulario de inicio de sesión');
            openLoginModal();
          }
          return true;
        },
        'cerrar sesión': () => {
          if (!isAuthenticated) {
            speak('No has iniciado sesión');
          } else {
            speak(`Hasta luego${user?.nombre ? ', ' + user.nombre : ''}`);
            // Ejecutar logout
            handleVoiceLogout();
          }
          return true;
        },
        'estoy logueado': () => {
          if (isAuthenticated) {
            speak(`Sí, has iniciado sesión como ${user?.nombre || 'usuario'}`);
          } else {
            speak('No has iniciado sesión');
          }
          return true;
        },
        'quién soy': () => {
          if (isAuthenticated) {
            const rol = user?.rol === 'A' ? 'administrador' : 'cliente';
            speak(`Eres ${user?.nombre || 'usuario'}, registrado como ${rol}`);
          } else {
            speak('No has iniciado sesión');
          }
          return true;
        },
      };

      // Verificar comandos globales de autenticación
      for (const [command, handler] of Object.entries(globalAuthCommands)) {
        if (normalizedTranscript === command) {
          handler();
          setState(VoiceState.IDLE);
          setLastCommand(transcript);
          return;
        }
      }

      // NUEVO: Primero intentar con comandos locales registrados
      const currentPageCommands = registeredCommands[currentPath];
      if (currentPageCommands) {
        const normalizedTranscript = transcript.toLowerCase().trim();
        
        // Buscar comando exacto
        for (const [commandPattern, handler] of Object.entries(currentPageCommands)) {
          const normalizedPattern = commandPattern.toLowerCase().trim();
          
          // Coincidencia exacta
          if (normalizedTranscript === normalizedPattern) {
            console.log('[Voice Context] Ejecutando comando local:', commandPattern);
            await handler();
            setState(VoiceState.IDLE);
            setLastCommand(transcript);
            return; // No enviar al backend si se ejecutó localmente
          }
          
          // Comandos con parámetros (pattern con (.+))
          if (normalizedPattern.includes('(.+)')) {
            const regex = new RegExp(normalizedPattern.replace(/\(\.\+\)/g, '(.+)'), 'i');
            const match = normalizedTranscript.match(regex);
            if (match) {
              // Extraer todos los parámetros capturados (match[1], match[2], etc.)
              const params = match.slice(1); // Eliminar match[0] que es el texto completo
              console.log('[Voice Context] Ejecutando comando local con parámetros:', commandPattern, params);
              await handler(...params); // Pasar todos los parámetros al handler
              setState(VoiceState.IDLE);
              setLastCommand(transcript);
              return;
            }
          }
        }
      }

      // Si no hay comando local, enviar al backend (comportamiento original)
      setState(VoiceState.PROCESSING);
      setProcessing(true);
      
      // Capturar screenshot (ahora con filtro de imágenes para evitar CORS)
      let screenshot = null;
      try {
        screenshot = await captureScreenshot();
        console.log('[Voice Context] Screenshot capturado:', screenshot ? 'Sí' : 'No');
      } catch (error) {
        console.warn('[Voice Context] Error capturando screenshot, continuando sin él:', error);
      }

      // Enviar al backend (con o sin screenshot)
      const response = await processVoiceCommand(
        transcript,
        {
          page: window.location.pathname,
          pathname: window.location.pathname,
          isAuthenticated, // 🔐 Incluir estado de autenticación
          user: user ? { 
            id: user.id, 
            nombre: user.nombre, 
            rol: user.rol 
          } : null
        },
        screenshot
      );

      console.log('[Voice Context] Respuesta:', response);

      // Extraer el feedback del usuario de la respuesta
      const feedbackText = response.data?.userFeedback || 'Comando procesado';
      setLastResponse(feedbackText);

      // 🔊 LEER LA RESPUESTA EN VOZ ALTA
      speak(feedbackText, {
        lang: 'es-ES',
        rate: 1.1, // Velocidad ligeramente más rápida
        pitch: 1.0,
        volume: 0.9
      });

      // Agregar a historial
      setCommandHistory(prev => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          command: transcript,
          response,
          success: response.success
        }
      ].slice(-10)); // Mantener solo los últimos 10

      if (response.success) {
        setState(VoiceState.EXECUTING);

        // Determinar éxito de la ejecución
        const execution = response.data?.execution;
        const hasSteps = execution && execution.totalSteps > 0;

        // Considerar exitoso si:
        // 1. No hay steps (solo feedback)
        // 2. Execution.success es true
        // 3. No hay steps fallidos (stepsFailed === 0 o undefined)
        // 4. Hay steps completados (stepsCompleted > 0)
        const executionSuccess = execution?.success;
        const hasFailedSteps = execution?.stepsFailed > 0;
        const hasCompletedSteps = execution?.stepsCompleted > 0;
        
        const isSuccessful = !hasSteps ||
                            executionSuccess === true ||
                            (!hasFailedSteps && hasCompletedSteps);

        console.log('[Voice Context] Análisis de ejecución:', {
          hasSteps,
          executionSuccess,
          stepsCompleted: execution?.stepsCompleted,
          stepsFailed: execution?.stepsFailed,
          hasFailedSteps,
          hasCompletedSteps,
          isSuccessful
        });

        if (isSuccessful) {
          setProcessing(false);
          setTimeout(() => {
            setState(VoiceState.IDLE);
            voiceRecognition.resetTranscript();
          }, 2000);
        } else {
          setProcessing(false);
          setState(VoiceState.IDLE);
          voiceRecognition.resetTranscript();
        }
      } else {
        throw new Error(response.error || 'Error desconocido');
      }

    } catch (error) {
      console.error('[Voice Context] Error:', error);
      
      setProcessing(false);
      const errorMessage = 'Lo siento, hubo un error al procesar tu comando';
      setError(error.message);
      setLastResponse(errorMessage);
      setState(VoiceState.ERROR);

      // 🔊 LEER EL MENSAJE DE ERROR EN VOZ ALTA
      speak(errorMessage, {
        lang: 'es-ES',
        rate: 1.0,
        pitch: 0.9,
        volume: 0.9
      });

      setTimeout(() => {
        setState(VoiceState.IDLE);
        voiceRecognition.resetTranscript();
      }, 3000);
    }
  }, [voiceRecognition, speak, registeredCommands, currentPath, isAuthenticated, user, dispatch]);

  /**
   * 🔐 Maneja el cierre de sesión por voz
   */
  const handleVoiceLogout = useCallback(async () => {
    try {
      await authAPI.logout();
      localStorage.clear();
      sessionStorage.clear();
      dispatch(logout());
      window.location.href = '/';
    } catch (err) {
      console.error('[Voice Context] Error al cerrar sesión:', err);
      speak('Error al cerrar sesión');
    }
  }, [dispatch, speak]);

  /**
   * Inicia la escucha de voz (sin modal)
   */
  const startVoiceCommand = useCallback(() => {
    if (!isEnabled) {
      console.warn('[Voice Context] Sistema de voz deshabilitado');
      return;
    }

    if (state !== VoiceState.IDLE) {
      console.warn('[Voice Context] Sistema ocupado, estado:', state);
      return;
    }

    setError(null);
    setIsModalOpen(false); // No abrir modal
    voiceRecognition.startListening();
  }, [isEnabled, state, voiceRecognition]);

  /**
   * Cancela el comando de voz actual
   */
  const cancelVoiceCommand = useCallback(() => {
    voiceRecognition.stopListening();
    setState(VoiceState.IDLE);
    setError(null);
    setIsModalOpen(false);
    voiceRecognition.resetTranscript();
  }, [voiceRecognition]);

  /**
   * Abre el modal de voz
   */
  const openVoiceModal = useCallback(() => {
    setIsModalOpen(true);
    startVoiceCommand();
  }, [startVoiceCommand]);

  /**
   * Cierra el modal de voz
   */
  const closeVoiceModal = useCallback(() => {
    cancelVoiceCommand();
    setIsModalOpen(false);
  }, [cancelVoiceCommand]);

  /**
   * Habilita/deshabilita el sistema de voz
   */
  const toggleVoice = useCallback((enabled) => {
    setIsEnabled(enabled);
    if (!enabled) {
      cancelVoiceCommand();
    }
  }, [cancelVoiceCommand]);

  /**
   * Limpia el historial de comandos
   */
  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    setHistoryIndex(-1);
    localStorage.removeItem('voice_command_history');
  }, []);

  /**
   * Navega en el historial con flechas (↑↓)
   * ↑ = comando anterior, ↓ = comando siguiente
   */
  const navigateHistory = useCallback((direction) => {
    if (commandHistory.length === 0) return null;

    let newIndex = historyIndex;
    
    if (direction === 'up') {
      // Flecha arriba: ir al comando anterior (más antiguo)
      newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        newIndex = commandHistory.length - 1; // No pasar del inicio
      }
    } else if (direction === 'down') {
      // Flecha abajo: ir al comando siguiente (más reciente)
      newIndex = historyIndex - 1;
      if (newIndex < -1) {
        newIndex = -1; // -1 = no navegando
      }
    }

    setHistoryIndex(newIndex);

    // Retornar comando correspondiente (historia en orden inverso)
    if (newIndex === -1) {
      return null; // Volver al estado sin historial
    }

    const historyCommand = commandHistory[commandHistory.length - 1 - newIndex];
    return historyCommand?.command || null;
  }, [commandHistory, historyIndex]);

  // Event listener para navegación con flechas
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Solo si el avatar está visible y no estamos escribiendo en un input
      if (document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // Solo cuando el sistema está IDLE (no procesando)
      if (state !== VoiceState.IDLE) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        const direction = e.key === 'ArrowUp' ? 'up' : 'down';
        const command = navigateHistory(direction);

        if (command) {
          console.log('[Voice Context] Historial navegado:', command);
          // Ejecutar comando del historial
          handleVoiceCommand(command);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, navigateHistory, handleVoiceCommand]);

  /**
   * Registra comandos de voz específicos para la página actual
   * @param {Object} commands - Objeto con pares comando: handler
   */
  const registerCommands = useCallback((commands) => {
    const path = window.location.pathname;
    console.log('[Voice Context] Registrando comandos para', path, ':', Object.keys(commands));
    
    setRegisteredCommands(prev => ({
      ...prev,
      [path]: { ...(prev[path] || {}), ...commands }
    }));
  }, []);

  /**
   * Elimina comandos registrados para la página actual
   */
  const unregisterCommands = useCallback(() => {
    const path = window.location.pathname;
    console.log('[Voice Context] Eliminando comandos de', path);
    
    setRegisteredCommands(prev => {
      const newCommands = { ...prev };
      delete newCommands[path];
      return newCommands;
    });
  }, []);

  /**
   * Obtiene los comandos disponibles para la página actual
   */
  const getAvailableCommands = useCallback(() => {
    const path = window.location.pathname;
    const pageCommands = registeredCommands[path] || {};
    const commandNames = Object.keys(pageCommands);
    
    // Comandos globales siempre disponibles
    const globalCommands = [
      'ir al inicio',
      'ir al catálogo',
      'ir al carrito',
      'ir al perfil',
      'ir a contacto',
      'ayuda',
      'qué puedo decir'
    ];
    
    return {
      page: commandNames,
      global: globalCommands,
      all: [...commandNames, ...globalCommands]
    };
  }, [registeredCommands]);

  /**
   * 🔐 Verifica si el usuario está autenticado
   * @returns {boolean} true si está autenticado
   */
  const checkAuthentication = useCallback(() => {
    return isAuthenticated;
  }, [isAuthenticated]);

  /**
   * 🔐 Ejecuta una acción solo si el usuario está autenticado
   * Si no lo está, abre el modal de login y da feedback por voz
   * @param {Function} action - Acción a ejecutar si está autenticado
   * @param {string} requirementMessage - Mensaje personalizado (opcional)
   * @returns {boolean} true si se ejecutó la acción
   */
  const requireAuth = useCallback((action, requirementMessage = 'Necesitas iniciar sesión para realizar esta acción') => {
    if (!isAuthenticated) {
      speak(requirementMessage);
      openLoginModal();
      return false;
    }
    
    action();
    return true;
  }, [isAuthenticated, speak, openLoginModal]);

  /**
   * 🔐 Obtiene información del usuario actual
   * @returns {Object|null} Información del usuario o null
   */
  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  const value = {
    // Estado
    state,
    error,
    isModalOpen,
    lastCommand,
    lastResponse,
    commandHistory,
    historyIndex,
    isEnabled,

    // 🔐 Estado de autenticación
    isAuthenticated,
    user,

    // Hooks
    voiceRecognition,

    // Funciones
    startVoiceCommand,
    cancelVoiceCommand,
    openVoiceModal,
    closeVoiceModal,
    toggleVoice,
    clearHistory,
    navigateHistory,

    // Registro de comandos por página
    registerCommands,
    unregisterCommands,
    getAvailableCommands,

    // 🔐 Funciones de autenticación
    checkAuthentication,
    requireAuth,
    getCurrentUser,

    // Text-to-Speech
    speak,
    stopSpeaking,
    isSpeaking,

    // Información
    isSupported: voiceRecognition.isSupported,
    isListening: voiceRecognition.isListening,
    isProcessing: state === VoiceState.PROCESSING || state === VoiceState.EXECUTING,
    currentTranscript: voiceRecognition.fullTranscript
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

/**
 * Hook para usar el contexto de voz
 */
export function useVoice() {
  const context = useContext(VoiceContext);

  if (!context) {
    throw new Error('useVoice debe usarse dentro de un VoiceProvider');
  }

  return context;
}

export default VoiceContext;
