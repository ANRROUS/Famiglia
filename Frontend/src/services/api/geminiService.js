import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const geminiService = {
  /**
   * Llamada al back para generar el test
   * @param {string} userPrompt - Prompt del usuario para personalizar el test
   * @returns {Promise<Object>}
   */
  generatePreferencesTest: async (userPrompt = '') => {
    try {
      const response = await axios.post(`${API_URL}/api/preferences/generate-test`, {
        userPrompt
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al generar el test');
      }
    } catch (error) {
      console.error('Error generando test de preferencias:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al generar el test. Por favor, intenta de nuevo.');
    }
  },

  /**
   * Envía las respuestas del test y obtiene recomendación de producto del backend
   * @param {Object} testData - Datos del test y respuestas del usuario
   * @returns {Promise<Object>} Recomendación de producto
   */
  getProductRecommendation: async (testData) => {
    try {
      const { userPrompt, questions, answers } = testData;

      const response = await axios.post(`${API_URL}/api/preferences/recommendation`, {
        userPrompt,
        questions,
        answers
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al obtener la recomendación');
      }
    } catch (error) {
      console.error('Error obteniendo recomendación:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener la recomendación. Por favor, intenta de nuevo.');
    }
  }
};

export default geminiService;
