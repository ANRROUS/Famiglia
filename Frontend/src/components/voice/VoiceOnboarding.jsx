/**
 * VoiceOnboarding
 * Tutorial de bienvenida para el control de voz
 * Se muestra solo en la primera visita
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../../context/VoiceContext';

const VoiceOnboarding = ({
  storageKey = 'famiglia_voice_onboarding_completed',
  autoShow = true,
  onComplete = null,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

  const { activate, isSupported } = useVoice();

  /**
   * Verificar si ya se mostró el onboarding
   */
  useEffect(() => {
    if (!isSupported || !autoShow) {
      return;
    }

    try {
      const hasCompleted = localStorage.getItem(storageKey);

      if (!hasCompleted) {
        // Mostrar después de un breve delay
        const timeout = setTimeout(() => {
          setIsOpen(true);
        }, 1000);

        return () => clearTimeout(timeout);
      }
    } catch (error) {
      console.error('[Voice Onboarding] Error accessing localStorage:', error);
    }
  }, [storageKey, autoShow, isSupported]);

  /**
   * Focus trap - mantener foco dentro del modal
   */
  useEffect(() => {
    if (!isOpen) return;

    // Enfocar botón de cerrar al abrir
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Manejar Tab para trap de foco
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  /**
   * Manejar tecla ESC para cerrar
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    setIsOpen(false);

    try {
      // Guardar en localStorage
      if (dontShowAgain) {
        localStorage.setItem(storageKey, 'true');
      } else {
        localStorage.setItem(storageKey, 'temporary');
      }

      // Callback
      if (onComplete) {
        onComplete(dontShowAgain);
      }
    } catch (error) {
      console.error('[Voice Onboarding] Error saving to localStorage:', error);
    }
  };

  /**
   * Activar asistente y cerrar
   */
  const handleActivate = async () => {
    await activate();
    handleClose();
  };

  /**
   * Abrir modal manualmente (para usar desde fuera)
   */
  const open = () => {
    setIsOpen(true);
  };

  /**
   * Exponer función open globalmente
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.voiceOnboarding = { open };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.voiceOnboarding;
      }
    };
  }, []);

  if (!isSupported || !isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="voice-onboarding-overlay"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`voice-onboarding-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
      >
        {/* Botón cerrar */}
        <button
          ref={closeButtonRef}
          type="button"
          className="onboarding-close-button"
          onClick={handleClose}
          aria-label="Cerrar tutorial"
        >
          <svg
            className="close-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Encabezado */}
        <div className="onboarding-header">
          {/* Ícono */}
          <div className="onboarding-icon">
            <svg
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

          {/* Título */}
          <h2 id="onboarding-title" className="onboarding-title">
            Control por Voz Activado
          </h2>

          {/* Descripción */}
          <p id="onboarding-description" className="onboarding-description">
            Puedes navegar por toda la página usando tu voz. Haz clic en el botón de micrófono y di un comando.
          </p>
        </div>

        {/* Contenido */}
        <div className="onboarding-content">
          {/* Comandos principales */}
          <div className="onboarding-section">
            <h3 className="section-title">Comandos Principales</h3>
            <ul className="commands-list">
              <li className="command-item">
                <span className="command-text">"Ayuda"</span>
                <span className="command-desc">Ver todos los comandos disponibles</span>
              </li>
              <li className="command-item">
                <span className="command-text">"Ir a carta"</span>
                <span className="command-desc">Ver productos disponibles</span>
              </li>
              <li className="command-item">
                <span className="command-text">"Agregar al carrito"</span>
                <span className="command-desc">Añadir producto actual al carrito</span>
              </li>
              <li className="command-item">
                <span className="command-text">"Leer productos"</span>
                <span className="command-desc">Escuchar los productos disponibles</span>
              </li>
              <li className="command-item">
                <span className="command-text">"Siguiente"</span>
                <span className="command-desc">Navegar al siguiente producto</span>
              </li>
              <li className="command-item">
                <span className="command-text">"Ir al carrito"</span>
                <span className="command-desc">Ver tu carrito de compras</span>
              </li>
            </ul>
          </div>

          {/* Consejos */}
          <div className="onboarding-section">
            <h3 className="section-title">Consejos</h3>
            <ul className="tips-list">
              <li className="tip-item">
                <svg className="tip-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Habla claro y a velocidad normal</span>
              </li>
              <li className="tip-item">
                <svg className="tip-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Espera a que termine de hablar el asistente</span>
              </li>
              <li className="tip-item">
                <svg className="tip-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Usa Alt + V para activar/desactivar rápidamente</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="onboarding-footer">
          {/* Checkbox "No mostrar de nuevo" */}
          <label className="dont-show-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>No mostrar de nuevo</span>
          </label>

          {/* Botones */}
          <div className="footer-buttons">
            <button
              type="button"
              className="button button-secondary"
              onClick={handleClose}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleActivate}
            >
              Activar Asistente
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Overlay */
        .voice-onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 10001;
          animation: fadeIn 0.3s ease-out;
        }

        /* Modal */
        .voice-onboarding-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10002;
          max-width: 600px;
          width: calc(100% - 32px);
          max-height: calc(100vh - 64px);
          overflow-y: auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease-out;
        }

        /* Botón cerrar */
        .onboarding-close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #6b7280;
        }

        .onboarding-close-button:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #111827;
        }

        .onboarding-close-button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .close-icon {
          width: 20px;
          height: 20px;
        }

        /* Header */
        .onboarding-header {
          text-align: center;
          padding: 40px 32px 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .onboarding-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: pulse 2s ease-in-out infinite;
        }

        .onboarding-icon svg {
          width: 40px;
          height: 40px;
        }

        .onboarding-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px;
        }

        .onboarding-description {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
        }

        /* Contenido */
        .onboarding-content {
          padding: 24px 32px;
        }

        .onboarding-section {
          margin-bottom: 24px;
        }

        .onboarding-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px;
        }

        /* Lista de comandos */
        .commands-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .command-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          background: rgba(16, 185, 129, 0.05);
          border-left: 3px solid #10b981;
          border-radius: 8px;
        }

        .command-text {
          font-weight: 600;
          color: #10b981;
          font-size: 15px;
        }

        .command-desc {
          font-size: 14px;
          color: #6b7280;
        }

        /* Lista de consejos */
        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #4b5563;
        }

        .tip-icon {
          width: 20px;
          height: 20px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        /* Footer */
        .onboarding-footer {
          padding: 20px 32px 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dont-show-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
          cursor: pointer;
        }

        .dont-show-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .footer-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .button {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .button-secondary {
          background: rgba(0, 0, 0, 0.05);
          color: #4b5563;
        }

        .button-secondary:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .button-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Animaciones */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .voice-onboarding-modal {
            max-width: calc(100vw - 24px);
          }

          .onboarding-header {
            padding: 32px 24px 20px;
          }

          .onboarding-title {
            font-size: 24px;
          }

          .onboarding-description {
            font-size: 15px;
          }

          .onboarding-content {
            padding: 20px 24px;
          }

          .onboarding-footer {
            padding: 16px 24px 20px;
          }

          .footer-buttons {
            flex-direction: column;
          }

          .button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .onboarding-icon {
            width: 64px;
            height: 64px;
          }

          .onboarding-icon svg {
            width: 32px;
            height: 32px;
          }

          .onboarding-title {
            font-size: 22px;
          }

          .section-title {
            font-size: 16px;
          }

          .command-item {
            padding: 10px;
          }

          .command-text {
            font-size: 14px;
          }

          .command-desc {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

VoiceOnboarding.propTypes = {
  storageKey: PropTypes.string,
  autoShow: PropTypes.bool,
  onComplete: PropTypes.func,
  className: PropTypes.string
};

export default VoiceOnboarding;
