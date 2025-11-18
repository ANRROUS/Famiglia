import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { pagoAPI } from "../services/api";
import { useVoice } from "../context/VoiceContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";

// ---
// NOTA IMPORTANTE:
// He importado los logos basándome en la estructura de tu proyecto.
// Si Payment.jsx está en 'src/pages/', esta ruta debería ser correcta.
// Ajusta la ruta ('../') si es necesario.
// ---
import plinLogo from "../assets/images/img_plin_logo.png";
import yapeLogo from "../assets/images/img_yapeLogo.png";

// --- Paleta de Colores ---
const palette = {
  darkBrown: "#6B3730",
  rustRed: "#AF442F",
  brightRed: "#C94549",
  orange: "#EF9D58",
  lightPeach: "#EBBABC",
  white: "#FFFFFF",
};

const Payment = () => {
  const navigate = useNavigate();
  const { items, totalAmount, orderId } = useSelector((state) => state.cart);

  // Hook de voz
  const { speak, registerCommands, unregisterCommands, requireAuth } = useVoice();

  const [paymentMethod, setPaymentMethod] = useState("yape");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Si no hay items en el carrito, redirigir
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // Si no hay items, no renderizar el componente
  if (!items || items.length === 0) {
    return null;
  }

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^9\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handlePayment = async () => {
    const newErrors = {};

    // Validar número de teléfono
    if (!phoneNumber) {
      newErrors.phoneNumber = "El número de teléfono es requerido";
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = "Ingrese un número válido (9 dígitos, comenzando con 9)";
    }

    // Validar código de verificación
    if (!verificationCode) {
      newErrors.verificationCode = "El código de verificación es requerido";
    } else if (verificationCode.length < 4) {
      newErrors.verificationCode = "El código debe tener al menos 4 dígitos";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Llamar al backend para procesar el pago
      const response = await pagoAPI.procesarPago({
        medio: paymentMethod,
        numero: phoneNumber,
        cod_ver: verificationCode,
        envio: "pendiente",
      });

      console.log("Pago procesado exitosamente:", response.data);

      // Navegar a la página de confirmación
      navigate("/order-confirmation", {
        state: {
          orderDetails: response.data.pedido,
          paymentDetails: response.data.pago,
        },
      });
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      setApiError(
        error.response?.data?.error ||
          "Error al procesar el pago. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // COMANDOS DE VOZ ESPECÍFICOS DE PAGO
  // ============================================
  useEffect(() => {
    const voiceCommands = {
      // Seleccionar método de pago
      'seleccionar yape': () => {
        setPaymentMethod('yape');
        speak('Método de pago cambiado a Yape');
      },
      'seleccionar plin': () => {
        setPaymentMethod('plin');
        speak('Método de pago cambiado a Plin');
      },
      'pagar con yape': () => {
        setPaymentMethod('yape');
        speak('Método de pago cambiado a Yape');
      },
      'pagar con plin': () => {
        setPaymentMethod('plin');
        speak('Método de pago cambiado a Plin');
      },

      // Llenar teléfono (acepta número)
      'teléfono (.+)': (numero) => {
        // Limpiar el número (remover espacios, guiones, etc.)
        const cleanNumber = numero.replace(/\D/g, '');
        setPhoneNumber(cleanNumber);
        speak(`Número de teléfono ingresado: ${cleanNumber}`);
      },
      'número (.+)': (numero) => {
        const cleanNumber = numero.replace(/\D/g, '');
        setPhoneNumber(cleanNumber);
        speak(`Número de teléfono ingresado: ${cleanNumber}`);
      },

      // Llenar código de verificación
      'código (.+)': (codigo) => {
        const cleanCode = codigo.replace(/\D/g, '');
        setVerificationCode(cleanCode);
        speak(`Código de verificación ingresado: ${cleanCode}`);
      },
      'verificación (.+)': (codigo) => {
        const cleanCode = codigo.replace(/\D/g, '');
        setVerificationCode(cleanCode);
        speak(`Código de verificación ingresado: ${cleanCode}`);
      },

      // Confirmar pago (🔐 requiere autenticación)
      'confirmar pago': () => {
        if (isLoading) {
          speak('Ya se está procesando un pago');
          return;
        }
        requireAuth(
          () => {
            speak('Procesando pago');
            handlePayment();
          },
          'Debes iniciar sesión para confirmar el pago'
        );
      },
      'procesar pago': () => {
        if (isLoading) {
          speak('Ya se está procesando un pago');
          return;
        }
        requireAuth(
          () => {
            speak('Procesando pago');
            handlePayment();
          },
          'Debes iniciar sesión para procesar el pago'
        );
      },

      // Navegación
      'volver al carrito': () => {
        navigate('/cart');
        speak('Volviendo al carrito');
      },
      'cancelar': () => {
        navigate('/cart');
        speak('Pago cancelado, volviendo al carrito');
      },

      // Información
      'cuánto es el total': () => {
        speak(`El total a pagar es ${totalAmount.toFixed(2)} soles`);
      },
      'cuál es el total': () => {
        speak(`El total a pagar es ${totalAmount.toFixed(2)} soles`);
      },
      'cuál es el método seleccionado': () => {
        if (!paymentMethod) {
          speak('No has seleccionado un método de pago todavía');
          return;
        }
        const metodo = paymentMethod === 'yape' ? 'Yape' : 'Plin';
        speak(`El método seleccionado es ${metodo}`);
      },
      'qué método tengo': () => {
        if (!paymentMethod) {
          speak('No has seleccionado un método de pago');
          return;
        }
        const metodo = paymentMethod === 'yape' ? 'Yape' : 'Plin';
        speak(`Tienes seleccionado ${metodo}`);
      },

      // Validación de campos (NUEVO)
      'qué campos faltan': () => {
        const faltantes = [];
        if (!paymentMethod) faltantes.push('método de pago');
        if (!phoneNumber) faltantes.push('número de teléfono');
        if (!verificationCode) faltantes.push('código de verificación');
        
        if (faltantes.length === 0) {
          speak('Todos los campos están completos. Puedes confirmar el pago');
        } else {
          speak(`Faltan los siguientes campos: ${faltantes.join(', ')}`);
        }
      },

      // Limpiar campos (NUEVO)
      'limpiar teléfono': () => {
        setPhoneNumber('');
        speak('Teléfono limpiado');
      },
      'limpiar código': () => {
        setVerificationCode('');
        speak('Código de verificación limpiado');
      },
      'limpiar todo': () => {
        setPhoneNumber('');
        setVerificationCode('');
        setApiError('');
        speak('Todos los campos limpiados');
      },
    };

    // Registrar comandos para esta página
    registerCommands(voiceCommands);
    console.log('[Payment] ✅ Comandos de voz registrados:', Object.keys(voiceCommands).length);

    // Cleanup: eliminar comandos al desmontar
    return () => {
      unregisterCommands();
      console.log('[Payment] 🗑️ Comandos de voz eliminados');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, phoneNumber, verificationCode, totalAmount, isLoading, speak]);

  return (
    
      <Box sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "700",
            color: palette.darkBrown, // Título principal
            mb: 4,
            pt: 4,
            textAlign: "center",
          }}
        >
          Método de Pago
        </Typography>

        {/* Mensaje de error de API */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
            {apiError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* Columna Izquierda: Método de Pago */}
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "18px",
              background: "linear-gradient(145deg, #fefcfcff, #f2f0ed)",
              boxShadow: `
                8px 8px 20px rgba(0, 0, 0, 0.15), 
                -4px -4px 10px rgba(255, 255, 255, 0.8)
              `,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `
                  10px 10px 25px rgba(0, 0, 0, 0.2), 
                  -5px -5px 12px rgba(255, 255, 255, 0.9)
                `,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", mb: 3, color: palette.darkBrown }}
            >
              Seleccionar Método de Pago
            </Typography>

            <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ gap: 2 }} // Espacio entre opciones
              >
                {/* --- Opción Yape --- */}
                <FormControlLabel
                  value="yape"
                  control={
                    <Radio
                      sx={{
                        color: palette.orange,
                        "&.Mui-checked": { color: palette.rustRed },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        component="img"
                        src={yapeLogo}
                        alt="Yape"
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography sx={{ fontWeight: "500", color: palette.darkBrown }}>
                        Yape
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border:
                      paymentMethod === "yape"
                        ? `2px solid ${palette.rustRed}`
                        : `1px solid #ddd`,
                    borderRadius: "12px",
                    p: 1.5,
                    m: 0, // Resetear margen
                    transition: "all 0.2s ease",
                    backgroundColor:
                      paymentMethod === "yape"
                        ? `${palette.rustRed}1A` // Tinte sutil
                        : palette.white,
                  }}
                />
                {/* --- Opción Plin --- */}
                <FormControlLabel
                  value="plin"
                  control={
                    <Radio
                      sx={{
                        color: palette.orange,
                        "&.Mui-checked": { color: palette.rustRed },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                       <Box
                        component="img"
                        src={plinLogo}
                        alt="Plin"
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography sx={{ fontWeight: "500", color: palette.darkBrown }}>
                        Plin
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border:
                      paymentMethod === "plin"
                        ? `2px solid ${palette.rustRed}`
                        : `1px solid #ddd`,
                    borderRadius: "12px",
                    p: 1.5,
                    m: 0, // Resetear margen
                    transition: "all 0.2s ease",
                    backgroundColor:
                      paymentMethod === "plin"
                        ? `${palette.rustRed}1A` // Tinte sutil
                        : palette.white,
                  }}
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", mb: 3, color: palette.darkBrown }}
            >
              Información de Pago
            </Typography>

            <TextField
              fullWidth
              label="Número de Teléfono"
              placeholder="987654321"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: "" });
                }
              }}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": {
                    borderColor: palette.rustRed, // Color al enfocar
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.rustRed, // Color de label al enfocar
                },
              }}
            />

            <TextField
              fullWidth
              label="Código de Verificación"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                if (errors.verificationCode) {
                  setErrors({ ...errors, verificationCode: "" });
                }
              }}
              error={!!errors.verificationCode}
              helperText={errors.verificationCode}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": {
                    borderColor: palette.rustRed, // Color al enfocar
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.rustRed, // Color de label al enfocar
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handlePayment}
              disabled={isLoading}
              sx={{
                backgroundColor: palette.rustRed, // Botón primario
                color: palette.white,
                py: 1.5,
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0px 4px 15px -5px rgba(175, 68, 47, 0.7)",
                "&:hover": {
                  backgroundColor: palette.darkBrown, // Hover más oscuro
                  boxShadow: "none",
                },
                "&:disabled": {
                  backgroundColor: palette.lightPeach, // Color deshabilitado
                  color: palette.darkBrown,
                  opacity: 0.7
                },
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: palette.white }} />
                  Procesando...
                </>
              ) : (
                "Confirmar Pago"
              )}
            </Button>
          </Paper>

          {/* Columna Derecha: Resumen del Pedido */}
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "18px",
              background: "linear-gradient(145deg, #fcfcfcff, #f7f4efff)",
              height: "fit-content",
              boxShadow: `
                8px 8px 20px rgba(0, 0, 0, 0.15), 
                -4px -4px 10px rgba(255, 255, 255, 0.9)
              `,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `
                  10px 10px 25px rgba(0, 0, 0, 0.2), 
                  -5px -5px 12px rgba(255, 255, 255, 0.95)
                `,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", mb: 2, color: palette.darkBrown }}
            >
              Resumen del Pedido
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontWeight: "500",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                ID del Pedido:{" "}
                <strong style={{ color: palette.darkBrown }}>{orderId}</strong>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Lista de productos */}
            <Box sx={{ mb: 3, maxHeight: "300px", overflowY: "auto", pr: 1 }}>
              {items.map((item) => (
                <Box
                  key={item.id_detalle}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 2,
                    borderBottom: "1px solid #f0f0f0",
                    "&:last-child": {
                      borderBottom: "none",
                      pb: 0
                    }
                  }}
                >
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography sx={{ fontWeight: "600", fontSize: "15px", color: palette.darkBrown }}>
                      {item.nombre}
                    </Typography>
                    <Typography
                      sx={{ color: "#888", fontSize: "13px", mt: 0.5 }}
                    >
                      Cantidad: {item.cantidad}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: "600", color: palette.rustRed, fontSize: "15px" }}>
                    S/{item.subtotal.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Typography sx={{ fontWeight: "700", fontSize: "18px", color: palette.darkBrown }}>
                Total a Pagar:
              </Typography>
              <Typography
                sx={{
                  fontWeight: "700",
                  fontSize: "24px",
                  color: palette.brightRed, // Total destacado
                }}
              >
                S/{totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Botón Volver */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            onClick={() => navigate("/cart")}
            sx={{
              color: palette.rustRed, // Color de acento
              textTransform: "none",
              fontWeight: "600",
              borderRadius: "8px",
              mb: 4,
              "&:hover": {
                backgroundColor: `${palette.rustRed}1A`, // Fondo sutil al pasar el mouse
              },
            }}
          >
            ← Volver al Carrito
          </Button>
        </Box>
      </Box>
  );
};

export default Payment;