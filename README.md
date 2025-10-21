# Famiglia - Panadería y Pastelería

Sistema de gestión para panadería con autenticación, carrito de compras y recomendaciones personalizadas con IA.

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

## 📦 Tecnologías

- **Frontend:** React, Redux Toolkit, Tailwind CSS, Material-UI
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Auth:** JWT con cookies HTTPOnly
- **IA:** Google Gemini AI