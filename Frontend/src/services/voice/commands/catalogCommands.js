/**
 * catalogCommands.js
 * Comandos específicos para la página de Catálogo/Carta
 * - Filtros, búsqueda, navegación de productos, lectura
 */

import { clickActions, formActions, readActions, ListNavigator } from '../voiceActions.js';

/**
 * Instancia del navegador de productos
 */
let productNavigator = null;

/**
 * Inicializar navegador de productos
 */
const initProductNavigator = () => {
  if (!productNavigator) {
    productNavigator = new ListNavigator('[data-product-card], .product-card, .producto-card, article[class*="product"]');
  }
  return productNavigator;
};

/**
 * Filtrar por categoría
 * @param {String} category - Nombre de la categoría
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const filterByCategory = async (category, ttsService) => {
  try {
    console.log('[Catalog Commands] Filtering by category:', category);

    if (!category) {
      await ttsService?.speak('¿Por qué categoría quieres filtrar?');
      return { success: false, error: 'No category provided' };
    }

    // Normalizar categoría
    const normalizedCategory = category.toLowerCase().trim();

    // Mapeo de categorías comunes
    const categoryMap = {
      'panadería': ['panaderia', 'pan', 'panes', 'bread'],
      'pastelería': ['pasteleria', 'pastel', 'pasteles', 'cake', 'cakes'],
      'galletas': ['galleta', 'cookies', 'cookie'],
      'bebidas': ['bebida', 'drinks', 'drink'],
      'especiales': ['especial', 'special', 'specials'],
      'temporada': ['temporal', 'seasonal']
    };

    // Encontrar categoría correcta
    let targetCategory = normalizedCategory;
    for (const [key, aliases] of Object.entries(categoryMap)) {
      if (aliases.includes(normalizedCategory) || key === normalizedCategory) {
        targetCategory = key;
        break;
      }
    }

    // Buscar botón de categoría
    const categoryButton = document.querySelector(
      `button[data-category="${targetCategory}"], button[data-filter="${targetCategory}"], .category-btn[data-value="${targetCategory}"]`
    ) || Array.from(document.querySelectorAll('button, .filter-button, .category-button')).find(btn => {
      const text = btn.textContent.toLowerCase();
      const dataValue = btn.getAttribute('data-category') || btn.getAttribute('data-value') || '';
      return text.includes(normalizedCategory) || dataValue.toLowerCase().includes(normalizedCategory);
    });

    if (categoryButton) {
      clickActions.simulateReactClick(categoryButton);
      await ttsService?.speak(`Filtrando por ${category}`);
      return { success: true, action: 'filter_category', category };
    }

    // Intentar con select/dropdown
    const categorySelect = document.querySelector('select[name*="category" i], select[name*="categoria" i], select.category-filter');
    if (categorySelect) {
      const success = formActions.selectOption('categoría', targetCategory);
      if (success) {
        await ttsService?.speak(`Filtrando por ${category}`);
        return { success: true, action: 'filter_category', category };
      }
    }

    await ttsService?.speak(`No encontré la categoría ${category}`);
    return { success: false, error: 'Category not found', category };

  } catch (error) {
    console.error('[Catalog Commands] Error filtering by category:', error);
    await ttsService?.speak('No pude aplicar el filtro');
    return { success: false, error: error.message };
  }
};

/**
 * Filtrar precio menor a (máximo)
 * @param {Number} maxPrice - Precio máximo
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const filterPriceLessThan = async (maxPrice, ttsService) => {
  try {
    console.log('[Catalog Commands] Filtering price less than:', maxPrice);

    if (!maxPrice || isNaN(maxPrice)) {
      await ttsService?.speak('Especifica un precio máximo');
      return { success: false, error: 'Invalid price' };
    }

    // Buscar input de precio máximo
    const maxPriceInput = document.querySelector(
      'input[name*="max" i][name*="price" i], input[name*="precio" i][name*="max" i], input.max-price, input#maxPrice'
    ) || Array.from(document.querySelectorAll('input[type="number"], input[type="range"]')).find(input => {
      const label = input.labels?.[0]?.textContent.toLowerCase() || '';
      const placeholder = input.placeholder.toLowerCase();
      return label.includes('máximo') || label.includes('max') || placeholder.includes('máximo');
    });

    if (maxPriceInput) {
      formActions.fillInput(maxPriceInput.name || 'precio máximo', maxPrice);
      await ttsService?.speak(`Filtrando productos menores a ${maxPrice} pesos`);
      return { success: true, action: 'filter_max_price', maxPrice };
    }

    // Buscar slider de rango
    const priceSlider = document.querySelector('input[type="range"][name*="price" i]');
    if (priceSlider) {
      const max = parseFloat(priceSlider.max) || 1000;
      const value = Math.min(maxPrice, max);
      formActions.fillInput('precio', value);
      await ttsService?.speak(`Filtrando productos menores a ${value} pesos`);
      return { success: true, action: 'filter_max_price', maxPrice: value };
    }

    await ttsService?.speak('No encontré el filtro de precio');
    return { success: false, error: 'Price filter not found' };

  } catch (error) {
    console.error('[Catalog Commands] Error filtering max price:', error);
    await ttsService?.speak('No pude aplicar el filtro de precio');
    return { success: false, error: error.message };
  }
};

/**
 * Filtrar precio mayor a (mínimo)
 * @param {Number} minPrice - Precio mínimo
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const filterPriceGreaterThan = async (minPrice, ttsService) => {
  try {
    console.log('[Catalog Commands] Filtering price greater than:', minPrice);

    if (!minPrice || isNaN(minPrice)) {
      await ttsService?.speak('Especifica un precio mínimo');
      return { success: false, error: 'Invalid price' };
    }

    // Buscar input de precio mínimo
    const minPriceInput = document.querySelector(
      'input[name*="min" i][name*="price" i], input[name*="precio" i][name*="min" i], input.min-price, input#minPrice'
    ) || Array.from(document.querySelectorAll('input[type="number"], input[type="range"]')).find(input => {
      const label = input.labels?.[0]?.textContent.toLowerCase() || '';
      const placeholder = input.placeholder.toLowerCase();
      return label.includes('mínimo') || label.includes('min') || placeholder.includes('mínimo');
    });

    if (minPriceInput) {
      formActions.fillInput(minPriceInput.name || 'precio mínimo', minPrice);
      await ttsService?.speak(`Filtrando productos mayores a ${minPrice} pesos`);
      return { success: true, action: 'filter_min_price', minPrice };
    }

    await ttsService?.speak('No encontré el filtro de precio mínimo');
    return { success: false, error: 'Min price filter not found' };

  } catch (error) {
    console.error('[Catalog Commands] Error filtering min price:', error);
    await ttsService?.speak('No pude aplicar el filtro de precio');
    return { success: false, error: error.message };
  }
};

/**
 * Buscar producto
 * @param {String} query - Término de búsqueda
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const searchProduct = async (query, ttsService) => {
  try {
    console.log('[Catalog Commands] Searching product:', query);

    if (!query) {
      await ttsService?.speak('¿Qué producto quieres buscar?');
      return { success: false, error: 'No query provided' };
    }

    // Buscar input de búsqueda
    const searchInput = document.querySelector(
      'input[type="search"], input[name*="search" i], input[name*="buscar" i], input.search-input, input[placeholder*="buscar" i]'
    ) || Array.from(document.querySelectorAll('input[type="text"]')).find(input => {
      const placeholder = input.placeholder.toLowerCase();
      const label = input.labels?.[0]?.textContent.toLowerCase() || '';
      return placeholder.includes('buscar') || placeholder.includes('search') ||
             label.includes('buscar') || label.includes('search');
    });

    if (!searchInput) {
      await ttsService?.speak('No encontré el campo de búsqueda');
      return { success: false, error: 'Search input not found' };
    }

    // Llenar y ejecutar búsqueda
    formActions.fillInput(searchInput.name || 'buscar', query);

    // Buscar botón de búsqueda
    const searchButton = document.querySelector(
      'button[type="submit"][form*="search" i], button.search-button, button[aria-label*="buscar" i]'
    ) || searchInput.closest('form')?.querySelector('button[type="submit"]');

    if (searchButton) {
      clickActions.simulateReactClick(searchButton);
    } else {
      // Enviar form con Enter
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
    }

    await ttsService?.speak(`Buscando ${query}`);
    return { success: true, action: 'search_product', query };

  } catch (error) {
    console.error('[Catalog Commands] Error searching product:', error);
    await ttsService?.speak('No pude buscar el producto');
    return { success: false, error: error.message };
  }
};

/**
 * Siguiente producto en la lista
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const nextProduct = async (ttsService) => {
  try {
    console.log('[Catalog Commands] Next product');

    const navigator = initProductNavigator();
    const element = navigator.next();

    if (!element) {
      await ttsService?.speak('No hay más productos');
      return { success: false, error: 'No more products' };
    }

    const info = navigator.getCurrentInfo();

    // Leer nombre del producto
    const nameElement = element.querySelector('h2, h3, h4, .product-name, .product-title');
    const productName = nameElement ? nameElement.textContent.trim() : '';

    if (productName) {
      await ttsService?.speak(`Producto ${info.index + 1} de ${info.total}: ${productName}`);
    } else {
      await ttsService?.speak(`Producto ${info.index + 1} de ${info.total}`);
    }

    return { success: true, action: 'next_product', index: info.index, total: info.total };

  } catch (error) {
    console.error('[Catalog Commands] Error next product:', error);
    await ttsService?.speak('No pude navegar al siguiente producto');
    return { success: false, error: error.message };
  }
};

/**
 * Producto anterior en la lista
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const previousProduct = async (ttsService) => {
  try {
    console.log('[Catalog Commands] Previous product');

    const navigator = initProductNavigator();
    const element = navigator.previous();

    if (!element) {
      await ttsService?.speak('No hay producto anterior');
      return { success: false, error: 'No previous product' };
    }

    const info = navigator.getCurrentInfo();

    // Leer nombre del producto
    const nameElement = element.querySelector('h2, h3, h4, .product-name, .product-title');
    const productName = nameElement ? nameElement.textContent.trim() : '';

    if (productName) {
      await ttsService?.speak(`Producto ${info.index + 1} de ${info.total}: ${productName}`);
    } else {
      await ttsService?.speak(`Producto ${info.index + 1} de ${info.total}`);
    }

    return { success: true, action: 'previous_product', index: info.index, total: info.total };

  } catch (error) {
    console.error('[Catalog Commands] Error previous product:', error);
    await ttsService?.speak('No pude navegar al producto anterior');
    return { success: false, error: error.message };
  }
};

/**
 * Leer producto actual (destacado)
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readCurrentProduct = async (ttsService) => {
  try {
    console.log('[Catalog Commands] Reading current product');

    const navigator = initProductNavigator();
    const info = navigator.getCurrentInfo();

    if (!info || !info.element) {
      await ttsService?.speak('No hay producto seleccionado. Di "siguiente" para navegar');
      return { success: false, error: 'No product selected' };
    }

    const element = info.element;

    // Extraer información del producto
    const nameElement = element.querySelector('h2, h3, h4, .product-name, .product-title');
    const priceElement = element.querySelector('.price, .precio, .product-price');
    const descriptionElement = element.querySelector('.description, .descripcion, .product-description, p');

    const name = nameElement ? nameElement.textContent.trim() : 'Producto sin nombre';
    const price = priceElement ? priceElement.textContent.trim() : '';
    const description = descriptionElement ? descriptionElement.textContent.trim() : '';

    // Leer información
    await ttsService?.speak(name);

    if (price) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ttsService?.speak(`Precio: ${price}`);
    }

    if (description && description.length < 200) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ttsService?.speak(description);
    }

    return {
      success: true,
      action: 'read_product',
      product: { name, price, description }
    };

  } catch (error) {
    console.error('[Catalog Commands] Error reading product:', error);
    await ttsService?.speak('No pude leer el producto');
    return { success: false, error: error.message };
  }
};

/**
 * Leer todos los productos disponibles
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const readAllProducts = async (ttsService) => {
  try {
    console.log('[Catalog Commands] Reading all products');

    const products = readActions.readProducts();

    if (products.length === 0) {
      await ttsService?.speak('No hay productos para leer');
      return { success: false, error: 'No products found' };
    }

    await ttsService?.speak(`Hay ${products.length} productos disponibles`);

    // Leer primeros 5 productos
    const limit = Math.min(products.length, 5);
    for (let i = 0; i < limit; i++) {
      const product = products[i];
      const message = product.price ?
        `${i + 1}. ${product.name}, ${product.price}` :
        `${i + 1}. ${product.name}`;

      await new Promise(resolve => setTimeout(resolve, 800));
      await ttsService?.speak(message);
    }

    if (products.length > 5) {
      await new Promise(resolve => setTimeout(resolve, 800));
      await ttsService?.speak(`Y ${products.length - 5} productos más`);
    }

    return {
      success: true,
      action: 'read_all_products',
      count: products.length
    };

  } catch (error) {
    console.error('[Catalog Commands] Error reading all products:', error);
    await ttsService?.speak('No pude leer los productos');
    return { success: false, error: error.message };
  }
};

/**
 * Agregar producto actual al carrito
 * @param {Number} quantity - Cantidad a agregar
 * @param {Object} ttsService - Servicio de TTS
 * @returns {Promise<Object>}
 */
export const addCurrentProductToCart = async (quantity = 1, ttsService) => {
  try {
    console.log('[Catalog Commands] Adding current product to cart:', quantity);

    const navigator = initProductNavigator();
    const info = navigator.getCurrentInfo();

    if (!info || !info.element) {
      await ttsService?.speak('Primero selecciona un producto con "siguiente"');
      return { success: false, error: 'No product selected' };
    }

    const element = info.element;

    // Extraer nombre
    const nameElement = element.querySelector('h2, h3, h4, .product-name, .product-title');
    const productName = nameElement ? nameElement.textContent.trim() : 'producto';

    // Buscar botón de agregar
    const addButton = element.querySelector(
      'button[aria-label*="agregar" i], button[aria-label*="añadir" i], button.add-to-cart, .btn-add-cart'
    ) || element.querySelector('button');

    if (!addButton) {
      await ttsService?.speak('No encontré el botón de agregar al carrito');
      return { success: false, error: 'Add button not found' };
    }

    // Ajustar cantidad si es necesario
    if (quantity > 1) {
      const quantityInput = element.querySelector('input[type="number"], input.quantity');
      if (quantityInput) {
        formActions.fillInput(quantityInput.name || 'cantidad', quantity);
      }
    }

    // Agregar al carrito
    clickActions.simulateReactClick(addButton);
    await ttsService?.speak(`Agregado ${productName} al carrito`);

    return {
      success: true,
      action: 'add_to_cart',
      product: productName,
      quantity
    };

  } catch (error) {
    console.error('[Catalog Commands] Error adding to cart:', error);
    await ttsService?.speak('No pude agregar el producto al carrito');
    return { success: false, error: error.message };
  }
};

export default {
  filterByCategory,
  filterPriceLessThan,
  filterPriceGreaterThan,
  searchProduct,
  nextProduct,
  previousProduct,
  readCurrentProduct,
  readAllProducts,
  addCurrentProductToCart
};
