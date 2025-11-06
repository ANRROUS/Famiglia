/**
 * VoiceAvatar
 * Avatar visual animado del asistente de voz
 * Placeholder para futuras mejoras (integración con avatar 3D/animado)
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../../context/VoiceContext';

const VoiceAvatar = ({
  size = 'medium',
  showWhenInactive = false,
  position = 'center',
  className = ''
}) => {
  const {
    isActive,
    isListening,
    isProcessing,
    isSpeaking,
    error
  } = useVoice();

  const [audioLevels, setAudioLevels] = useState([0.5, 0.7, 0.3, 0.8, 0.4, 0.6]);

  /**
   * Simular niveles de audio (placeholder)
   * En el futuro: conectar con analyzer de audio real
   */
  useEffect(() => {
    if (!isListening && !isSpeaking) {
      setAudioLevels([0.5, 0.7, 0.3, 0.8, 0.4, 0.6]);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevels(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  /**
   * Determinar estado visual
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
   * No mostrar si está inactivo y showWhenInactive es false
   */
  if (!isActive && !showWhenInactive) {
    return null;
  }

  /**
   * Obtener clase de tamaño
   */
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'voice-avatar-small';
      case 'medium':
        return 'voice-avatar-medium';
      case 'large':
        return 'voice-avatar-large';
      default:
        return 'voice-avatar-medium';
    }
  };

  /**
   * Obtener clase de posición
   */
  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'voice-avatar-top-left';
      case 'top-right':
        return 'voice-avatar-top-right';
      case 'bottom-left':
        return 'voice-avatar-bottom-left';
      case 'bottom-right':
        return 'voice-avatar-bottom-right';
      case 'center':
        return 'voice-avatar-center';
      default:
        return 'voice-avatar-center';
    }
  };

  /**
   * Obtener colores del gradiente según estado
   */
  const getGradientColors = () => {
    switch (visualState) {
      case 'error':
        return { from: '#ef4444', to: '#dc2626' }; // red
      case 'processing':
        return { from: '#f59e0b', to: '#d97706' }; // amber
      case 'speaking':
        return { from: '#8b5cf6', to: '#7c3aed' }; // violet
      case 'listening':
        return { from: '#10b981', to: '#059669' }; // emerald
      case 'active':
        return { from: '#3b82f6', to: '#2563eb' }; // blue
      default:
        return { from: '#6b7280', to: '#4b5563' }; // gray
    }
  };

  const colors = getGradientColors();

  return (
    <>
      <div className={`voice-avatar-container ${getPositionClass()} ${className}`}>
        <div className={`voice-avatar ${getSizeClass()} ${visualState}`}>
          {/* Círculo exterior con gradiente */}
          <div className="avatar-circle-outer">
            {/* Círculo medio con animación de pulso */}
            <div className="avatar-circle-middle">
              {/* Círculo interior con ícono */}
              <div className="avatar-circle-inner">
                {/* Ícono del asistente */}
                <svg
                  className="avatar-icon"
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
              </div>
            </div>
          </div>

          {/* Barras de visualización de audio */}
          {(isListening || isSpeaking) && (
            <div className="avatar-audio-bars">
              {audioLevels.map((level, index) => (
                <div
                  key={index}
                  className="audio-bar"
                  style={{
                    height: `${level * 100}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Ondas de sonido (círculos concéntricos) */}
          {isListening && (
            <div className="avatar-sound-waves">
              <div className="sound-wave sound-wave-1" />
              <div className="sound-wave sound-wave-2" />
              <div className="sound-wave sound-wave-3" />
            </div>
          )}

          {/* Partículas (para estado speaking) */}
          {isSpeaking && (
            <div className="avatar-particles">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    '--angle': `${i * 45}deg`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Label de estado */}
        <div className={`avatar-label ${visualState}`}>
          {visualState === 'error' && 'Error'}
          {visualState === 'processing' && 'Procesando...'}
          {visualState === 'speaking' && 'Hablando...'}
          {visualState === 'listening' && 'Escuchando...'}
          {visualState === 'active' && 'Activo'}
          {visualState === 'idle' && 'Inactivo'}
        </div>
      </div>

      <style jsx>{`
        /* Contenedor */
        .voice-avatar-container {
          position: fixed;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          pointer-events: none;
        }

        /* Posiciones */
        .voice-avatar-center {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .voice-avatar-top-left {
          top: 100px;
          left: 100px;
        }

        .voice-avatar-top-right {
          top: 100px;
          right: 100px;
        }

        .voice-avatar-bottom-left {
          bottom: 100px;
          left: 100px;
        }

        .voice-avatar-bottom-right {
          bottom: 100px;
          right: 100px;
        }

        /* Avatar principal */
        .voice-avatar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Tamaños */
        .voice-avatar-small {
          width: 80px;
          height: 80px;
        }

        .voice-avatar-medium {
          width: 120px;
          height: 120px;
        }

        .voice-avatar-large {
          width: 160px;
          height: 160px;
        }

        /* Círculos */
        .avatar-circle-outer {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.from}, ${colors.to});
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s ease;
        }

        .avatar-circle-middle {
          width: 85%;
          height: 85%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .avatar-circle-inner {
          width: 75%;
          height: 75%;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.from}, ${colors.to});
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        /* Ícono */
        .avatar-icon {
          width: 60%;
          height: 60%;
        }

        /* Barras de audio */
        .avatar-audio-bars {
          position: absolute;
          bottom: -40px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 30px;
        }

        .audio-bar {
          width: 4px;
          background: linear-gradient(to top, ${colors.from}, ${colors.to});
          border-radius: 2px;
          animation: audioBarPulse 0.5s ease-in-out infinite alternate;
        }

        /* Ondas de sonido */
        .avatar-sound-waves {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .sound-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid ${colors.from};
          border-radius: 50%;
          opacity: 0;
          animation: soundWaveExpand 2s ease-out infinite;
        }

        .sound-wave-1 {
          animation-delay: 0s;
        }

        .sound-wave-2 {
          animation-delay: 0.7s;
        }

        .sound-wave-3 {
          animation-delay: 1.4s;
        }

        /* Partículas */
        .avatar-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          background: ${colors.from};
          border-radius: 50%;
          transform-origin: center;
          animation: particleFloat 2s ease-in-out infinite;
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-60px);
        }

        /* Label de estado */
        .avatar-label {
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-out;
        }

        .avatar-label.listening {
          background: rgba(16, 185, 129, 0.9);
        }

        .avatar-label.speaking {
          background: rgba(139, 92, 246, 0.9);
        }

        .avatar-label.processing {
          background: rgba(245, 158, 11, 0.9);
        }

        .avatar-label.error {
          background: rgba(239, 68, 68, 0.9);
        }

        /* Animaciones de estado */
        .voice-avatar.listening .avatar-circle-outer {
          animation: breathe 2s ease-in-out infinite;
        }

        .voice-avatar.speaking .avatar-circle-outer {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .voice-avatar.processing .avatar-circle-outer {
          animation: rotate360 2s linear infinite;
        }

        .voice-avatar.error .avatar-circle-outer {
          animation: shake 0.5s ease-in-out;
        }

        /* Keyframes */
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }

        @keyframes rotate360 {
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
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes audioBarPulse {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes soundWaveExpand {
          0% {
            width: 100%;
            height: 100%;
            opacity: 0.6;
          }
          100% {
            width: 200%;
            height: 200%;
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .voice-avatar-container {
            display: none; /* Ocultar en móviles para no obstruir */
          }
        }
      `}</style>
    </>
  );
};

VoiceAvatar.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showWhenInactive: PropTypes.bool,
  position: PropTypes.oneOf(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']),
  className: PropTypes.string
};

export default VoiceAvatar;
