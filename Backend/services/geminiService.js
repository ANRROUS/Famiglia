import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatePreferencesTest = async (userPrompt = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

// Nuevas Funciones para los comandos de voz


/**
 * Interpretar comando de voz y extraer intención
 * @param {String} voiceText - Texto del comando de voz
 * @param {Object} context - Contexto actual (página, rol, estado del carrito, etc.)
 * @returns {Object} - { intent, params, confidence, language, response }
 */
export const interpretVoiceIntent = async (voiceText, context = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Mayor consistencia en la interpretación
      }
    });

    const { currentPage = 'home', userRole = 'visitante', cartItemsCount = 0, productCount = 0 } = context;

    const prompt = `
Eres un asistente inteligente de control por voz para una aplicación web de panadería llamada "Famiglia".
Tu trabajo es interpretar comandos de voz en español y extraer la intención del usuario.

COMANDO DEL USUARIO: "${voiceText}"

CONTEXTO ACTUAL:
- Página actual: ${currentPage}
- Rol del usuario: ${userRole}
- Items en carrito: ${cartItemsCount}
- Productos disponibles: ${productCount}

INTENCIONES DISPONIBLES:

**Navegación:**
- navigate_home: ir a inicio, ir a home, ir a página principal
- navigate_catalog: ir a carta, ver menú, ver productos, ir al menú
- navigate_cart: ir al carrito, ver carrito, mi carrito
- navigate_checkout: proceder al pago, ir al pago, finalizar compra
- navigate_profile: ir a mi perfil, ver perfil
- navigate_login: iniciar sesión, entrar, login
- navigate_register: registrarme, crear cuenta

**Búsqueda y Filtros:**
- search_product: buscar [producto], encontrar [producto]
- filter_category: filtrar por [categoría], mostrar [categoría]
- filter_price_max: filtrar precio menor a [número], máximo [número]
- filter_price_min: filtrar precio mayor a [número], mínimo [número]
- clear_filters: limpiar filtros, quitar filtros

**Carrito:**
- add_to_cart: agregar al carrito, añadir [cantidad]
- remove_from_cart: eliminar producto [número], quitar [número]
- update_quantity: modificar cantidad [número] a [cantidad], cambiar cantidad
- clear_cart: vaciar carrito, limpiar carrito
- checkout: proceder al pago, finalizar compra

**Lectura de Contenido:**
- read_products: leer productos, qué productos hay
- read_cart: leer carrito, qué hay en mi carrito, cuánto debo
- read_page: leer página, qué hay aquí
- read_price: cuánto cuesta, precio, cuánto vale
- read_total: cuál es el total, cuánto debo

**Navegación de Listas:**
- next_item: siguiente, siguiente producto
- previous_item: anterior, anterior producto
- first_item: primero, primer producto
- last_item: último, último producto
- select_item: seleccionar, abrir este, ver este

**Scroll:**
- scroll_up: subir, desplazar arriba
- scroll_down: bajar, desplazar abajo
- scroll_top: ir arriba, inicio de página
- scroll_bottom: ir abajo, final de página

**Formularios:**
- fill_field: llenar [campo] con [valor], escribir [valor] en [campo]
- submit_form: enviar formulario, enviar, confirmar

**Modales:**
- open_modal: abrir [modal], mostrar [modal]
- close_modal: cerrar, cerrar ventana

**Sistema:**
- help: ayuda, qué puedo decir, comandos disponibles
- activate: activar asistente
- deactivate: desactivar asistente
- repeat: repetir, qué dijiste

**Específicos de Home:**
- rappi: abrir rappi, pedir por rappi
- whatsapp: abrir whatsapp, contactar por whatsapp
- about: quiénes somos, información
- location: ubicación, dónde están, cómo llegar
- terms: términos y condiciones
- privacy: políticas de privacidad

**Específicos de Test:**
- request_test: solicitar test, hacer test, nuevo test
- view_result: ver resultado, mi resultado

INSTRUCCIONES:
1. Detecta el idioma del comando (preferir es-MX)
2. Identifica la intención principal
3. Extrae parámetros relevantes (productos, cantidades, números, categorías)
4. Asigna un nivel de confianza (0.0 a 1.0)
5. Genera una respuesta corta y natural en español (máximo 2 oraciones)

Responde ÚNICAMENTE con un JSON válido en este formato exacto (sin markdown, sin código, solo JSON):
{
  "intent": "nombre_de_la_intencion",
  "params": {
    "producto": "nombre si aplica",
    "cantidad": 1,
    "numero": 0,
    "categoria": "",
    "valor": "",
    "campo": ""
  },
  "confidence": 0.95,
  "language": "es-MX",
  "response": "Respuesta natural y breve para confirmar la acción"
}

Si no puedes interpretar el comando, usa intent: "unknown" y confidence menor a 0.5.
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

    return {
      intent: parsedResponse.intent || 'unknown',
      params: parsedResponse.params || {},
      confidence: parsedResponse.confidence || 0.0,
      language: parsedResponse.language || 'es-MX',
      response: parsedResponse.response || 'No pude entender el comando'
    };
  } catch (error) {
    console.error('Error interpreting voice intent:', error);
    return {
      intent: 'error',
      params: {},
      confidence: 0.0,
      language: 'es-MX',
      response: 'Lo siento, hubo un error al procesar tu comando'
    };
  }
};

/**
 * Generar respuesta de voz natural
 * @param {String} intent - Intención detectada
 * @param {Object} result - Resultado de la acción ejecutada
 * @returns {String} - Respuesta natural en español
 */
export const generateVoiceResponse = async (intent, result = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
      }
    });

    const prompt = `
Eres un asistente de voz amigable y conciso para una panadería.
Genera una respuesta natural en español para confirmar la acción.

INTENCIÓN: ${intent}
RESULTADO: ${JSON.stringify(result)}

INSTRUCCIONES:
1. Máximo 2 oraciones
2. Tono amigable y profesional
3. Confirmar la acción de forma clara
4. En español de México (es-MX)

Responde ÚNICAMENTE con el texto de la respuesta (sin JSON, sin formato extra):
`;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text().trim();

    return responseText || 'Acción completada';
  } catch (error) {
    console.error('Error generating voice response:', error);
    return 'Acción completada';
  }
};
