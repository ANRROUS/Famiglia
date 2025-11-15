import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getHistory } from './conversationHistoryService.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sistema de Ensemble Multi-Modelo para Gemini
 * Combina respuestas de múltiples modelos para mayor precisión y robustez
 */

/**
 * Procesa un comando con múltiples modelos Gemini en paralelo
 * @param {Object} params - Parámetros del ensemble
 * @param {string} params.transcript - Transcripción del comando de voz
 * @param {Object} params.context - Contexto del usuario y aplicación
 * @param {string} params.screenshot - Screenshot base64 (opcional)
 * @param {string} params.systemPrompt - System prompt para los modelos
 * @param {Array} params.parts - Partes del mensaje (texto + imagen)
 * @param {boolean} params.useFullEnsemble - Si usar los 3 modelos o solo el principal
 * @param {string} params.sessionId - ID de sesión para historial de conversación
 * @returns {Object} Respuesta combinada del ensemble
 */
export async function processWithEnsemble({
  transcript,
  context,
  screenshot,
  systemPrompt,
  parts,
  useFullEnsemble = false,
  sessionId = null
}) {
  // Obtener historial de conversación
  const conversationHistory = sessionId ? getHistory(sessionId) : [];
  
  if (conversationHistory.length > 0) {
    console.log(`[Ensemble] 📚 Usando historial: ${conversationHistory.length} mensajes previos`);
  }
  console.log(`[Ensemble] ${useFullEnsemble ? '🎯 Modo COMPLETO' : '⚡ Modo RÁPIDO'}`);

  // Configuración de modelos con roles y pesos
  const modelConfigs = [
    {
      name: 'gemini-2.5-flash-lite',
      role: 'validator',
      weight: 0.20,
      description: 'Validación rápida y detección de errores obvios',
      enabled: useFullEnsemble
    },
    {
      name: 'gemini-2.5-flash',
      role: 'primary',
      weight: 0.50,
      description: 'Modelo principal balanceado',
      enabled: true // Siempre habilitado
    },
    {
      name: 'gemini-2.5-pro',
      role: 'refiner',
      weight: 0.30,
      description: 'Refinamiento y validación de calidad',
      enabled: useFullEnsemble
    }
  ];

  // Filtrar solo modelos habilitados
  const activeModels = modelConfigs.filter(m => m.enabled);
  console.log(`[Ensemble] Modelos activos: ${activeModels.map(m => m.name).join(', ')}`);

  // Ejecutar todos los modelos en paralelo
  const modelPromises = activeModels.map(async (config) => {
    const startTime = Date.now();
    
    try {
      console.log(`[Ensemble/${config.role}] 🚀 Iniciando ${config.name}...`);

      const model = genAI.getGenerativeModel({
        model: config.name,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });

      // Crear chat con system prompt + historial de conversación
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{
              text: 'Entendido. Estoy listo para interpretar comandos de voz y planificar acciones usando las herramientas MCP. Responderé únicamente en formato JSON sin markdown.'
            }]
          },
          // Agregar historial de conversación previo
          ...conversationHistory
        ]
      });

      // Enviar mensaje
      const result = await chat.sendMessage(parts);
      const response = await result.response;
      const text = response.text();

      const duration = Date.now() - startTime;
      console.log(`[Ensemble/${config.role}] ✅ Completado en ${duration}ms`);

      // Parsear JSON
      let planData = parseGeminiResponse(text, config.name);

      return {
        model: config.name,
        role: config.role,
        weight: config.weight,
        duration,
        success: true,
        planData
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Ensemble/${config.role}] ❌ Error en ${duration}ms:`, error.message);

      return {
        model: config.name,
        role: config.role,
        weight: config.weight,
        duration,
        success: false,
        error: error.message,
        planData: null
      };
    }
  });

  // Esperar todas las respuestas
  const results = await Promise.all(modelPromises);

  console.log('[Ensemble] 📊 Resultados:');
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`  ${status} ${r.model} (${r.role}): ${r.duration}ms`);
  });

  // Combinar resultados usando votación ponderada
  const combinedPlan = combineEnsembleResults(results, transcript);

  // Agregar metadatos del ensemble
  combinedPlan.ensemble = {
    modelsUsed: results.filter(r => r.success).map(r => r.model),
    totalDuration: Math.max(...results.map(r => r.duration)),
    avgDuration: Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length),
    successRate: `${results.filter(r => r.success).length}/${results.length}`
  };

  console.log('[Ensemble] ✅ Plan combinado generado');
  console.log(`[Ensemble] Modelos exitosos: ${combinedPlan.ensemble.successRate}`);
  console.log(`[Ensemble] Duración total: ${combinedPlan.ensemble.totalDuration}ms`);

  return combinedPlan;
}

/**
 * Parsea la respuesta de texto de Gemini a objeto JSON
 */
function parseGeminiResponse(text, modelName) {
  try {
    // Limpiar markdown
    let cleanedResponse = text.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    // Extraer JSON
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No se encontró JSON válido');
    }
  } catch (error) {
    console.error(`[Ensemble] Error parseando respuesta de ${modelName}:`, error.message);
    return {
      reasoning: 'Error al parsear respuesta',
      steps: [],
      userFeedback: 'Lo siento, hubo un error procesando tu comando',
      expectedDuration: '0s'
    };
  }
}

/**
 * Combina resultados de múltiples modelos usando votación ponderada
 */
function combineEnsembleResults(results, transcript) {
  const successfulResults = results.filter(r => r.success && r.planData);

  if (successfulResults.length === 0) {
    return {
      reasoning: 'Ningún modelo pudo procesar el comando correctamente',
      steps: [],
      userFeedback: 'Lo siento, no pude entender tu comando. ¿Podrías repetirlo?',
      expectedDuration: '0s'
    };
  }

  // Si solo hay 1 resultado exitoso, usarlo directamente
  if (successfulResults.length === 1) {
    return successfulResults[0].planData;
  }

  // ESTRATEGIA DE COMBINACIÓN:
  // 1. Usar el plan del modelo con mayor peso que tenga éxito
  // 2. Validar consistencia entre modelos
  // 3. Combinar feedback si hay consenso

  // Ordenar por peso descendente
  successfulResults.sort((a, b) => b.weight - a.weight);

  const primaryPlan = successfulResults[0].planData;
  const secondaryPlans = successfulResults.slice(1);

  // Validar consistencia: ¿Los modelos están de acuerdo en la cantidad de pasos?
  const stepCounts = successfulResults.map(r => r.planData.steps?.length || 0);
  const avgSteps = stepCounts.reduce((sum, count) => sum + count, 0) / stepCounts.length;
  const isConsistent = stepCounts.every(count => Math.abs(count - avgSteps) <= 2);

  if (!isConsistent) {
    console.warn('[Ensemble] ⚠️  Inconsistencia detectada entre modelos');
    console.warn(`[Ensemble] Steps por modelo: ${stepCounts.join(', ')}`);
  }

  // Combinar userFeedback si hay consenso
  const feedbacks = successfulResults.map(r => r.planData.userFeedback);
  const mostCommonFeedback = findMostCommon(feedbacks);

  // Si hay consenso (>50% coinciden), usar ese feedback
  const feedbackConsensus = feedbacks.filter(f => f === mostCommonFeedback).length / feedbacks.length;
  if (feedbackConsensus >= 0.5) {
    primaryPlan.userFeedback = mostCommonFeedback;
  }

  // Agregar warning si hay baja consistencia
  if (!isConsistent) {
    primaryPlan.userFeedback += ' (Comando complejo, verifica el resultado)';
  }

  return primaryPlan;
}

/**
 * Encuentra el elemento más común en un array
 */
function findMostCommon(arr) {
  const frequency = {};
  let maxCount = 0;
  let mostCommon = arr[0];

  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxCount) {
      maxCount = frequency[item];
      mostCommon = item;
    }
  });

  return mostCommon;
}
