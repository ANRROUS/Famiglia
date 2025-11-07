/**
 * profileCommands.js
 * Comandos específicos para la página de Perfil de Cliente
 * - Ver información, historial de pedidos, historial de tests
 */

import { clickActions, scrollActions } from '../voiceActions.js';
import voiceReduxBridge from '../reduxIntegration.js';

/**
 * Ver información del perfil
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewProfileInfo = async (ttsService) => {
  try {
    console.log('[Profile Commands] Viewing profile info');

    // Obtener información del usuario desde Redux
    const userInfo = voiceReduxBridge.getUserInfo();

    if (userInfo) {
      const { name, email, phone, role } = userInfo;

      await ttsService?.speak('Información del perfil');
      await new Promise(resolve => setTimeout(resolve, 500));

      if (name) {
        await ttsService?.speak(`Nombre: ${name}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (email) {
        await ttsService?.speak(`Correo: ${email}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (phone) {
        await ttsService?.speak(`Teléfono: ${phone}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { success: true, action: 'view_profile_info', userInfo };
    }

    // Fallback: leer desde DOM
    const profileSection = document.querySelector('#profile-info, .profile-info, .user-info, [data-profile]');

    if (!profileSection) {
      await ttsService?.speak('No encontré información del perfil');
      return { success: false, error: 'Profile section not found' };
    }

    // Scroll a la sección
    profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Extraer datos del DOM
    const nameElement = profileSection.querySelector('.user-name, .name, [data-name]');
    const emailElement = profileSection.querySelector('.user-email, .email, [data-email]');
    const phoneElement = profileSection.querySelector('.user-phone, .phone, [data-phone]');

    await ttsService?.speak('Información del perfil');
    await new Promise(resolve => setTimeout(resolve, 500));

    if (nameElement) {
      await ttsService?.speak(`Nombre: ${nameElement.textContent.trim()}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (emailElement) {
      await ttsService?.speak(`Correo: ${emailElement.textContent.trim()}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (phoneElement) {
      await ttsService?.speak(`Teléfono: ${phoneElement.textContent.trim()}`);
    }

    return { success: true, action: 'view_profile_info' };

  } catch (error) {
    console.error('[Profile Commands] Error viewing profile:', error);
    await ttsService?.speak('No pude mostrar la información del perfil');
    return { success: false, error: error.message };
  }
};

/**
 * Ver historial de pedidos
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewOrderHistory = async (ttsService) => {
  try {
    console.log('[Profile Commands] Viewing order history');

    // Buscar botón o sección de historial
    const historyButton = clickActions.clickByAccessibleName('ver pedidos') ||
                         clickActions.clickByAccessibleName('historial de pedidos') ||
                         clickActions.clickByAccessibleName('mis pedidos');

    if (historyButton) {
      await ttsService?.speak('Mostrando historial de pedidos');
      return { success: true, action: 'view_order_history' };
    }

    // Buscar sección de historial
    const historySection = document.querySelector('#order-history, .order-history, .pedidos, [data-orders]');

    if (!historySection) {
      await ttsService?.speak('No encontré el historial de pedidos');
      return { success: false, error: 'Order history not found' };
    }

    // Scroll a la sección
    historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await ttsService?.speak('Historial de pedidos');

    return { success: true, action: 'view_order_history' };

  } catch (error) {
    console.error('[Profile Commands] Error viewing order history:', error);
    await ttsService?.speak('No pude mostrar el historial de pedidos');
    return { success: false, error: error.message };
  }
};

/**
 * Leer historial de pedidos
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readOrderHistory = async (ttsService) => {
  try {
    console.log('[Profile Commands] Reading order history');

    const historySection = document.querySelector('#order-history, .order-history, .pedidos, [data-orders]');

    if (!historySection) {
      await ttsService?.speak('No hay pedidos en tu historial');
      return { success: false, error: 'No orders found' };
    }

    // Buscar items de pedidos
    const orderItems = historySection.querySelectorAll('.order-item, .pedido, [data-order]');

    if (orderItems.length === 0) {
      await ttsService?.speak('No tienes pedidos anteriores');
      return { success: false, error: 'No order items' };
    }

    await ttsService?.speak(`Tienes ${orderItems.length} pedidos en tu historial`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Leer primeros 3 pedidos
    const limit = Math.min(orderItems.length, 3);
    for (let i = 0; i < limit; i++) {
      const order = orderItems[i];

      const dateElement = order.querySelector('.order-date, .date, .fecha');
      const totalElement = order.querySelector('.order-total, .total');
      const statusElement = order.querySelector('.order-status, .status, .estado');

      let message = `Pedido ${i + 1}`;

      if (dateElement) {
        message += `, ${dateElement.textContent.trim()}`;
      }

      if (totalElement) {
        message += `, total: ${totalElement.textContent.trim()}`;
      }

      if (statusElement) {
        message += `, estado: ${statusElement.textContent.trim()}`;
      }

      await ttsService?.speak(message);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (orderItems.length > 3) {
      await ttsService?.speak(`Y ${orderItems.length - 3} pedidos más`);
    }

    return { success: true, action: 'read_order_history', count: orderItems.length };

  } catch (error) {
    console.error('[Profile Commands] Error reading orders:', error);
    await ttsService?.speak('No pude leer el historial');
    return { success: false, error: error.message };
  }
};

/**
 * Ver historial de tests
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewTestHistory = async (ttsService) => {
  try {
    console.log('[Profile Commands] Viewing test history');

    // Buscar botón o sección de historial de tests
    const testHistoryButton = clickActions.clickByAccessibleName('ver tests') ||
                             clickActions.clickByAccessibleName('historial de tests') ||
                             clickActions.clickByAccessibleName('mis tests');

    if (testHistoryButton) {
      await ttsService?.speak('Mostrando historial de tests');
      return { success: true, action: 'view_test_history' };
    }

    // Buscar sección de tests
    const testSection = document.querySelector('#test-history, .test-history, .tests, [data-tests]');

    if (!testSection) {
      await ttsService?.speak('No encontré el historial de tests');
      return { success: false, error: 'Test history not found' };
    }

    // Scroll a la sección
    testSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await ttsService?.speak('Historial de tests');

    return { success: true, action: 'view_test_history' };

  } catch (error) {
    console.error('[Profile Commands] Error viewing test history:', error);
    await ttsService?.speak('No pude mostrar el historial de tests');
    return { success: false, error: error.message };
  }
};

/**
 * Leer historial de tests
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readTestHistory = async (ttsService) => {
  try {
    console.log('[Profile Commands] Reading test history');

    const testSection = document.querySelector('#test-history, .test-history, .tests, [data-tests]');

    if (!testSection) {
      await ttsService?.speak('No hay tests en tu historial');
      return { success: false, error: 'No tests found' };
    }

    const testItems = testSection.querySelectorAll('.test-item, .test, [data-test]');

    if (testItems.length === 0) {
      await ttsService?.speak('No has realizado tests anteriormente');
      return { success: false, error: 'No test items' };
    }

    await ttsService?.speak(`Has realizado ${testItems.length} tests`);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Leer primeros 3 tests
    const limit = Math.min(testItems.length, 3);
    for (let i = 0; i < limit; i++) {
      const test = testItems[i];

      const dateElement = test.querySelector('.test-date, .date, .fecha');
      const resultElement = test.querySelector('.test-result, .result, .resultado');

      let message = `Test ${i + 1}`;

      if (dateElement) {
        message += `, ${dateElement.textContent.trim()}`;
      }

      if (resultElement) {
        message += `, resultado: ${resultElement.textContent.trim()}`;
      }

      await ttsService?.speak(message);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (testItems.length > 3) {
      await ttsService?.speak(`Y ${testItems.length - 3} tests más`);
    }

    return { success: true, action: 'read_test_history', count: testItems.length };

  } catch (error) {
    console.error('[Profile Commands] Error reading test history:', error);
    await ttsService?.speak('No pude leer el historial de tests');
    return { success: false, error: error.message };
  }
};

export default {
  viewProfileInfo,
  viewOrderHistory,
  readOrderHistory,
  viewTestHistory,
  readTestHistory
};
