import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import imgDegradado from "../../../assets/images/img_degradado.png";
import imgLogoFamigliawithourBorders from "../../../assets/images/img_logoFamigliawithoutBorders.png";
import imgMilhojasFresa from "../../../assets/images/img_milhojasFresa.png";
import imgAlfajor from "../../../assets/images/img_alfajor.png";
import imgEmpanadaMixta from "../../../assets/images/img_empanadaMixta.png";
import imgPointMap from "../../../assets/images/img_map.png";

const HeroSection = ({
  onHomeTextClick,
  onCartaTextClick,
  onDeliveryTextClick,
  onTestTextClick,
  onContactanosTextClick,
  onGroupContainerClick,
  onGroupContainerClick1,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Box className="relative w-full bg-white text-[#753b3b] font-[Montserrat] overflow-hidden">
      {/* Fondo degradado */}
      <img
        src={imgDegradado}
        alt="fondo"
        className="absolute top-0 left-0 w-full h-[75%] object-cover z-0"
      />

      {/* NAVBAR */}
      {/* NAVBAR */}
      <Box className="relative flex flex-row justify-between items-center px-6 sm:px-10 md:px-16 py-3 z-20 text-white">
        {/* Logo */}
        <img
          src={imgLogoFamigliawithourBorders}
          alt="Famiglia Logo"
          className="w-40 sm:w-56 md:w-64 h-auto object-contain z-20"
        />

        {/* Menú en pantallas grandes */}
        <Box className="hidden md:flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-10 text-base sm:text-lg md:text-base font-medium">
          <div className="cursor-pointer border-b-2 border-white pb-1" onClick={onHomeTextClick}>
            Home
          </div>
          <div className="cursor-pointer hover:text-gray-200" onClick={onCartaTextClick}>
            Carta
          </div>
          <div className="cursor-pointer hover:text-gray-200" onClick={onDeliveryTextClick}>
            Delivery
          </div>
          <div className="cursor-pointer hover:text-gray-200" onClick={onTestTextClick}>
            Test
          </div>
          <div className="cursor-pointer hover:text-gray-200" onClick={onContactanosTextClick}>
            Contáctanos
          </div>
        </Box>

        {/* Botones en escritorio */}
        <Box className="hidden md:flex gap-3">
          <button
            onClick={onGroupContainerClick1}
            className="border-2 border-white text-white bg-transparent font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-4 py-2 text-sm md:text-base"
          >
            Registrarse
          </button>
          <button
            onClick={onGroupContainerClick}
            className="border-2 border-white text-white bg-transparent font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-4 py-2 text-sm md:text-base"
          >
            Iniciar Sesión
          </button>
        </Box>

        {/* Botón menú hamburguesa (solo en móvil) */}
        <Box className="flex md:hidden absolute right-6 top-4 z-30">
          <IconButton
            onClick={() => setMenuOpen(!menuOpen)}
            sx={{
              color: "white",
              "&:hover": { color: "#f5f5f5" },
            }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <Box
            className="fixed inset-0 bg-[#753b3bcc] backdrop-blur-sm flex flex-col justify-center items-center text-white text-2xl gap-6 z-20"
          >
            <div onClick={onHomeTextClick} className="cursor-pointer hover:text-gray-200">
              Home
            </div>
            <div onClick={onCartaTextClick} className="cursor-pointer hover:text-gray-200">
              Carta
            </div>
            <div onClick={onDeliveryTextClick} className="cursor-pointer hover:text-gray-200">
              Delivery
            </div>
            <div onClick={onTestTextClick} className="cursor-pointer hover:text-gray-200">
              Test
            </div>
            <div onClick={onContactanosTextClick} className="cursor-pointer hover:text-gray-200">
              Contáctanos
            </div>

            {/* Botones también visibles en móvil */}
            <Box className="flex flex-col gap-4 mt-8">
              <button
                onClick={onGroupContainerClick1}
                className="border-2 border-white text-white bg-transparent font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-6 py-2"
              >
                Registrarse
              </button>
              <button
                onClick={onGroupContainerClick}
                className="border-2 border-white text-white bg-transparent font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-6 py-2"
              >
                Iniciar Sesión
              </button>
            </Box>
          </Box>
        )}
      </Box>


      {/* HERO SECTION */}
      <Box className="relative flex flex-col md:flex-row justify-between items-center px-6 sm:px-10 md:px-16 pt-2 md:pt-0 pb-8 md:pb-12 z-10">
        {/* Texto principal */}
        <Box className="relative z-10 text-center md:text-left md:w-1/2 flex flex-col gap-6">
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Lilita One', cursive",
              fontWeight: 400,
              color: "#753b3b",
              lineHeight: 1.1,
              fontSize: {
                xs: "2rem",
                sm: "2.8rem",
                md: "3.8rem",
              },
            }}
          >
            Panadería,{" "}
            <span style={{ color: "#fd9d50" }}>pastelería y</span>{" "}
            <span style={{ color: "#da3644" }}>snack bar</span>
          </Typography>

          <button className="bg-[#8f3c3c] text-white text-[1.3rem] sm:text-[1.7rem] md:text-[1.9rem] font-['Lilita_One'] rounded-xl px-10 sm:px-14 py-4 shadow-lg hover:bg-[#702828] transition self-center">
            RESERVA TU PEDIDO
          </button>

          <Box className="flex items-center gap-3 justify-center mt-4 text-[#000]">
            <img
              src={imgPointMap}
              alt="Ubicación"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 200, // Extralight
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                color: "#000",
              }}
            >
              Av. Gral. Antonio Álvarez de Arenales 458, Jesús María
            </Typography>
          </Box>
        </Box>

        {/* Imágenes del hero */}
        <Box className="hidden md:flex relative -mt-8 md:-mt-12 w-full md:w-1/2 justify-center items-center -mr-6 sm:-mr-10 md:-mr-16 lg:-mr-20">
          <img
            src={imgMilhojasFresa}
            alt="Milhojas Fresa"
            className="relative z-10 w-80 sm:w-[28rem] md:w-[40rem] h-auto object-contain drop-shadow-2xl"
          />
          <img
            src={imgAlfajor}
            alt="Alfajor"
            className="absolute bottom-0 -right-5 w-28 sm:w-36 md:w-44 object-contain"
          />
          <img
            src={imgEmpanadaMixta}
            alt="Empanada"
            className="absolute top-0 left-[-18%] w-24 sm:w-32 md:w-60 object-contain"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
