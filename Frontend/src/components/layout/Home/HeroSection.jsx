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
  onContctanosTextClick,
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
      <Box className="relative flex justify-between items-center px-6 sm:px-10 md:px-16 py-4 z-10 text-white">
        {/* Logo */}
        <img
          src={imgLogoFamigliawithourBorders}
          alt="Famiglia Logo"
          className="w-36 sm:w-48 md:w-56 h-auto object-contain"
        />

        {/* Menú principal (solo en escritorio) */}
        <Box className="hidden md:flex items-center gap-8 text-base font-medium">
          <div
            className="cursor-pointer border-b-2 border-white pb-1"
            onClick={onHomeTextClick}
          >
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
          <div className="cursor-pointer hover:text-gray-200" onClick={onContctanosTextClick}>
            Contáctanos
          </div>
        </Box>

        {/* Botones (solo escritorio) */}
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

        {/* Ícono menú hamburguesa (solo móvil) */}
        <IconButton
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>

        {/* Menú desplegable móvil */}
        {menuOpen && (
          <Box className="absolute top-[100%] left-0 w-full bg-[#8f3c3c] text-white flex flex-col items-center py-6 gap-4 text-lg font-semibold shadow-lg animate-fadeIn z-20">
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
            <div onClick={onContctanosTextClick} className="cursor-pointer hover:text-gray-200">
              Contáctanos
            </div>
            <button
              onClick={onGroupContainerClick1}
              className="border-2 border-white text-white bg-transparent font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-5 py-2 w-4/5"
            >
              Registrarse
            </button>
            <button
              onClick={onGroupContainerClick}
              className="border-2 border-white text-white bg-transparent font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-5 py-2 w-4/5"
            >
              Iniciar Sesión
            </button>
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

          <button className="bg-[#8f3c3c] text-white text-[1.2rem] sm:text-[1.5rem] md:text-[1.8rem] font-['Lilita_One'] rounded-lg px-6 py-3 shadow-md hover:bg-[#702828] transition self-center md:self-start">
            RESERVA TU PEDIDO
          </button>

          <Box className="flex items-center gap-3 justify-center md:justify-start mt-4 text-[#000]">
            <img
              src={imgPointMap}
              alt="Ubicación"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                fontWeight: 300,
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
