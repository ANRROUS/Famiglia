import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useEffect, useState, useMemo } from 'react';
import { useVoice, VoiceState } from '../../context/VoiceContext';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useMicrophonePermission } from '../../hooks/useMicrophonePermission';
import { X } from 'lucide-react';
import bakerAnimation from '../../assets/animations/Baker.json';

/**
 * Avatar Flotante de Voz - Esquina Inferior Derecha
 * 
 * Combina el avatar animado de Baker con la funcionalidad del botón flotante.
 * - Click para activar/desactivar reconocimiento de voz
 * - Animaciones según el estado (IDLE, LISTENING, PROCESSING, etc.)
 * - Feedback visual con transcript y respuesta
 * - Atajo de teclado: Ctrl+Shift+V
 */

/**
 * Get animation configuration for each voice state
 */
const getAnimationConfig = (state) => {
  switch (state) {
    case VoiceState.IDLE:
      return {
        segments: [0, 30],
        loop: true,
        speed: 0.8,
        backgroundColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
        ringColor: 'border-gray-400',
      };
    case VoiceState.LISTENING:
      return {
        segments: [31, 90],
        loop: true,
        speed: 1,
        backgroundColor: 'bg-gradient-to-br from-red-100 to-red-200',
        ringColor: 'border-red-400',
      };
    case VoiceState.PROCESSING:
      return {
        segments: [91, 127],
        loop: true,
        speed: 1.2,
        backgroundColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
        ringColor: 'border-blue-400',
      };
    case VoiceState.EXECUTING:
      return {
        segments: [60, 127],
        loop: true,
        speed: 1,
        backgroundColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
        ringColor: 'border-purple-400',
      };
    case VoiceState.ERROR:
      return {
        segments: [128, 174],
        loop: false,
        speed: 1.5,
        backgroundColor: 'bg-gradient-to-br from-red-200 to-red-300',
        ringColor: 'border-red-500',
      };
    default:
      return {
        segments: [0, 30],
        loop: true,
        speed: 0.8,
        backgroundColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
        ringColor: 'border-gray-400',
      };
  }
};

export function VoiceAvatarFloating() {
  const {
    state,
    isSupported,
    isListening,
    isProcessing,
    error,
    currentTranscript,
    lastResponse,
    startVoiceCommand,
    cancelVoiceCommand
  } = useVoice();

  // Hook de permisos de micrófono
  const {
    permissionState,
    hasPermission,
    needsPermission,
    isChecking,
    error: permissionError,
    requestPermission
  } = useMicrophonePermission();

  // Memoizar configuración para evitar re-cálculos innecesarios
  const config = useMemo(() => getAnimationConfig(state), [state]);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Detectar si es mobile para ajustar tamaño
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show feedback when there's a transcript or response
  useEffect(() => {
    if (currentTranscript || lastResponse) {
      setShowFeedback(true);
    }
  }, [currentTranscript, lastResponse]);

  // Close feedback with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showFeedback) {
        setShowFeedback(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showFeedback]);

  // Keyboard shortcut: Ctrl+Shift+V
  useKeyboardShortcut('v', async () => {
    if (!isSupported) return;

    // Si necesita permisos, solicitarlos primero
    if (needsPermission && !isListening && !isProcessing) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (isListening || isProcessing) {
      cancelVoiceCommand();
    } else {
      startVoiceCommand();
    }
  }, { ctrl: true, shift: true });

  const handleClick = async () => {
    if (!isSupported) {
      alert(
        'Tu navegador no soporta reconocimiento de voz.\n\n' +
        'Por favor, usa Chrome, Edge o Safari en tu dispositivo.'
      );
      return;
    }

    // Si necesita permisos, solicitarlos primero
    if (needsPermission && !isListening && !isProcessing) {
      console.log('[Voice Avatar] Solicitando permisos de micrófono...');
      const granted = await requestPermission();
      
      if (!granted) {
        alert(
          '🎤 Se necesita acceso al micrófono\n\n' +
          'Para usar comandos de voz, debes permitir el acceso al micrófono en tu navegador.\n\n' +
          'Haz clic en el ícono de candado en la barra de direcciones y habilita el micrófono.'
        );
        return;
      }
    }

    if (isListening || isProcessing) {
      cancelVoiceCommand();
    } else {
      startVoiceCommand();
    }
  };

  const getStateLabel = () => {
    if (!isSupported) return 'No soportado';
    if (needsPermission && !isListening && !isProcessing) return '🎤 Click para activar';
    if (error) return 'Error';
    if (state === VoiceState.EXECUTING) return '✨ Ejecutando...';
    if (isProcessing) return '⚙️ Procesando...';
    if (isListening) return '🎤 Escuchando...';
    return '🎙️ Click para hablar';
  };

  const getTooltipText = () => {
    if (!isSupported) return 'Navegador no compatible con reconocimiento de voz';
    if (needsPermission && !isListening && !isProcessing) return 'Click para solicitar permisos de micrófono';
    if (isListening) return 'Click para cancelar (Ctrl+Shift+V)';
    return 'Click para activar voz (Ctrl+Shift+V)';
  };

  return (
    <>
      {/* Floating Avatar Button - ALWAYS ON TOP */}
      <motion.div
        className={`fixed z-[100000] ${
          isMobile 
            ? 'bottom-6 right-4' 
            : 'bottom-12 right-6'
        }`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Avatar Container */}
        <motion.button
          onClick={handleClick}
          disabled={!isSupported || isProcessing}
          title={getTooltipText()}
          aria-label={getTooltipText()}
          aria-pressed={isListening}
          aria-disabled={!isSupported || isProcessing}
          role="button"
          className={`
            relative
            ${isMobile ? 'w-[100px] h-[100px]' : 'w-[150px] h-[150px]'}
            rounded-full
            ${config.backgroundColor}
            shadow-2xl
            cursor-pointer
            disabled:cursor-not-allowed
            disabled:opacity-50
            overflow-hidden
            transition-all
            duration-300
            hover:scale-110
            active:scale-95
            focus:outline-none
            focus:ring-4
            focus:ring-offset-2
            ${isListening ? 'focus:ring-red-400' : 'focus:ring-blue-400'}
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isListening ? [1, 1.05, 1] : 1,
          }}
          transition={{
            scale: {
              repeat: isListening ? Infinity : 0,
              duration: 1,
              ease: "easeInOut",
            }
          }}
        >
          {/* Lottie Animation */}
          <div className="w-full h-full flex items-center justify-center">
            <Lottie
              animationData={bakerAnimation}
              loop={config.loop}
              autoplay={true}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>

          {/* Animated Rings when Listening */}
          {isListening && (
            <>
              <motion.span
                className={`absolute inset-0 rounded-full border-4 ${config.ringColor}`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.span
                className={`absolute inset-0 rounded-full border-4 ${config.ringColor.replace('400', '300')}`}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </>
          )}

          {/* Error Indicator */}
          {error && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-full">
              <span className="text-2xl"></span>
            </div>
          )}

          {/* Permission Request Indicator */}
          {needsPermission && !isListening && !isProcessing && (
            <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center rounded-full">
              <motion.span 
                className="text-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎤
              </motion.span>
            </div>
          )}
          
          {/* Processing Indicator */}
          {(state === VoiceState.PROCESSING || state === VoiceState.EXECUTING) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-3/4 h-3/4 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>
          )}
        </motion.button>

        {/* State Label Below Avatar */}
        <motion.div
          className={`
            absolute
            -bottom-10
            left-1/2
            -translate-x-1/2
            px-3
            py-1
            rounded-full
            ${config.backgroundColor}
            shadow-md
            border-2
            border-white
            text-xs
            font-medium
            whitespace-nowrap
            text-center
          `}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {getStateLabel()}
        </motion.div>

        {/* Audio Level Indicator when Listening */}
        {isListening && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-red-500 to-red-300 rounded-full"
                animate={{
                  height: [8, 20, 8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Feedback Panel (Transcript + Response) - A LA IZQUIERDA DEL AVATAR */}
      <AnimatePresence>
        {showFeedback && (currentTranscript || lastResponse) && (
          <motion.div
            className={`fixed z-[99999] ${
              isMobile 
                ? 'bottom-6 left-4 right-24 max-w-[calc(100%-7rem)]' 
                : 'bottom-12 right-52 max-w-md'
            }`}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            role="region"
            aria-label="Respuesta del asistente de voz"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 space-y-3 border-2 border-gray-100">
              {/* Close Button */}
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Cerrar feedback"
              >
                <X size={14} />
              </button>

              {/* Current Transcript */}
              {currentTranscript && (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎤</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Tú dijiste:
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-2 border border-blue-200">
                    "{currentTranscript}"
                  </p>
                </motion.div>
              )}

              {/* Last Response */}
              {lastResponse && (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Respuesta:
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 bg-green-50 rounded-lg p-2 border border-green-200">
                    {typeof lastResponse === 'string' ? lastResponse : JSON.stringify(lastResponse)}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Hint */}
      <motion.div
        className="fixed bottom-6 right-28 z-40 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        Ctrl + Shift + V
      </motion.div>
    </>
  );
}

export default VoiceAvatarFloating;
