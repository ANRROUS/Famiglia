/**
 * testCommands.js
 * Comandos específicos para la página de Test de Preferencias
 * - Solicitar test, ver resultado, agregar recomendado, reiniciar
 */

import { clickActions } from '../voiceActions.js';
import voiceReduxBridge from '../reduxIntegration.js';

/**
 * Solicitar nuevo test de preferencias
 * @param {Function} navigate - React Router navigate
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const requestNewTest = async (navigate, ttsService) => {
  try {
    console.log('[Test Commands] Requesting new test');

    // Buscar botón de solicitar/iniciar test
    const testButton = clickActions.clickByAccessibleName('solicitar test') ||
                      clickActions.clickByAccessibleName('iniciar test') ||
                      clickActions.clickByAccessibleName('hacer test') ||
                      clickActions.clickByAccessibleName('comenzar test') ||
                      clickActions.clickByAccessibleName('nuevo test') ||
                      document.querySelector('button[data-action="start-test"], button.start-test, button.test-button');

    if (testButton) {
      await ttsService?.speak('Iniciando test de preferencias');
      return { success: true, action: 'request_test' };
    }

    // Si no hay botón, intentar navegar a la página de test
    if (navigate) {
      navigate('/test');
      await ttsService?.speak('Ir al test de preferencias');
      return { success: true, action: 'navigate_test' };
    }

    await ttsService?.speak('No encontré el test de preferencias');
    return { success: false, error: 'Test button not found' };

  } catch (error) {
    console.error('[Test Commands] Error requesting test:', error);
    await ttsService?.speak('No pude iniciar el test');
    return { success: false, error: error.message };
  }
};

/**
 * Ver resultado del test
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewTestResult = async (ttsService) => {
  try {
    console.log('[Test Commands] Viewing test result');

    // Buscar botón de ver resultado
    const resultButton = clickActions.clickByAccessibleName('ver resultado') ||
                        clickActions.clickByAccessibleName('mi resultado') ||
                        clickActions.clickByAccessibleName('resultado del test') ||
                        clickActions.clickByAccessibleName('ver mi resultado') ||
                        document.querySelector('button[data-action="view-result"], button.view-result, button.result-button');

    if (resultButton) {
      await ttsService?.speak('Mostrando resultado del test');
      return { success: true, action: 'view_result' };
    }

    // Buscar sección de resultado visible
    const resultSection = document.querySelector('#test-result, .test-result, [data-test-result], section.result');

    if (resultSection) {
      // Scroll a la sección de resultado
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Intentar leer el resultado
      const resultText = resultSection.querySelector('h2, h3, .result-title, .result-text, p');
      if (resultText) {
        await ttsService?.speak(`Tu resultado: ${resultText.textContent.trim()}`);
      } else {
        await ttsService?.speak('Mostrando resultado del test');
      }

      return { success: true, action: 'view_result' };
    }

    await ttsService?.speak('No encontré resultados del test. Primero completa el test.');
    return { success: false, error: 'Result not found' };

  } catch (error) {
    console.error('[Test Commands] Error viewing result:', error);
    await ttsService?.speak('No pude mostrar el resultado');
    return { success: false, error: error.message };
  }
};

/**
 * Leer resultado del test en voz alta
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readTestResult = async (ttsService) => {
  try {
    console.log('[Test Commands] Reading test result');

    // Buscar sección de resultado
    const resultSection = document.querySelector('#test-result, .test-result, [data-test-result], section.result');

    if (!resultSection) {
      await ttsService?.speak('No hay resultado de test disponible');
      return { success: false, error: 'No result found' };
    }

    // Extraer información del resultado
    const title = resultSection.querySelector('h2, h3, .result-title')?.textContent.trim();
    const description = resultSection.querySelector('.result-description, .description, p')?.textContent.trim();
    const recommendations = Array.from(
      resultSection.querySelectorAll('.recommendation, .product-recommendation, li')
    ).map(el => el.textContent.trim());

    // Leer resultado
    if (title) {
      await ttsService?.speak(title);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (description && description.length < 300) {
      await ttsService?.speak(description);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (recommendations.length > 0) {
      await ttsService?.speak('Productos recomendados:');
      await new Promise(resolve => setTimeout(resolve, 500));

      for (let i = 0; i < Math.min(recommendations.length, 3); i++) {
        await ttsService?.speak(`${i + 1}. ${recommendations[i]}`);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    return {
      success: true,
      action: 'read_result',
      result: { title, description, recommendations }
    };

  } catch (error) {
    console.error('[Test Commands] Error reading result:', error);
    await ttsService?.speak('No pude leer el resultado');
    return { success: false, error: error.message };
  }
};

/**
 * Agregar producto recomendado al carrito
 * @param {Number} index - Índice del producto recomendado (1-based)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const addRecommendedToCart = async (index = 1, ttsService) => {
  try {
    console.log('[Test Commands] Adding recommended product to cart:', index);

    // Buscar productos recomendados
    const recommendedProducts = document.querySelectorAll(
      '.recommended-product, .product-recommendation, [data-recommended], .recommendation-card'
    );

    if (recommendedProducts.length === 0) {
      await ttsService?.speak('No hay productos recomendados disponibles');
      return { success: false, error: 'No recommended products found' };
    }

    // Validar índice
    const targetIndex = index - 1;
    if (targetIndex < 0 || targetIndex >= recommendedProducts.length) {
      await ttsService?.speak(`Solo hay ${recommendedProducts.length} productos recomendados`);
      return { success: false, error: 'Invalid index' };
    }

    const productElement = recommendedProducts[targetIndex];

    // Extraer nombre del producto
    const nameElement = productElement.querySelector('h2, h3, h4, .product-name, .name');
    const productName = nameElement ? nameElement.textContent.trim() : 'producto recomendado';

    // Buscar botón de agregar al carrito
    const addButton = productElement.querySelector(
      'button[aria-label*="agregar" i], button.add-to-cart, button.add-button, button[data-action="add"]'
    ) || productElement.querySelector('button');

    if (!addButton) {
      await ttsService?.speak('No encontré el botón de agregar');
      return { success: false, error: 'Add button not found' };
    }

    // Hacer click
    clickActions.simulateReactClick(addButton);
    await ttsService?.speak(`Agregado ${productName} al carrito`);

    return {
      success: true,
      action: 'add_recommended',
      product: productName,
      index
    };

  } catch (error) {
    console.error('[Test Commands] Error adding recommended:', error);
    await ttsService?.speak('No pude agregar el producto recomendado');
    return { success: false, error: error.message };
  }
};

/**
 * Reiniciar/Hacer nuevo test
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const restartTest = async (ttsService) => {
  try {
    console.log('[Test Commands] Restarting test');

    // Buscar botón de reiniciar/nuevo test
    const restartButton = clickActions.clickByAccessibleName('hacer nuevo test') ||
                         clickActions.clickByAccessibleName('nuevo test') ||
                         clickActions.clickByAccessibleName('reiniciar test') ||
                         clickActions.clickByAccessibleName('volver a empezar') ||
                         clickActions.clickByAccessibleName('repetir test') ||
                         document.querySelector('button[data-action="restart-test"], button.restart-test, button.new-test');

    if (restartButton) {
      await ttsService?.speak('Reiniciando test de preferencias');
      return { success: true, action: 'restart_test' };
    }

    // Si no hay botón de reinicio, intentar recargar la página
    const currentPath = window.location.pathname;
    if (currentPath.includes('test') || currentPath.includes('preferencias')) {
      window.location.reload();
      await ttsService?.speak('Reiniciando test');
      return { success: true, action: 'restart_test' };
    }

    await ttsService?.speak('No pude reiniciar el test');
    return { success: false, error: 'Restart button not found' };

  } catch (error) {
    console.error('[Test Commands] Error restarting test:', error);
    await ttsService?.speak('No pude reiniciar el test');
    return { success: false, error: error.message };
  }
};

/**
 * Responder pregunta del test
 * @param {Number} optionIndex - Índice de la opción (1-based)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const answerTestQuestion = async (optionIndex, ttsService) => {
  try {
    console.log('[Test Commands] Answering question, option:', optionIndex);

    if (!optionIndex || optionIndex < 1) {
      await ttsService?.speak('¿Qué opción quieres seleccionar?');
      return { success: false, error: 'Invalid option' };
    }

    // Buscar opciones de la pregunta actual
    const options = document.querySelectorAll(
      '.test-option, .question-option, input[type="radio"], button[data-option]'
    );

    if (options.length === 0) {
      await ttsService?.speak('No encontré opciones para responder');
      return { success: false, error: 'No options found' };
    }

    const targetIndex = optionIndex - 1;
    if (targetIndex >= options.length) {
      await ttsService?.speak(`Solo hay ${options.length} opciones`);
      return { success: false, error: 'Invalid index' };
    }

    const option = options[targetIndex];

    // Seleccionar opción
    if (option.tagName === 'INPUT') {
      option.checked = true;
      option.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      clickActions.simulateReactClick(option);
    }

    await ttsService?.speak(`Opción ${optionIndex} seleccionada`);

    // Buscar botón "siguiente" o "continuar"
    const nextButton = clickActions.clickByAccessibleName('siguiente') ||
                      clickActions.clickByAccessibleName('continuar') ||
                      document.querySelector('button[data-action="next"], button.next-button');

    if (nextButton) {
      // Pequeña pausa antes de continuar
      setTimeout(() => {
        clickActions.simulateReactClick(nextButton);
      }, 500);
    }

    return {
      success: true,
      action: 'answer_question',
      option: optionIndex
    };

  } catch (error) {
    console.error('[Test Commands] Error answering question:', error);
    await ttsService?.speak('No pude responder la pregunta');
    return { success: false, error: error.message };
  }
};

/**
 * Ir a la carta desde resultados del test
 * @param {Function} navigate - React Router navigate
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const goToCatalogFromTest = async (navigate, ttsService) => {
  try {
    console.log('[Test Commands] Going to catalog from test');

    if (navigate) {
      navigate('/carta');
      await ttsService?.speak('Ir a la carta');
      return { success: true, action: 'go_to_catalog' };
    }

    // Fallback: buscar botón
    const catalogButton = clickActions.clickByAccessibleName('ir a la carta') ||
                         clickActions.clickByAccessibleName('ver carta') ||
                         clickActions.clickByAccessibleName('ver productos');

    if (catalogButton) {
      await ttsService?.speak('Ir a la carta');
      return { success: true, action: 'go_to_catalog' };
    }

    await ttsService?.speak('No pude ir a la carta');
    return { success: false, error: 'Catalog navigation failed' };

  } catch (error) {
    console.error('[Test Commands] Error going to catalog:', error);
    await ttsService?.speak('No pude ir a la carta');
    return { success: false, error: error.message };
  }
};

export default {
  requestNewTest,
  viewTestResult,
  readTestResult,
  addRecommendedToCart,
  restartTest,
  answerTestQuestion,
  goToCatalogFromTest
};
