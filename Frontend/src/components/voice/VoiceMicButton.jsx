/**
 * VoiceMicButton
 * Botón flotante para activar/desactivar control de voz
 * Con estados visuales y animaciones
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../../context/VoiceContext';

const VoiceMicButton = ({
  position = 'bottom-right',
  size = 'large',
  showLabel = true,
  className = ''
}) => {
  const {
    isActive,
    isListening,
    isProcessing,
    isSpeaking,
    error,
    isSupported,
    toggle
  } = useVoice();

  const [isHovered, setIsHovered] = useState(false);

  /**
   * Determinar estado visual del botón
   */
  const getVisualState = () => {
    if (error) return 'error';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    if (isActive) return 'active';
    return 'idle';
  };

  const visualState = getVisualState();

  /**
   * Obtener color según estado
   */
  const getStateColor = () => {
    switch (visualState) {
      case 'error':
        return '#ef4444'; // red-500
      case 'processing':
        return '#f59e0b'; // amber-500
      case 'speaking':
        return '#8b5cf6'; // violet-500
      case 'listening':
        return '#10b981'; // emerald-500
      case 'active':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  /**
   * Obtener label según estado
   */
  const getStateLabel = () => {
    switch (visualState) {
      case 'error':
        return 'Error de voz';
      case 'processing':
        return 'Procesando...';
      case 'speaking':
        return 'Hablando...';
      case 'listening':
        return 'Escuchando...';
      case 'active':
        return 'Asistente activo';
      default:
        return 'Activar asistente';
    }
  };

  /**
   * Obtener clase de posición
   */
  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left':
        return 'voice-mic-bottom-left';
      case 'bottom-right':
        return 'voice-mic-bottom-right';
      case 'top-left':
        return 'voice-mic-top-left';
      case 'top-right':
        return 'voice-mic-top-right';
      default:
        return 'voice-mic-bottom-right';
    }
  };

  /**
   * Obtener clase de tamaño
   */
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'voice-mic-small';
      case 'medium':
        return 'voice-mic-medium';
      case 'large':
        return 'voice-mic-large';
      default:
        return 'voice-mic-large';
    }
  };

  /**
   * Manejar click en el botón
   */
  const handleClick = async () => {
    if (!isSupported) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome, Edge o Safari.');
      return;
    }

    await toggle();
  };

  /**
   * Manejar teclas de acceso rápido
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + V para activar/desactivar
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSupported, toggle]);

  if (!isSupported) {
    return null; // No mostrar si no hay soporte
  }

  const stateColor = getStateColor();
  const stateLabel = getStateLabel();

  return (
    <>
      <div
        className={`voice-mic-container ${getPositionClass()} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Label opcional */}
        {showLabel && (isHovered || isActive) && (
          <div className={`voice-mic-label ${visualState}`}>
            {stateLabel}
          </div>
        )}

        {/* Botón principal */}
        <button
          type="button"
          className={`voice-mic-button ${getSizeClass()} ${visualState}`}
          onClick={handleClick}
          aria-label={stateLabel}
          aria-pressed={isActive}
          aria-live="polite"
          title="Activar/Desactivar asistente de voz (Alt + V)"
        >
          {/* Ícono de micrófono */}
          <svg
            className="voice-mic-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>

          {/* Indicador de estado (punto) */}
          <div className={`voice-mic-indicator ${visualState}`} />

          {/* Ondas de sonido (solo cuando escucha) */}
          {isListening && (
            <div className="voice-mic-waves">
              <div className="wave wave-1" />
              <div className="wave wave-2" />
              <div className="wave wave-3" />
            </div>
          )}
        </button>
      </div>

      <style jsx>{`
        /* Contenedor */
        .voice-mic-container {
          position: fixed;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Posiciones */
        .voice-mic-bottom-right {
          bottom: 24px;
          right: 24px;
          flex-direction: row-reverse;
        }

        .voice-mic-bottom-left {
          bottom: 24px;
          left: 24px;
          flex-direction: row;
        }

        .voice-mic-top-right {
          top: 24px;
          right: 24px;
          flex-direction: row-reverse;
        }

        .voice-mic-top-left {
          top: 24px;
          left: 24px;
          flex-direction: row;
        }

        /* Label */
        .voice-mic-label {
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          backdrop-filter: blur(8px);
          animation: slideIn 0.2s ease-out;
        }

        .voice-mic-label.listening {
          background: rgba(16, 185, 129, 0.9);
        }

        .voice-mic-label.processing {
          background: rgba(245, 158, 11, 0.9);
        }

        .voice-mic-label.error {
          background: rgba(239, 68, 68, 0.9);
        }

        /* Botón */
        .voice-mic-button {
          position: relative;
          border: none;
          border-radius: 50%;
          background: ${stateColor};
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .voice-mic-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .voice-mic-button:active {
          transform: scale(0.95);
        }

        .voice-mic-button:focus-visible {
          outline: 3px solid #3b82f6;
          outline-offset: 3px;
        }

        /* Tamaños */
        .voice-mic-small {
          width: 48px;
          height: 48px;
        }

        .voice-mic-small .voice-mic-icon {
          width: 24px;
          height: 24px;
        }

        .voice-mic-medium {
          width: 56px;
          height: 56px;
        }

        .voice-mic-medium .voice-mic-icon {
          width: 28px;
          height: 28px;
        }

        .voice-mic-large {
          width: 64px;
          height: 64px;
        }

        .voice-mic-large .voice-mic-icon {
          width: 32px;
          height: 32px;
        }

        /* Ícono */
        .voice-mic-icon {
          position: relative;
          z-index: 2;
        }

        /* Indicador de estado */
        .voice-mic-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          z-index: 3;
        }

        .voice-mic-indicator.idle {
          background: #6b7280;
        }

        .voice-mic-indicator.active {
          background: #3b82f6;
        }

        .voice-mic-indicator.listening {
          background: #10b981;
          animation: pulse 2s ease-in-out infinite;
        }

        .voice-mic-indicator.processing {
          background: #f59e0b;
          animation: spin 1s linear infinite;
        }

        .voice-mic-indicator.speaking {
          background: #8b5cf6;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .voice-mic-indicator.error {
          background: #ef4444;
          animation: shake 0.5s ease-in-out;
        }

        /* Ondas de sonido */
        .voice-mic-waves {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid currentColor;
          border-radius: 50%;
          opacity: 0;
          animation: wave 2s ease-out infinite;
        }

        .wave-1 {
          animation-delay: 0s;
        }

        .wave-2 {
          animation-delay: 0.5s;
        }

        .wave-3 {
          animation-delay: 1s;
        }

        /* Animaciones */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }

        @keyframes wave {
          0% {
            width: 100%;
            height: 100%;
            opacity: 0.8;
          }
          100% {
            width: 200%;
            height: 200%;
            opacity: 0;
          }
        }

        /* Estados del botón */
        .voice-mic-button.listening {
          animation: breathe 2s ease-in-out infinite;
        }

        .voice-mic-button.processing {
          animation: rotate 2s linear infinite;
        }

        @keyframes breathe {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 4px 24px rgba(16, 185, 129, 0.6);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .voice-mic-container {
            bottom: 16px;
            right: 16px;
          }

          .voice-mic-button {
            width: 56px;
            height: 56px;
          }

          .voice-mic-button .voice-mic-icon {
            width: 28px;
            height: 28px;
          }

          .voice-mic-label {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </>
  );
};

VoiceMicButton.propTypes = {
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
  className: PropTypes.string
};

export default VoiceMicButton;
