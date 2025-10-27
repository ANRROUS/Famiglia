import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithoutBorders.png";
import { loginStart, loginSuccess, loginFailure, clearError } from "../../redux/slices/authSlice";
import { authAPI } from "../../services/api";

export default function LoginForm({ isOpen, onClose, onSwitchToRegister }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await authAPI.login(formData);
      dispatch(loginSuccess(response.data));
      
      // Limpiar formulario y cerrar modal
      setFormData({ correo: "", contraseña: "" });
      onClose();
      
      // Redirigir al home o perfil
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al iniciar sesión";
      dispatch(loginFailure(errorMessage));
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    setFormData({ correo: "", contraseña: "" });
    onClose();
  };

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Fondo difuminado */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Panel izquierdo */}
      <div className="relative z-10 bg-white w-[58%] h-full flex flex-col items-center justify-center px-10 py-6 shadow-2xl">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
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

          {/* Mensaje de error */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full text-left">
            <div>
              <label className="block text-[#8B3A3A] text-base font-medium mb-2">
                Correo Electrónico:
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
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
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className="w-full border border-[#E3AFAF] rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#E3AFAF]"
                placeholder="********"
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#EACCCC] text-[#5A3A29] font-semibold py-3 rounded-md hover:bg-[#E3AFAF] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
            </button>
          </form>

          {/* Enlace inferior */}
          <p className="text-sm text-[#5A3A29] mt-5 mb-2">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => {
                handleClose();
                if (onSwitchToRegister) onSwitchToRegister();
              }}
              className="text-[#8B3A3A] font-medium hover:underline"
            >
              Registrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}