import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined'; // <-- Importa este icono
import imgMilhojasFresa from "../assets/images/img_milhojasFresa.png";

// Selector de cantidad compacto tipo checkbox
const QuantitySelector = ({ value, onChange }) => {
  const handleIncrease = () => onChange(value + 1);
  const handleDecrease = () => onChange(Math.max(1, value - 1));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ff9c9c",
        borderRadius: "6px",
        overflow: "hidden",
        width: "70px",
        height: "32px",
        backgroundColor: "#fff",
      }}
    >
      <IconButton
        size="small"
        onClick={handleDecrease}
        sx={{
          width: "24px",
          height: "24px",
          color: "#771919",
          "&:hover": { backgroundColor: "#ffe5e5" },
        }}
      >
        <Remove fontSize="small" />
      </IconButton>

      <Typography
        sx={{
          width: "24px",
          textAlign: "center",
          fontSize: "0.9rem",
          fontWeight: 500,
        }}
      >
        {value}
      </Typography>

      <IconButton
        size="small"
        onClick={handleIncrease}
        sx={{
          width: "24px",
          height: "24px",
          color: "#771919",
          "&:hover": { backgroundColor: "#ffe5e5" },
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  );
};

const Cart = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Milhojas de fresa artesanal",
      price: 80.0,
      quantity: 1,
      image: imgMilhojasFresa,
    },
    {
      id: 2,
      name: "Milhojas de fresa artesanal",
      price: 80.0,
      quantity: 1,
      image: imgMilhojasFresa,
    },
  ]);

  const handleQuantityChange = (id, newQuantity) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: newQuantity } : { ...p }
      )
    );
  };

  const handleRemoveProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleContinue = () => {
    navigate("/payment");
  };

  const handleAddProduct = () => {
    navigate("/catalog");
  };

  const cartTotal = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const isCartEmpty = products.length === 0;

  return (
    <Box
      className="relative w-full bg-[#fff] overflow-hidden text-left text-base text-[#000] font-[Montserrat]"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 150px)",
        padding: "40px 0",
      }}
    >
      {/* CONTENEDOR PRINCIPAL */}
      <Box
        sx={{
          position: "relative",
          width: "90%",
          maxWidth: "1300px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "2rem",
        }}
      >
        {/* TABLA DE PRODUCTOS (LADO IZQUIERDO) */}
        <Box sx={{ flex: "1 1 65%", position: "relative" }}>
          {/* ENCABEZADO PERMANENTE */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto minmax(250px, 1fr) 0.6fr 0.6fr 0.6fr",
              fontWeight: "600",
              mb: 2,
              alignItems: "center",
            }}
          >
            <div></div>
            <div>Producto</div>
            <div style={{ textAlign: "center", paddingLeft: "30px" }}>
              Precio
            </div>
            <div style={{ textAlign: "center", paddingLeft: "20px" }}>
              Cantidad
            </div>
            <div style={{ textAlign: "center", paddingLeft: "10px" }}>
              Total Parcial
            </div>
          </Box>

          {!isCartEmpty ? (
            // CARRITO NO VACÍO: FILAS Y BOTÓN CONTINUAR
            <>
              {/* FILAS DE PRODUCTOS */}
              {products.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto minmax(250px, 1fr) 0.6fr 0.6fr 0.6fr",
                    alignItems: "center",
                    borderTop: "1px solid #ff9c9c",
                    py: 2,
                    columnGap: "1rem",
                  }}
                >
                  <CloseIcon
                    onClick={() => handleRemoveProduct(product.id)}
                    sx={{
                      color: "#771919", 
                      fontSize: 22,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#ffcccc", borderRadius: '50%', padding: '4px', border: '1px solid #ff9c9c'},
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Box
                      sx={{
                        width: "74px",
                        height: "62px",
                        borderRadius: "10px",
                        backgroundColor: "#ffe3d9",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Box>
                  <Typography sx={{ textAlign: "center" }}>
                    S/{product.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <QuantitySelector
                      value={product.quantity}
                      onChange={(newQty) =>
                        handleQuantityChange(product.id, newQty)
                      }
                    />
                  </Box>
                  <Typography sx={{ textAlign: "center" }}>
                    S/{(product.price * product.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              {/* BOTÓN CONTINUAR */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Box
                  onClick={handleContinue}
                  sx={{
                    backgroundColor: "#ffe5e5",
                    color: "#771919",
                    px: 3,
                    py: 1.5,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#ffcccc" },
                  }}
                >
                  Continuar
                </Box>
              </Box>
            </>
          ) : (
            // CARRITO VACÍO: MENSAJE Y BOTÓN AGREGAR PRODUCTO
            <>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 5,
                  borderTop: "1px solid #ff9c9c",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {/* *** MENSAJE CON ICONO SentimentDissatisfiedOutlinedIcon *** */}
                <Typography variant="h6" sx={{ color: '#803e38', display: 'flex', alignItems: 'center', gap: 1 }}>
                  No tiene productos en el carrito <SentimentDissatisfiedOutlinedIcon sx={{ color: '#803e38', fontSize: '1.5rem' }} />
                </Typography>
                <Box
                  onClick={handleAddProduct}
                  sx={{
                    display: 'inline-block',
                    backgroundColor: "#ffe5e5",
                    color: "#771919",
                    px: 3,
                    py: 1.5,
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#ffcccc" },
                    alignSelf: 'flex-end',
                  }}
                >
                  Agregar Producto
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* PANEL LATERAL: RESUMEN DE COMPRA */}
        <Box
          sx={{
            flex: "0 0 280px",
            maxWidth: "280px",
            minWidth: "280px",
            border: "1px solid #ff9c9c",
            borderRadius: "10px",
            padding: "2.5rem 2.5rem",
            backgroundColor: "#fff",
            mt: "-50px",
            mb: "-80px",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* SOLO MOSTRAR EL TÍTULO Y LA LÍNEA */}
          <Box>
            <Typography
              sx={{
                color: "#803e38",
                fontWeight: "700",
                textAlign: "center",
                mb: 3,
              }}
            >
              Resumen de Compra
            </Typography>
            <Box sx={{ borderTop: "1px solid #ff9c9c", my: 1 }} />
          </Box>
          
          {/* CONTENIDO CONDICIONAL (FILAS Y BOTÓN PROCESO) */}
          {!isCartEmpty && (
            <>
              {/* Bloque 2: DETALLES DE COMPRA */}
              <Box
                sx={{
                  flexGrow: 1,
                  mt: 7,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 5,
                  }}
                >
                  <Typography sx={{ fontWeight: "600" }}>ID-Compra:</Typography>
                  <Typography>C-001</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 5,
                  }}
                >
                  <Typography sx={{ fontWeight: "600" }}>Envío:</Typography>
                  <Typography>Recojo en tienda</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 5,
                    mb: 0,
                  }}
                >
                  <Typography sx={{ fontWeight: "600" }}>Total:</Typography>
                  <Typography
                    sx={{
                      color: "#f00000",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                    }}
                  >
                    S/{cartTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Bloque 3: Botón "En Proceso..." */}
              <Box
                sx={{
                  backgroundColor: "#ffe5e5",
                  color: "rgba(119,25,25,0.8)",
                  px: 3,
                  py: 1.5,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                En Proceso ...
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Cart;