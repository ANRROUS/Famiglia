import { GoogleGenerativeAI } from '@google/generative-ai';

// Uso de Apikey
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const geminiService = {
  /**
   * @param {string} userPrompt - Solicitud del usuario (opcional)
   * @returns {Promise<Object>}
   */
  generatePreferencesTest: async (userPrompt = '') => {
    try {
      // Modificar prompt
      const systemPrompt = `
Eres un asistente experto en panadería y repostería. Tu tarea es generar un test de 5 preguntas 
para conocer las preferencias del cliente sobre postres y productos de panadería.

${userPrompt ? `El usuario indica: "${userPrompt}"` : ''}

Genera un test en formato JSON con la siguiente estructura:
{
  "questions": [
    {
      "question": "Texto de la pregunta",
      "options": [
        {
          "label": "Opción 1",
          "value": "opcion_1",
          "description": "Descripción breve (opcional)"
        }
      ]
    }
  ]
}

Las preguntas deben cubrir:
1. Tipo de sabores preferidos (dulce, salado, agridulce)
2. Texturas preferidas (crujiente, suave, cremoso)
3. Ingredientes favoritos (chocolate, frutas, nueces, crema)
4. Ocasión de consumo (desayuno, postre, merienda)
5. Nivel de dulzura preferido

Cada pregunta debe tener 4 opciones. IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
`;

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Limpiar el texto para obtener solo el JSON
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const testData = JSON.parse(text);
      
      // Generar ID único para el test
      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        testId,
        questions: testData.questions,
        message: 'Test generado exitosamente'
      };
      
    } catch (error) {
      console.error('Error generando test de preferencias:', error);
      throw new Error('Error al generar el test. Por favor, verifica tu API Key de Gemini.');
    }
  },

  /**
   * Envía las respuestas del test y obtiene recomendación de producto
   * @param {Object} testData - Datos del test y respuestas del usuario
   * @returns {Promise<Object>} Recomendación de producto
   */
  getProductRecommendation: async (testData) => {
    try {
      const { userPrompt, questions, answers } = testData;
      
      // Construir contexto de las respuestas
      let answersContext = '';
      questions.forEach((q, index) => {
        const answer = answers[index];
        const selectedOption = q.options.find(opt => opt.value === answer);
        answersContext += `\nPregunta ${index + 1}: ${q.question}\nRespuesta: ${selectedOption?.label}\n`;
      });
      
      // Prompt para obtener recomendación
      const recommendationPrompt = `
Eres un experto en panadería y repostería. Basado en las siguientes respuestas del cliente, 
recomienda UN producto específico de panadería o repostería.

${userPrompt ? `Preferencias iniciales del usuario: "${userPrompt}"` : ''}

Respuestas del test:
${answersContext}

Productos disponibles (ejemplos):
- Pan de Chocolate: Pan dulce con chocolate derretido
- Croissant de Mantequilla: Hojaldre crujiente y mantecoso
- Pastel de Tres Leches: Suave y cremoso
- Dona Glaseada: Dulce con glaseado de azúcar
- Pan de Queso: Salado y suave
- Tarta de Frutas: Dulce con frutas frescas
- Brownie de Chocolate: Denso y chocolatoso
- Galletas de Avena: Crujientes y ligeramente dulces

Genera una recomendación en formato JSON:
{
  "product": {
    "name": "Nombre del producto",
    "description": "Descripción breve",
    "price": 45.00,
    "image": "/images/productos/producto.jpg"
  },
  "explanation": "Explicación de por qué se recomienda este producto",
  "message": "Mensaje personalizado para el cliente"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
`;

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(recommendationPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Limpiar el texto para obtener solo el JSON
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const recommendation = JSON.parse(text);
      
      return recommendation;
      
    } catch (error) {
      console.error('Error obteniendo recomendación:', error);
      throw new Error('Error al obtener la recomendación. Por favor, intenta de nuevo.');
    }
  }
};

export default geminiService;
