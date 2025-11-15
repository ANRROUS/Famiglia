import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Genera una respuesta final basada en los resultados de ejecución MCP
 * Esto permite que el asistente "vea" lo que encontró y responda con datos reales
 * 
 * @param {string} userCommand - Comando original del usuario
 * @param {Object} executionResult - Resultados de ejecutar el plan MCP
 * @param {string} initialFeedback - Feedback inicial generado por Gemini
 * @returns {Promise<string>} Respuesta final para el usuario
 */
export async function generateFinalResponse(userCommand, executionResult, initialFeedback) {
  // Si no hay resultados o falló todo, usar el feedback inicial
  if (!executionResult || !executionResult.results || executionResult.results.length === 0) {
    return initialFeedback;
  }

  // Si todos los steps fallaron, usar feedback inicial
  if (executionResult.stepsFailed === executionResult.totalSteps) {
    return initialFeedback;
  }

  // Buscar resultados de tools que devuelvan datos informativos
  const informativeResults = extractInformativeData(executionResult.results);

  // Si no hay datos informativos, usar feedback inicial
  if (informativeResults.length === 0) {
    return initialFeedback;
  }

  // Si el feedback inicial no es genérico (no contiene "momento", "espera", "un segundo"),
  // significa que Gemini ya generó una respuesta específica, mantenerla
  const genericPhrases = ['momento', 'espera', 'un segundo', 'enseguida', 'ahora'];
  const isGenericFeedback = genericPhrases.some(phrase => 
    initialFeedback.toLowerCase().includes(phrase)
  );

  if (!isGenericFeedback) {
    return initialFeedback;
  }

  // GENERAR RESPUESTA FINAL CON LOS DATOS REALES
  console.log('[Response Generator] 🎯 Generando respuesta final con datos reales...');

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      }
    });

    const prompt = `Eres un asistente de voz para una aplicación de e-commerce llamada Famiglia.

El usuario te pidió: "${userCommand}"

Has ejecutado acciones en la aplicación y obtuviste estos datos:

${formatInformativeResults(informativeResults)}

INSTRUCCIONES:
1. Responde DE FORMA NATURAL y CONVERSACIONAL en español
2. Incluye los datos específicos que encontraste (nombres de productos, precios, etc.)
3. NO uses frases genéricas como "en un momento" o "espera"
4. Sé directo y conciso (máximo 2-3 oraciones)
5. Si el usuario preguntó por "el segundo", "los primeros cinco", etc., menciona ESE NÚMERO específico
6. NO inventes datos, usa SOLO lo que está en los resultados

Ejemplos de buenas respuestas:
- "Los primeros cinco panes que encuentro son: Pan Francés, Pan Integral, Pan de Molde, Baguette y Ciabatta."
- "El segundo producto que aparece es Maracuyá a S/ 3.50."
- "He filtrado por pan y estos son los resultados: Pan Francés, Pan Integral y Pan de Molde."

Genera tu respuesta:`;

    const result = await model.generateContent(prompt);
    const finalResponse = result.response.text().trim();

    console.log(`[Response Generator] ✅ Respuesta generada: "${finalResponse.substring(0, 80)}..."`);

    return finalResponse;

  } catch (error) {
    console.error('[Response Generator] ❌ Error generando respuesta:', error);
    // Fallback al feedback inicial
    return initialFeedback;
  }
}

/**
 * Extrae datos informativos de los resultados de ejecución
 * @param {Array} results - Array de resultados de steps
 * @returns {Array} Array de objetos con datos informativos
 */
function extractInformativeData(results) {
  const informative = [];

  for (const stepResult of results) {
    const { tool, result } = stepResult;

    if (!result || !result.success) {
      continue;
    }

    // Tools que devuelven datos valiosos
    switch (tool) {
      case 'getProducts':
        if (result.data && Array.isArray(result.data)) {
          informative.push({
            type: 'products',
            tool: 'getProducts',
            data: result.data,
            count: result.data.length
          });
        }
        break;

      case 'getText':
        if (result.data && result.data.text) {
          informative.push({
            type: 'text',
            tool: 'getText',
            data: result.data.text
          });
        }
        break;

      case 'getCartItems':
        if (result.data && Array.isArray(result.data)) {
          informative.push({
            type: 'cartItems',
            tool: 'getCartItems',
            data: result.data,
            count: result.data.length
          });
        }
        break;

      case 'getElement':
        if (result.data) {
          informative.push({
            type: 'element',
            tool: 'getElement',
            data: result.data
          });
        }
        break;

      case 'snapshot':
        if (result.data && result.data.summary) {
          informative.push({
            type: 'snapshot',
            tool: 'snapshot',
            data: result.data.summary
          });
        }
        break;
    }
  }

  return informative;
}

/**
 * Formatea los resultados informativos para el prompt
 * @param {Array} informativeResults - Resultados informativos
 * @returns {string} Texto formateado
 */
function formatInformativeResults(informativeResults) {
  const formatted = informativeResults.map(item => {
    switch (item.type) {
      case 'products':
        const productList = item.data
          .map((p, idx) => `${idx + 1}. ${p.name}${p.price ? ` - ${p.price}` : ''}`)
          .join('\n');
        return `PRODUCTOS ENCONTRADOS (${item.count}):\n${productList}`;

      case 'cartItems':
        const cartList = item.data
          .map((item, idx) => `${idx + 1}. ${item.name} x${item.quantity}${item.price ? ` - ${item.price}` : ''}`)
          .join('\n');
        return `ITEMS EN CARRITO (${item.count}):\n${cartList}`;

      case 'text':
        return `TEXTO ENCONTRADO:\n${item.data}`;

      case 'element':
        return `ELEMENTO ENCONTRADO:\n${JSON.stringify(item.data, null, 2)}`;

      case 'snapshot':
        return `RESUMEN DE PÁGINA:\n${item.data}`;

      default:
        return `DATOS:\n${JSON.stringify(item.data, null, 2)}`;
    }
  });

  return formatted.join('\n\n');
}
