/**
 * VoiceTranscript
 * Muestra la transcripción del comando de voz en tiempo real
 * Útil para personas con audición parcial y para depuración
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../../context/VoiceContext';

const VoiceTranscript = ({
  position = 'bottom-center',
  showWhenInactive = false,
  maxLength = 150,
  className = ''
}) => {
  const {
    isActive,
    isListening,
    transcript,
    interimTranscript,
    finalTranscript,
    isProcessing
  } = useVoice();

  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Actualizar texto a mostrar
   */
  useEffect(() => {
    if (isProcessing) {
      setDisplayText(finalTranscript || transcript || '');
    } else if (isListening) {
      // Priorizar interim transcript si existe
      const currentText = interimTranscript || transcript || '';
      setDisplayText(currentText);
    } else {
      setDisplayText('');
    }
  }, [isListening, transcript, interimTranscript, finalTranscript, isProcessing]);

  /**
   * Controlar visibilidad
   */
  useEffect(() => {
    if (!isActive && !showWhenInactive) {
      setIsVisible(false);
      return;
    }

    // Mostrar cuando está escuchando o procesando
    if (isListening || isProcessing) {
      setIsVisible(true);
    } else {
      // Ocultar con delay para permitir leer el comando final
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isActive, isListening, isProcessing, showWhenInactive]);

  /**
   * No mostrar si no hay texto o no está visible
   */
  if (!isVisible && !displayText) {
    return null;
  }

  /**
   * Truncar texto si es muy largo
   */
  const truncatedText = displayText.length > maxLength
    ? `${displayText.substring(0, maxLength)}...`
    : displayText;

  /**
   * Obtener clase de posición
   */
  const getPositionClass = () => {
    switch (position) {
      case 'top-center':
        return 'voice-transcript-top-center';
      case 'top-left':
        return 'voice-transcript-top-left';
      case 'top-right':
        return 'voice-transcript-top-right';
      case 'bottom-center':
        return 'voice-transcript-bottom-center';
      case 'bottom-left':
        return 'voice-transcript-bottom-left';
      case 'bottom-right':
        return 'voice-transcript-bottom-right';
      default:
        return 'voice-transcript-bottom-center';
    }
  };

  /**
   * Determinar estado visual
   */
  const getStateClass = () => {
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    return 'idle';
  };

  const stateClass = getStateClass();

  return (
    <>
      <div
        className={`voice-transcript-container ${getPositionClass()} ${stateClass} ${isVisible ? 'visible' : 'hidden'} ${className}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Header con indicador */}
        <div className="transcript-header">
          {/* Indicador de estado */}
          <div className={`transcript-indicator ${stateClass}`}>
            <div className="indicator-dot" />
          </div>

          {/* Label de estado */}
          <span className="transcript-label">
            {isProcessing && 'Procesando comando'}
            {isListening && !isProcessing && 'Escuchando...'}
            {!isListening && !isProcessing && 'Comando detectado'}
          </span>
        </div>

        {/* Transcripción */}
        <div className="transcript-text">
          {truncatedText || (
            <span className="transcript-placeholder">
              {isListening ? 'Di un comando...' : 'Sin comando'}
            </span>
          )}
        </div>

        {/* Indicador de interim (parcial) */}
        {isListening && interimTranscript && (
          <div className="transcript-interim-indicator">
            <svg
              className="interim-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Escuchando...</span>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Contenedor */
        .voice-transcript-container {
          position: fixed;
          z-index: 9999;
          max-width: 400px;
          min-width: 280px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          padding: 16px;
          transition: all 0.3s ease;
          border: 2px solid rgba(0, 0, 0, 0.05);
        }

        .voice-transcript-container.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .voice-transcript-container.hidden {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
        }

        /* Posiciones */
        .voice-transcript-top-center {
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
        }

        .voice-transcript-top-center.visible {
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .voice-transcript-top-center.hidden {
          transform: translateX(-50%) translateY(-20px) scale(0.95);
        }

        .voice-transcript-top-left {
          top: 24px;
          left: 24px;
        }

        .voice-transcript-top-right {
          top: 24px;
          right: 24px;
        }

        .voice-transcript-bottom-center {
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
        }

        .voice-transcript-bottom-center.visible {
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .voice-transcript-bottom-center.hidden {
          transform: translateX(-50%) translateY(20px) scale(0.95);
        }

        .voice-transcript-bottom-left {
          bottom: 100px;
          left: 24px;
        }

        .voice-transcript-bottom-right {
          bottom: 100px;
          right: 24px;
        }

        /* Estados */
        .voice-transcript-container.listening {
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2);
        }

        .voice-transcript-container.processing {
          border-color: rgba(245, 158, 11, 0.3);
          box-shadow: 0 8px 32px rgba(245, 158, 11, 0.2);
        }

        /* Header */
        .transcript-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        /* Indicador */
        .transcript-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(107, 114, 128, 0.1);
        }

        .transcript-indicator.listening {
          background: rgba(16, 185, 129, 0.1);
        }

        .transcript-indicator.processing {
          background: rgba(245, 158, 11, 0.1);
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6b7280;
        }

        .transcript-indicator.listening .indicator-dot {
          background: #10b981;
          animation: pulse 2s ease-in-out infinite;
        }

        .transcript-indicator.processing .indicator-dot {
          background: #f59e0b;
          animation: spin 1s linear infinite;
        }

        /* Label */
        .transcript-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .voice-transcript-container.listening .transcript-label {
          color: #10b981;
        }

        .voice-transcript-container.processing .transcript-label {
          color: #f59e0b;
        }

        /* Texto de transcripción */
        .transcript-text {
          font-size: 16px;
          line-height: 1.5;
          color: #111827;
          font-weight: 500;
          min-height: 24px;
          word-wrap: break-word;
        }

        .transcript-placeholder {
          color: #9ca3af;
          font-style: italic;
          font-weight: 400;
        }

        /* Indicador de interim */
        .transcript-interim-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .interim-icon {
          width: 14px;
          height: 14px;
          animation: pulse 2s ease-in-out infinite;
        }

        /* Animaciones */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
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

        /* Responsive */
        @media (max-width: 768px) {
          .voice-transcript-container {
            max-width: calc(100vw - 48px);
            min-width: 260px;
            padding: 12px;
            bottom: 90px;
          }

          .transcript-text {
            font-size: 14px;
          }

          .transcript-label {
            font-size: 11px;
          }

          .transcript-interim-indicator {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .voice-transcript-container {
            max-width: calc(100vw - 32px);
            min-width: auto;
            left: 16px !important;
            right: 16px !important;
            transform: none !important;
          }

          .voice-transcript-bottom-center {
            left: 16px;
            right: 16px;
            transform: none;
          }

          .voice-transcript-bottom-center.visible {
            transform: translateY(0) scale(1);
          }

          .voice-transcript-bottom-center.hidden {
            transform: translateY(20px) scale(0.95);
          }
        }
      `}</style>
    </>
  );
};

VoiceTranscript.propTypes = {
  position: PropTypes.oneOf([
    'top-center',
    'top-left',
    'top-right',
    'bottom-center',
    'bottom-left',
    'bottom-right'
  ]),
  showWhenInactive: PropTypes.bool,
  maxLength: PropTypes.number,
  className: PropTypes.string
};

export default VoiceTranscript;
