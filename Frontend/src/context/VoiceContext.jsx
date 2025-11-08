import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { processVoiceCommand, checkVoiceAvailability, captureScreenshot } from '../services/api/voiceApiClient';

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
  // Hooks de voz con contexto de página actual
  const voiceRecognition = useVoiceRecognition({
    language: 'es-ES',
    continuous: false,
    interimResults: true,
    context: {
      pathname: window.location.pathname,
      page: window.location.pathname
    }
  });

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
          page: window.location.pathname
        },
        screenshot
      );

      console.log('[Voice Context] Respuesta:', response);

      // Extraer el feedback del usuario de la respuesta
      const feedbackText = response.data?.userFeedback || 'Comando procesado';
      setLastResponse(feedbackText);

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
      setError(error.message);
      setLastResponse('Lo siento, hubo un error al procesar tu comando');
      setState(VoiceState.ERROR);

      setTimeout(() => {
        setState(VoiceState.IDLE);
        voiceRecognition.resetTranscript();
      }, 3000);
    }
  }, [voiceRecognition]);

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
