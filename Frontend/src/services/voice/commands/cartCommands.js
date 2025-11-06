/**
 * cartCommands.js
 * Comandos específicos para la página de Carrito y Pago
 * - Leer carrito, eliminar, modificar cantidad, vaciar, pago
 */

import { clickActions, formActions } from '../voiceActions.js';
import voiceReduxBridge from '../reduxIntegration.js';

/**
 * Leer carrito completo
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readCart = async (ttsService) => {
  try {
    console.log('[Cart Commands] Reading cart');
    await voiceReduxBridge.readCart();
    return { success: true, action: 'read_cart' };
  } catch (error) {
    console.error('[Cart Commands] Error reading cart:', error);
    await ttsService?.speak('No pude leer el carrito');
    return { success: false, error: error.message };
  }
};

/**
 * Leer total del carrito
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readCartTotal = async (ttsService) => {
  try {
    console.log('[Cart Commands] Reading cart total');
    await voiceReduxBridge.readCartTotal();
    return { success: true, action: 'read_total' };
  } catch (error) {
    console.error('[Cart Commands] Error reading total:', error);
    await ttsService?.speak('No pude leer el total');
    return { success: false, error: error.message };
  }
};

/**
 * Leer cantidad de items en carrito
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readCartItemCount = async (ttsService) => {
  try {
    console.log('[Cart Commands] Reading cart item count');
    await voiceReduxBridge.readCartItemCount();
    return { success: true, action: 'read_count' };
  } catch (error) {
    console.error('[Cart Commands] Error reading count:', error);
    await ttsService?.speak('No pude contar los productos');
    return { success: false, error: error.message };
  }
};

/**
 * Eliminar producto del carrito por índice
 * @param {Number} index - Índice del producto (1-based)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const removeFromCart = async (index, ttsService) => {
  try {
    console.log('[Cart Commands] Removing from cart:', index);

    if (!index || index < 1) {
      await ttsService?.speak('¿Qué producto quieres eliminar? Di el número');
      return { success: false, error: 'Invalid index' };
    }

    const success = await voiceReduxBridge.removeFromCartByIndex(index);
    return { success, action: 'remove_from_cart', index };

  } catch (error) {
    console.error('[Cart Commands] Error removing from cart:', error);
    await ttsService?.speak('No pude eliminar el producto');
    return { success: false, error: error.message };
  }
};

/**
 * Modificar cantidad de producto en carrito
 * @param {Number} index - Índice del producto (1-based)
 * @param {Number} newQuantity - Nueva cantidad
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const updateCartQuantity = async (index, newQuantity, ttsService) => {
  try {
    console.log('[Cart Commands] Updating quantity:', index, 'to', newQuantity);

    if (!index || index < 1) {
      await ttsService?.speak('¿De qué producto quieres cambiar la cantidad? Di el número');
      return { success: false, error: 'Invalid index' };
    }

    if (!newQuantity || newQuantity < 0) {
      await ttsService?.speak('¿A qué cantidad quieres cambiar?');
      return { success: false, error: 'Invalid quantity' };
    }

    const success = await voiceReduxBridge.updateCartQuantity(index, newQuantity);
    return { success, action: 'update_quantity', index, quantity: newQuantity };

  } catch (error) {
    console.error('[Cart Commands] Error updating quantity:', error);
    await ttsService?.speak('No pude cambiar la cantidad');
    return { success: false, error: error.message };
  }
};

/**
 * Vaciar carrito completamente (con confirmación)
 * @param {Object} ttsService - Servicio de TTS
 * @param {Boolean} skipConfirmation - Saltar confirmación
 * @returns {Promise<Object>}
 */
export const clearCart = async (ttsService, skipConfirmation = false) => {
  try {
    console.log('[Cart Commands] Clearing cart');

    if (!skipConfirmation) {
      // En un escenario real, aquí se podría implementar confirmación por voz
      // Por ahora, procedemos directamente
      await ttsService?.speak('Vaciando carrito');
    }

    const success = await voiceReduxBridge.clearCart();
    return { success, action: 'clear_cart' };

  } catch (error) {
    console.error('[Cart Commands] Error clearing cart:', error);
    await ttsService?.speak('No pude vaciar el carrito');
    return { success: false, error: error.message };
  }
};

/**
 * Proceder al pago
 * @param {Function} navigate - React Router navigate
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const proceedToCheckout = async (navigate, ttsService) => {
  try {
    console.log('[Cart Commands] Proceeding to checkout');

    if (!navigate) {
      // Intentar hacer click en botón de pagar
      const checkoutButton = clickActions.clickByAccessibleName('proceder al pago') ||
                            clickActions.clickByAccessibleName('pagar') ||
                            clickActions.clickByAccessibleName('checkout') ||
                            clickActions.clickByAccessibleName('finalizar compra');

      if (checkoutButton) {
        await ttsService?.speak('Proceder al pago');
        return { success: true, action: 'checkout' };
      }

      await ttsService?.speak('No encontré el botón de pago');
      return { success: false, error: 'Checkout button not found' };
    }

    navigate('/payment');
    await ttsService?.speak('Proceder al pago');
    return { success: true, action: 'checkout' };

  } catch (error) {
    console.error('[Cart Commands] Error proceeding to checkout:', error);
    await ttsService?.speak('No pude ir al pago');
    return { success: false, error: error.message };
  }
};

/**
 * Seleccionar método de pago
 * @param {String} method - Método de pago (tarjeta, efectivo, transferencia)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const selectPaymentMethod = async (method, ttsService) => {
  try {
    console.log('[Cart Commands] Selecting payment method:', method);

    if (!method) {
      await ttsService?.speak('¿Qué método de pago quieres usar?');
      return { success: false, error: 'No method provided' };
    }

    // Normalizar método
    const normalizedMethod = method.toLowerCase().trim();

    // Mapeo de métodos
    const methodMap = {
      'tarjeta': ['tarjeta', 'card', 'credito', 'débito', 'debit', 'credit'],
      'efectivo': ['efectivo', 'cash', 'dinero'],
      'transferencia': ['transferencia', 'transfer', 'banco', 'bank']
    };

    // Encontrar método correcto
    let targetMethod = normalizedMethod;
    for (const [key, aliases] of Object.entries(methodMap)) {
      if (aliases.includes(normalizedMethod) || key === normalizedMethod) {
        targetMethod = key;
        break;
      }
    }

    // Buscar radio button o botón de método de pago
    const paymentOption = document.querySelector(
      `input[type="radio"][value="${targetMethod}"], input[type="radio"][data-method="${targetMethod}"]`
    ) || Array.from(document.querySelectorAll('input[type="radio"], button')).find(el => {
      const label = el.labels?.[0]?.textContent.toLowerCase() || '';
      const text = el.textContent?.toLowerCase() || '';
      const value = el.value?.toLowerCase() || '';
      return label.includes(normalizedMethod) || text.includes(normalizedMethod) || value.includes(normalizedMethod);
    });

    if (!paymentOption) {
      // Intentar con select
      const paymentSelect = document.querySelector('select[name*="payment" i], select[name*="metodo" i], select.payment-method');
      if (paymentSelect) {
        const success = formActions.selectOption('método de pago', targetMethod);
        if (success) {
          await ttsService?.speak(`Método de pago: ${method}`);
          return { success: true, action: 'select_payment_method', method };
        }
      }

      await ttsService?.speak(`No encontré el método de pago ${method}`);
      return { success: false, error: 'Payment method not found', method };
    }

    // Seleccionar método
    if (paymentOption.tagName === 'INPUT') {
      paymentOption.checked = true;
      paymentOption.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      clickActions.simulateReactClick(paymentOption);
    }

    await ttsService?.speak(`Método de pago seleccionado: ${method}`);
    return { success: true, action: 'select_payment_method', method };

  } catch (error) {
    console.error('[Cart Commands] Error selecting payment method:', error);
    await ttsService?.speak('No pude seleccionar el método de pago');
    return { success: false, error: error.message };
  }
};

/**
 * Activar modo dictado para ingresar datos
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const activateDictationMode = async (ttsService) => {
  try {
    console.log('[Cart Commands] Activating dictation mode');

    // Enfocar primer input vacío en el formulario
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    const emptyInput = Array.from(inputs).find(input => !input.value || input.value.trim() === '');

    if (emptyInput) {
      emptyInput.focus();
      await ttsService?.speak('Modo dictado activado. Di los datos que quieres ingresar');
      return { success: true, action: 'activate_dictation' };
    }

    await ttsService?.speak('No encontré campos vacíos para llenar');
    return { success: false, error: 'No empty fields found' };

  } catch (error) {
    console.error('[Cart Commands] Error activating dictation:', error);
    await ttsService?.speak('No pude activar el modo dictado');
    return { success: false, error: error.message };
  }
};

/**
 * Finalizar compra / Enviar formulario de pago
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const finalizePurchase = async (ttsService) => {
  try {
    console.log('[Cart Commands] Finalizing purchase');

    // Buscar botón de finalizar compra
    const finalizeButton = clickActions.clickByAccessibleName('finalizar compra') ||
                          clickActions.clickByAccessibleName('confirmar pago') ||
                          clickActions.clickByAccessibleName('pagar ahora') ||
                          clickActions.clickByAccessibleName('completar pedido') ||
                          document.querySelector('button[type="submit"].checkout-button, button.finalize-purchase');

    if (!finalizeButton) {
      await ttsService?.speak('No encontré el botón de finalizar compra');
      return { success: false, error: 'Finalize button not found' };
    }

    // Hacer click
    clickActions.simulateReactClick(finalizeButton);
    await ttsService?.speak('Finalizando compra');

    return { success: true, action: 'finalize_purchase' };

  } catch (error) {
    console.error('[Cart Commands] Error finalizing purchase:', error);
    await ttsService?.speak('No pude finalizar la compra');
    return { success: false, error: error.message };
  }
};

/**
 * Aplicar cupón de descuento
 * @param {String} couponCode - Código del cupón
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const applyCoupon = async (couponCode, ttsService) => {
  try {
    console.log('[Cart Commands] Applying coupon:', couponCode);

    if (!couponCode) {
      await ttsService?.speak('¿Qué cupón quieres aplicar?');
      return { success: false, error: 'No coupon code provided' };
    }

    // Buscar input de cupón
    const couponInput = document.querySelector(
      'input[name*="coupon" i], input[name*="cupon" i], input[name*="promo" i], input[placeholder*="cupón" i], input.coupon-input'
    ) || Array.from(document.querySelectorAll('input[type="text"]')).find(input => {
      const label = input.labels?.[0]?.textContent.toLowerCase() || '';
      const placeholder = input.placeholder.toLowerCase();
      return label.includes('cupón') || label.includes('cupon') ||
             placeholder.includes('cupón') || placeholder.includes('cupon');
    });

    if (!couponInput) {
      await ttsService?.speak('No encontré el campo de cupón');
      return { success: false, error: 'Coupon input not found' };
    }

    // Llenar cupón
    formActions.fillInput(couponInput.name || 'cupón', couponCode);

    // Buscar botón de aplicar
    const applyButton = couponInput.closest('div, form')?.querySelector(
      'button[type="submit"], button.apply-coupon, button[aria-label*="aplicar" i]'
    );

    if (applyButton) {
      clickActions.simulateReactClick(applyButton);
    }

    await ttsService?.speak(`Cupón ${couponCode} aplicado`);
    return { success: true, action: 'apply_coupon', coupon: couponCode };

  } catch (error) {
    console.error('[Cart Commands] Error applying coupon:', error);
    await ttsService?.speak('No pude aplicar el cupón');
    return { success: false, error: error.message };
  }
};

export default {
  readCart,
  readCartTotal,
  readCartItemCount,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  proceedToCheckout,
  selectPaymentMethod,
  activateDictationMode,
  finalizePurchase,
  applyCoupon
};
