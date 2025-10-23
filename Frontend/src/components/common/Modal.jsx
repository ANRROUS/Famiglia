import React, { useEffect } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Modal genérico reutilizable
const Modal = ({ isOpen, onClose, title, children }) => {
  // Cerrar modal con la tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Fondo con desenfoque */}
      <div
        className="fixed inset-0 backdrop-blur-[6px] transition-all duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Contenedor del modal */}
      <div className="relative bg-white rounded-lg shadow-xl border-2 border-[#b17b6b] max-w-md w-full mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto font-['Montserrat']">
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#b17b6b',
            '&:hover': { color: '#6b2c2c' },
          }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>

        {title && <h2 className="text-2xl font-bold text-[#6b2c2c] mb-4">{title}</h2>}

        <div className="text-sm text-[#4a2b2b] leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
