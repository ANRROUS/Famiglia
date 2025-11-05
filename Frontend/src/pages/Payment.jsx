import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { pagoAPI } from "../services/api";
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
import { 
  AccountBalance as YapeIcon,
  Phone as PlinIcon 
} from "@mui/icons-material";

const Payment = () => {
  const navigate = useNavigate();
  const { items, totalAmount, orderId } = useSelector((state) => state.cart);
  
  const [paymentMethod, setPaymentMethod] = useState("yape");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Si no hay items en el carrito, redirigir
  if (!items || items.length === 0) {
    navigate("/cart");
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
        envio: "pendiente"
      });

      console.log("Pago procesado exitosamente:", response.data);

      // Navegar a la página de confirmación
      navigate("/order-confirmation", { 
        state: { 
          orderDetails: response.data.pedido,
          paymentDetails: response.data.pago 
        } 
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fef7f5",
        pt: 8,
        pb: 6,
        px: 2,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <Box sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "700",
            color: "#2d2d2d",
            mb: 4,
            textAlign: "center",
          }}
        >
          Completar Pago
        </Typography>

        {/* Mensaje de error de API */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          {/* Columna Izquierda: Método de Pago */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: "12px",
              backgroundColor: "#fff",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", mb: 3, color: "#2d2d2d" }}
            >
              Seleccionar Método de Pago
            </Typography>

            <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="yape"
                  control={
                    <Radio
                      sx={{
                        color: "#ff9c9c",
                        "&.Mui-checked": { color: "#ff9c9c" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <YapeIcon sx={{ color: "#752F8A" }} />
                      <Typography sx={{ fontWeight: "500" }}>Yape</Typography>
                    </Box>
                  }
                  sx={{
                    border: paymentMethod === "yape" ? "2px solid #ff9c9c" : "1px solid #ddd",
                    borderRadius: "8px",
                    p: 2,
                    mb: 2,
                    backgroundColor: paymentMethod === "yape" ? "#fff5f5" : "#fff",
                  }}
                />
                <FormControlLabel
                  value="plin"
                  control={
                    <Radio
                      sx={{
                        color: "#ff9c9c",
                        "&.Mui-checked": { color: "#ff9c9c" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PlinIcon sx={{ color: "#00A9E0" }} />
                      <Typography sx={{ fontWeight: "500" }}>Plin</Typography>
                    </Box>
                  }
                  sx={{
                    border: paymentMethod === "plin" ? "2px solid #ff9c9c" : "1px solid #ddd",
                    borderRadius: "8px",
                    p: 2,
                    backgroundColor: paymentMethod === "plin" ? "#fff5f5" : "#fff",
                  }}
                />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              sx={{ fontWeight: "600", mb: 3, color: "#2d2d2d" }}
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
                  "&.Mui-focused fieldset": {
                    borderColor: "#ff9c9c",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#ff9c9c",
                },
              }}
            />

            <TextField
              fullWidth
              label="Código de Verificación"
              placeholder="1234"
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
                  "&.Mui-focused fieldset": {
                    borderColor: "#ff9c9c",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#ff9c9c",
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handlePayment}
              disabled={isLoading}
              sx={{
                backgroundColor: "#ff9c9c",
                color: "#fff",
                py: 1.5,
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#ff7a7a",
                },
                "&:disabled": {
                  backgroundColor: "#ffcccc",
                  color: "#fff",
                },
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
                  Procesando...
                </>
              ) : (
                "Confirmar Pago"
              )}
            </Button>
          </Paper>

          {/* Columna Derecha: Resumen del Pedido */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: "12px",
              backgroundColor: "#fff",
              height: "fit-content",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", mb: 3, color: "#2d2d2d" }}
            >
              Resumen del Pedido
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontWeight: "500",
                  color: "#666",
                  fontSize: "14px",
                  mb: 1,
                }}
              >
                ID del Pedido: <strong>{orderId}</strong>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Lista de productos */}
            <Box sx={{ mb: 3, maxHeight: "300px", overflowY: "auto" }}>
              {items.map((item) => (
                <Box
                  key={item.id_detalle}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    pb: 2,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: "500", fontSize: "14px" }}>
                      {item.nombre}
                    </Typography>
                    <Typography
                      sx={{ color: "#999", fontSize: "12px", mt: 0.5 }}
                    >
                      Cantidad: {item.cantidad}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: "600", color: "#ff9c9c" }}>
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
              <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
                Total a Pagar:
              </Typography>
              <Typography
                sx={{
                  fontWeight: "700",
                  fontSize: "24px",
                  color: "#f00000",
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
              color: "#ff9c9c",
              textTransform: "none",
              fontWeight: "500",
              "&:hover": {
                backgroundColor: "#fff5f5",
              },
            }}
          >
            ← Volver al Carrito
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Payment;
