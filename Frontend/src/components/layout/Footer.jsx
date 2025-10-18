import { Box, Typography } from "@mui/material";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithBorders.png";
import imgFooter from "../../assets/images/img_footer.png";
import imgBook from "../../assets/images/img_book.png";
import imgFacebookLogo from "../../assets/images/img_facebookLogo.png";
import imgIgLogo from "../../assets/images/img_igLogo.png";
import imgXLogo from "../../assets/images/img_xLogo.png";
import imgYtLogo from "../../assets/images/img_ytLogo.png";

const Footer = () => {
  return (
    <Box className="relative w-full bg-white text-[#000] font-[Montserrat] overflow-hidden">
      {/* Fondo granate */}
      <Box className="bg-[#8f3c3c] w-full text-white py-16 px-8 sm:px-12 md:px-20 relative">
        {/* Logo principal */}
        <img
          src={imgLogoFamiglia}
          alt="Famiglia Logo"
          className="w-64 sm:w-72 md:w-80 object-contain mb-8"
        />

        {/* Slogan */}
        <Typography
          variant="h5"
          className="text-center font-medium leading-tight mb-12"
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
          }}
        >
          Tu mesa de siempre, en la esquina de Arenales. <br />
          ¡Siempre pensando en ustedes!
        </Typography>

        {/* Imagen decorativa del footer */}
        <img
          src={imgFooter}
          alt="Decoración footer"
          className="w-full max-w-[1200px] mx-auto object-cover rounded-lg mb-10"
        />

        {/* Contenedor de secciones */}
        <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-white text-left">
          {/* Sobre nosotros */}
          <Box>
            <Typography
              variant="h6"
              className="font-bold text-[1.2rem] mb-3 tracking-tight"
            >
              Sobre nosotros
            </Typography>
            <ul className="space-y-1 text-[0.95rem] leading-[1.6]">
              <li>Quienes somos</li>
              <li>Ubicación</li>
              <li>Contacto</li>
            </ul>
          </Box>

          {/* Descubre */}
          <Box>
            <Typography
              variant="h6"
              className="font-bold text-[1.2rem] mb-3 tracking-tight"
            >
              Descubre
            </Typography>
            <ul className="space-y-1 text-[0.95rem] leading-[1.6]">
              <li>Nuestra carta</li>
              <li>Delivery</li>
            </ul>
          </Box>

          {/* Categorías */}
          <Box>
            <Typography
              variant="h6"
              className="font-bold text-[1.2rem] mb-3 tracking-tight"
            >
              Categorías
            </Typography>
            <ul className="space-y-1 text-[0.95rem] leading-[1.6]">
              <li>Postres</li>
              <li>Tortas</li>
              <li>Salados</li>
              <li>Sandwiches</li>
              <li>Bebidas</li>
            </ul>
          </Box>

          {/* Legales */}
          <Box>
            <Typography
              variant="h6"
              className="font-bold text-[1.2rem] mb-3 tracking-tight"
            >
              Legales
            </Typography>
            <ul className="space-y-1 text-[0.95rem] leading-[1.6]">
              <li>Términos y condiciones</li>
              <li>Política de privacidad</li>
            </ul>
          </Box>

          {/* Redes sociales */}
          <Box>
            <Typography
              variant="h6"
              className="font-bold text-[1.2rem] mb-3 tracking-tight"
            >
              Síguenos
            </Typography>
            <Box className="flex gap-3 mb-6">
              <img src={imgFacebookLogo} alt="Facebook" className="w-10 h-10" />
              <img src={imgIgLogo} alt="Instagram" className="w-10 h-10" />
              <img src={imgXLogo} alt="X" className="w-10 h-10" />
              <img src={imgYtLogo} alt="YouTube" className="w-10 h-10" />
            </Box>

            {/* Reclamaciones */}
            <Box className="bg-white text-[#000] rounded-md px-4 py-3 flex items-center justify-center gap-2 text-[0.9rem] font-medium shadow-md hover:bg-gray-100 transition-all">
              <img src={imgBook} alt="Libro de Reclamaciones" className="w-6 h-6" />
              Reclamaciones
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Derechos reservados */}
      <Box className="bg-white text-[#b63434] text-center py-4 text-sm md:text-base font-medium">
        Pastelería Famiglia © 2025 - Todos los derechos reservados
      </Box>
    </Box>
  );
};

export default Footer;
