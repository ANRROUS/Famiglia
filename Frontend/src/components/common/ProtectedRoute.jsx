import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useLoginModal } from '../../context/LoginModalContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { showLoginModal } = useLoginModal();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Guardamos la ruta a la que el usuario intentaba acceder
      showLoginModal(location.pathname);
    }
  }, [isAuthenticated, location.pathname, showLoginModal]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
