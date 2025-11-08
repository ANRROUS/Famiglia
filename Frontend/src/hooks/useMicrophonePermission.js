import { useState, useEffect } from 'react';

/**
 * Hook para validar y gestionar permisos de micrófono
 * @returns {Object} Estado de permisos y funciones de control
 */
export function useMicrophonePermission() {
  const [permissionState, setPermissionState] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Verifica el estado actual de los permisos de micrófono
   */
  const checkPermission = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Verificar si la API de permisos está disponible
      if (!navigator.permissions) {
        console.warn('[Microphone Permission] Permissions API no disponible, asumiendo prompt');
        setPermissionState('prompt');
        setIsChecking(false);
        return 'prompt';
      }

      // Consultar estado del permiso
      const result = await navigator.permissions.query({ name: 'microphone' });
      setPermissionState(result.state);

      // Escuchar cambios en el permiso
      result.addEventListener('change', () => {
        console.log('[Microphone Permission] Estado cambiado a:', result.state);
        setPermissionState(result.state);
      });

      setIsChecking(false);
      return result.state;
    } catch (err) {
      console.error('[Microphone Permission] Error verificando permisos:', err);
      setError(err.message);
      setIsChecking(false);
      
      // Si no se puede verificar, asumir que necesita prompt
      setPermissionState('prompt');
      return 'prompt';
    }
  };

  /**
   * Solicita permisos de micrófono al usuario
   */
  const requestPermission = async () => {
    setIsChecking(true);
    setError(null);

    try {
      console.log('[Microphone Permission] Solicitando acceso al micrófono...');

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Si se obtiene el stream, tenemos permiso
      console.log('[Microphone Permission] ✓ Permiso concedido');
      setPermissionState('granted');

      // Detener el stream inmediatamente (solo queremos verificar el permiso)
      stream.getTracks().forEach(track => track.stop());

      setIsChecking(false);
      return true;
    } catch (err) {
      console.error('[Microphone Permission] ✗ Permiso denegado o error:', err);

      // Distinguir entre negación explícita y otros errores
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setError('Permiso de micrófono denegado. Por favor, habilítalo en la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ningún micrófono en tu dispositivo.');
      } else {
        setError(`Error al acceder al micrófono: ${err.message}`);
      }

      setIsChecking(false);
      return false;
    }
  };

  /**
   * Verificar permisos al montar el componente
   */
  useEffect(() => {
    checkPermission();
  }, []);

  return {
    permissionState,
    isChecking,
    error,
    hasPermission: permissionState === 'granted',
    needsPermission: permissionState === 'prompt' || permissionState === 'denied',
    checkPermission,
    requestPermission
  };
}
