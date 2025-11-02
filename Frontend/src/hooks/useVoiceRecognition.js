/**
 * useVoiceRecognition Hook
 * Hook personalizado para reconocimiento de voz usando Web Speech API
 * Configurado para español de México (es-MX)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const useVoiceRecognition = () => {
  // Estados del hook
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Referencias
  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);

  // Verificar soporte del navegador al montar
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      // Crear instancia de reconocimiento
      const recognition = new SpeechRecognition();

      // Configuración
      recognition.continuous = true; // Escucha continua
      recognition.interimResults = true; // Resultados parciales en tiempo real
      recognition.lang = 'es-MX'; // Español de México
      recognition.maxAlternatives = 3; // Hasta 3 alternativas por reconocimiento

      // Event handlers
      recognition.onstart = () => {
        console.log('[Voice Recognition] Started');
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        // Procesar resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;

          if (result.isFinal) {
            finalText += transcriptPart + ' ';
          } else {
            interimText += transcriptPart;
          }
        }

        // Actualizar estados
        if (interimText) {
          setInterimTranscript(interimText);
        }

        if (finalText) {
          const cleanedText = finalText.trim();
          console.log('[Voice Recognition] Final transcript:', cleanedText);
          setTranscript(cleanedText);
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event) => {
        console.error('[Voice Recognition] Error:', event.error);

        // Manejar diferentes tipos de errores
        let errorMessage = 'Error desconocido';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó ningún sonido. Intenta hablar más cerca del micrófono.';
            // No detener el reconocimiento por falta de voz temporal
            break;
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono. Verifica los permisos.';
            setIsListening(false);
            shouldRestartRef.current = false;
            break;
          case 'not-allowed':
            errorMessage = 'Permiso de micrófono denegado. Por favor permite el acceso al micrófono.';
            setIsListening(false);
            shouldRestartRef.current = false;
            break;
          case 'network':
            errorMessage = 'Error de red. Verifica tu conexión a internet.';
            break;
          case 'aborted':
            errorMessage = 'Reconocimiento de voz abortado.';
            break;
          case 'service-not-allowed':
            errorMessage = 'El servicio de reconocimiento de voz no está disponible en este navegador.';
            setIsListening(false);
            shouldRestartRef.current = false;
            break;
          default:
            errorMessage = `Error de reconocimiento: ${event.error}`;
        }

        setError(errorMessage);
      };

      recognition.onend = () => {
        console.log('[Voice Recognition] Ended');

        // Auto-reiniciar si debe seguir escuchando
        if (shouldRestartRef.current && isSupported) {
          console.log('[Voice Recognition] Auto-restarting...');
          try {
            recognition.start();
          } catch (err) {
            console.error('[Voice Recognition] Failed to restart:', err);
            setIsListening(false);
            setError('No se pudo reiniciar el reconocimiento de voz.');
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('[Voice Recognition] Web Speech API not supported');
      setIsSupported(false);
      setError('Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome, Edge o Safari.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('[Voice Recognition] Error stopping on cleanup:', err);
        }
      }
    };
  }, []);

  /**
   * Iniciar reconocimiento de voz
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado en este navegador.');
      return false;
    }

    if (isListening) {
      console.log('[Voice Recognition] Already listening');
      return true;
    }

    try {
      shouldRestartRef.current = true;
      recognitionRef.current.start();
      setError(null);
      console.log('[Voice Recognition] Starting...');
      return true;
    } catch (err) {
      console.error('[Voice Recognition] Error starting:', err);

      // Si ya está iniciado, solo actualizar estado
      if (err.name === 'InvalidStateError') {
        console.log('[Voice Recognition] Already started');
        setIsListening(true);
        return true;
      }

      setError('No se pudo iniciar el reconocimiento de voz.');
      return false;
    }
  }, [isSupported, isListening]);

  /**
   * Detener reconocimiento de voz
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      shouldRestartRef.current = false;
      recognitionRef.current.stop();
      console.log('[Voice Recognition] Stopping...');
    } catch (err) {
      console.error('[Voice Recognition] Error stopping:', err);
    }
  }, []);

  /**
   * Limpiar transcripción
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    // Estados
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,

    // Funciones
    startListening,
    stopListening,
    resetTranscript
  };
};

export default useVoiceRecognition;
