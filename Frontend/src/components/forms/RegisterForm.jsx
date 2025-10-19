import CloseIcon from "@mui/icons-material/Close";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithoutBorders.png";

export default function RegisterForm({ isOpen, onClose }) {
  if (!isOpen) return null; // ✅ esto hace que desaparezca el modal cuando se cierre

  return (
    <div
      className="fixed inset-0 z-50 flex"
    >
      {/* Fondo difuminado */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Panel izquierdo */}
      <div className="relative z-10 bg-white w-[58%] h-full flex flex-col items-center justify-center px-10 py-6 shadow-2xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8B3A3A] hover:scale-110 transition-transform"
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </button>

        {/* Contenedor centrado */}
        <div className="w-full max-w-md flex flex-col items-center text-center justify-center -mt-16">
          {/* Logo */}
          <img
            src={imgLogoFamiglia}
            alt="Panadería Famiglia"
            className="w-56 -mb-6"
          />

          {/* Título */}
          <h2 className="text-3xl font-semibold text-[#8B3A3A] mb-8">
            ¡Qué bueno verte aquí!
          </h2>

          {/* Formulario */}
          <form className="flex flex-col gap-5 w-full text-left">
            <div>
              <label className="block text-[#8B3A3A] text-base font-medium mb-2">
                Correo Electrónico:
              </label>
              <input
                type="email"
                className="w-full border border-[#E3AFAF] rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#E3AFAF]"
                placeholder="Ej. maria@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#8B3A3A] text-base font-medium mb-2">
                Contraseña:
              </label>
              <input
                type="password"
                className="w-full border border-[#E3AFAF] rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#E3AFAF]"
                placeholder="********"
                required
              />
            </div>

            {/* Política de privacidad */}
            <div className="flex items-center gap-3 text-sm text-[#5A3A29] leading-snug">
              <input
                type="checkbox"
                required
                className="accent-[#E3AFAF] w-4 h-4"
              />
              <p>
                Estoy de acuerdo con la{" "}
                <a href="#" className="underline text-[#8B3A3A]">
                  política de privacidad
                </a>
                .
              </p>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-[#EACCCC] text-[#5A3A29] font-semibold py-3 rounded-md hover:bg-[#E3AFAF] transition-colors mt-2"
            >
              CREAR CUENTA
            </button>
          </form>

          {/* Enlace inferior */}
          <p className="text-sm text-[#5A3A29] mt-5 mb-2">
            ¿Ya tienes una cuenta?{" "}
            <button
              type="button"
              onClick={onClose}
              className="text-[#8B3A3A] font-medium hover:underline"
            >
              Ingresa aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
