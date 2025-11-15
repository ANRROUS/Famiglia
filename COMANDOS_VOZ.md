# 🎤 Comandos de Voz - Famiglia

Guía completa de todos los comandos de voz soportados por el sistema de navegación inteligente de Famiglia.

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │ VoiceAvatar     │────▶│  VoiceContext    │                   │
│  │ (UI Component)  │     │  (Global State)  │                   │
│  └─────────────────┘     └──────────────────┘                   │
│           │                        │                            │
│           ▼                        ▼                            │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │useVoiceRecog    │     │transcription     │                   │
│  │(Web Speech API) │────▶│Corrector         │                   │
│  └─────────────────┘     │(280+ corrections)│                   │
│                          └──────────────────┘                   │
│                                   │                             │
└───────────────────────────────────┼─────────────────────────────┘
                                    │ HTTP POST
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │voiceController  │────▶│selectorHelper    │                   │
│  │(REST Endpoint)  │     │(Intent Detection)│                   │
│  └─────────────────┘     └──────────────────┘                   │
│           │                        │                            │
│           │                        ▼                            │
│           │          ┌─────────────────────────┐                │
│           │          │ ¿Simple Navigation?     │                │
│           │          └─────────────────────────┘                │
│           │                  │            │                     │
│           │         YES ◄────┘            └────▶ NO             │
│           │          │                          │               │
│           ▼          ▼                          ▼               │
│  ┌─────────────────────────┐     ┌──────────────────┐           │
│  │MCP Orchestrator         │     │voiceGeminiService│           │
│  │(Direct Execution)       │     │(AI Processing)   │           │
│  └─────────────────────────┘     └──────────────────┘           │
│           │                                │                    │
│           └────────────────┬───────────────┘                    │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │ MCP Protocol
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MCP PLAYWRIGHT SERVER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌──────────────────┐                   │
│  │Playwright CDP   │────▶│ Browser Actions  │                   │
│  │(Chrome DevTools)│     │ (26 Tools)       │                   │
│  └─────────────────┘     └──────────────────┘                   │
│                                   │                             │
│  Tools: click, navigate, type, scroll, wait, screenshot, etc.   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  USER'S BROWSER  │
                    │  (localhost:5173)│
                    └──────────────────┘
```

### Tecnologías Utilizadas

**Frontend:**
- React 19.1 + Vite
- Web Speech API (reconocimiento de voz)
- Framer Motion (animaciones)
- Lottie (avatar animado)
- Tailwind CSS (estilos)

**Backend:**
- Node.js + Express
- Google Gemini 2.0 Flash (IA)
- Winston (logging)
- Prisma (base de datos)

**Automatización:**
- Playwright (control del navegador)
- Chrome DevTools Protocol (CDP)
- Model Context Protocol (MCP)

---

## ⚙️ Cómo Funciona

### 1. **Captura de Voz (Frontend)**

El usuario activa el sistema con:
- **Click en avatar**: Botón flotante en esquina inferior derecha
- **Atajo de teclado**: `Ctrl + Shift + V`

```javascript
// useVoiceRecognition.js
recognition.start()
recognition.maxAlternatives = 5  // Captura 5 posibles transcripciones
```

El sistema captura:
- 🎤 **Transcripción principal** (mayor confianza)
- 🎯 **4 alternativas** (análisis de corrección)
- 📸 **Screenshot de la página** (contexto visual)

### 2. **Corrección de Transcripción (Frontend)**

Antes de enviar al backend, se corrige la transcripción:

```javascript
// transcriptionCorrector.js - 687 líneas
• 280+ correcciones de diccionario (palabras específicas)
• 24 patrones regex (casos complejos)
• Análisis de 5 alternativas (mejor coincidencia)
• Scoring contextual por página (14 contextos)
```

**Ejemplos de correcciones:**
- "quiénes somos" ✅ (de "quién estamos", "quiénes estamos")
- "carrito" ✅ (de "carito", "cabrito")
- "maracuyá" ✅ (de "maraculla", "maracuya")

### 3. **Detección de Intención (Backend)**

El backend analiza el comando corregido:

```javascript
// selectorHelper.js - detectIntent()
const intent = detectIntent(transcript);

if (intent === 'goToCatalog') {
  // Ejecución directa SIN Gemini ⚡
  executeToolDirectly('navigate', { url: '/carta' });
}
```

**Intenciones simples** (ejecución directa):
- Navegación: `goToHome`, `goToCatalog`, `goToCart`, `goToProfile`
- Autenticación: `login`, `register`, `logout`
- Info: `goToAbout`, `goToTerms`, `goToPrivacy`

**Ventaja**: Respuesta instantánea (~200ms) sin consumir cuota de IA

### 4. **Procesamiento con IA (Comandos Complejos)**

Para comandos complejos, se usa Gemini:

```javascript
// voiceGeminiService.js
const plan = await gemini.sendMessage({
  transcript: "busca torta de chocolate y agrégala al carrito",
  context: { page: '/carta', isAuthenticated: true },
  screenshot: base64Image
});
```

**Gemini genera un plan de acciones:**
```json
{
  "reasoning": "Buscar producto y agregarlo al carrito",
  "steps": [
    {
      "tool": "type",
      "params": { "selector": "input#search", "text": "torta de chocolate" },
      "reason": "Buscar el producto"
    },
    {
      "tool": "click",
      "params": { "selector": "button[aria-label='Agregar al carrito']" },
      "reason": "Agregar primer resultado"
    }
  ],
  "userFeedback": "Agregando torta de chocolate al carrito"
}
```

### 5. **Ejecución de Acciones (MCP Orchestrator)**

El orquestador ejecuta cada paso:

```javascript
// mcpOrchestratorService.js
for (const step of steps) {
  const result = await executeStepWithRetry(async () => {
    return await mcpClient.callTool({
      name: step.tool,
      arguments: step.params
    });
  }, maxRetries: 3);
}
```

**Características:**
- ✅ **Retry logic**: 3 intentos con backoff exponencial
- ✅ **Error handling**: Captura y reporta fallos
- ✅ **Logging**: Winston registra cada acción
- ✅ **Timeout**: 30 segundos máximo por comando

### 6. **Interacción con el Navegador (MCP Playwright)**

El servidor MCP ejecuta acciones reales:

```javascript
// playwright-server.js
await page.click(selector);           // Hacer click
await page.type(selector, text);      // Escribir texto
await page.goto(url);                 // Navegar
await page.screenshot();              // Capturar pantalla
await page.evaluate(() => { ... });   // Ejecutar JavaScript
```

**26 herramientas disponibles:**
- `navigate`, `click`, `type`, `scroll`, `wait`
- `getPageElements`, `screenshot`, `getCurrentUrl`
- `filterByPrice`, `sortBy`, `addToCart`
- Y más...

### 7. **Respuesta al Usuario (Frontend)**

El frontend muestra:
- ✅ **Feedback visual**: Panel con transcripción y respuesta
- 🎨 **Avatar animado**: Cambia de color según estado
- 📢 **Texto hablado**: (opcional) Text-to-Speech
- 📊 **Logs en consola**: Para debugging

---

## 🔄 Flujo de Procesamiento

### Flujo Completo: "busca torta de chocolate"

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CAPTURA DE VOZ (Frontend)                                    │
└─────────────────────────────────────────────────────────────────┘
    Usuario dice: "busca torta de chocolate"
    │
    ├─ Web Speech API captura audio
    ├─ Genera 5 transcripciones alternativas:
    │   1. "busca torta de chocolate" (94.8%)
    │   2. "busca tortas de chocolate" (0.0%)
    │   3. "buscar torta de chocolate" (0.0%)
    │   4. "busca torta de chocolates" (0.0%)
    │   5. "busca torta the chocolate" (0.0%)
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CORRECCIÓN (Frontend)                                        │
└─────────────────────────────────────────────────────────────────┘
    transcriptionCorrector.js analiza las 5 alternativas
    │
    ├─ Aplica 280+ correcciones de diccionario
    ├─ Aplica 24 patrones regex
    ├─ Calcula score contextual (página: /carta)
    │
    ▼ Transcripción corregida: "busca torta de chocolate" ✅
    │
┌─────────────────────────────────────────────────────────────────┐
│ 3. ENVÍO AL BACKEND                                             │
└─────────────────────────────────────────────────────────────────┘
    POST /api/voice/process
    {
      transcript: "busca torta de chocolate",
      context: { page: '/carta', currentUrl: '...' },
      screenshot: "data:image/png;base64,..."
    }
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. DETECCIÓN DE INTENCIÓN (Backend)                            │
└─────────────────────────────────────────────────────────────────┘
    selectorHelper.detectIntent("busca torta de chocolate")
    │
    ├─ Detecta: "search" (comando complejo)
    ├─ No es navegación simple
    │
    ▼ Requiere procesamiento con Gemini
    │
┌─────────────────────────────────────────────────────────────────┐
│ 5. PROCESAMIENTO CON IA (Backend)                              │
└─────────────────────────────────────────────────────────────────┘
    voiceGeminiService.interpretVoiceWithGemini()
    │
    ├─ Envía a Gemini 2.0 Flash:
    │   • Transcript: "busca torta de chocolate"
    │   • Context: { page: '/carta', ... }
    │   • Screenshot: base64Image
    │
    ├─ Gemini analiza y genera plan:
    │   {
    │     reasoning: "Buscar producto en catálogo",
    │     steps: [
    │       { tool: "type", params: {...}, reason: "..." },
    │       { tool: "wait", params: {...}, reason: "..." }
    │     ],
    │     userFeedback: "Buscando torta de chocolate..."
    │   }
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. ORQUESTACIÓN (Backend)                                       │
└─────────────────────────────────────────────────────────────────┘
    mcpOrchestratorService.executeMCPPlan(steps)
    │
    ├─ Step 1: type en input de búsqueda
    │   ├─ Intento 1... ✅ Success (250ms)
    │   └─ Log: "Step 1/2 completado"
    │
    ├─ Step 2: wait para resultados
    │   ├─ Intento 1... ✅ Success (800ms)
    │   └─ Log: "Step 2/2 completado"
    │
    ▼ Resultado: { success: true, stepsCompleted: 2, stepsFailed: 0 }
    │
┌─────────────────────────────────────────────────────────────────┐
│ 7. EJECUCIÓN EN NAVEGADOR (MCP Playwright)                     │
└─────────────────────────────────────────────────────────────────┘
    Playwright conectado via CDP (localhost:9222)
    │
    ├─ await page.type('#search-input', 'torta de chocolate')
    ├─ await page.waitForSelector('.product-card', { timeout: 3000 })
    │
    ▼ Usuario ve resultados en su navegador
    │
┌─────────────────────────────────────────────────────────────────┐
│ 8. RESPUESTA AL USUARIO (Frontend)                             │
└─────────────────────────────────────────────────────────────────┘
    VoiceContext recibe respuesta
    │
    ├─ Muestra panel de feedback:
    │   • "🎤 TÚ: busca torta de chocolate"
    │   • "� RESPUESTA: Encontré productos con 'torta de chocolate'"
    │
    ├─ Avatar cambia a estado SUCCESS (verde)
    ├─ Auto-cierra después de 5 segundos
    │
    ▼ Usuario continúa navegando

```

### Flujo Optimizado: "navega a la carta"

```
┌─────────────────────────────────────────────────────────────────┐
│ RUTA RÁPIDA (Sin Gemini)                                        │
└─────────────────────────────────────────────────────────────────┘
    1. Captura: "navega a la carta"
    2. Corrección: ✅ (ya está bien)
    3. Detección: intent = 'goToCatalog'
    4. Ejecución directa: navigate({ url: '/carta' })
    5. Respuesta: "Te muestro nuestro catálogo"
    
    Sin consumo de cuota de IA
```

---

## 🛡️ Mejoras y Recomendaciones

### ✅ Mejoras Implementadas

#### 1. **Sistema de Retry con Backoff Exponencial**
```javascript
// mcpOrchestratorService.js
maxRetries: 3
baseDelay: 500ms
delays: 500ms → 1000ms → 2000ms
```
**Beneficio**: Maneja errores temporales de red/navegador

#### 2. **Corrección Inteligente de Transcripciones**
```javascript
// 280+ correcciones + 24 regex + 5 alternativas
Score contextual por página
```
**Beneficio**: 95% de precisión en comandos

#### 3. **Detección de Intenciones (Fast Path)**
```javascript
// Comandos simples sin IA
Respuesta: 200ms vs 1500ms
```
**Beneficio**: Ahorra cuota de API (50 comandos/día)

#### 4. **Caché de Respuestas de Gemini**
```javascript
// geminiCacheService.js
TTL: 5 minutos por comando
```
**Beneficio**: Comandos repetidos son instantáneos

#### 5. **Timeout de 30 Segundos**
```javascript
// voiceController.js
Promise.race([command, timeout])
```
**Beneficio**: Evita comandos colgados

#### 6. **Logging Estructurado**
```javascript
// Winston logs
combined.log, error.log, voice-commands.log
```
**Beneficio**: Debugging y auditoría

### Mejoras Recomendadas para Producción

#### 1. **Fallback a Comando Local si Gemini Falla**
```javascript
if (geminiError && isSimpleCommand) {
  return fallbackToLocalIntent(transcript);
}
```
**Beneficio**: Sistema más robusto, menos dependencia de API externa

#### 2. **Rate Limiting en Frontend**
```javascript
const rateLimiter = {
  maxCommandsPerMinute: 10,
  cooldown: 2000ms
};
```
**Beneficio**: Evita spam de comandos, protege cuota de API

#### 3. **Confirmación para Acciones Críticas**
```javascript
if (isDestructive || isPurchase) {
  await askConfirmation("¿Confirmas esta acción?");
}
```
**Beneficio**: Evita acciones accidentales (eliminar carrito, confirmar pago)

#### 4. **Caché Persistente (Redis)**
```javascript
// En lugar de in-memory
redis.set(`voice:${hash}`, result, 'EX', 300);
```
**Beneficio**: Caché sobrevive reinicios del servidor

#### 5. **Feedback de Progreso para Comandos Lentos**
```javascript
if (duration > 2000ms) {
  showProgressFeedback("Procesando tu solicitud...");
}
```
**Beneficio**: Usuario sabe que el sistema está trabajando

#### 6. **Análisis de Sentimiento del Usuario**
```javascript
if (transcript.includes('no funciona') || transcript.includes('error')) {
  logUserFrustration();
  offerHelp();
}
```
**Beneficio**: Detecta problemas de UX, ofrece ayuda proactiva

#### 7. **Modo Offline (Service Worker)**
```javascript
if (!navigator.onLine) {
  queueCommandForLater(transcript);
  showOfflineMessage();
}
```
**Beneficio**: Comandos se ejecutan cuando vuelve la conexión

#### 8. **Validación de Contexto Antes de Ejecutar**
```javascript
if (command === 'addToCart' && !isAuthenticated) {
  return { error: "Debes iniciar sesión primero" };
}
```
**Beneficio**: Mensajes de error más claros, evita fallos

#### 9. **Telemetría y Métricas**
```javascript
trackVoiceCommand({
  command: transcript,
  success: result.success,
  duration: duration,
  intent: detectedIntent,
  userId: user?.id
});
```
**Beneficio**: Analizar patrones de uso, optimizar comandos populares

#### 10. **Multi-idioma**
```javascript
const language = detectLanguage(transcript);
recognition.lang = language; // 'es-ES', 'en-US', 'pt-BR'
```
**Beneficio**: Expandir a otros mercados

#### 11. **Comando de Ayuda Contextual**
```javascript
if (transcript.includes('ayuda') || transcript.includes('qué puedo decir')) {
  return getSuggestionsForCurrentPage(context.page);
}
```
**Beneficio**: Usuarios descubren comandos disponibles

#### 12. **Historial de Comandos**
```javascript
const recentCommands = localStorage.getItem('voice:history');
// Mostrar últimos 5 comandos en panel
```
**Beneficio**: Usuario puede repetir comandos anteriores

### 🔒 Seguridad y Privacidad

#### 1. **Sanitización de Entrada**
```javascript
const sanitized = transcript
  .replace(/<script>/gi, '')
  .replace(/[^\w\sáéíóúñ]/gi, '');
```
**Beneficio**: Prevenir inyección de código

#### 2. **Rate Limiting en Backend**
```javascript
app.use('/api/voice', rateLimit({
  windowMs: 60000, // 1 minuto
  max: 20 // máximo 20 comandos
}));
```
**Beneficio**: Prevenir abuso de API

#### 3. **Validación de Autenticación**
```javascript
if (requiresAuth(intent) && !req.user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```
**Beneficio**: Proteger endpoints sensibles

#### 4. **Logging de Auditoría**
```javascript
logAuditoria({
  usuario: req.user?.id,
  accion: 'VOICE_COMMAND',
  detalles: { transcript, intent, success }
});
```
**Beneficio**: Trazabilidad completa, cumplimiento legal

### 📊 Monitoreo y Alertas

#### 1. **Alertas de Cuota de Gemini**
```javascript
if (remainingQuota < 10) {
  notifyAdmin('Cuota de Gemini casi agotada');
}
```

#### 2. **Monitoreo de Tasa de Errores**
```javascript
if (errorRate > 15%) {
  alertOps('Alta tasa de errores en comandos de voz');
}
```

#### 3. **Dashboard de Métricas**
```javascript
// Grafana/Prometheus
- Comandos por minuto
- Tasa de éxito/fallo
- Latencia promedio
- Top comandos usados
```

---

### Ir al Inicio
```
• "inicio"
• "home"
• "página principal"
• "volver al inicio"
• "ir al home"
• "página de inicio"
```

### Ir al Catálogo/Carta
```
• "catálogo"
• "carta"
• "menú"
• "productos"
• "ver productos"
• "mostrar productos"
• "qué tienen"
• "qué venden"
• "ir a la carta"
• "ir al catálogo"
• "ver carta"
• "ver menú"
```

### Ir a Delivery
```
• "delivery"
• "envío"
• "envíos"
• "domicilio"
• "cómo funciona el envío"
• "información de envío"
• "delivery información"
```

### Ir a Contacto
```
• "contacto"
• "contáctanos"
• "contactar"
• "formulario de contacto"
• "escribir"
• "enviar mensaje"
• "hablar con ustedes"
```

### Ir al Carrito
```
• "carrito"
• "mi carrito"
• "ver carrito"
• "ver mi carrito"
• "qué tengo en el carrito"
• "productos en carrito"
• "bolsa"
```

### Ir al Perfil
```
• "perfil"
• "mi perfil"
• "mi cuenta"
• "cuenta"
• "datos"
• "mis datos"
• "información personal"
```

---

## 🔍 Búsqueda de Productos

### Buscar Productos Específicos
```
• "busca [producto]"
• "buscar [producto]"
• "encuentra [producto]"
• "encontrar [producto]"
• "quiero [producto]"
• "dame [producto]"
• "muéstrame [producto]"
• "hay [producto]"
• "tienen [producto]"
```

**Ejemplos:**
- "busca torta" → Busca "torta"
- "quiero pan" → Busca "pan"
- "tienen donas" → Busca "donas"
- "muéstrame galletas" → Busca "galletas"
- "hay maracuyá" → Busca "maracuyá"
- "busca torta de chocolate" → Busca "torta de chocolate"

### Filtros y Ordenamiento
```
• "filtra por precio menor a [X]"
• "productos menores de [X] soles"
• "productos superiores a [X]"
• "más de [X] soles"
• "ordena por precio de menor a mayor"
• "ordena por más baratos"
• "muestra los productos más vendidos"
• "ordena por populares"
• "productos más caros primero"
```

---

## 🔐 Autenticación

### Iniciar Sesión
```
• "iniciar sesión"
• "login"
• "entrar"
• "ingresar"
• "acceder"
• "loguearse"
• "loguearme"
• "identificarme"
```

**Con credenciales:**
```
• "inicia sesión con [correo] y contraseña [contraseña]"
• "login con admin@test.com y contraseña 123456"
```

### Registrarse
```
• "registrarse"
• "registro"
• "crear cuenta"
• "nueva cuenta"
• "registrarme"
• "abrir cuenta"
• "hacerme usuario"
```

**Con datos:**
```
• "regístrate con [email], nombre [nombre], contraseña [contraseña]"
```

### Cerrar Sesión
```
• "cerrar sesión"
• "salir"
• "logout"
• "desconectarse"
• "desconectar"
• "cerrar mi cuenta"
```

---

## 🛒 Carrito de Compras

### Agregar al Carrito
```
• "agregar al carrito"
• "añadir al carrito"
• "agregar"
• "añadir"
• "comprar"
• "quiero comprar"
• "agrégalo"
• "añádelo"
• "ponlo en el carrito"
• "lo quiero"
• "me lo llevo"
```

### Aumentar Cantidad (Comandos Específicos)
```
• "aumenta un [producto] más"
• "pon más [producto]"
• "agrega uno más de [producto]"
• "aumenta la cantidad del [producto]"
• "incrementa [producto]"
```

**Ejemplos:**
- "aumenta un jugo surtido más"
- "pon más pan francés"
- "agrega uno más de dona"
- "aumenta la cantidad del primer producto"

### Disminuir Cantidad
```
• "quita una [producto]"
• "disminuye la [producto]"
• "reduce una [producto]"
• "quita del carrito"
```

**Ejemplos:**
- "quita una torta"
- "disminuye la dona"
- "reduce un chocolate"

### Eliminar del Carrito
```
• "elimina el [producto] del carrito"
• "quita el [producto]"
• "borra el [producto]"
• "elimina el segundo producto del carrito"
```

### Proceder al Pago
```
• "proceder al pago"
• "ir a pagar"
• "checkout"
• "pagar"
• "finalizar compra"
```

---

## 🍰 Catálogo y Productos

### Ver Productos
```
• "abre el primer producto"
• "ver detalles del primer producto"
• "muestra el segundo producto"
• "abre el producto [nombre]"
```

### Agregar desde Búsqueda
```
• "busca y agrega [producto] al carrito"
• "encuentra [producto] y añádelo"
```

**Ejemplo:**
- "busca y agrega torta de chocolate al carrito"

### Ver Categorías
```
• "muestra categoría [nombre]"
• "filtra por categoría [nombre]"
• "productos de [categoría]"
```

---

## 💳 Formularios y Pago

### Llenar Formulario de Pago
```
• "llena el formulario de pago con dirección [dirección]"
• "dirección [dirección]"
• "teléfono [número]"
• "referencia [texto]"
```

**Ejemplo:**
```
"llena el formulario de pago con dirección Av. Lima 123"
```

### Seleccionar Método de Pago
```
• "pagar con Yape"
• "pagar con tarjeta"
• "pagar en efectivo"
• "método de pago Yape"
• "selecciona Yape"
```

### Confirmar Pedido
```
• "confirma el pago"
• "finalizar compra"
• "confirmar pedido"
• "completar pago"
```

---

## 👤 Perfil de Usuario

### Acceder al Perfil
```
• "ve a mi perfil"
• "abre mi cuenta"
• "ir al perfil"
• "mi perfil"
```

### Actualizar Datos
```
• "actualiza mi email a [nuevo@email.com]"
• "cambia mi teléfono a [número]"
• "actualiza mi dirección"
```

### Cambiar Contraseña
```
• "cambia mi contraseña a [NuevaPass123]"
• "actualiza mi contraseña"
• "nueva contraseña [password]"
```

### Ver Pedidos
```
• "mis pedidos"
• "ver mis pedidos"
• "historial de compras"
• "pedidos anteriores"
```

---

## 🧪 Test de Preferencias

### Iniciar Test
```
• "comienza el test de preferencias"
• "iniciar test"
• "empezar test"
• "comenzar test de preferencias"
```

### Responder Preguntas
```
• "responde [opción]"
• "selecciona [opción]"
• "elige [opción]"
• "mi respuesta es [opción]"
```

**Ejemplos:**
- "responde dulce"
- "selecciona la primera opción"
- "elige salado"
- "mi respuesta es chocolate"

### Navegación del Test
```
• "siguiente pregunta"
• "avanza"
• "continuar"
• "siguiente"
• "vuelve atrás"
• "pregunta anterior"
• "regresar"
• "atrás"
```

### Finalizar Test
```
• "obtén la recomendación"
• "dame mi recomendación"
• "finalizar test"
• "terminar test"
• "obtener recomendación"
```

### Reiniciar Test
```
• "reinicia el test"
• "volver a empezar"
• "comenzar de nuevo"
• "reiniciar test"
• "empezar otra vez"
```

### Ver Catálogo Completo
```
• "ver catálogo completo"
• "ir al catálogo"
• "ver todos los productos"
```

---

## 📄 Información y Footer

### Quiénes Somos
```
• "quiénes somos"
• "sobre nosotros"
• "acerca de"
• "información"
• "quién es famiglia"
• "historia"
```

### Términos y Condiciones
```
• "términos"
• "términos y condiciones"
• "condiciones"
• "términos de uso"
• "política de uso"
```

### Política de Privacidad
```
• "privacidad"
• "política de privacidad"
• "datos personales"
• "protección de datos"
```

### Libro de Reclamaciones
```
• "reclamos"
• "reclamaciones"
• "libro de reclamaciones"
• "quejas"
• "reclamo"
• "queja"
• "abre el libro de reclamaciones"
```

### Ubicación
```
• "ubicación"
• "dónde están"
• "dónde están ubicados"
• "dirección"
```

---

## ⌨️ Atajos de Teclado

### Activar/Desactivar Voz
```
Ctrl + Shift + V
```
- Activa el reconocimiento de voz si está inactivo
- Cancela el comando si está escuchando o procesando

### Cerrar Panel de Feedback
```
Escape (Esc)
```
- Cierra el panel de respuestas del asistente

---

## 🎯 Comandos Contextuales

El sistema es inteligente y adapta los comandos según el contexto:

### En la Página de Inicio (/)
```
• "ir al catálogo"
• "ver productos"
• "buscar [producto]"
```

### En el Catálogo (/carta)
```
• "busca [producto]"
• "agrega al carrito"
• "muestra el primer producto"
• "ordena por precio"
```

### En el Carrito (/cart)
```
• "aumenta [producto]"
• "quita [producto]"
• "proceder al pago"
• "elimina del carrito"
```

### En Pago (/payment)
```
• "pagar con [método]"
• "dirección [dirección]"
• "confirmar pedido"
```

### En Test (/test)
```
• "responde [opción]"
• "siguiente"
• "obtener recomendación"
```

---

## 💡 Consejos de Uso

### ✅ Mejores Prácticas

1. **Habla claro y natural**: No necesitas usar palabras exactas, el sistema entiende variaciones
2. **Sé específico**: "aumenta un jugo surtido" es mejor que solo "aumenta"
3. **Usa nombres completos**: "torta de chocolate" en lugar de solo "torta"
4. **Contexto importa**: El sistema sabe en qué página estás

### ⚠️ Limitaciones

1. **Autenticación requerida**: Algunos comandos requieren estar logueado:
   - Agregar al carrito
   - Ver carrito
   - Realizar compras
   - Acceder al perfil

2. **Comandos secuenciales**: Espera a que termine un comando antes de dar el siguiente

3. **Navegador compatible**: Usa Chrome, Edge o Safari (Firefox tiene soporte limitado)

---

## 🔄 Estados del Sistema

### Visual del Avatar

El avatar cambia de color según el estado:

| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟢 **IDLE** | Gris | Esperando comando |
| 🔴 **LISTENING** | Rojo | Escuchando tu voz |
| 🔵 **PROCESSING** | Azul | Procesando comando |
| 🟣 **EXECUTING** | Púrpura | Ejecutando acciones |
| ❌ **ERROR** | Rojo oscuro | Error ocurrió |

### Feedback Visual

- **Anillos pulsantes**: Cuando está escuchando
- **Barras de audio**: Indicador de nivel de voz
- **Spinner rotatorio**: Durante procesamiento
- **Panel de respuestas**: Muestra tu comando y la respuesta del sistema

---

## 📊 Ejemplos Completos de Flujos

### Flujo 1: Buscar y Comprar
```
1. "busca torta de chocolate"
2. "agrega al carrito"
3. "ir al carrito"
4. "proceder al pago"
5. "pagar con Yape"
6. "confirmar pedido"
```

### Flujo 2: Test de Preferencias
```
1. "ir al test"
2. "comienza el test"
3. "responde dulce"
4. "siguiente"
5. "responde chocolate"
6. "siguiente"
7. "obtener recomendación"
```

### Flujo 3: Gestionar Carrito
```
1. "ir al carrito"
2. "aumenta un jugo más"
3. "quita una dona"
4. "elimina el tercer producto"
5. "proceder al pago"
```

### Flujo 4: Autenticación y Perfil
```
1. "iniciar sesión con user@test.com y contraseña 123456"
2. "ir a mi perfil"
3. "actualiza mi teléfono a 987654321"
4. "ver mis pedidos"
```

---

## 🆘 Resolución de Problemas

### No me escucha
- ✅ Verifica permisos del micrófono en el navegador
- ✅ Presiona Ctrl+Shift+V para activar
- ✅ Habla cerca del micrófono

### No entiende mi comando
- ✅ Habla más claro y despacio
- ✅ Usa comandos de la lista
- ✅ Verifica que estés en la página correcta

### Se queda procesando
- ✅ Espera unos segundos más
- ✅ Si persiste, presiona Ctrl+Shift+V para cancelar
- ✅ Verifica tu conexión a internet

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ **Chrome** (Recomendado)
- ✅ **Edge** (Recomendado)
- ✅ **Safari** (iOS/macOS)
- ⚠️ **Firefox** (Soporte limitado)
- ❌ **Internet Explorer** (No soportado)

### Dispositivos
- ✅ **Desktop** (150x150px avatar)
- ✅ **Mobile** (100x100px avatar)
- ✅ **Tablet** (Ajuste responsivo)

---

## 🎨 Personalización

### Tamaño del Avatar
- Desktop: 150x150 píxeles
- Mobile: 100x100 píxeles
- Posición: Esquina inferior derecha

### Panel de Feedback
- Desktop: Máximo 448px de ancho
- Mobile: Ancho completo con margen

---

## 📝 Notas Finales

- El sistema utiliza **Google Gemini AI** para procesamiento inteligente de lenguaje natural
- Las acciones se ejecutan mediante **Playwright MCP** para automatización real
- El reconocimiento de voz usa la **Web Speech API** del navegador
- Todos los comandos son procesados en español (es-ES)

---

**Versión:** 1.0  
**Última actualización:** Noviembre 8, 2025  
**Desarrollado por:** Famiglia Team

---

Para más información o soporte, visita la sección de [Contacto](#ir-a-contacto) o envía un mensaje a través del formulario.
