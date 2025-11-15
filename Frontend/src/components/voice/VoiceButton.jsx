import { Mic, MicOff } from 'lucide-react';
import { useVoice, VoiceState } from '../../context/VoiceContext';

/**
 * Botón de micrófono para iniciar la navegación por voz
 * Muestra estado visual del sistema (escuchando, procesando, error)
 */
export function VoiceButton({ className = '', size = 'default' }) {
  const {
    state,
    isSupported,
    isListening,
    isProcessing,
    error,
    openVoiceModal,
    cancelVoiceCommand
  } = useVoice();

  // 🔧 DEBUG: Mostrar siempre el botón para diagnosticar
  // Si no está soportado, mostrar icono con indicador de error
  console.log('[VoiceButton] isSupported:', isSupported, 'state:', state);

  const handleClick = () => {
    if (!isSupported) {
      alert('Tu navegador no soporta reconocimiento de voz.\n\nPor favor usa Chrome o Edge.\n\nAsegúrate de dar permisos al micrófono.');
      return;
    }
    
    if (isListening || isProcessing) {
      cancelVoiceCommand();
    } else {
      openVoiceModal();
    }
  };

  // Clases de tamaño
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 20,
    default: 24,
    large: 32
  };

  // Clases de estado
  const getStateClasses = () => {
    if (!isSupported) {
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed';
    }
    
    switch (state) {
      case VoiceState.LISTENING:
        return 'bg-red-500 hover:bg-red-600 animate-pulse';
      case VoiceState.PROCESSING:
      case VoiceState.EXECUTING:
        return 'bg-blue-500 hover:bg-blue-600 animate-spin';
      case VoiceState.SPEAKING:
        return 'bg-purple-500 hover:bg-purple-600 animate-pulse';
      case VoiceState.ERROR:
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  // Texto de tooltip
  const getTooltipText = () => {
    if (!isSupported) {
      return '⚠️ Navegación por voz no disponible. Usa Chrome o Edge.';
    }
    
    switch (state) {
      case VoiceState.LISTENING:
        return 'Escuchando... (clic para cancelar)';
      case VoiceState.PROCESSING:
        return 'Procesando comando...';
      case VoiceState.EXECUTING:
        return 'Ejecutando acción...';
      case VoiceState.SPEAKING:
        return 'Hablando...';
      case VoiceState.ERROR:
        return error || 'Error - clic para reintentar';
      default:
        return 'Navegación por voz (clic para hablar)';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${getStateClasses()}
        rounded-full
        text-white
        shadow-lg
        transition-all
        duration-300
        flex
        items-center
        justify-center
        focus:outline-none
        focus:ring-4
        focus:ring-primary/50
        disabled:opacity-50
        disabled:cursor-not-allowed
        relative
        group
        ${className}
      `}
      title={getTooltipText()}
      aria-label={getTooltipText()}
      disabled={!isSupported || state === VoiceState.PROCESSING || state === VoiceState.EXECUTING}
    >
      {/* Icono */}
      {isListening || state === VoiceState.SPEAKING ? (
        <Mic size={iconSizes[size]} className="animate-pulse" />
      ) : !isSupported ? (
        <MicOff size={iconSizes[size]} className="opacity-70" />
      ) : (
        <Mic size={iconSizes[size]} />
      )}

      {/* Indicador de estado - anillo animado */}
      {(isListening || isProcessing) && (
        <span className="absolute -inset-1 rounded-full border-4 border-white/30 animate-ping" />
      )}

      {/* Tooltip en hover */}
      <span className="
        absolute
        bottom-full
        mb-2
        px-3
        py-1
        bg-gray-900
        text-white
        text-xs
        rounded
        whitespace-nowrap
        opacity-0
        group-hover:opacity-100
        transition-opacity
        pointer-events-none
        z-50
      ">
        {getTooltipText()}
      </span>

      {/* Badge de error */}
      {(state === VoiceState.ERROR || !isSupported) && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

export default VoiceButton;
