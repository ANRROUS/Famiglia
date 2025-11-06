/**
 * VoiceControl
 * Componente principal que orquesta todo el sistema de control de voz
 * Integra todos los componentes y maneja la ejecución de comandos
 */

import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../../context/VoiceContext';
import VoiceCommandExecutor from '../../services/voice/VoiceCommandExecutor';
import voiceReduxBridge from '../../services/voice/reduxIntegration';

// Componentes
import VoiceMicButton from './VoiceMicButton';
import VoiceAvatar from './VoiceAvatar';
import VoiceTranscript from './VoiceTranscript';
import VoiceAnnouncer from './VoiceAnnouncer';
import VoiceHelp from './VoiceHelp';
import VoiceOnboarding from './VoiceOnboarding';

const VoiceControl = ({
  store = null,
  showAvatar = true,
  showTranscript = true,
  showOnboarding = true,
  avatarPosition = 'bottom-right',
  transcriptPosition = 'bottom-center',
  micButtonPosition = 'bottom-right',
  micButtonSize = 'large',
  className = ''
}) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const navigate = useNavigate();
  const executorRef = useRef(null);

  const {
    isActive,
    finalTranscript,
    lastCommand,
    error,
    ttsService,
    apiClient,
    isSupported
  } = useVoice();

  // Redux state (opcional)
  const reduxState = useSelector(state => state);

  /**
   * Inicializar Command Executor
   */
  useEffect(() => {
    if (!executorRef.current) {
      executorRef.current = new VoiceCommandExecutor(
        store,
        navigate,
        ttsService
      );

      console.log('[Voice Control] Command Executor initialized');
    }

    // Actualizar referencias si cambian
    executorRef.current.setStore(store);
    executorRef.current.setNavigate(navigate);
    executorRef.current.setTTSService(ttsService);
  }, [store, navigate, ttsService]);

  /**
   * Configurar Redux Bridge
   */
  useEffect(() => {
    if (store) {
      voiceReduxBridge.setStore(store);
    }
    if (ttsService) {
      voiceReduxBridge.setTTSService(ttsService);
    }
  }, [store, ttsService]);

  /**
   * Procesar comandos cuando se detecta transcript final
   */
  useEffect(() => {
    if (!isActive || !finalTranscript || isExecuting) {
      return;
    }

    // Solo procesar si hay un cambio real en el transcript
    if (finalTranscript === lastCommand) {
      return;
    }

    handleCommandExecution(finalTranscript);
  }, [finalTranscript, isActive]);

  /**
   * Ejecutar comando
   */
  const handleCommandExecution = async (commandText) => {
    if (!commandText || !executorRef.current) {
      return;
    }

    try {
      setIsExecuting(true);

      console.log('[Voice Control] Executing command:', commandText);

      // Construir contexto
      const context = buildContext();

      // Enviar comando al backend para interpretación
      const interpretation = await apiClient.processCommand(commandText, context);

      if (!interpretation || !interpretation.success) {
        console.error('[Voice Control] Command interpretation failed:', interpretation);
        await ttsService.error('No pude entender ese comando');
        return;
      }

      const { intent, params } = interpretation;

      console.log('[Voice Control] Interpreted intent:', intent, params);

      // Comando especial: ayuda
      if (intent === 'help') {
        setHelpOpen(true);
        return;
      }

      // Ejecutar comando localmente
      const result = await executorRef.current.executeCommand(intent, params);

      console.log('[Voice Control] Execution result:', result);

      // Manejar resultado
      if (!result.success) {
        console.warn('[Voice Control] Command execution failed:', result);
        // El TTS ya se manejó en el executor
      }

    } catch (error) {
      console.error('[Voice Control] Error executing command:', error);
      await ttsService.error('Hubo un error al ejecutar el comando');

    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Construir contexto para el backend
   */
  const buildContext = () => {
    // Determinar página actual
    const pathname = window.location.pathname;
    let currentPage = 'home';

    if (pathname.includes('/carta') || pathname.includes('/catalog')) {
      currentPage = 'catalog';
    } else if (pathname.includes('/carrito') || pathname.includes('/cart')) {
      currentPage = 'cart';
    } else if (pathname.includes('/checkout') || pathname.includes('/pago')) {
      currentPage = 'checkout';
    } else if (pathname.includes('/payment')) {
      currentPage = 'payment';
    } else if (pathname.includes('/test') || pathname.includes('/preferencias')) {
      currentPage = 'test';
    } else if (pathname.includes('/perfil') || pathname.includes('/profile')) {
      currentPage = 'profile';
    } else if (pathname.includes('/login')) {
      currentPage = 'login';
    } else if (pathname.includes('/register')) {
      currentPage = 'register';
    } else if (pathname.includes('/admin')) {
      currentPage = 'admin';
    }

    // Extraer datos del carrito
    const cart = reduxState?.cart || reduxState?.carrito || {};
    const cartItems = cart.items || cart.productos || [];
    const cartItemsCount = cartItems.length || 0;

    // Extraer rol del usuario
    const auth = reduxState?.auth || {};
    const user = auth.user || auth.usuario || {};
    const userRole = user.role || user.rol || (auth.isAuthenticated ? 'cliente' : 'visitante');

    // Contar productos visibles
    let productCount = 0;
    if (currentPage === 'catalog') {
      const productCards = document.querySelectorAll(
        '[data-product-card], .product-card, .producto-card, article[class*="product"]'
      );
      productCount = productCards.length;
    }

    return {
      currentPage,
      userRole,
      cartItemsCount,
      productCount
    };
  };

  /**
   * Manejar errores del sistema de voz
   */
  useEffect(() => {
    if (error) {
      console.error('[Voice Control] Voice system error:', error);

      // Anunciar error si es crítico
      if (error.includes('no-speech') || error.includes('not-allowed')) {
        window.voiceAnnouncer?.error('Error en el micrófono. Verifica los permisos.');
      }
    }
  }, [error]);

  /**
   * Listener global para comando "ayuda"
   */
  useEffect(() => {
    const handleHelpCommand = (event) => {
      if (event.detail?.command === 'help') {
        setHelpOpen(true);
      }
    };

    window.addEventListener('voiceHelpRequested', handleHelpCommand);
    return () => window.removeEventListener('voiceHelpRequested', handleHelpCommand);
  }, []);

  /**
   * No renderizar nada si no hay soporte
   */
  if (!isSupported) {
    return (
      <div className="voice-not-supported">
        <p>Tu navegador no soporta reconocimiento de voz.</p>
        <p>Por favor usa Chrome, Edge o Safari.</p>
      </div>
    );
  }

  return (
    <div className={`voice-control-container ${className}`}>
      {/* Announcer - Para anuncios ARIA live */}
      <VoiceAnnouncer showVisually={false} autoHideDuration={5000} />

      {/* Botón de micrófono */}
      <VoiceMicButton
        position={micButtonPosition}
        size={micButtonSize}
        showLabel={true}
      />

      {/* Avatar animado */}
      {showAvatar && (
        <VoiceAvatar
          size="medium"
          position={avatarPosition}
          showWhenInactive={false}
        />
      )}

      {/* Transcripción en tiempo real */}
      {showTranscript && (
        <VoiceTranscript
          position={transcriptPosition}
          showWhenInactive={false}
          maxLength={150}
        />
      )}

      {/* Modal de ayuda */}
      <VoiceHelp
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        showContextualOnly={false}
      />

      {/* Onboarding - Primera visita */}
      {showOnboarding && (
        <VoiceOnboarding
          autoShow={true}
          onComplete={(dontShow) => {
            console.log('[Voice Control] Onboarding completed, dontShow:', dontShow);
          }}
        />
      )}

      <style jsx>{`
        .voice-control-container {
          position: relative;
          z-index: 10000;
        }

        .voice-not-supported {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 16px 20px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 10000;
          max-width: 300px;
        }

        .voice-not-supported p {
          margin: 0 0 8px;
          font-size: 14px;
          line-height: 1.4;
        }

        .voice-not-supported p:last-child {
          margin-bottom: 0;
          font-size: 13px;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .voice-not-supported {
            bottom: 16px;
            right: 16px;
            left: 16px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

VoiceControl.propTypes = {
  store: PropTypes.object,
  showAvatar: PropTypes.bool,
  showTranscript: PropTypes.bool,
  showOnboarding: PropTypes.bool,
  avatarPosition: PropTypes.oneOf(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']),
  transcriptPosition: PropTypes.oneOf(['top-center', 'top-left', 'top-right', 'bottom-center', 'bottom-left', 'bottom-right']),
  micButtonPosition: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  micButtonSize: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string
};

export default VoiceControl;
