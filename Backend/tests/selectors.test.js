/**
 * Tests unitarios para validar los selectores mapeados
 */

import SELECTORS from '../services/selectorMappingService.js';
import { 
  detectIntent, 
  getSelectorForIntent,
  isValidSelectorForContext,
  generateSelectorByText 
} from '../utils/selectorHelper.js';

/**
 * Test 1: Validar que todos los selectores principales existen
 */
console.log('🧪 Test 1: Validando existencia de selectores principales...');

const requiredSelectors = [
  { path: 'HEADER_SELECTORS.auth.iniciarSesion', value: SELECTORS.HEADER_SELECTORS?.auth?.iniciarSesion },
  { path: 'HEADER_SELECTORS.auth.registrarse', value: SELECTORS.HEADER_SELECTORS?.auth?.registrarse },
  { path: 'CATALOG_SELECTORS.search.input', value: SELECTORS.CATALOG_SELECTORS?.search?.input },
  { path: 'CART_SELECTORS.procederAlPago', value: SELECTORS.CART_SELECTORS?.procederAlPago },
  { path: 'PAYMENT_SELECTORS.delivery.direccion', value: SELECTORS.PAYMENT_SELECTORS?.delivery?.direccion },
  { path: 'FOOTER_SELECTORS.terminos', value: SELECTORS.FOOTER_SELECTORS?.terminos },
];

let passedTests = 0;
let failedTests = 0;

requiredSelectors.forEach(({ path, value }) => {
  if (value) {
    console.log(`  ✅ ${path}: "${value}"`);
    passedTests++;
  } else {
    console.error(`  ❌ ${path}: FALTA`);
    failedTests++;
  }
});

console.log(`\n📊 Test 1 resultado: ${passedTests}/${requiredSelectors.length} selectores válidos\n`);

/**
 * Test 2: Validar detección de intenciones
 */
console.log('🧪 Test 2: Validando detección de intenciones...');

const intentTests = [
  { command: 'busca pan', expected: 'search' },
  { command: 'ir al carrito', expected: 'goToCart' },
  { command: 'iniciar sesión', expected: 'login' },
  { command: 'registrarse', expected: 'register' },
  { command: 'cerrar sesión', expected: 'logout' },
  { command: 'catálogo', expected: 'goToCatalog' },
  { command: 'inicio', expected: 'goToHome' },
  { command: 'términos y condiciones', expected: 'goToTerms' },
  { command: 'agregar al carrito', expected: 'addToCart' },
  { command: 'libro de reclamaciones', expected: 'goToComplaints' },
];

let intentPassedTests = 0;
let intentFailedTests = 0;

intentTests.forEach(({ command, expected }) => {
  const detected = detectIntent(command);
  if (detected === expected) {
    console.log(`  ✅ "${command}" → ${detected}`);
    intentPassedTests++;
  } else {
    console.error(`  ❌ "${command}" → ${detected} (esperado: ${expected})`);
    intentFailedTests++;
  }
});

console.log(`\n📊 Test 2 resultado: ${intentPassedTests}/${intentTests.length} intenciones detectadas correctamente\n`);

/**
 * Test 3: Validar generación de selectores por intención
 */
console.log('🧪 Test 3: Validando generación de selectores por intención...');

const selectorTests = [
  { 
    intent: 'search', 
    context: { currentUrl: '/carta' },
    shouldExist: true 
  },
  { 
    intent: 'login', 
    context: { isAuthenticated: false },
    shouldExist: true 
  },
  { 
    intent: 'logout', 
    context: { isAuthenticated: true },
    shouldExist: true 
  },
  { 
    intent: 'goToCart', 
    context: { isAuthenticated: true },
    shouldExist: true 
  },
  { 
    intent: 'addToCart', 
    context: { currentUrl: '/carta' },
    params: { productIndex: 0 },
    shouldExist: true 
  },
];

let selectorPassedTests = 0;
let selectorFailedTests = 0;

selectorTests.forEach(({ intent, context, params, shouldExist }) => {
  const selector = getSelectorForIntent(intent, context, params);
  const exists = selector !== null && selector !== undefined;
  
  if (exists === shouldExist) {
    console.log(`  ✅ ${intent}: "${selector?.substring(0, 50)}${selector?.length > 50 ? '...' : ''}"`);
    selectorPassedTests++;
  } else {
    console.error(`  ❌ ${intent}: ${exists ? 'generó selector inesperado' : 'no generó selector'}`);
    selectorFailedTests++;
  }
});

console.log(`\n📊 Test 3 resultado: ${selectorPassedTests}/${selectorTests.length} selectores generados correctamente\n`);

/**
 * Test 4: Validar contexto de selectores
 */
console.log('🧪 Test 4: Validando validación de contexto...');

const contextTests = [
  {
    selector: '/profile', // Ruta de navegación
    context: { isAuthenticated: true },
    expectedValid: true,
    description: 'Ruta de perfil con auth'
  },
  {
    selector: '/profile', // Rutas siempre válidas (navegación maneja auth)
    context: { isAuthenticated: false },
    expectedValid: true,
    description: 'Ruta de perfil sin auth (navegación la maneja)'
  },
  {
    selector: SELECTORS.HEADER_SELECTORS?.user?.carrito, // Selector de elemento
    context: { isAuthenticated: true },
    expectedValid: true,
    description: 'Selector de carrito con auth'
  },
  {
    selector: SELECTORS.HEADER_SELECTORS?.user?.carrito, // Selector de elemento
    context: { isAuthenticated: false },
    expectedValid: false,
    description: 'Selector de carrito sin auth (debe fallar)'
  },
  {
    selector: SELECTORS.HEADER_SELECTORS?.auth?.iniciarSesion,
    context: { isAuthenticated: false },
    expectedValid: true,
    description: 'Botón login sin auth'
  },
];

let contextPassedTests = 0;
let contextFailedTests = 0;

contextTests.forEach(({ selector, context, expectedValid, description }, index) => {
  const isValid = isValidSelectorForContext(selector, context);
  
  if (isValid === expectedValid) {
    console.log(`  ✅ ${description}: ${isValid ? 'válido' : 'inválido'} (correcto)`);
    contextPassedTests++;
  } else {
    console.error(`  ❌ ${description}: ${isValid ? 'válido' : 'inválido'} (esperado: ${expectedValid ? 'válido' : 'inválido'})`);
    contextFailedTests++;
  }
});

console.log(`\n📊 Test 4 resultado: ${contextPassedTests}/${contextTests.length} validaciones de contexto correctas\n`);

/**
 * Test 5: Validar generación de selectores por texto
 */
console.log('🧪 Test 5: Validando generación de selectores por texto...');

const textTests = [
  { text: 'Agregar', type: 'button', expectedContains: 'button:has-text' },
  { text: 'Términos y condiciones', type: 'link', expectedContains: 'text=' },
  { text: 'Buscar productos', type: 'input', expectedContains: 'placeholder' },
];

let textPassedTests = 0;
let textFailedTests = 0;

textTests.forEach(({ text, type, expectedContains }) => {
  const selector = generateSelectorByText(text, type);
  
  if (selector.includes(expectedContains)) {
    console.log(`  ✅ "${text}" (${type}): "${selector}"`);
    textPassedTests++;
  } else {
    console.error(`  ❌ "${text}" (${type}): no contiene "${expectedContains}"`);
    textFailedTests++;
  }
});

console.log(`\n📊 Test 5 resultado: ${textPassedTests}/${textTests.length} selectores por texto generados correctamente\n`);

/**
 * Resultado final
 */
console.log('═══════════════════════════════════════════');
console.log('📊 RESUMEN TOTAL DE TESTS');
console.log('═══════════════════════════════════════════');

const totalTests = requiredSelectors.length + intentTests.length + selectorTests.length + contextTests.length + textTests.length;
const totalPassed = passedTests + intentPassedTests + selectorPassedTests + contextPassedTests + textPassedTests;
const totalFailed = failedTests + intentFailedTests + selectorFailedTests + contextFailedTests + textFailedTests;

console.log(`✅ Tests pasados: ${totalPassed}/${totalTests}`);
console.log(`❌ Tests fallados: ${totalFailed}/${totalTests}`);
console.log(`📈 Tasa de éxito: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
console.log('═══════════════════════════════════════════\n');

if (totalFailed > 0) {
  console.error('⚠️ Hay tests fallando. Revisa la implementación.');
  process.exit(1);
} else {
  console.log('🎉 ¡Todos los tests pasaron exitosamente!');
  process.exit(0);
}
