import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithoutBorders.png";
import {
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
} from "../../redux/slices/authSlice";
import { authAPI } from "../../services/api";
import Modal from "../common/Modal";
import Terminos from "../../pages/TerminosPage";
import Privacidad from "../../pages/PrivacidadPage";

/**
 * Small tooltip-like box that mimics the native validation bubble visually.
 * - messages: string | string[]  (if array, shows each on its own line)
 */
function FieldTooltip({ messages }) {
  if (!messages) return null;
  const arr = Array.isArray(messages) ? messages : [messages];

  return (
    <div
      className="mt-2 inline-block text-left"
      // outer wrapper keeps layout consistent with your current red text styles
    >
      <div
        className="inline-block bg-red-100 border border-red-300 text-red-700 text-xs rounded-md px-3 py-2 shadow-md"
        style={{ maxWidth: "100%" }}
      >
        {arr.map((m, i) => (
          <div key={i} className="leading-tight" style={{ margin: 0 }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterForm({ isOpen, onClose, onSwitchToLogin }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // update form
    setFormData((prev) => ({ ...prev, [name]: value }));

    // if user types, clear field-specific errors for that field (so tooltip hides)
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    // Also clear global redux error if you want when editing
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    dispatch(clearError());

    if (!acceptedPolicy) {
      dispatch(registerFailure("Debes aceptar la política de privacidad y los términos."));
      return;
    }

    dispatch(registerStart());
    try {
      const response = await authAPI.register(formData);
      dispatch(registerSuccess());

      alert(response.data.message || "¡Registro exitoso! Ahora puedes iniciar sesión.");
      setFormData({ nombre: "", correo: "", contraseña: "" });
      setAcceptedPolicy(false);

      if (onSwitchToLogin) {
        onSwitchToLogin();
      } else {
        onClose();
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const message = data?.message || "Error al registrarse.";

      if (status === 400 && Array.isArray(data?.errors)) {
        // Agrupar errores por campo (array de mensajes por campo)
        const errorsByField = {};
        data.errors.forEach((e) => {
          if (!errorsByField[e.field]) errorsByField[e.field] = [e.message];
          else errorsByField[e.field].push(e.message);
        });

        // Guardamos errores por campo (esto hará que aparezcan las "ventanitas" debajo de cada input)
        setFieldErrors(errorsByField);

        // STOP loading state: dispatch failure with a friendly message (so button re-enable)
        dispatch(registerFailure(message || "Errores de validación"));
        return;
      }

      // Otros errores (500, etc.)
      dispatch(registerFailure(message));
    }
  };

  const handleClose = () => {
    dispatch(clearError());
    setFormData({ nombre: "", correo: "", contraseña: "" });
    setAcceptedPolicy(false);
    setFieldErrors({});
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="">
        <div className="flex flex-col items-center justify-center max-h-[80vh] overflow-hidden">
          <div className="w-full max-w-sm flex flex-col items-center text-center justify-center">
            <img src={imgLogoFamiglia} alt="Panadería Famiglia" className="w-32 -mb-2" />

            <h2 className="text-xl font-semibold text-[#8B3A3A] mb-3">¡Únete a Famiglia!</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full text-left">
              {/* NOMBRE */}
              <div>
                <label className="block text-[#8B3A3A] text-xs font-medium mb-0.5">
                  Nombre de Usuario:
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full border ${fieldErrors.nombre ? "border-red-400" : "border-[#E3AFAF]"} rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3AFAF]`}
                  placeholder="Ej. María García"
                  required
                />
                {/* tooltip-like */}
                {fieldErrors.nombre && (
                  <div className="mt-1">
                    <FieldTooltip messages={fieldErrors.nombre} />
                  </div>
                )}
              </div>

              {/* CORREO */}
              <div>
                <label className="block text-[#8B3A3A] text-xs font-medium mb-0.5">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`w-full border ${fieldErrors.correo ? "border-red-400" : "border-[#E3AFAF]"} rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3AFAF]`}
                  placeholder="Ej. maria@gmail.com"
                  required
                />
                {fieldErrors.correo && (
                  <div className="mt-1">
                    <FieldTooltip messages={fieldErrors.correo} />
                  </div>
                )}
              </div>

              {/* CONTRASEÑA */}
              <div>
                <label className="block text-[#8B3A3A] text-xs font-medium mb-0.5">
                  Contraseña:
                </label>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  className={`w-full border ${fieldErrors.contraseña ? "border-red-400" : "border-[#E3AFAF]"} rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#E3AFAF]`}
                  placeholder="********"
                  required
                  minLength={6}
                />
                {fieldErrors.contraseña && (
                  <div className="mt-1">
                    {/* mostramos todos los mensajes pero en UNA sola cajita (como pediste) */}
                    <FieldTooltip messages={fieldErrors.contraseña} />
                  </div>
                )}
              </div>

              {/* POLÍTICA DE PRIVACIDAD */}
              <div className="flex items-center gap-3 text-sm text-[#5A3A29] leading-snug">
                <input
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(e) => setAcceptedPolicy(e.target.checked)}
                  required
                  className="accent-[#E3AFAF] w-4 h-4 cursor-pointer"
                />
                <p className="text-xs leading-tight">
                  Estoy de acuerdo con la{" "}
                  <span onClick={() => setShowPrivacyModal(true)} className="underline text-[#8B3A3A] cursor-pointer hover:text-[#a55a5a]">
                    política de privacidad
                  </span>{" "}
                  y con los{" "}
                  <span onClick={() => setShowTermsModal(true)} className="underline text-[#8B3A3A] cursor-pointer hover:text-[#a55a5a]">
                    términos y condiciones
                  </span>.
                </p>
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#EACCCC] text-[#5A3A29] font-semibold py-2 rounded-md text-sm hover:bg-[#E3AFAF] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
              </button>
            </form>

            {/* ENLACE LOGIN */}
            <p className="text-xs text-[#5A3A29] mt-3 mb-1">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  if (onSwitchToLogin) onSwitchToLogin();
                }}
                className="text-[#8B3A3A] font-medium hover:underline"
              >
                Ingresa aquí
              </button>
            </p>
          </div>
        </div>
      </Modal>

      {/* MODALS */}
      {showPrivacyModal && (
        <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)}>
          <Privacidad />
        </Modal>
      )}

      {showTermsModal && (
        <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)}>
          <Terminos />
        </Modal>
      )}
    </>
  );
}
