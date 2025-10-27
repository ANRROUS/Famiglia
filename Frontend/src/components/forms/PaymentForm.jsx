import { Box, Typography, TextField, Button } from "@mui/material";

const Compra = () => {
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
        {/* FORMULARIO DE PAGO (IZQUIERDA) */}
        <Box
          sx={{
            flex: "1 1 65%",
            border: "1px solid #ff9c9c",
            borderRadius: "10px",
            padding: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <Typography
            sx={{ color: "#8f3c3c", fontWeight: "800", fontSize: "1.3rem" }}
          >
            Realizar Pago
          </Typography>

          <Box>
            <Typography
              sx={{ color: "#8f3c3c", fontWeight: "600", mb: 1 }}
            >
              N° de teléfono:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese su número"
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ffa1a1" },
                  "&:hover fieldset": { borderColor: "#ff7b7b" },
                  "&.Mui-focused fieldset": { borderColor: "#771919" },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{ color: "#8f3c3c", fontWeight: "600", mb: 1 }}
            >
              Código de Verificación:
            </Typography>
            <TextField
              fullWidth
              placeholder="Ingrese el código"
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ffa1a1" },
                  "&:hover fieldset": { borderColor: "#ff7b7b" },
                  "&.Mui-focused fieldset": { borderColor: "#771919" },
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#ffe5e5",
                color: "#771919",
                fontWeight: "500",
                textTransform: "none",
                px: 3,
                py: 1.5,
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#ffcccc" },
              }}
            >
              Finalizar Compra
            </Button>
          </Box>
        </Box>

        {/* PANEL LATERAL: RESUMEN DE COMPRA (DERECHA) */}
        <Box
          sx={{
            flex: "0 0 280px",
            maxWidth: "280px",
            minWidth: "280px",
            border: "1px solid #ff9c9c",
            borderRadius: "10px",
            padding: "2.5rem 2.5rem",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
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

          <Box sx={{ flexGrow: 1, mt: 7, mb: 3 }}>
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
                S/160.00
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Compra;