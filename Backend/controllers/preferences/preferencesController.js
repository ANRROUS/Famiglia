import prisma from '../../prismaClient.js';
import { generatePreferencesTest, getProductRecommendation } from '../../services/geminiService.js';

export const generateTest = async (req, res) => {
  try {
    const { userPrompt } = req.body;

    const testData = await generatePreferencesTest(userPrompt || '');

    res.json({
      success: true,
      data: testData
    });
  } catch (error) {
    console.error('Error en generateTest:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el test de preferencias',
      message: error.message
    });
  }
};

export const getRecommendation = async (req, res) => {
  try {
    const { userPrompt, questions, answers } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren las preguntas del test'
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Se requieren las respuestas del test'
      });
    }

    const products = await prisma.producto.findMany({
      include: {
        categoria: true
      }
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No hay productos disponibles en la base de datos'
      });
    }

    const recommendation = await getProductRecommendation(
      { userPrompt, questions, answers },
      products
    );

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error en getRecommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la recomendación',
      message: error.message
    });
  }
};
