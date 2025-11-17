import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import imgRappiLogo from "../assets/images/img_rappiLogo.png";
import imgWhatsappLogo from "../assets/images/img_wspLogo.png";
import { useVoice } from "../context/VoiceContext";

const Delivery = ({ id }) => {
  const { speak, registerCommands, unregisterCommands } = useVoice();

  // Comandos de voz para Delivery
  useEffect(() => {
    const voiceCommands = {
      // Información
      'información de delivery': () => {
        speak('Tenemos dos opciones de delivery: Rappi con envío gratis, y WhatsApp a los números 949978664 o 949870092');
      },
      'cuáles son las opciones de delivery': () => {
        speak('Puedes pedir por Rappi con envío gratis, o por WhatsApp');
      },
      'delivery gratis': () => {
        speak('Sí, el delivery por Rappi es completamente gratis. Aprovecha nuestros combos y ofertas online');
      },

      // Números de contacto
      'cuál es el número de whatsapp': () => {
        speak('Puedes escribirnos a 949978664 o 949870092');
      },
      'número de whatsapp': () => {
        speak('949978664 o 949870092');
      },
      'dime el whatsapp': () => {
        speak('Los números son 949978664 y 949870092');
      },

      // Rappi
      'cómo pido por rappi': () => {
        speak('Haz click en el botón de Rappi para ver nuestros combos y ofertas. El envío es completamente gratis');
      },
      'rappi': () => {
        speak('Envío gratis por Rappi. Haz click en el botón naranja para empezar');
      },

      // Horarios y disponibilidad
      'horarios de delivery': () => {
        speak('Puedes hacer tu pedido en cualquier momento. Para productos personalizados, se requiere al menos 24 horas de anticipación');
      },
      'cuánto demora el delivery': () => {
        speak('El tiempo de entrega depende del método. Por Rappi es inmediato, por WhatsApp coordinamos contigo');
      },
    };

    registerCommands(voiceCommands);
    console.log('[Delivery] ✅ Comandos registrados:', Object.keys(voiceCommands).length);

    return () => {
      unregisterCommands();
      console.log('[Delivery] 🗑️ Comandos eliminados');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak]);
  return (
    <Box
      id={id}
      className="w-full bg-[#FFFFFF] text-center font-[Montserrat] text-[#000] py-24 flex flex-col items-center justify-center"
      data-scroll-to="rESERVASDEPEDIDOS"
    >
      {/* TÍTULO */}
      <Typography
        variant="h2"
        className="text-[#8f3c3c] font-bold tracking-[0.25em] uppercase mb-14 text-center"
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.2rem" },
          lineHeight: "150%",
        }}
      >
        RESERVAS DE PEDIDOS & DELIVERY
      </Typography>

      {/* SUBTÍTULO */}
      <Typography
        variant="subtitle1"
        className="text-[#000] font-normal text-center"
        sx={{
          fontSize: { xs: "0.95rem", sm: "1rem" },
          maxWidth: "720px",
          margin: "0 auto",
          lineHeight: "160%",
          mb: { xs: 8, sm: 10, md: 10 }, // más espacio entre subtítulo y cards
        }}
      >
        Te ofrecemos distintas opciones para que no te quedes con las ganas
      </Typography>

      {/* CONTENEDOR PRINCIPAL */}
      <Box
        className="flex flex-col lg:flex-row justify-center items-center gap-20 lg:gap-28 w-full"
        sx={{ maxWidth: "1100px", mx: "auto" }}
      >
        {/* --- CARD RAPPI --- */}
        <Box className="flex flex-col items-center text-center w-full max-w-[360px]">
          <Box className="h-[170px] flex items-center justify-center mb-8">
            <img
              src={imgRappiLogo}
              alt="Rappi Logo"
              className="w-56 sm:w-60 md:w-64 object-contain"
            />
          </Box>

          <button className="bg-[#ff441f] text-white font-bold rounded-full px-10 py-3 text-lg shadow-md hover:bg-[#e63d18] transition-all mb-8">
            Haz click aquí
          </button>

          <Typography
            variant="body1"
            className="text-[#000] font-light italic mb-4"
            sx={{
              fontSize: { xs: "1rem", sm: "1.05rem" },
              lineHeight: "160%",
              maxWidth: "320px",
            }}
          >
            Aprovecha de nuestros combos y entérate de nuestras ofertas online
          </Typography>

          <Typography
            variant="h6"
            className="font-semibold text-[1.15rem] sm:text-[1.25rem] mt-2"
          >
            Envío GRATIS
          </Typography>
        </Box>

        {/* --- CARD WHATSAPP --- */}
        <Box className="flex flex-col items-center text-center w-full max-w-[360px]">
          <Box className="h-[170px] flex items-center justify-center mb-8">
            <img
              src={imgWhatsappLogo}
              alt="WhatsApp Logo"
              className="w-[140px] sm:w-[160px] md:w-[140px] object-contain"
            />
          </Box>

          <Box className="bg-[#25d366] rounded-full px-10 py-3 text-white font-bold text-lg shadow-md mb-8">
            949978664 | 949870092
          </Box>

          <Typography
            variant="body1"
            className="text-[#000] font-light italic mb-4"
            sx={{
              fontSize: { xs: "1rem", sm: "1.05rem" },
              lineHeight: "160%",
              maxWidth: "320px",
            }}
          >
            Separa tus pedidos y pide delivery de forma directa
          </Typography>

          <Typography
            variant="h6"
            className="font-semibold text-[1.15rem] sm:text-[1.25rem] mt-2"
          >
            Fácil y Rápido
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Delivery;
