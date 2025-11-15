/**
 * Cliente API para el sistema de navegación por voz
 * Comunica el frontend con el backend de voz
 */

import domtoimage from 'dom-to-image';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Procesa un comando de voz enviándolo al backend
 * @param {string} transcript - Texto transcrito del comando de voz
 * @param {Object} context - Contexto actual (URL, página, etc.)
 * @param {string|null} screenshot - Screenshot en base64 (opcional)
 * @returns {Promise<Object>} Respuesta del backend con plan ejecutado
 */
export async function processVoiceCommand(transcript, context = {}, screenshot = null) {
  try {
    // Enriquecer contexto con información del navegador
    const enrichedContext = {
      ...context,
      currentUrl: window.location.href,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };

    console.log('[Voice API] Enviando comando:', transcript);
    console.log('[Voice API] Contexto:', enrichedContext);

    const response = await fetch(`${API_BASE_URL}/api/voice/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluir cookies para autenticación
      body: JSON.stringify({
        transcript,
        context: enrichedContext,
        screenshot
      })
    });

    if (!response.ok) {
      console.error('[Voice API] Respuesta HTTP no OK:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error('[Voice API] Error data:', errorData);
      throw new Error(errorData.error || `Error con el servicio de IA. Intenta de nuevo.`);
    }

    const data = await response.json();

    console.log('[Voice API] Respuesta recibida exitosamente:', data);
    console.log('[Voice API] Success:', data.success);
    console.log('[Voice API] Data:', data.data);

    return data;

  } catch (error) {
    console.error('[Voice API] Error procesando comando:', error);
    throw error;
  }
}

/**
 * Obtiene el estado actual de la página para screenshot
 * @returns {Promise<string|null>} Screenshot en base64 o null si falla
 */
export async function captureScreenshot() {
  try {
    console.log('[Voice API] Capturando screenshot...');

    // Capturar con resolución muy reducida para evitar problemas
    const scale = 0.3; // Reducir a 30% del tamaño original (más agresivo)
    const width = window.innerWidth * scale;
    const height = window.innerHeight * scale;

    const dataUrl = await domtoimage.toPng(document.body, {
      quality: 0.3, // Calidad muy baja para reducir tamaño
      width: width,
      height: height,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`
      },
      filter: (node) => {
        // Filtrar elementos problemáticos
        if (node.tagName === 'SCRIPT') return false;
        if (node.tagName === 'STYLE') return false;
        if (node.tagName === 'LINK') return false;
        if (node.tagName === 'IMG') return false; // IMPORTANTE: Filtrar imágenes para evitar CORS
        if (node.classList?.contains('voice-avatar')) return false;
        if (node.classList?.contains('voice-feedback')) return false;
        return true;
      },
      // Cachebust para evitar problemas
      cacheBust: false,
      // Usar CORS anónimo
      useCORS: false,
    });

    // Calcular tamaño aproximado en KB
    const sizeInBytes = dataUrl.length * 0.75;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    console.log(`[Voice API] Screenshot capturado: ${Math.round(width)}x${Math.round(height)}px, ~${sizeInKB}KB`);

    // Si el screenshot es muy grande (>500KB), no enviarlo
    if (sizeInBytes > 500 * 1024) {
      console.warn(`[Voice API] Screenshot demasiado grande (${sizeInKB}KB), omitiendo`);
      return null;
    }

    return dataUrl;

  } catch (error) {
    console.warn('[Voice API] No se pudo capturar screenshot:', error.message);
    console.info('[Voice API] El sistema continuará usando solo análisis estructural (getPageElements)');

    // Retornar null - el sistema funcionará solo con getPageElements()
    return null;
  }
}

/**
 * Verifica si el sistema de voz está disponible
 * @returns {Object} Estado de disponibilidad
 */
export function checkVoiceAvailability() {
  const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const hasSpeechSynthesis = 'speechSynthesis' in window;

  return {
    voiceRecognition: hasWebSpeech,
    textToSpeech: hasSpeechSynthesis,
    isFullySupported: hasWebSpeech && hasSpeechSynthesis,
    browser: navigator.userAgent
  };
}

export default {
  processVoiceCommand,
  captureScreenshot,
  checkVoiceAvailability
};
