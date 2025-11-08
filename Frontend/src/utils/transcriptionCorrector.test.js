/**
 * Tests para el sistema de corrección de transcripciones
 * Para ejecutar: copiar y pegar en la consola del navegador
 */

import { correctTranscription, getBestAlternative } from './transcriptionCorrector';

console.log('%c=== TESTS DE CORRECCIÓN DE TRANSCRIPCIONES ===', 'color: #FF5722; font-size: 18px; font-weight: bold');
console.log('');

const testCases = [
  // QUIÉNES SOMOS (caso crítico reportado)
  {
    input: 'a quién estamos',
    expected: 'a quiénes somos',
    description: '🔴 CASO CRÍTICO: "a quién estamos" → "a quiénes somos"'
  },
  {
    input: 'quién estamos',
    expected: 'quiénes somos',
    description: '"quién estamos" → "quiénes somos"'
  },
  {
    input: 'da click a quién estamos',
    expected: 'da click a quiénes somos',
    description: '"da click a quién estamos" → "da click a quiénes somos"'
  },
  
  // COMANDOS DE CLICK
  {
    input: 'da clic a inicio',
    expected: 'da click a inicio',
    description: '"da clic" → "da click"'
  },
  {
    input: 'haz clic en carta',
    expected: 'da click en carta',
    description: '"haz clic" → "da click"'
  },
  {
    input: 'da clip a perfil',
    expected: 'da click a perfil',
    description: '"da clip" → "da click"'
  },
  
  // NAVEGACIÓN
  {
    input: 've a inicio',
    expected: 'ir a inicio',
    description: '"ve a" → "ir a"'
  },
  {
    input: 'abre carta',
    expected: 'abre carta',
    description: '"abre carta" sin cambios'
  },
  {
    input: 'ir a contacto',
    expected: 'ir a contacto',
    description: '"ir a contacto" sin cambios'
  },
  
  // BÚSQUEDA
  {
    input: 'busca tortas',
    expected: 'busca tortas',
    description: '"busca tortas" sin cambios'
  },
  {
    input: 'muéstrame panes',
    expected: 'muestra panes',
    description: '"muéstrame" → "muestra"'
  },
  {
    input: 'encuentra galletas',
    expected: 'busca galletas',
    description: '"encuentra" → "busca"'
  },
  
  // CARRITO
  {
    input: 'agrega dos tortas',
    expected: 'agrega dos tortas',
    description: '"agrega dos tortas" sin cambios'
  },
  {
    input: 'añade tres panes',
    expected: 'agrega tres panes',
    description: '"añade" → "agrega"'
  },
  {
    input: 'elimina galleta',
    expected: 'elimina galleta',
    description: '"elimina galleta" sin cambios'
  },
  {
    input: 'quita dona',
    expected: 'quita dona',
    description: '"quita dona" sin cambios'
  },
  
  // SESIÓN
  {
    input: 'cerrar sesión',
    expected: 'cierra sesión',
    description: '"cerrar sesión" → "cierra sesión"'
  },
  {
    input: 'salir',
    expected: 'cierra sesión',
    description: '"salir" → "cierra sesión"'
  },
  {
    input: 'logout',
    expected: 'cierra sesión',
    description: '"logout" → "cierra sesión"'
  },
  {
    input: 'login',
    expected: 'iniciar sesión',
    description: '"login" → "iniciar sesión"'
  },
  
  // FILTROS
  {
    input: 'filtra dulces',
    expected: 'filtra dulces',
    description: '"filtra dulces" sin cambios'
  },
  {
    input: 'muestra productos salados',
    expected: 'filtra salados',
    description: '"muestra productos salados" → "filtra salados"'
  },
  
  // PAGO
  {
    input: 'ir a pago',
    expected: 'ir a pago',
    description: '"ir a pago" sin cambios'
  },
  {
    input: 'confirmar pedido',
    expected: 'confirmar',
    description: '"confirmar pedido" → "confirmar"'
  },
  {
    input: 'cancelar',
    expected: 'cancelar',
    description: '"cancelar" sin cambios'
  },
];

// Ejecutar tests
let passed = 0;
let failed = 0;

console.log('%c📝 Ejecutando tests...', 'color: #2196F3; font-size: 14px; font-weight: bold');
console.log('');

testCases.forEach((test, index) => {
  const result = correctTranscription(test.input);
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(
      `%c✓ Test ${index + 1}:`,
      'color: #4CAF50; font-weight: bold',
      test.description
    );
    console.log(`  Input:    "${test.input}"`);
    console.log(`  Output:   "${result}"`);
  } else {
    failed++;
    console.log(
      `%c✗ Test ${index + 1}:`,
      'color: #F44336; font-weight: bold',
      test.description
    );
    console.log(`  Input:    "${test.input}"`);
    console.log(`  Expected: "${test.expected}"`);
    console.log(`  Got:      "${result}"`);
  }
  console.log('');
});

// Resumen
console.log('%c=== RESUMEN ===', 'color: #FF9800; font-size: 16px; font-weight: bold');
console.log(`%c✓ Passed: ${passed}`, 'color: #4CAF50; font-size: 14px; font-weight: bold');
console.log(`%c✗ Failed: ${failed}`, failed > 0 ? 'color: #F44336; font-size: 14px; font-weight: bold' : 'color: #4CAF50; font-size: 14px');
console.log(`%cTotal: ${testCases.length}`, 'color: #2196F3; font-size: 14px');
console.log(`%cSuccess Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`, 'color: #9C27B0; font-size: 14px; font-weight: bold');
console.log('');

// TEST DE ALTERNATIVAS
console.log('%c=== TEST DE ALTERNATIVAS ===', 'color: #673AB7; font-size: 16px; font-weight: bold');
console.log('Simulando múltiples alternativas de reconocimiento...');
console.log('');

const alternativesTest = [
  { transcript: 'a quién estamos', confidence: 0.85 },
  { transcript: 'a quién somos', confidence: 0.78 },
  { transcript: 'quiénes somos', confidence: 0.72 },
  { transcript: 'quien estamos', confidence: 0.65 },
  { transcript: 'a quien es somos', confidence: 0.45 },
];

const context = {
  pathname: '/',
  page: '/'
};

console.log('Alternativas recibidas:');
alternativesTest.forEach((alt, i) => {
  console.log(`  ${i + 1}. "${alt.transcript}" (${(alt.confidence * 100).toFixed(1)}%)`);
});
console.log('');

const bestAlternative = getBestAlternative(alternativesTest, context);
const corrected = correctTranscription(bestAlternative);

console.log('%c✓ Resultado final después de scoring y corrección:', 'color: #4CAF50; font-weight: bold');
console.log(`  "${corrected}"`);
console.log('');

export { testCases };
