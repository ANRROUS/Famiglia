import { Box, Typography } from "@mui/material";
import imgRappiLogo from "../../../assets/images/img_rappiLogo.png";
import imgWhatsappLogo from "../../../assets/images/img_wspLogo.png";

const DeliverySection = () => {
  return (
    <Box
      className="relative w-full bg-white text-center font-[Montserrat] text-[#000] py-16 px-6 md:px-16 lg:px-24 overflow-hidden"
      data-scroll-to="rESERVASDEPEDIDOS"
    >
      {/* Título */}
      <Typography
        variant="h2"
        className="text-[#8f3c3c] font-bold tracking-[0.2em] text-center mb-6"
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          lineHeight: "137%",
        }}
      >
        RESERVAS DE PEDIDOS & DELIVERY
      </Typography>

      {/* Subtítulo */}
      <Typography
        variant="subtitle1"
        className="text-[#000] font-medium text-center mb-12"
        sx={{
          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        Te ofrecemos distintas opciones para que no te quedes con las ganas
      </Typography>

      {/* Contenedor principal */}
      <Box className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20">
        {/* Rappi Card */}
        <Box className="flex flex-col items-center justify-between w-full max-w-[320px]">
          <img
            src={imgRappiLogo}
            alt="Rappi Logo"
            className="w-56 sm:w-64 md:w-72 object-contain mb-6"
          />
          <button className="bg-[#ff441f] text-white font-semibold rounded-full px-8 py-3 text-lg shadow-md hover:bg-[#e93b18] transition-all">
            Haz click aquí
          </button>

          <Typography
            variant="body1"
            className="text-[#000] mt-6 font-light"
            sx={{
              maxWidth: "400px",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Aprovecha nuestros combos y entérate de nuestras ofertas online
          </Typography>

          <Typography
            variant="h6"
            className="font-semibold text-[1.3rem] sm:text-[1.5rem] mt-4"
          >
            Envío GRATIS
          </Typography>
        </Box>

        {/* WhatsApp Card */}
        <Box className="flex flex-col items-center justify-between w-full max-w-[320px]">
          <Box className="relative w-[140px] sm:w-[160px] md:w-[180px] h-[140px] sm:h-[160px] md:h-[180px] mb-4">
            <div className="absolute inset-0 bg-[#25d366] rounded-full shadow-inner shadow-black/20" />
            <img
              src={imgWhatsappLogo}
              alt="WhatsApp Logo"
              className="absolute inset-0 p-3 rounded-full object-cover"
            />
          </Box>

          <Box className="bg-[#24cc63] rounded-full px-6 py-3 text-white font-bold text-lg shadow-md">
            949978664 | 949870092
          </Box>

          <Typography
            variant="body1"
            className="text-[#000] mt-6 font-light"
            sx={{
              maxWidth: "400px",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Separa tus pedidos y pide delivery de forma directa
          </Typography>

          <Typography
            variant="h6"
            className="font-semibold text-[1.3rem] sm:text-[1.5rem] mt-4"
          >
            Fácil y Rápido
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DeliverySection;
