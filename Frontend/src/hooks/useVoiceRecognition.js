import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para reconocimiento de voz usando Web Speech API
 * Soporta español (es-ES) por defecto
 * NO hace conversiones - envía texto RAW a Gemini
 *
 * @param {Object} options - Opciones de configuración
 * @param {string} options.language - Idioma (default: 'es-ES')
 * @param {boolean} options.continuous - Reconocimiento continuo (default: false)
 * @param {number} options.interimResults - Mostrar resultados intermedios (default: true)
 * @returns {Object} Estado y funciones del reconocimiento de voz
 */
export function useVoiceRecognition(options = {}) {
  const {
    language = 'es-ES',
    continuous = false,
    interimResults = true,
    context = {} // Contexto para mejores correcciones
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Verificar soporte del navegador
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      // Configuración del reconocimiento
      recognitionRef.current.lang = language;
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.maxAlternatives = 5; // Aumentar de 1 a 5 para más opciones
      
      // IMPORTANTE: Configuraciones adicionales para evitar cortes
      // Estos valores no son estándar pero algunos navegadores los soportan
      try {
        recognitionRef.current.serviceURI = undefined; // Usar servicio por defecto
      } catch (e) {
        // Ignorar si no soportado
      }

      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('[Voice Recognition] Iniciado');
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event) => {
        let interimText = '';
        let finalText = '';
        let alternatives = [];

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          
          // Recopilar todas las alternativas
          const resultAlternatives = [];
          for (let j = 0; j < result.length; j++) {
            resultAlternatives.push(result[j]);
          }

          if (result.isFinal) {
            // NO usar getBestAlternative - tomar la primera alternativa RAW
            finalText += result[0].transcript;
            alternatives = resultAlternatives;
          } else {
            // Para interim, usar la primera alternativa
            interimText += result[0].transcript;
          }
        }

        if (finalText) {
          // NO aplicar correcciones - enviar texto RAW a Gemini
          const rawText = finalText.trim();
          
          console.log('[Voice Recognition] Resultado RAW (sin conversiones):', rawText);
          console.log('[Voice Recognition] Alternativas:', alternatives.map((a, i) => 
            `${i + 1}. "${a.transcript}" (${(a.confidence * 100).toFixed(1)}%)`
          ).join(', '));
          
          setTranscript(rawText);
          setInterimTranscript('');
        } else if (interimText) {
          console.log('[Voice Recognition] Resultado interim:', interimText);
          setInterimTranscript(interimText);
        }

        // Auto-stop después de silencio más largo (solo si no es continuo)
        if (!continuous && finalText) {
          // Solo iniciar timeout cuando hay texto final (no durante interim)
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isListening) {
              console.log('[Voice Recognition] Auto-stop por silencio');
              recognitionRef.current.stop();
            }
          }, 2000); // 2 segundos después del último resultado final
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('[Voice Recognition] Error:', event.error);

        // Ignorar errores comunes que no son críticos
        const ignorableErrors = ['no-speech', 'aborted', 'audio-capture'];
        
        if (ignorableErrors.includes(event.error)) {
          console.log(`[Voice Recognition] Error ignorable: ${event.error}`);
          
          // Para 'no-speech', NO detener - dejar que el usuario continúe
          if (event.error === 'no-speech') {
            // Reintentar automáticamente si estaba escuchando
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                console.log('[Voice Recognition] Reintentando después de no-speech...');
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.warn('[Voice Recognition] No se pudo reiniciar:', e);
                }
              }
            }, 300);
          }
          return;
        }

        let errorMessage = 'Error desconocido';

        switch (event.error) {
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono. Verifica los permisos.';
            break;
          case 'not-allowed':
            errorMessage = 'Permiso de micrófono denegado. Por favor, permite el acceso.';
            break;
          case 'network':
            errorMessage = 'Error de red. Verifica tu conexión a Internet.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }

        setError(errorMessage);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('[Voice Recognition] Finalizado');
        setIsListening(false);
        clearTimeout(timeoutRef.current);
      };
    } else {
      setIsSupported(false);
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearTimeout(timeoutRef.current);
    };
  }, [language, continuous, interimResults]);

  /**
   * Inicia el reconocimiento de voz
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado en este navegador');
      return;
    }

    if (isListening) {
      console.log('[Voice Recognition] Ya está escuchando');
      return;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error('[Voice Recognition] Error al iniciar:', error);
      setError('No se pudo iniciar el reconocimiento de voz');
    }
  }, [isSupported, isListening]);

  /**
   * Detiene el reconocimiento de voz
   */
  const stopListening = useCallback(() => {
    if (!isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
      clearTimeout(timeoutRef.current);
    } catch (error) {
      console.error('[Voice Recognition] Error al detener:', error);
    }
  }, [isListening]);

  /**
   * Alterna entre iniciar y detener
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Resetea el transcript
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    // Estado
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,

    // Funciones
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,

    // Texto combinado (final + interim)
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : '')
  };
}

export default useVoiceRecognition;
