/**
 * VoiceHelp
 * Modal de ayuda con lista completa de comandos de voz
 * Categorizado y con búsqueda
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useVoice } from '../../context/VoiceContext';
import { useLocation } from 'react-router-dom';

const VoiceHelp = ({
  isOpen: isOpenProp = false,
  onClose = null,
  showContextualOnly = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  const { getCapabilities } = useVoice();
  const location = useLocation();

  /**
   * Sincronizar con prop isOpen
   */
  useEffect(() => {
    setIsOpen(isOpenProp);
  }, [isOpenProp]);

  /**
   * Enfocar búsqueda al abrir
   */
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Manejar tecla ESC
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
   * Exponer función open globalmente
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.voiceHelp = {
        open: () => setIsOpen(true),
        close: () => setIsOpen(false)
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.voiceHelp;
      }
    };
  }, []);

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  /**
   * Determinar página actual
   */
  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname.includes('/carta') || pathname.includes('/catalog')) return 'catalog';
    if (pathname.includes('/carrito') || pathname.includes('/cart')) return 'cart';
    if (pathname.includes('/checkout') || pathname.includes('/pago')) return 'checkout';
    if (pathname.includes('/payment')) return 'payment';
    if (pathname.includes('/test') || pathname.includes('/preferencias')) return 'test';
    if (pathname.includes('/perfil') || pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/login')) return 'login';
    if (pathname.includes('/register')) return 'register';
    if (pathname.includes('/admin')) return 'admin';
    return 'home';
  };

  /**
   * Comandos por categoría
   */
  const commandCategories = {
    navegacion: {
      title: 'Navegación',
      icon: '🧭',
      commands: [
        { command: 'Ir a inicio', description: 'Navegar a la página principal' },
        { command: 'Ir a carta / Ir a catálogo', description: 'Ver productos disponibles' },
        { command: 'Ir al carrito', description: 'Ver carrito de compras' },
        { command: 'Ir a pago / Proceder al pago', description: 'Ir al checkout' },
        { command: 'Ir a perfil / Ir a mi perfil', description: 'Ver perfil de usuario' },
        { command: 'Ir a login / Iniciar sesión', description: 'Ir a página de login' },
        { command: 'Ir a registro', description: 'Ir a página de registro' },
        { command: 'Volver / Regresar', description: 'Navegar hacia atrás' }
      ]
    },
    carrito: {
      title: 'Carrito de Compras',
      icon: '🛒',
      commands: [
        { command: 'Agregar al carrito', description: 'Agregar producto actual/destacado' },
        { command: 'Agregar [producto]', description: 'Agregar producto específico por nombre' },
        { command: 'Eliminar [número]', description: 'Eliminar producto del carrito (ej: "eliminar 1")' },
        { command: 'Cambiar cantidad [número] a [cantidad]', description: 'Actualizar cantidad' },
        { command: 'Vaciar carrito', description: 'Eliminar todos los productos' },
        { command: 'Leer carrito', description: 'Escuchar productos en el carrito' },
        { command: 'Leer total / ¿Cuánto es?', description: 'Escuchar total a pagar' }
      ]
    },
    busqueda: {
      title: 'Búsqueda y Filtros',
      icon: '🔍',
      commands: [
        { command: 'Buscar [producto]', description: 'Buscar producto por nombre' },
        { command: 'Filtrar por [categoría]', description: 'Filtrar por categoría' },
        { command: 'Limpiar filtros / Quitar filtros', description: 'Remover todos los filtros' },
        { command: 'Mostrar todo', description: 'Ver todos los productos' }
      ]
    },
    lectura: {
      title: 'Lectura de Contenido',
      icon: '📖',
      commands: [
        { command: 'Leer productos', description: 'Escuchar primeros 5 productos' },
        { command: 'Leer página', description: 'Escuchar encabezados de la página' },
        { command: 'Leer esta sección', description: 'Leer sección actual' },
        { command: '¿Dónde estoy?', description: 'Describir página actual' },
        { command: 'Ayuda', description: 'Abrir esta ventana de ayuda' }
      ]
    },
    listas: {
      title: 'Navegación de Listas',
      icon: '📋',
      commands: [
        { command: 'Siguiente / Próximo', description: 'Siguiente producto en la lista' },
        { command: 'Anterior', description: 'Producto anterior' },
        { command: 'Primero', description: 'Primer producto' },
        { command: 'Último', description: 'Último producto' },
        { command: 'Seleccionar / Abrir', description: 'Abrir producto destacado' }
      ]
    },
    scroll: {
      title: 'Desplazamiento',
      icon: '⬆️',
      commands: [
        { command: 'Subir / Arriba', description: 'Desplazar 300px hacia arriba' },
        { command: 'Bajar / Abajo', description: 'Desplazar 300px hacia abajo' },
        { command: 'Ir arriba del todo', description: 'Ir al inicio de la página' },
        { command: 'Ir abajo del todo', description: 'Ir al final de la página' }
      ]
    },
    formularios: {
      title: 'Formularios',
      icon: '📝',
      commands: [
        { command: 'Llenar [campo] con [valor]', description: 'Rellenar campo de formulario' },
        { command: 'Enviar formulario / Enviar', description: 'Enviar formulario actual' }
      ]
    },
    modales: {
      title: 'Modales y Ventanas',
      icon: '🔲',
      commands: [
        { command: 'Cerrar / Cancelar', description: 'Cerrar modal o ventana actual' },
        { command: 'Abrir [nombre]', description: 'Abrir modal específico' }
      ]
    },
    sistema: {
      title: 'Sistema',
      icon: '⚙️',
      commands: [
        { command: 'Repetir / Repite', description: 'Repetir último mensaje de voz' },
        { command: 'Cerrar sesión / Salir', description: 'Cerrar sesión de usuario' },
        { command: 'Silencio / Callar', description: 'Detener voz del asistente' }
      ]
    }
  };

  /**
   * Comandos específicos por página
   */
  const contextualCommands = {
    home: {
      title: 'Comandos de Inicio',
      icon: '🏠',
      commands: [
        { command: 'Abrir Rappi', description: 'Abrir enlace de Rappi' },
        { command: 'Abrir WhatsApp', description: 'Contactar por WhatsApp' },
        { command: 'Ir a quiénes somos', description: 'Scroll a sección sobre nosotros' },
        { command: 'Ir a ubicación', description: 'Scroll a mapa de ubicación' }
      ]
    },
    test: {
      title: 'Comandos de Test',
      icon: '🧪',
      commands: [
        { command: 'Solicitar test / Hacer test', description: 'Iniciar test de preferencias' },
        { command: 'Ver resultado', description: 'Ver resultado del test' }
      ]
    }
  };

  /**
   * Obtener comandos a mostrar
   */
  const getCommandsToShow = () => {
    const currentPage = getCurrentPage();

    if (showContextualOnly && contextualCommands[currentPage]) {
      return {
        contextual: contextualCommands[currentPage],
        general: commandCategories
      };
    }

    return {
      contextual: contextualCommands[currentPage] || null,
      general: commandCategories
    };
  };

  /**
   * Filtrar comandos por búsqueda
   */
  const filterCommands = (commands) => {
    if (!searchQuery) return commands;

    const query = searchQuery.toLowerCase();
    return commands.filter(cmd =>
      cmd.command.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
    );
  };

  /**
   * Renderizar categoría de comandos
   */
  const renderCommandCategory = (categoryKey, category) => {
    const filteredCommands = filterCommands(category.commands);

    if (filteredCommands.length === 0) return null;

    if (selectedCategory !== 'all' && selectedCategory !== categoryKey) {
      return null;
    }

    return (
      <div key={categoryKey} className="command-category">
        <h3 className="category-title">
          <span className="category-icon">{category.icon}</span>
          {category.title}
        </h3>
        <div className="commands-grid">
          {filteredCommands.map((cmd, index) => (
            <div key={index} className="command-card">
              <div className="command-name">"{cmd.command}"</div>
              <div className="command-description">{cmd.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  const { contextual, general } = getCommandsToShow();
  const categories = Object.keys(general);

  return (
    <>
      {/* Overlay */}
      <div
        className="voice-help-overlay"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`voice-help-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        {/* Header */}
        <div className="help-header">
          <div className="header-content">
            <h2 id="help-title" className="help-title">
              📚 Comandos de Voz
            </h2>
            <p className="help-subtitle">
              Todos los comandos disponibles para controlar la aplicación con tu voz
            </p>
          </div>

          <button
            type="button"
            className="help-close-button"
            onClick={handleClose}
            aria-label="Cerrar ayuda"
          >
            <svg
              className="close-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="help-controls">
          {/* Búsqueda */}
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar comando..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {/* Filtros por categoría */}
          <div className="category-filters">
            <button
              type="button"
              className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </button>
            {categories.map(key => (
              <button
                key={key}
                type="button"
                className={`filter-button ${selectedCategory === key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(key)}
              >
                {general[key].icon} {general[key].title}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="help-content">
          {/* Comandos contextuales */}
          {contextual && (
            <div className="contextual-section">
              <div className="contextual-badge">Para esta página</div>
              {renderCommandCategory('contextual', contextual)}
            </div>
          )}

          {/* Comandos generales */}
          <div className="general-section">
            {categories.map(key => renderCommandCategory(key, general[key]))}
          </div>

          {/* Sin resultados */}
          {searchQuery && categories.every(key => filterCommands(general[key].commands).length === 0) && (
            <div className="no-results">
              <svg className="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No se encontraron comandos con "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="help-footer">
          <div className="footer-tip">
            💡 <strong>Tip:</strong> Presiona <kbd>Alt + V</kbd> para activar/desactivar el asistente
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Overlay */
        .voice-help-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 10003;
          animation: fadeIn 0.2s ease-out;
        }

        /* Modal */
        .voice-help-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10004;
          width: 90%;
          max-width: 900px;
          max-height: 85vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }

        /* Header */
        .help-header {
          padding: 24px 28px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .header-content {
          flex: 1;
        }

        .help-title {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px;
        }

        .help-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .help-close-button {
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
          flex-shrink: 0;
        }

        .help-close-button:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #111827;
        }

        .close-icon {
          width: 20px;
          height: 20px;
        }

        /* Controles */
        .help-controls {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: rgba(0, 0, 0, 0.01);
        }

        /* Búsqueda */
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          width: 20px;
          height: 20px;
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 44px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .search-clear:hover {
          background: rgba(0, 0, 0, 0.15);
        }

        /* Filtros */
        .category-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-button {
          padding: 8px 16px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          background: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #4b5563;
        }

        .filter-button:hover {
          border-color: rgba(0, 0, 0, 0.2);
          background: rgba(0, 0, 0, 0.02);
        }

        .filter-button.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        /* Contenido */
        .help-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px;
        }

        /* Sección contextual */
        .contextual-section {
          margin-bottom: 32px;
        }

        .contextual-badge {
          display: inline-block;
          padding: 6px 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        /* Categoría */
        .command-category {
          margin-bottom: 32px;
        }

        .command-category:last-child {
          margin-bottom: 0;
        }

        .category-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-icon {
          font-size: 20px;
        }

        /* Grid de comandos */
        .commands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .command-card {
          padding: 14px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 10px;
          transition: all 0.2s;
        }

        .command-card:hover {
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .command-name {
          font-weight: 600;
          color: #3b82f6;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .command-description {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        /* Sin resultados */
        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }

        .no-results-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          opacity: 0.5;
        }

        .no-results p {
          font-size: 16px;
          margin: 0;
        }

        /* Footer */
        .help-footer {
          padding: 16px 28px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(0, 0, 0, 0.01);
        }

        .footer-tip {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        kbd {
          padding: 4px 8px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
          color: #374151;
        }

        /* Animaciones */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        /* Responsive */
        @media (max-width: 768px) {
          .voice-help-modal {
            width: 95%;
            max-height: 90vh;
          }

          .help-header,
          .help-controls,
          .help-content,
          .help-footer {
            padding-left: 20px;
            padding-right: 20px;
          }

          .commands-grid {
            grid-template-columns: 1fr;
          }

          .category-filters {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 4px;
          }

          .filter-button {
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .help-title {
            font-size: 22px;
          }

          .help-subtitle {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

VoiceHelp.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  showContextualOnly: PropTypes.bool,
  className: PropTypes.string
};

export default VoiceHelp;
