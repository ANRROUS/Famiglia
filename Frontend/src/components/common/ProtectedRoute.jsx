import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useLoginModal } from '../../context/LoginModalContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children, allowedRoles = null, fallbackPath = '/' }) {
  const { isAuthenticated, isLoading, role } = useSelector((state) => state.auth);
  const { showLoginModal } = useLoginModal();
  const location = useLocation();

  useEffect(() => {
    // Solo mostrar modal si terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated) {
      // Guardamos la ruta a la que el usuario intentaba acceder
      showLoginModal(location.pathname);
    }
  }, [isLoading, isAuthenticated, location.pathname, showLoginModal]);

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no está autenticado después de verificar, redirigir
  if (!isAuthenticated) {
    // Obtener la última ruta segura registrada
    const lastSafePath = localStorage.getItem("lastSafePath") || "/";
    return <Navigate to={lastSafePath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || 'C')) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
