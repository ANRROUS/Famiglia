import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatePreferencesTest = async (userPrompt = '') => {
  try {
    // Usar gemini-2.5-flash para generación de tests (velocidad + calidad)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Eres un asistente que ayuda a crear tests de preferencias para una panadería.
Genera un test de 5 preguntas para entender las preferencias del cliente en productos de panadería.

${userPrompt ? `El cliente mencionó: "${userPrompt}"\nToma esto en cuenta al generar las preguntas.` : ''}

Las preguntas deben cubrir:
1. Preferencias de sabor (dulce, salado, agridulce)
2. Preferencias de textura (crujiente, suave, cremoso)
3. Ingredientes favoritos (chocolate, frutas, nueces, crema, queso)
4. Ocasión de consumo (desayuno, postre, merienda, snack)
5. Nivel de dulzura preferido

Cada pregunta debe tener exactamente 4 opciones de respuesta.

Responde ÚNICAMENTE con un JSON válido en este formato exacto (sin markdown, sin código, solo JSON):
{
  "questions": [
    {
      "question": "Texto de la pregunta",
      "options": [
        {
          "label": "Opción breve",
          "value": "valor_unico",
          "description": "Descripción detallada de la opción"
        }
      ]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const parsedResponse = JSON.parse(cleanedResponse);

    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      testId,
      questions: parsedResponse.questions
    };
  } catch (error) {
    console.error('Error generating preferences test:', error);
    throw new Error('Error al generar el test de preferencias: ' + error.message);
  }
};

export const getProductRecommendation = async (testData, products) => {
  try {
    // Usar gemini-2.5-pro para recomendaciones (razonamiento avanzado necesario)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    console.log('[Gemini Service] 🧠 Usando gemini-2.5-pro para recomendación de productos');

    const { userPrompt, questions, answers } = testData;

    const answersContext = questions.map((q, index) => {
      const selectedAnswer = answers[index];
      const selectedOption = q.options.find(opt => opt.value === selectedAnswer);
      return `
Pregunta ${index + 1}: ${q.question}
Respuesta: ${selectedOption ? selectedOption.label : 'No respondida'}
${selectedOption ? `Descripción: ${selectedOption.description}` : ''}`;
    }).join('\n');

    const productsInfo = products.map(p => ({
      id: p.id_producto.toString(),
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: parseFloat(p.precio),
      categoria: p.categoria?.nombre || 'Sin categoría'
    }));

    const prompt = `
Eres un experto en recomendaciones de productos de panadería.

${userPrompt ? `Preferencias iniciales del cliente: "${userPrompt}"` : ''}

Respuestas del test de preferencias:
${answersContext}

Lista de productos disponibles:
${JSON.stringify(productsInfo, null, 2)}

Basándote en las respuestas del cliente, selecciona EL PRODUCTO MÁS ADECUADO de la lista.
Considera las preferencias de sabor, textura, ingredientes y ocasión de consumo.

Responde ÚNICAMENTE con un JSON válido en este formato exacto (sin markdown, sin código, solo JSON):
{
  "productId": "ID del producto seleccionado",
  "explanation": "Explicación detallada de por qué este producto es perfecto para el cliente (2-3 oraciones)",
  "message": "Mensaje personalizado para el cliente (1 oración)"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const parsedResponse = JSON.parse(cleanedResponse);

    const recommendedProduct = products.find(
      p => p.id_producto.toString() === parsedResponse.productId
    );

    if (!recommendedProduct) {
      throw new Error('Producto recomendado no encontrado en la base de datos');
    }

    const formattedProduct = {
      id_producto: recommendedProduct.id_producto.toString(),
      nombre: recommendedProduct.nombre,
      descripcion: recommendedProduct.descripcion,
      precio: parseFloat(recommendedProduct.precio),
      url_imagen: recommendedProduct.url_imagen,
      stock: recommendedProduct.stock,
      id_categoria: recommendedProduct.id_categoria.toString()
    };

    return {
      product: formattedProduct,
      explanation: parsedResponse.explanation,
      message: parsedResponse.message
    };
  } catch (error) {
    console.error('Error getting product recommendation:', error);
    throw new Error('Error al obtener la recomendación: ' + error.message);
  }
};
