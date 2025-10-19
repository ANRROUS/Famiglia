import React, { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Alert } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import RoomIcon from "@mui/icons-material/Room";
import axios from "axios";

const ContactUs = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      await axios.post("http://localhost:3000/send-email", { nombre, email, mensaje });

      setAlert({
        show: true,
        type: "success",
        message: "¡Tu mensaje fue enviado correctamente!",
      });
      setNombre("");
      setEmail("");
      setMensaje("");
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Ocurrió un error al enviar el mensaje. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="
        w-full 
        bg-white 
        flex flex-col md:flex-row 
        justify-center md:items-start items-center
        gap-16 md:gap-20 
        py-16 px-6 sm:px-10 md:px-16 
        font-[Montserrat] 
        text-[#753b3b]
      "
      sx={{
        boxSizing: "border-box",
        maxWidth: "100vw",
        overflowX: "hidden",
        paddingTop: "90px",
      }}
    >
      {/* LEFT SIDE - CONTACT INFO */}
      <Box
        className="flex-1 flex flex-col gap-10 max-w-md w-full md:items-start items-center text-center md:text-left"
        sx={{ minWidth: 0 }}
      >
        <Typography
          sx={{
            fontFamily: "'Lilita One', cursive",
            fontWeight: 700,
            color: "#753b3b",
            fontSize: "1.3rem",
            mb: 1,
          }}
        >
          Contáctanos
        </Typography>

        <Box className="flex items-center justify-center md:justify-start gap-4">
          <PhoneIcon sx={{ fontSize: 36, color: "#000" }} />
          <Box>
            <Typography sx={{ color: "#000", fontSize: "0.9rem", fontWeight: 600 }}>
              Número de llamada
            </Typography>
            <Typography sx={{ color: "#000", fontSize: "0.8rem" }}>+51 933 043 066</Typography>
          </Box>
        </Box>

        <Box className="flex items-center justify-center md:justify-start gap-4">
          <EmailIcon sx={{ fontSize: 36, color: "#000" }} />
          <Box>
            <Typography sx={{ color: "#000", fontSize: "0.9rem", fontWeight: 600 }}>Email</Typography>
            <Typography sx={{ color: "#000", fontSize: "0.8rem" }}>
              lunaromero@famiglia.com
            </Typography>
          </Box>
        </Box>

        <Box className="flex items-center justify-center md:justify-start gap-4">
          <RoomIcon sx={{ fontSize: 36, color: "#000" }} />
          <Box>
            <Typography sx={{ color: "#000", fontSize: "0.9rem", fontWeight: 600 }}>
              Ubicación
            </Typography>
            <Typography sx={{ color: "#000", fontSize: "0.8rem" }}>
              Av. Arenales 330 – Lima
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* RIGHT SIDE - CONTACT FORM */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="flex-1 max-w-md w-full"
        sx={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid #efb0b0",
          borderRadius: "8px",
          padding: "2rem 2rem",
          backgroundColor: "#fff",
          minWidth: 0,
          marginTop: { xs: "1.5rem", md: 0 },
        }}
      >
        <Typography sx={{ fontWeight: 700, color: "#753b3b", fontSize: "0.9rem", mb: 0.5 }}>
          Nombre:
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "40px",
              "& fieldset": { borderColor: "#efb0b0" },
              "&:hover fieldset": { borderColor: "#d47a7a" },
              "&.Mui-focused fieldset": { borderColor: "#b25555" },
            },
          }}
        />

        <Typography sx={{ fontWeight: 700, color: "#753b3b", fontSize: "0.9rem", mt: 2, mb: 0.5 }}>
          Correo:
        </Typography>
        <TextField
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "40px",
              "& fieldset": { borderColor: "#efb0b0" },
              "&:hover fieldset": { borderColor: "#d47a7a" },
              "&.Mui-focused fieldset": { borderColor: "#b25555" },
            },
          }}
        />

        <Typography sx={{ fontWeight: 700, color: "#753b3b", fontSize: "0.9rem", mt: 2, mb: 0.5 }}>
          Mensaje:
        </Typography>
        <TextField
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#efb0b0" },
              "&:hover fieldset": { borderColor: "#d47a7a" },
              "&.Mui-focused fieldset": { borderColor: "#b25555" },
            },
          }}
        />

        <Button
          type="submit"
          disabled={loading}
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
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            "&:hover": { backgroundColor: "#f9cccc" },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ color: "#753b3b" }} />
              Enviando...
            </>
          ) : (
            "Enviar Mensaje"
          )}
        </Button>

        {alert.show && (
          <Alert
            severity={alert.type}
            sx={{
              mt: 3,
              textAlign: "center",
              borderRadius: "8px",
              backgroundColor:
                alert.type === "success" ? "#f0fff0" : "#fff0f0",
            }}
          >
            {alert.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default ContactUs;
