import React from 'react';
import { VoiceButton } from '../components/voice/VoiceButton';

/**
 * Página de prueba para verificar el botón de voz
 */
export default function VoiceTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎤 Prueba del Botón de Voz
        </h1>

        <div className="space-y-8">
          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">📋 Instrucciones</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. El botón del micrófono debería aparecer abajo</li>
              <li>2. Abre la consola del navegador (F12)</li>
              <li>3. Busca logs que digan: [VoiceButton]</li>
              <li>4. Haz clic en el botón para probar</li>
            </ul>
          </div>

          {/* Tamaños diferentes */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Tamaño Small</p>
              <div className="flex justify-center">
                <VoiceButton size="small" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Tamaño Default</p>
              <div className="flex justify-center">
                <VoiceButton size="default" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Tamaño Large</p>
              <div className="flex justify-center">
                <VoiceButton size="large" />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="font-semibold text-green-900 mb-2">✅ Checklist</h2>
            <div className="text-sm text-green-800 space-y-1">
              <div>• ¿Ves 3 botones circulares arriba?</div>
              <div>• ¿Están en diferentes tamaños?</div>
              <div>• ¿Tienen el ícono de micrófono?</div>
              <div>• ¿Cambian de color al pasar el mouse?</div>
            </div>
          </div>

          {/* Información del navegador */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">🌐 Información del Navegador</h2>
            <div className="text-sm text-gray-700 space-y-1 font-mono">
              <div>Navegador: {navigator.userAgent.split(' ').pop()}</div>
              <div>
                Web Speech API: {' '}
                {('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) 
                  ? '✅ Soportado' 
                  : '❌ No soportado'}
              </div>
              <div>
                Speech Synthesis: {' '}
                {'speechSynthesis' in window 
                  ? '✅ Soportado' 
                  : '❌ No soportado'}
              </div>
            </div>
          </div>

          {/* Botón para volver */}
          <div className="text-center">
            <a 
              href="/"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Volver al Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
