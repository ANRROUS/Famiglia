import { useEffect } from 'react';

/**
 * Hook para manejar atajos de teclado
 * @param {string} key - Tecla principal (ej: 'v', 'k', 'Enter')
 * @param {Function} callback - Función a ejecutar cuando se presione el atajo
 * @param {Object} options - Opciones del atajo
 * @param {boolean} options.ctrl - Requiere Ctrl
 * @param {boolean} options.shift - Requiere Shift
 * @param {boolean} options.alt - Requiere Alt
 * @param {boolean} options.meta - Requiere Meta (Cmd en Mac)
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Verificar si la tecla coincide
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      // Verificar modificadores
      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;

      // Si todo coincide, ejecutar callback
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        event.stopPropagation();
        callback(event);
      }
    };

    // Agregar listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, ctrl, shift, alt, meta]);
}

export default useKeyboardShortcut;
