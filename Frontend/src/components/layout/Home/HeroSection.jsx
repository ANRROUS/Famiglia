import { Box, Typography } from "@mui/material";
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
  return (
    <Box className="relative w-full bg-white text-[#753b3b] font-[Montserrat] overflow-hidden">
      {/* Fondo degradado */}
      <img
        src={imgDegradado}
        alt=""
        className="absolute top-0 left-0 w-full h-auto object-cover"
      />

      {/* NAVBAR */}
      <Box className="relative flex flex-wrap md:flex-nowrap justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 pt-6 z-10">
        {/* Logo */}
        <img
          src={imgLogoFamigliawithourBorders}
          alt="Famiglia Logo"
          className="w-40 sm:w-56 md:w-72 h-auto object-contain mb-4 md:mb-0"
        />

        {/* Menú principal */}
        <Box className="flex flex-wrap justify-center gap-4 sm:gap-8 text-lg md:text-base text-[#753b3b] font-medium">
          <div className="cursor-pointer hover:text-[#8f3c3c]" onClick={onHomeTextClick}>
            Home
          </div>
          <div className="cursor-pointer hover:text-[#8f3c3c]" onClick={onCartaTextClick}>
            Carta
          </div>
          <div className="cursor-pointer hover:text-[#8f3c3c]" onClick={onDeliveryTextClick}>
            Delivery
          </div>
          <div className="cursor-pointer hover:text-[#8f3c3c]" onClick={onTestTextClick}>
            Test
          </div>
          <div className="cursor-pointer hover:text-[#8f3c3c]" onClick={onContctanosTextClick}>
            Contáctanos
          </div>
        </Box>

        {/* Botones de registro/login */}
        <Box className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={onGroupContainerClick1}
            className="bg-white text-[#8f3c3c] font-semibold rounded-md shadow-md hover:shadow-lg transition px-4 py-2 text-sm md:text-base"
          >
            Registrarse
          </button>
          <button
            onClick={onGroupContainerClick}
            className="border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-[#8f3c3c] transition px-4 py-2 text-sm md:text-base"
          >
            Iniciar Sesión
          </button>
        </Box>
      </Box>

      {/* HERO SECTION */}
      <Box className="relative flex flex-col md:flex-row justify-between items-center px-6 sm:px-12 md:px-20 pt-16 md:pt-20 pb-10 md:pb-24">
        {/* Texto principal */}
        <Box className="relative z-10 text-left md:w-1/2 flex flex-col gap-6">
          <Typography
            variant="h2"
            className="font-['Lilita_One'] text-[#753b3b] leading-tight"
            sx={{
              fontSize: {
                xs: "2.5rem",
                sm: "3rem",
                md: "4rem",
              },
            }}
          >
            Panadería,{" "}
            <span className="text-[#fd9d50]">pastelería</span> y{" "}
            <span className="text-[#da3644]">snack bar</span>
          </Typography>

          {/* Botón reserva */}
          <button className="bg-[#8f3c3c] text-white text-[1.5rem] md:text-[2rem] font-['Lilita_One'] rounded-lg px-6 py-3 shadow-md hover:bg-[#702828] transition self-center md:self-start">
            RESERVA TU PEDIDO
          </button>

          {/* Dirección */}
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
        <Box className="relative mt-10 md:mt-0 md:w-1/2 flex justify-center items-center">
          <img
            src={imgMilhojasFresa}
            alt="Milhojas Fresa"
            className="w-64 sm:w-80 md:w-[28rem] h-auto object-contain"
          />
          <img
            src={imgAlfajor}
            alt="Alfajor"
            className="absolute bottom-0 right-[15%] w-24 sm:w-32 md:w-40 object-contain"
          />
          <img
            src={imgEmpanadaMixta}
            alt="Empanada"
            className="absolute top-0 left-[10%] w-20 sm:w-28 md:w-36 object-contain"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
