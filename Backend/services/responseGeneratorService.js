import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { VOICE_CONTEXT, formatPrice, formatPriceForVoice, convertCurrencyToVoice, isCarrotalQuery, generateProductListResponse, isBusinessReference, getBusinessInfo } from '../context/voiceContext.js';

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
  
  console.log(`[Response Generator] 📊 Datos informativos encontrados: ${informativeResults.length}`);
  informativeResults.forEach((result, idx) => {
    console.log(`[Response Generator] Dato ${idx + 1}: ${result.type} (${result.tool}) - ${result.count || 'N/A'} elementos`);
  });

  // Si no hay datos informativos, usar feedback inicial
  if (informativeResults.length === 0) {
    console.log('[Response Generator] ❌ No hay datos informativos, usando feedback inicial');
    return initialFeedback;
  }

  // Si el feedback inicial no es genérico, significa que Gemini ya generó una respuesta específica, mantenerla
  // PERO si contiene frases que indican que va a mostrar datos, entonces SÍ generar respuesta con datos reales
  const genericPhrases = ['momento', 'espera', 'un segundo', 'enseguida', 'ahora', 'te mostraré', 'te muestro', 'aquí tienes', 'estos son', 'te diré', 'te digo', 'son los siguientes', 'aparecen', 'disponibles'];
  const isGenericFeedback = genericPhrases.some(phrase => 
    initialFeedback.toLowerCase().includes(phrase)
  );

  console.log(`[Response Generator] 🔍 Feedback inicial: "${initialFeedback}"`);
  console.log(`[Response Generator] 🔍 Es genérico: ${isGenericFeedback}`);

  // Si no es genérico PERO tenemos datos de productos y el feedback no menciona nombres específicos de productos,
  // entonces SÍ deberíamos generar la respuesta con datos reales
  if (!isGenericFeedback) {
    const hasProductData = informativeResults.some(result => result.type === 'products');
    const mentionsSpecificProducts = /torta|pan|galleta|empanada|jugo|maracuyá|croissant|cheesecake|flan/i.test(initialFeedback);
    
    if (hasProductData && !mentionsSpecificProducts) {
      console.log('[Response Generator] 🔄 Feedback no genérico PERO tiene datos de productos sin nombres específicos, generando respuesta con datos...');
    } else {
      console.log('[Response Generator] ❌ Feedback no es genérico, usando el inicial');
      return initialFeedback;
    }
  }

  // Detectar si es una consulta específica sobre total
  const isCarrotalQuerySpecific = isCarrotalQuery(userCommand);
  console.log(`[Response Generator] 🎯 ¿Es consulta específica de total?: ${isCarrotalQuerySpecific}`);

  // GENERAR RESPUESTA FINAL CON LOS DATOS REALES
  console.log('[Response Generator] 🎯 Generando respuesta final con datos reales...');
  console.log('[Response Generator] 📋 Datos formateados:', formatInformativeResults(informativeResults));

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1000, // Aumentado para respuestas más largas
      }
    });

    const prompt = `Eres un asistente de voz para ${VOICE_CONTEXT.business.fullName}, una panadería artesanal peruana.

CONTEXTO DEL NEGOCIO:
- Nombre: ${VOICE_CONTEXT.business.name}
- Descripción: ${VOICE_CONTEXT.business.description}
- Moneda: ${VOICE_CONTEXT.currency.name} (${VOICE_CONTEXT.currency.symbol})
- Cuando el usuario mencione "familia" se refiere al negocio "Famiglia"

El usuario te pidió: "${userCommand}"
${isCarrotalQuerySpecific ? '\n⚠️  CONSULTA ESPECÍFICA DE TOTAL: El usuario pregunta SOLO por el total del carrito, NO por todos los productos detallados.' : ''}

Has ejecutado acciones en la aplicación y obtuviste estos datos:

${formatInformativeResults(informativeResults)}

INSTRUCCIONES:
1. Responde DE FORMA NATURAL y CONVERSACIONAL en español peruano
2. MENCIONA TODOS LOS PRODUCTOS que encontraste (nombres completos y precios en soles)
3. USA EL FORMATO DE MONEDA: ${VOICE_CONTEXT.currency.symbol} para todos los precios
4. NO uses frases genéricas como "en un momento" o "espera"
5. Si el usuario preguntó por "los primeros tres", "los cinco", etc., menciona TODOS esos productos específicos
6. NO inventes datos, usa SOLO lo que está en los resultados
7. Si mencionan "familia", entiende que se refieren a "Famiglia" (el negocio)
8. COMPLETA LA RESPUESTA: no cortes las oraciones a la mitad

PARA CARRITO DE COMPRAS:
- Si el carrito está vacío, responde de forma amigable que no hay productos
${isCarrotalQuerySpecific ? 
'- ⚠️  CONSULTA DE TOTAL ÚNICAMENTE: El usuario pregunta solo por el total. Responde SOLO con el total general, ID de compra y tipo de envío. NO menciones todos los productos.' :
'- Si hay productos: menciona cada uno con cantidad, precio individual y total parcial'}
- Incluye el total general del carrito cuando hay productos
- Si hay información de envío o ID de compra, menciónala
- Si preguntan por el total y está vacío, indica que no hay productos para sumar
- FORMATO DE MONEDA: Reemplaza 'S/' por 'soles' en las respuestas (ej: '42.50 soles' en lugar de 'S/ 42.50')

Ejemplos de buenas respuestas:
- "Los primeros cinco productos de Famiglia son: Pan Francés a S/ 3.50, Croissant a S/ 4.20, Empanada de Pollo a S/ 5.80, Torta de Chocolate a S/ 12.00 y Galletas de Avena a S/ 2.50."
- "El segundo producto que tenemos es Maracuyá a S/ 3.50."
- "En Famiglia tenemos estos panes: Pan Francés a S/ 3.50, Pan Integral a S/ 4.00 y Pan de Molde a S/ 3.80."

Para el carrito:
- "Tienes 3 productos en tu carrito: Torta de chocolate 1 unidad a 42.00 soles cada una, total 42.00 soles; Baguette dulce navideño 1 unidad a 4.00 soles cada una, total 4.00 soles; y Empanada de carne 1 unidad a 3.50 soles cada una, total 3.50 soles. El total de tu carrito es 49.50 soles."
- "El total de tu carrito en Famiglia es 52.80 soles, con recojo en tienda." (cuando preguntan SOLO por el total)
- "Tu carrito está vacío. No tienes productos agregados aún. ¿Te gustaría ver nuestros productos disponibles?"
- "Actualmente no tienes productos en tu carrito de Famiglia. Puedes explorar nuestra carta para agregar deliciosos productos."

Genera tu respuesta:`;

    const result = await model.generateContent(prompt);
    let finalResponse = result.response.text().trim();
    
    console.log(`[Response Generator] 🔍 Respuesta original de Gemini: "${finalResponse.substring(0, 100)}..."`);
    
    // Convertir S/ a formato de voz con 'soles'
    const originalResponse = finalResponse;
    finalResponse = convertCurrencyToVoice(finalResponse);
    
    console.log(`[Response Generator] 🔄 Después de convertCurrencyToVoice: "${finalResponse.substring(0, 100)}..."`);
    
    if (!finalResponse || finalResponse.trim() === '') {
      console.error('[Response Generator] ⚠️ Respuesta vacía después de conversión, usando original');
      finalResponse = originalResponse;
    }

    console.log(`[Response Generator] ✅ Respuesta final: "${finalResponse.substring(0, 80)}..."`);

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

      case 'getProductsData':
        if (result.products && Array.isArray(result.products)) {
          informative.push({
            type: 'products',
            tool: 'getProductsData',
            data: result.products,
            count: result.products.length
          });
        }
        break;

      case 'searchProducts':
        if (result.products && Array.isArray(result.products)) {
          informative.push({
            type: 'products',
            tool: 'searchProducts',
            data: result.products,
            count: result.products.length
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

      case 'getCartState':
        // Siempre agregar información del carrito, incluso si está vacío
        informative.push({
          type: 'cartItems',
          tool: 'getCartState',
          data: result.items || [],
          count: result.items ? result.items.length : 0,
          total: result.total || 0,
          purchaseInfo: result.purchaseInfo,
          continueButtons: result.continueButtons,
          isEmpty: result.isEmpty || (result.items && result.items.length === 0)
        });
        break;

      case 'debugCartDOM':
        if (result.analysis) {
          informative.push({
            type: 'debug',
            tool: 'debugCartDOM',
            data: result.analysis
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
          .map((p, idx) => {
            // Soporte para ambos formatos: getProducts (name/price) y getProductsData (nombre/precio)
            const nombre = p.nombre || p.name || 'Producto';
            const precio = p.precio || p.price;
            const precioTexto = precio ? ` - ${formatPrice(precio)}` : '';
            return `${idx + 1}. ${nombre}${precioTexto}`;
          })
          .join('\n');
        return `PRODUCTOS ENCONTRADOS (${item.count}):\n${productList}`;

      case 'cartItems':
        // Manejar carrito vacío
        if (item.isEmpty || item.count === 0) {
          return `CARRITO VACÍO:\nNo tienes productos en tu carrito de compras.`;
        }
        
        const cartList = item.data
          .map((cartItem, idx) => {
            const name = cartItem.name || cartItem.nombre || 'Producto';
            const quantity = cartItem.quantity || cartItem.cantidad || 1;
            const price = cartItem.price || cartItem.precio || 0;
            const total = cartItem.total || (price * quantity);
            
            // Formato detallado: Nombre x Cantidad - Precio individual c/u - Total parcial
            const unitPriceText = price > 0 ? ` (${formatPrice(price)} c/u)` : '';
            return `${idx + 1}. ${name} x${quantity}${unitPriceText} = ${formatPrice(total)}`;
          })
          .join('\n');
        
        const totalText = item.total ? `\nTotal del carrito: ${formatPrice(item.total)}` : '';
        const summaryText = item.purchaseInfo ? `\nID de compra: ${item.purchaseInfo.id}\nEnvío: ${item.purchaseInfo.shipping}` : '';
        
        return `PRODUCTOS EN CARRITO (${item.count}):\n${cartList}${totalText}${summaryText}`;

      case 'text':
        return `TEXTO ENCONTRADO:\n${item.data}`;

      case 'element':
        return `ELEMENTO ENCONTRADO:\n${JSON.stringify(item.data, null, 2)}`;

      case 'debug':
        const debugData = item.data;
        let debugSummary = `ANÁLISIS COMPLETO DEL CARRITO:\n`;
        debugSummary += `URL: ${debugData.url}\n\n`;
        
        // Información del Redux Store
        if (debugData.reduxStore) {
          debugSummary += `REDUX STORE:\n`;
          debugSummary += `- Disponible: ${debugData.reduxStore.available}\n`;
          if (debugData.reduxStore.available) {
            debugSummary += `- Cart existe: ${debugData.reduxStore.cartExists}\n`;
            debugSummary += `- Items en cart: ${debugData.reduxStore.cartItemsCount}\n`;
            debugSummary += `- Total: S/${debugData.reduxStore.cartTotal}\n`;
            
            if (debugData.reduxStore.cartItems?.length > 0) {
              debugSummary += `\nPRODUCTOS EN REDUX:\n`;
              debugData.reduxStore.cartItems.forEach((item, idx) => {
                debugSummary += `${idx + 1}. ${item.name} - S/${item.price} x${item.quantity} = S/${item.subtotal}\n`;
              });
            }
          } else {
            debugSummary += `- Error: ${debugData.reduxStore.error || debugData.reduxStore.reason}\n`;
          }
          debugSummary += '\n';
        }
        
        // Información del DOM
        debugSummary += `ANÁLISIS DOM:\n`;
        debugSummary += `- Elementos grid: ${debugData.gridElements?.length || 0}\n`;
        debugSummary += `- Elementos con precios (S/): ${debugData.priceElements?.length || 0}\n`;
        debugSummary += `- Imágenes: ${debugData.imageSources?.length || 0}\n`;
        debugSummary += `- Posibles productos: ${debugData.productElements?.length || 0}\n\n`;
        
        // Mostrar elementos con precios del DOM
        if (debugData.priceElements?.length > 0) {
          debugSummary += `ELEMENTOS CON PRECIOS (DOM):\n`;
          debugData.priceElements.slice(0, 5).forEach((el, idx) => {
            debugSummary += `${idx + 1}. ${el.tag}: "${el.textContent?.substring(0, 50)}..."\n`;
          });
          debugSummary += '\n';
        }
        
        return debugSummary;

      case 'snapshot':
        return `RESUMEN DE PÁGINA:\n${item.data}`;

      default:
        return `DATOS:\n${JSON.stringify(item.data, null, 2)}`;
    }
  });

  return formatted.join('\n\n');
}
