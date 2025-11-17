/**
 * ============================================
 * TEMPLATE: INTEGRACIÓN DE VOZ EN PÁGINAS
 * ============================================
 * 
 * Este template muestra cómo integrar el sistema de voz "Pernity"
 * en cualquier página de la aplicación.
 * 
 * PASOS:
 * 1. Importar useVoice desde VoiceContext
 * 2. Extraer speak, registerCommands, unregisterCommands
 * 3. Definir comandos en useEffect
 * 4. Registrar comandos al montar
 * 5. Limpiar comandos al desmontar
 * 
 * FECHA: Noviembre 2025
 * VERSIÓN: 1.0
 */

import { useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';

const MiPagina = () => {
  // ============================================
  // 1. IMPORTAR HOOK DE VOZ
  // ============================================
  const { speak, registerCommands, unregisterCommands } = useVoice();

  // ============================================
  // 2. TUS FUNCIONES/HANDLERS EXISTENTES
  // ============================================
  const handleMiAccion = () => {
    console.log('Acción ejecutada');
  };

  const handleOtraAccion = (parametro) => {
    console.log('Acción con parámetro:', parametro);
  };

  // ============================================
  // 3. DEFINIR COMANDOS DE VOZ
  // ============================================
  useEffect(() => {
    const voiceCommands = {
      // ----------------------------------------
      // COMANDOS EXACTOS (sin parámetros)
      // ----------------------------------------
      'mi comando': () => {
        handleMiAccion();
        speak('Ejecutando mi comando');
      },

      'otro comando': () => {
        speak('Comando ejecutado correctamente');
      },

      // ----------------------------------------
      // COMANDOS CON PARÁMETROS
      // Usa (.+) para capturar cualquier texto
      // ----------------------------------------
      'buscar (.+)': (query) => {
        handleOtraAccion(query);
        speak(`Buscando ${query}`);
      },

      'filtrar por (.+)': (categoria) => {
        // Lógica de filtrado
        speak(`Filtrando por ${categoria}`);
      },

      // ----------------------------------------
      // COMANDOS CONDICIONALES
      // ----------------------------------------
      'acción especial': () => {
        if (algunaCondicion) {
          speak('Acción especial ejecutada');
        } else {
          speak('No se puede ejecutar esta acción ahora');
        }
      },

      // ----------------------------------------
      // COMANDOS DE NAVEGACIÓN
      // ----------------------------------------
      'ir al catálogo': () => {
        navigate('/carta');
        speak('Yendo al catálogo');
      },

      'volver': () => {
        navigate(-1);
        speak('Volviendo atrás');
      },
    };

    // ----------------------------------------
    // 4. REGISTRAR COMANDOS
    // ----------------------------------------
    registerCommands(voiceCommands);
    console.log('[MiPagina] ✅ Comandos de voz registrados:', Object.keys(voiceCommands).length);

    // ----------------------------------------
    // 5. CLEANUP: ELIMINAR COMANDOS AL DESMONTAR
    // ----------------------------------------
    return () => {
      unregisterCommands();
      console.log('[MiPagina] 🗑️ Comandos de voz eliminados');
    };
  }, [
    // ----------------------------------------
    // DEPENDENCIAS IMPORTANTES:
    // - Funciones handlers
    // - Estados que usan los comandos
    // - speak, registerCommands, unregisterCommands
    // ----------------------------------------
    handleMiAccion,
    handleOtraAccion,
    speak,
    registerCommands,
    unregisterCommands,
  ]);

  return (
    <div>
      {/* Tu contenido aquí */}
    </div>
  );
};

export default MiPagina;
