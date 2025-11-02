/**
 * VoiceAnnouncer
 * Componente para anuncios accesibles usando ARIA live regions
 * Compatible con lectores de pantalla
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const VoiceAnnouncer = ({
  autoHideDuration = 5000,
  className = '',
  showVisually = false // Si true, muestra los mensajes visualmente (útil para desarrollo)
}) => {
  // Estados para diferentes tipos de anuncios
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  // Timeouts para auto-clear
  const politeTimeoutRef = useRef(null);
  const assertiveTimeoutRef = useRef(null);

  /**
   * Limpiar timeouts al desmontar
   */
  useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Anunciar mensaje (polite - no interrumpe)
   * @param {String} message - Mensaje a anunciar
   */
  const announce = useCallback((message) => {
    if (!message || typeof message !== 'string') {
      return;
    }

    // Limpiar timeout anterior
    if (politeTimeoutRef.current) {
      clearTimeout(politeTimeoutRef.current);
    }

    // Establecer mensaje
    setPoliteMessage(message);

    // Auto-clear después del tiempo especificado
    if (autoHideDuration > 0) {
      politeTimeoutRef.current = setTimeout(() => {
        setPoliteMessage('');
      }, autoHideDuration);
    }

    console.log('[Voice Announcer] Polite:', message);
  }, [autoHideDuration]);

  /**
   * Anunciar mensaje importante (assertive - interrumpe)
   * @param {String} message - Mensaje importante a anunciar
   */
  const announceImportant = useCallback((message) => {
    if (!message || typeof message !== 'string') {
      return;
    }

    // Limpiar timeout anterior
    if (assertiveTimeoutRef.current) {
      clearTimeout(assertiveTimeoutRef.current);
    }

    // Establecer mensaje
    setAssertiveMessage(message);

    // Auto-clear después del tiempo especificado
    if (autoHideDuration > 0) {
      assertiveTimeoutRef.current = setTimeout(() => {
        setAssertiveMessage('');
      }, autoHideDuration);
    }

    console.log('[Voice Announcer] Assertive:', message);
  }, [autoHideDuration]);

  /**
   * Confirmar acción (polite, mensaje corto)
   * @param {String} message - Mensaje de confirmación
   */
  const confirm = useCallback((message) => {
    announce(message || 'Acción completada');
  }, [announce]);

  /**
   * Anunciar error (assertive, mensaje importante)
   * @param {String} message - Mensaje de error
   */
  const error = useCallback((message) => {
    announceImportant(message || 'Ha ocurrido un error');
  }, [announceImportant]);

  /**
   * Limpiar todos los mensajes
   */
  const clear = useCallback(() => {
    setPoliteMessage('');
    setAssertiveMessage('');

    if (politeTimeoutRef.current) {
      clearTimeout(politeTimeoutRef.current);
    }
    if (assertiveTimeoutRef.current) {
      clearTimeout(assertiveTimeoutRef.current);
    }
  }, []);

  // Exponer funciones a través de ref (para uso desde componentes padre)
  useEffect(() => {
    // Registrar funciones en el objeto window para acceso global
    if (typeof window !== 'undefined') {
      window.voiceAnnouncer = {
        announce,
        announceImportant,
        confirm,
        error,
        clear
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.voiceAnnouncer;
      }
    };
  }, [announce, announceImportant, confirm, error, clear]);

  return (
    <>
      {/* Región ARIA live polite - No interrumpe lectores de pantalla */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`voice-announcer voice-announcer-polite ${showVisually ? 'voice-announcer-visible' : 'sr-only'} ${className}`}
      >
        {politeMessage}
      </div>

      {/* Región ARIA live assertive - Interrumpe lectores de pantalla */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={`voice-announcer voice-announcer-assertive ${showVisually ? 'voice-announcer-visible' : 'sr-only'} ${className}`}
      >
        {assertiveMessage}
      </div>

      <style jsx>{`
        /* Screen reader only - oculto visualmente pero accesible */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Versión visible (para desarrollo/depuración) */
        .voice-announcer-visible {
          position: fixed;
          bottom: 20px;
          right: 20px;
          max-width: 400px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
        }

        .voice-announcer-visible:empty {
          display: none;
        }

        .voice-announcer-polite.voice-announcer-visible {
          background: rgba(16, 185, 129, 0.95);
        }

        .voice-announcer-assertive.voice-announcer-visible {
          background: rgba(239, 68, 68, 0.95);
          font-weight: 600;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

VoiceAnnouncer.propTypes = {
  autoHideDuration: PropTypes.number,
  className: PropTypes.string,
  showVisually: PropTypes.bool
};

export default VoiceAnnouncer;
