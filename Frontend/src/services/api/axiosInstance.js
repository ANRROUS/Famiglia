import axios from 'axios';

// Instancia Axios con soporte para cookies HTTPOnly
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30seg
  withCredentials: true, // ✅ Habilitar cookies (HTTPOnly)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuesta para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Solo redirigir si NO es la petición de verificación de perfil
      const isProfileCheck = error.config?.url?.includes('/auth/perfil');
      
      switch (error.response.status) {
        case 401:
        case 403:
          // Solo redirigir si NO es el chequeo inicial de autenticación
          if (!isProfileCheck) {
            console.error('No autenticado');
          }
          break;
        case 500:
          console.error('Error del servidor');
          break;
        default:
          console.error('Error en la petición:', error.response.data);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;