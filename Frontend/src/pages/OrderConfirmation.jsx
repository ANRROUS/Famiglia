import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Typography, Button, Paper } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const orderDetails = location.state?.orderDetails;
  const paymentDetails = location.state?.paymentDetails;

  useEffect(() => {
    // Limpiar el carrito después de confirmar el pedido
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fef7f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: "600px",
          width: "100%",
          p: 6,
          borderRadius: "16px",
          textAlign: "center",
          backgroundColor: "#fff",
        }}
      >
        <CheckCircle
          sx={{
            fontSize: "80px",
            color: "#4caf50",
            mb: 3,
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: "700",
            color: "#2d2d2d",
            mb: 2,
          }}
        >
          ¡Pedido Confirmado!
        </Typography>

        <Typography
          sx={{
            color: "#666",
            fontSize: "16px",
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          Tu pedido ha sido procesado exitosamente. 
          Recibirás una confirmación en tu correo electrónico.
        </Typography>

        {/* Detalles del pedido */}
        {orderDetails && (
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                color: "#666",
                fontSize: "14px",
                mb: 1,
              }}
            >
              Número de Pedido:
            </Typography>
            <Typography
              sx={{
                fontWeight: "700",
                fontSize: "20px",
                color: "#ff9c9c",
                mb: 2,
              }}
            >
              {orderDetails.id_pedido}
            </Typography>
            
            {paymentDetails && (
              <>
                <Typography
                  sx={{
                    color: "#666",
                    fontSize: "14px",
                    mb: 1,
                  }}
                >
                  Total Pagado:
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "700",
                    fontSize: "24px",
                    color: "#2d2d2d",
                  }}
                >
                  S/{paymentDetails.total?.toFixed(2)}
                </Typography>
              </>
            )}
          </Box>
        )}

        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            p: 3,
            mb: 4,
          }}
        >
          <Typography
            sx={{
              color: "#666",
              fontSize: "14px",
              mb: 1,
            }}
          >
            Gracias por tu compra en
          </Typography>
          <Typography
            sx={{
              fontWeight: "700",
              fontSize: "24px",
              color: "#ff9c9c",
            }}
          >
            Famiglia
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: "#ff9c9c",
              color: "#fff",
              px: 4,
              py: 1.5,
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#ff7a7a",
              },
            }}
          >
            Volver al Inicio
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/carta")}
            sx={{
              borderColor: "#ff9c9c",
              color: "#ff9c9c",
              px: 4,
              py: 1.5,
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": {
                borderColor: "#ff7a7a",
                backgroundColor: "#fff5f5",
              },
            }}
          >
            Ver Carta
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderConfirmation;
