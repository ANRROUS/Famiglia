# Famiglia - Panadería y Pastelería


## 🚀 Configuración Inicial

### 1. Variables de Entorno

Después de clonar el repositorio, crea los archivos `.env` necesarios:

#### **Backend** (`Backend/.env`)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=famiglia-secret

# Email Configuration
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app
EMAIL_RECEIVER=tu_email@gmail.com

# Database URL (Prisma)
DATABASE_URL="tu_connection_string_postgresql"
DIRECT_URL="tu_direct_url_postgresql"
```

#### **Frontend** (`Frontend/.env`)
```env
# Backend API URL
VITE_API_URL=http://localhost:3000

# Gemini AI API Key
VITE_GEMINI_API_KEY=tu_api_key_de_google_gemini
```

### 2. Instalación

```bash
# Instalar dependencias del backend
cd Backend
npm install

# Instalar dependencias del frontend
cd ../Frontend
npm install
```

### 3. Ejecutar el proyecto

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`
El backend estará disponible en `http://localhost:3000`

##  Sistema de Navegación por Voz

El sistema incluye un avanzado módulo de reconocimiento de voz con corrección automática de transcripciones.

### Características del Sistema de Voz

- **280+ correcciones automáticas** en diccionario
- **24 patrones regex** para casos complejos
- **Análisis de 5 alternativas** por comando
- **Scoring contextual** según página actual
- **Audio feedback** con beeps (Web Audio API)
- **Historial navegable** con flechas ↑↓
- **Logs estructurados** con Winston
- **Screenshots optimizados** (30% escala, 500KB max)
- **Cache Gemini** con TTL de 5 minutos
- **Retry logic** con backoff exponencial

**Ejemplos rápidos:**

```bash
# Navegación
"Da click a inicio"
"Ve a carta"
"Abre quiénes somos"  # ✓ Corrige automáticamente "a quién estamos"

# Búsqueda y Filtros
"Busca tortas"
"Filtra dulces"
"Muéstrame panes"

# Carrito
"Agrega dos galletas"
"Elimina dona"
"Ve al carrito"

# Sesión
"Cierra sesión"
"Iniciar sesión"
```