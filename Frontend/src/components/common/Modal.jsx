import React, { useEffect } from 'react';
import { IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Modal genérico reutilizable
const Modal = ({ isOpen, onClose, title, children }) => {
  // Cerrar modal con la tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Fondo con solo desenfoque (sin color visible) */}
      <div
        className="fixed inset-0 backdrop-blur-[6px] transition-all duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del modal */}
      <div className="relative bg-white rounded-lg shadow-xl border-2 border-[#b17b6b] max-w-md w-full mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto font-['Montserrat']">
        {/* Botón de cierre */}
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

        {/* Título */}
        {title && (
          <h2 className="text-2xl font-bold text-[#6b2c2c] mb-4">{title}</h2>
        )}

        {/* Contenido */}
        <div className="text-sm text-[#4a2b2b] leading-relaxed">{children}</div>

        {/* Botón de aceptar */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              backgroundColor: '#8b3e3e',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 4,
              '&:hover': { backgroundColor: '#742f2f' },
            }}
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---- Modal de Términos y Condiciones ----
export const ModalTerminos = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Términos y Condiciones">
    <p>
      Bienvenido a <strong>Pastelería Famiglia</strong>. Al realizar una compra en
      nuestro sitio web, usted acepta los siguientes términos:
    </p>
    <ul className="list-disc pl-5 mt-3 space-y-2">
      <li>Todos los precios incluyen impuestos y pueden variar sin previo aviso.</li>
      <li>Los pedidos deben realizarse con al menos 24 horas de anticipación para productos personalizados.</li>
      <li>Los pagos se procesan de manera segura a través de nuestras pasarelas autorizadas.</li>
      <li>No se aceptan devoluciones en productos alimenticios una vez entregados, salvo en casos de error comprobable por parte de la empresa.</li>
      <li>Pastelería Famiglia se reserva el derecho de cancelar pedidos en caso de fraude o información incorrecta.</li>
    </ul>
    <p className="mt-4">
      Gracias por confiar en nosotros. Nos esforzamos por ofrecerle siempre
      productos frescos y de la más alta calidad.
    </p>
  </Modal>
);

// ---- Modal de Política de Privacidad ----
export const ModalPrivacidad = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Política de Privacidad">
    <p>
      En <strong>Pastelería Famiglia</strong>, respetamos su privacidad y protegemos su información personal de acuerdo con la normativa vigente.
    </p>
    <ul className="list-disc pl-5 mt-3 space-y-2">
      <li>Recopilamos datos como nombre, correo electrónico, teléfono y dirección únicamente para procesar pedidos y mejorar nuestro servicio.</li>
      <li>No compartimos su información con terceros, excepto con servicios necesarios para el procesamiento del pago o la entrega.</li>
      <li>Puede solicitar la eliminación de sus datos personales en cualquier momento enviando un correo a <strong>soporte@famiglia.pe</strong>.</li>
      <li>Utilizamos cookies para mejorar su experiencia de navegación y ofrecerle contenido personalizado.</li>
      <li>Su información es almacenada de forma segura y cifrada.</li>
    </ul>
    <p className="mt-4">
      Al usar nuestra tienda en línea, usted acepta esta política y nos autoriza a utilizar sus datos de acuerdo con ella.
    </p>
  </Modal>
);

export default Modal;
