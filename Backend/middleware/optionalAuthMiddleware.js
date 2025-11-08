import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware de autenticación OPCIONAL
 * Intenta autenticar al usuario, pero permite continuar si no hay token
 * Útil para funcionalidades que funcionan tanto con usuarios autenticados como anónimos
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    // Intentar obtener token de cookies o headers
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      // No hay token - usuario anónimo
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token válido - usuario autenticado
    req.user = decoded;
    req.isAuthenticated = true;
    next();

  } catch (error) {
    // Token inválido o expirado - tratar como usuario anónimo
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};
