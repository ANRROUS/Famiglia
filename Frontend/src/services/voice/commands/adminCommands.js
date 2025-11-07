/**
 * adminCommands.js
 * Comandos específicos para el panel de Administrador
 * - Ver productos, pedidos, búsqueda, filtros, cambiar estados
 */

import { clickActions, formActions } from '../voiceActions.js';

/**
 * Ver catálogo completo de productos (admin)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewAdminProducts = async (ttsService) => {
  try {
    console.log('[Admin Commands] Viewing admin products');

    // Buscar sección o botón de productos
    const productsButton = clickActions.clickByAccessibleName('ver productos') ||
                          clickActions.clickByAccessibleName('productos') ||
                          clickActions.clickByAccessibleName('catálogo');

    if (productsButton) {
      await ttsService?.speak('Mostrando productos');
      return { success: true, action: 'view_admin_products' };
    }

    const productsSection = document.querySelector('#admin-products, .admin-products, [data-products]');

    if (!productsSection) {
      await ttsService?.speak('No encontré la sección de productos');
      return { success: false, error: 'Products section not found' };
    }

    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await ttsService?.speak('Productos del catálogo');

    return { success: true, action: 'view_admin_products' };

  } catch (error) {
    console.error('[Admin Commands] Error viewing products:', error);
    await ttsService?.speak('No pude mostrar los productos');
    return { success: false, error: error.message };
  }
};

/**
 * Buscar producto en panel admin
 * @param {String} productName - Nombre del producto
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const searchAdminProduct = async (productName, ttsService) => {
  try {
    console.log('[Admin Commands] Searching product:', productName);

    if (!productName) {
      await ttsService?.speak('¿Qué producto quieres buscar?');
      return { success: false, error: 'No product name' };
    }

    const searchInput = document.querySelector(
      'input[type="search"], input[name*="search" i], input[placeholder*="buscar" i], input.search-input'
    );

    if (!searchInput) {
      await ttsService?.speak('No encontré el campo de búsqueda');
      return { success: false, error: 'Search input not found' };
    }

    formActions.fillInput(searchInput.name || 'buscar', productName);

    const searchButton = searchInput.closest('form')?.querySelector('button[type="submit"]');
    if (searchButton) {
      clickActions.simulateReactClick(searchButton);
    }

    await ttsService?.speak(`Buscando ${productName}`);
    return { success: true, action: 'search_admin_product', query: productName };

  } catch (error) {
    console.error('[Admin Commands] Error searching product:', error);
    await ttsService?.speak('No pude buscar el producto');
    return { success: false, error: error.message };
  }
};

/**
 * Filtrar por categoría en panel admin
 * @param {String} category - Categoría
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const filterAdminByCategory = async (category, ttsService) => {
  try {
    console.log('[Admin Commands] Filtering by category:', category);

    if (!category) {
      await ttsService?.speak('¿Por qué categoría quieres filtrar?');
      return { success: false, error: 'No category' };
    }

    // Buscar select de categoría
    const categorySelect = document.querySelector('select[name*="category" i], select[name*="categoria" i], select.category-filter');

    if (categorySelect) {
      const success = formActions.selectOption('categoría', category);
      if (success) {
        await ttsService?.speak(`Filtrando por ${category}`);
        return { success: true, action: 'filter_admin_category', category };
      }
    }

    // Buscar botón de categoría
    const categoryButton = clickActions.clickByAccessibleName(category);
    if (categoryButton) {
      await ttsService?.speak(`Filtrando por ${category}`);
      return { success: true, action: 'filter_admin_category', category };
    }

    await ttsService?.speak(`No encontré la categoría ${category}`);
    return { success: false, error: 'Category not found' };

  } catch (error) {
    console.error('[Admin Commands] Error filtering category:', error);
    await ttsService?.speak('No pude aplicar el filtro');
    return { success: false, error: error.message };
  }
};

/**
 * Ver pedidos entregados
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewDeliveredOrders = async (ttsService) => {
  try {
    console.log('[Admin Commands] Viewing delivered orders');

    const deliveredButton = clickActions.clickByAccessibleName('pedidos entregados') ||
                           clickActions.clickByAccessibleName('entregados') ||
                           clickActions.clickByAccessibleName('completados');

    if (deliveredButton) {
      await ttsService?.speak('Mostrando pedidos entregados');
      return { success: true, action: 'view_delivered_orders' };
    }

    // Buscar tab o filtro
    const deliveredTab = document.querySelector('[data-status="delivered"], [data-tab="delivered"], .tab-delivered');
    if (deliveredTab) {
      clickActions.simulateReactClick(deliveredTab);
      await ttsService?.speak('Pedidos entregados');
      return { success: true, action: 'view_delivered_orders' };
    }

    await ttsService?.speak('No encontré los pedidos entregados');
    return { success: false, error: 'Delivered orders not found' };

  } catch (error) {
    console.error('[Admin Commands] Error viewing delivered orders:', error);
    await ttsService?.speak('No pude mostrar los pedidos entregados');
    return { success: false, error: error.message };
  }
};

/**
 * Ver pedidos reservados (pendientes)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const viewReservedOrders = async (ttsService) => {
  try {
    console.log('[Admin Commands] Viewing reserved orders');

    const reservedButton = clickActions.clickByAccessibleName('pedidos reservados') ||
                          clickActions.clickByAccessibleName('reservados') ||
                          clickActions.clickByAccessibleName('pendientes');

    if (reservedButton) {
      await ttsService?.speak('Mostrando pedidos reservados');
      return { success: true, action: 'view_reserved_orders' };
    }

    // Buscar tab o filtro
    const reservedTab = document.querySelector('[data-status="reserved"], [data-status="pending"], [data-tab="reserved"], .tab-reserved');
    if (reservedTab) {
      clickActions.simulateReactClick(reservedTab);
      await ttsService?.speak('Pedidos reservados');
      return { success: true, action: 'view_reserved_orders' };
    }

    await ttsService?.speak('No encontré los pedidos reservados');
    return { success: false, error: 'Reserved orders not found' };

  } catch (error) {
    console.error('[Admin Commands] Error viewing reserved orders:', error);
    await ttsService?.speak('No pude mostrar los pedidos reservados');
    return { success: false, error: error.message };
  }
};

/**
 * Buscar pedido por número de ticket
 * @param {String} ticketNumber - Número de ticket
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const searchOrderByTicket = async (ticketNumber, ttsService) => {
  try {
    console.log('[Admin Commands] Searching order by ticket:', ticketNumber);

    if (!ticketNumber) {
      await ttsService?.speak('¿Qué número de ticket quieres buscar?');
      return { success: false, error: 'No ticket number' };
    }

    const searchInput = document.querySelector(
      'input[name*="ticket" i], input[name*="pedido" i], input[placeholder*="ticket" i], input[placeholder*="pedido" i]'
    ) || document.querySelector('input[type="search"], input[type="text"]');

    if (!searchInput) {
      await ttsService?.speak('No encontré el campo de búsqueda');
      return { success: false, error: 'Search input not found' };
    }

    formActions.fillInput(searchInput.name || 'ticket', ticketNumber);

    const searchButton = searchInput.closest('form')?.querySelector('button[type="submit"]') ||
                        searchInput.nextElementSibling;

    if (searchButton && searchButton.tagName === 'BUTTON') {
      clickActions.simulateReactClick(searchButton);
    }

    await ttsService?.speak(`Buscando pedido ${ticketNumber}`);
    return { success: true, action: 'search_order_ticket', ticket: ticketNumber };

  } catch (error) {
    console.error('[Admin Commands] Error searching ticket:', error);
    await ttsService?.speak('No pude buscar el pedido');
    return { success: false, error: error.message };
  }
};

/**
 * Cambiar estado de pedido
 * @param {String} newStatus - Nuevo estado (pendiente, preparando, listo, entregado)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const changeOrderStatus = async (newStatus, ttsService) => {
  try {
    console.log('[Admin Commands] Changing order status to:', newStatus);

    if (!newStatus) {
      await ttsService?.speak('¿A qué estado quieres cambiar el pedido?');
      return { success: false, error: 'No status provided' };
    }

    // Normalizar estado
    const statusMap = {
      'pendiente': ['pendiente', 'pending'],
      'preparando': ['preparando', 'preparing', 'en preparación'],
      'listo': ['listo', 'ready', 'completado'],
      'entregado': ['entregado', 'delivered', 'completado']
    };

    const normalizedStatus = newStatus.toLowerCase().trim();
    let targetStatus = normalizedStatus;

    for (const [key, aliases] of Object.entries(statusMap)) {
      if (aliases.includes(normalizedStatus)) {
        targetStatus = key;
        break;
      }
    }

    // Buscar select de estado
    const statusSelect = document.querySelector('select[name*="status" i], select[name*="estado" i], select.status-select');

    if (statusSelect) {
      const success = formActions.selectOption('estado', targetStatus);
      if (success) {
        // Buscar botón de guardar
        const saveButton = statusSelect.closest('form')?.querySelector('button[type="submit"]') ||
                          clickActions.clickByAccessibleName('guardar') ||
                          clickActions.clickByAccessibleName('actualizar');

        if (saveButton) {
          clickActions.simulateReactClick(saveButton);
        }

        await ttsService?.speak(`Estado cambiado a ${newStatus}`);
        return { success: true, action: 'change_order_status', status: targetStatus };
      }
    }

    // Buscar botones de estado
    const statusButton = clickActions.clickByAccessibleName(`marcar como ${targetStatus}`) ||
                        clickActions.clickByAccessibleName(targetStatus);

    if (statusButton) {
      await ttsService?.speak(`Estado cambiado a ${newStatus}`);
      return { success: true, action: 'change_order_status', status: targetStatus };
    }

    await ttsService?.speak('No pude cambiar el estado del pedido');
    return { success: false, error: 'Status change failed' };

  } catch (error) {
    console.error('[Admin Commands] Error changing status:', error);
    await ttsService?.speak('No pude cambiar el estado');
    return { success: false, error: error.message };
  }
};

export default {
  viewAdminProducts,
  searchAdminProduct,
  filterAdminByCategory,
  viewDeliveredOrders,
  viewReservedOrders,
  searchOrderByTicket,
  changeOrderStatus
};
