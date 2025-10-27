/**
 * Servicio para manejar el test de preferencias en localStorage
 */

const STORAGE_KEY = 'preferences_test';

const preferencesStorage = {
  /**
   * Guarda el test actual en localStorage
   * @param {Object} testData - Datos del test
   */
  saveTest: (testData) => {
    try {
      const dataToSave = {
        ...testData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error guardando test en localStorage:', error);
    }
  },

  /**
   * Recupera el test actual de localStorage
   * @returns {Object|null} - Datos del test o null si no existe
   */
  getTest: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error recuperando test de localStorage:', error);
      return null;
    }
  },

  /**
   * Actualiza las respuestas del test
   * @param {number} questionIndex - Índice de la pregunta
   * @param {string} answer - Respuesta seleccionada
   */
  updateAnswer: (questionIndex, answer) => {
    try {
      const test = preferencesStorage.getTest();
      if (test) {
        if (!test.answers) {
          test.answers = {};
        }
        test.answers[questionIndex] = answer;
        test.currentQuestion = questionIndex;
        test.timestamp = new Date().toISOString();
        preferencesStorage.saveTest(test);
      }
    } catch (error) {
      console.error('Error actualizando respuesta:', error);
    }
  },

  /**
   * Verifica si hay un test en progreso
   * @returns {boolean} - True si hay un test activo
   */
  hasActiveTest: () => {
    const test = preferencesStorage.getTest();
    return test !== null && !test.completed;
  },

  /**
   * Elimina el test actual de localStorage
   */
  clearTest: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error eliminando test de localStorage:', error);
    }
  },

  /**
   * Marca el test como completado
   */
  markTestAsCompleted: () => {
    try {
      const test = preferencesStorage.getTest();
      if (test) {
        test.completed = true;
        test.completedAt = new Date().toISOString();
        preferencesStorage.saveTest(test);
      }
    } catch (error) {
      console.error('Error marcando test como completado:', error);
    }
  },

  /**
   * Obtiene el progreso del test
   * @returns {Object} - Información del progreso
   */
  getProgress: () => {
    const test = preferencesStorage.getTest();
    if (!test || !test.questions) {
      return { total: 0, answered: 0, percentage: 0 };
    }

    const total = test.questions.length;
    const answered = Object.keys(test.answers || {}).length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { total, answered, percentage };
  }
};

export default preferencesStorage;
