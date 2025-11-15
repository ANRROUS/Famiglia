/**
 * Servicio de caché para respuestas de Gemini
 * Reduce latencia y carga en comandos frecuentes
 */

class GeminiCacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutos en ms
    
    // Limpiar cache cada minuto
    setInterval(() => this.cleanExpired(), 60 * 1000);
  }

  /**
   * Normaliza un comando para usarlo como key de cache
   * @param {string} transcript - Comando de voz original
   * @param {string} screenshot - Screenshot base64 (opcional)
   * @returns {string} - Key normalizada
   */
  normalizeKey(transcript, screenshot = null) {
    // Normalizar el transcript: lowercase, trim, quitar espacios extra
    const normalizedTranscript = transcript
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[¿?¡!,.\-]/g, ''); // Quitar puntuación

    // Si hay screenshot, incluir hash simplificado (primeros 20 chars del base64)
    // Para comandos que dependen de la UI, no usar cache si hay screenshot
    if (screenshot) {
      const screenshotHash = screenshot.substring(0, 20);
      return `${normalizedTranscript}:${screenshotHash}`;
    }

    return normalizedTranscript;
  }

  /**
   * Obtiene una respuesta cacheada si existe y no ha expirado
   * @param {string} key - Key de cache normalizada
   * @returns {object|null} - Respuesta cacheada o null
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si expiró
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      console.log(`[Gemini Cache] ⏰ Cache expirado para: ${key.substring(0, 50)}...`);
      return null;
    }

    console.log(`[Gemini Cache] ✓ Cache hit: ${key.substring(0, 50)}...`);
    return entry.data;
  }

  /**
   * Guarda una respuesta en cache
   * @param {string} key - Key de cache normalizada
   * @param {object} data - Datos a cachear
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`[Gemini Cache] ✓ Cacheado: ${key.substring(0, 50)}... (${this.cache.size} entradas)`);
  }

  /**
   * Limpia entradas expiradas del cache
   */
  cleanExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Gemini Cache] 🧹 Limpieza: ${cleaned} entradas expiradas eliminadas (${this.cache.size} restantes)`);
    }
  }

  /**
   * Limpia todo el cache
   */
  clear() {
    this.cache.clear();
    console.log('[Gemini Cache] 🗑️ Cache limpiado completamente');
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {object} - Estadísticas
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
      entries: Array.from(this.cache.keys()).map(key => ({
        key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
        age: Date.now() - this.cache.get(key).timestamp
      }))
    };
  }
}

// Singleton
const geminiCache = new GeminiCacheService();

export default geminiCache;
