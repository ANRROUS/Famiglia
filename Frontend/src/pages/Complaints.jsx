import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

const Complaints = () => {
  return (
    <Box
      className="
        w-full 
        bg-white 
        flex flex-col justify-center items-center 
        py-20 px-6 sm:px-10 
        font-[Montserrat] text-[#753b3b]
      "
      sx={{
        maxWidth: "100vw",
        paddingTop: "40px",
        paddingBottom: "60px",
        overflowX: "hidden",
      }}
    >
      {/* Título principal */}
      <Typography
        sx={{
          fontFamily: "'Lilita One', cursive",
          fontWeight: 700,
          fontSize: "1.8rem",
          color: "#753b3b",
          mb: 4,
          textAlign: "center",
        }}
      >
        Libro de Reclamaciones
      </Typography>

      {/* Descripción */}
      <Typography
        sx={{
          maxWidth: "700px",
          textAlign: "center",
          fontSize: "1rem",
          mb: 6,
          color: "#5a2b2b",
        }}
      >
        En Pastelería Famiglia, tu satisfacción es nuestra prioridad. Si tienes alguna queja,
        reclamo o sugerencia, por favor completa el siguiente formulario. Nuestro equipo revisará tu solicitud lo antes posible.
      </Typography>

      {/* Formulario visual */}
      <Box
        className="max-w-md w-full"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          border: "1px solid #efb0b0",
          borderRadius: "10px",
          padding: "2rem 2rem",
          backgroundColor: "#fff",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Nombre completo:</Typography>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Ej. María López"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#efb0b0" },
              "&:hover fieldset": { borderColor: "#d47a7a" },
              "&.Mui-focused fieldset": { borderColor: "#b25555" },
            },
          }}
        />

        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", mt: 1 }}>
          Correo electrónico:
        </Typography>
        <TextField
          variant="outlined"
          type="email"
          placeholder="Ej. maria@gmail.com"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#efb0b0" },
              "&:hover fieldset": { borderColor: "#d47a7a" },
              "&.Mui-focused fieldset": { borderColor: "#b25555" },
            },
          }}
        />
        
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", mt: 1 }}>
          Motivo del reclamo:
        </Typography>
        <TextField
          variant="outlined"
          multiline
          rows={4}
          placeholder="Describe brevemente el motivo de tu reclamo"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#efb0b0" },
              "&:hover fieldset": { borderColor: "#d47a7a" },
              "&.Mui-focused fieldset": { borderColor: "#b25555" },
            },
          }}
        />

        <Button
          sx={{
            mt: 3,
            alignSelf: "center",
            width: "160px",
            height: "36px",
            backgroundColor: "#fde3e3",
            color: "#753b3b",
            fontWeight: 500,
            textTransform: "none",
            fontSize: "0.8rem",
            borderRadius: "6px",
            "&:hover": { backgroundColor: "#f9cccc" },
          }}
        >
          Enviar Reclamo
        </Button>
      </Box>
    </Box>
  );
};

export default Complaints;
