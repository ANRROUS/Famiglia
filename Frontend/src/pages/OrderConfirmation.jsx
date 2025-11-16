import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Typography, Button, Paper } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { clearCart } from "../redux/slices/cartSlice";

const palette = {
  darkBrown: "#6B3730",
  rustRed: "#AF442F",
  brightRed: "#C94549",
  orange: "#EF9D58",
  lightPeach: "#EBBABC",
  white: "#FFFFFF",
};

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
      }}
    >
      {/* Comprobante */}
      <Paper
        elevation={4}
        sx={{
          maxWidth: "600px",
          width: "100%",
          p: 6,
          mt: 8,
          mb: 4,
          borderRadius: "20px",
          textAlign: "center",
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
        <CheckCircle
          sx={{
            fontSize: "80px",
            color: "#5cd644ff",
            mb: 3,
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: palette.darkBrown,
            mb: 2,
          }}
        >
          ¡Pedido Confirmado!
        </Typography>

        <Typography
          sx={{
            color: palette.darkBrown,
            opacity: 0.8,
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
              backgroundColor: `${palette.white}cc`,
              borderRadius: "12px",
              p: 3,
              mb: 3,
              border: `1px solid ${palette.lightPeach}`,
            }}
          >
            <Typography
              sx={{
                color: palette.rustRed,
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                mb: 1.5,
              }}
            >
              Número de Pedido:
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "20px",
                color: palette.brightRed,
                mb: 2,
              }}
            >
              {orderDetails.id_pedido}
            </Typography>

            {paymentDetails && (
              <>
                <Typography
                  sx={{
                    color: palette.darkBrown,
                    fontSize: "14px",
                    mb: 1,
                    opacity: 0.8,
                  }}
                >
                  Total Pagado:
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "22px",
                    color: palette.orange,
                  }}
                >
                  S/{paymentDetails.total?.toFixed(2)}
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Agradecimiento */}
        <Box
          sx={{
            backgroundColor: `${palette.white}cc`,
            borderRadius: "12px",
            p: 3,
            mb: 2,
            border: `1px solid ${palette.lightPeach}`,
          }}
        >
          <Typography
            sx={{
              color: palette.darkBrown,
              fontSize: "14px",
              mb: 1,
            }}
          >
            Gracias por tu compra en
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "24px",
              color: palette.rustRed,
            }}
          >
            Famiglia
          </Typography>
        </Box>
      </Paper>

      {/* Botones debajo del comprobante */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          mb: 8,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            backgroundColor: palette.brightRed,
            color: palette.white,
            px: 4,
            py: 1.2,
            fontSize: "15px",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "2px 4px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: palette.rustRed,
              boxShadow: "3px 6px 10px rgba(0,0,0,0.2)",
            },
          }}
        >
          Volver al Inicio
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/carta")}
          sx={{
            borderColor: palette.brightRed,
            color: palette.brightRed,
            px: 4,
            py: 1.2,
            fontSize: "15px",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              borderColor: palette.rustRed,
              backgroundColor: `${palette.lightPeach}33`,
            },
          }}
        >
          Ver Carta
        </Button>
      </Box>
    </Box>
  );
};

export default OrderConfirmation;
