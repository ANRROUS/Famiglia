import { useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom"; // ✅ Importa useNavigate
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithoutBorders.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Inicializa el hook de navegación

  // ✅ Funciones de redirección claramente definidas
  const handleGoHome = () => navigate("/");
  const handleGoCarta = () => navigate("/carta");
  const handleGoDelivery = () => navigate("/delivery");
  const handleGoTest = () => navigate("/test");
  const handleGoContact = () => navigate("/contact-us");
  const handleGoRegister = () => navigate("/register");
  const handleGoLogin = () => navigate("/login");

  return (
    <Box className="w-full bg-white text-[#6b2c2c] font-[Montserrat] border-b-[1.5px] border-[#b17b6b]">
      {/* Contenedor principal */}
      <Box className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <img
          src={imgLogoFamiglia}
          alt="Panadería Famiglia"
          className="w-36 sm:w-44 md:w-48 object-contain cursor-pointer"
          onClick={handleGoHome}
        />

        {/* Links en escritorio */}
        <Box className="hidden md:flex items-center gap-10 text-sm font-medium">
          <span onClick={handleGoHome} className="cursor-pointer hover:text-[#9c4c4c]">
            Home
          </span>
          <span
            onClick={handleGoCarta}
            className="cursor-pointer border-b-[2px] border-[#6b2c2c] pb-0.5"
          >
            Carta
          </span>
          <span onClick={handleGoDelivery} className="cursor-pointer hover:text-[#9c4c4c]">
            Delivery
          </span>
          <span onClick={handleGoTest} className="cursor-pointer hover:text-[#9c4c4c]">
            Test
          </span>
          <span onClick={handleGoContact} className="cursor-pointer hover:text-[#9c4c4c]">
            Contáctanos
          </span>
        </Box>

        {/* Botones en escritorio */}
        <Box className="hidden md:flex gap-3">
          <Button
            onClick={handleGoRegister}
            variant="contained"
            sx={{
              backgroundColor: "#8b3e3e",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              "&:hover": { backgroundColor: "#742f2f" },
            }}
          >
            Registrarse
          </Button>
          <Button
            onClick={handleGoLogin}
            variant="outlined"
            sx={{
              borderColor: "#8b3e3e",
              color: "#8b3e3e",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              "&:hover": {
                backgroundColor: "#8b3e3e",
                color: "#fff",
                borderColor: "#8b3e3e",
              },
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>

        {/* Menú hamburguesa móvil */}
        <Box className="md:hidden">
          <IconButton onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Menú desplegable móvil */}
      {menuOpen && (
        <Box className="md:hidden flex flex-col items-center bg-white text-[#6b2c2c] py-6 gap-5 border-t border-[#c9a6a6]">
          <span onClick={handleGoHome} className="cursor-pointer hover:text-[#9c4c4c]">
            Home
          </span>
          <span
            onClick={handleGoCarta}
            className="cursor-pointer border-b-[2px] border-[#6b2c2c] pb-0.5"
          >
            Carta
          </span>
          <span onClick={handleGoDelivery} className="cursor-pointer hover:text-[#9c4c4c]">
            Delivery
          </span>
          <span onClick={handleGoTest} className="cursor-pointer hover:text-[#9c4c4c]">
            Test
          </span>
          <span onClick={handleGoContact} className="cursor-pointer hover:text-[#9c4c4c]">
            Contáctanos
          </span>

          <Box className="flex flex-col gap-3 mt-4 w-[60%]">
            <Button
              onClick={handleGoRegister}
              variant="contained"
              sx={{
                backgroundColor: "#8b3e3e",
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#742f2f" },
              }}
            >
              Registrarse
            </Button>
            <Button
              onClick={handleGoLogin}
              variant="outlined"
              sx={{
                borderColor: "#8b3e3e",
                color: "#8b3e3e",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#8b3e3e",
                  color: "#fff",
                  borderColor: "#8b3e3e",
                },
              }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Header;
