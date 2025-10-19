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
    <Box className="w-full font-[Montserrat] overflow-hidden">

      {/* Header del Footer: Logo + Slogan */}
      <Box className="flex flex-col md:flex-row w-full">
        {/* Logo dentro de caja granate */}
        <Box className="bg-[#8f3c3c] p-4 md:p-6 flex justify-center items-center md:min-w-[330px] md:max-w-[330px]">
          <img
            src={imgLogoFamiglia}
            alt="Logo Famiglia"
            className="w-[230px] md:w-[260px] object-contain"
          />
        </Box>

        {/* Slogan */}
        <Box className="bg-[#8f3c3c] flex-1 flex justify-center items-center text-center px-6 md:px-10 py-6">
          <Typography
            variant="h5"
            className="text-white font-normal leading-tight"
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 400,
              fontSize: "35px",
            }}
          >
            Tu mesa de siempre, en la esquina de Arenales.
            <br />
            ¡Siempre pensando en ustedes!
          </Typography>
        </Box>
      </Box>

      {/* Imagen decorativa con fusión al fondo granate */}
      <Box
        className="w-full relative leading-none"
        sx={{
          background: "linear-gradient(to bottom, transparent 80%, #8f3c3c 100%)",
        }}
      >
        <img
          src={imgFooter}
          alt="Decoración"
          className="w-full object-cover block align-bottom m-0 p-0"
        />
      </Box>

      {/* Contenido textual del footer */}
      <Box className="bg-[#8f3c3c] text-white pt-12 pb-16">
        <Box className="max-w-[1200px] mx-auto px-6 md:px-10">
          <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-left">

            {/* Secciones principales */}
            {[
              {
                title: "Sobre nosotros",
                items: ["Quienes somos", "Ubicación", "Contacto"],
              },
              {
                title: "Descubre",
                items: ["Nuestra carta", "Delivery"],
              },
              {
                title: "Categorías",
                items: ["Postres", "Tortas", "Salados", "Sandwiches", "Bebidas"],
              },
              {
                title: "Legales",
                items: ["Términos y condiciones", "Política de privacidad"],
              },
            ].map((section, idx) => (
              <Box key={idx}>
                <Typography
                  className="text-white mb-3"
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: "25px",
                  }}
                >
                  {section.title}
                </Typography>
                <ul className="list-none pl-0 space-y-[14px]">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-white"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 400,
                        fontSize: "20px",
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Box>
            ))}

            {/* Síguenos */}
            <Box>
              <Typography
                className="text-white mb-3"
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: "25px",
                }}
              >
                Síguenos
              </Typography>

              <Box className="flex gap-3 mb-6">
                <img src={imgFacebookLogo} alt="Facebook" className="w-9 h-9" />
                <img src={imgIgLogo} alt="Instagram" className="w-9 h-9" />
                <img src={imgXLogo} alt="X" className="w-9 h-9" />
                <img src={imgYtLogo} alt="YouTube" className="w-9 h-9" />
              </Box>

              <Box className="bg-white text-[#000] rounded-md px-4 py-3 flex items-center justify-center gap-2 text-[0.9rem] font-medium shadow-md hover:bg-gray-100 transition-all">
                <img src={imgBook} alt="Libro de Reclamaciones" className="w-5 h-5" />
                Reclamaciones
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Pie de página */}
      <Box className="bg-white text-[#b63434] text-center py-4 text-sm md:text-base font-medium">
        Pastelería Famiglia © 2025 - Todos los derechos reservados
      </Box>
    </Box>
  );
};

export default Footer;
