import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useVoice } from "../context/VoiceContext";
import HeroSection from "../components/layout/Home/HeroSection";
import MenuSection from "../components/layout/Home/MenuSection";
import DeliverySection from "../pages/Delivery";

const Home = () => {
  const navigate = useNavigate();
  const { speak, registerCommands, unregisterCommands } = useVoice();
  
  const onCartaTextClick = () => navigate("/carta");
  const onDeliveryTextClick = () => navigate("/delivery");
  const onTestTextClick = () => navigate("/test");
  const onContactanosTextClick = () => navigate("/contact-us");

  // ============================================
  // COMANDOS DE VOZ ESPECÍFICOS DE HOME
  // ============================================
  useEffect(() => {
    const voiceCommands = {
      'ver catálogo': () => {
        onCartaTextClick();
        speak('Yendo al catálogo');
      },
      'ver carta': () => {
        onCartaTextClick();
        speak('Yendo a la carta');
      },
      'ver delivery': () => {
        onDeliveryTextClick();
        speak('Yendo a información de delivery');
      },
      'hacer test': () => {
        onTestTextClick();
        speak('Yendo al test de preferencias');
      },
      'test de preferencias': () => {
        onTestTextClick();
        speak('Yendo al test de preferencias');
      },
      'contactar': () => {
        onContactanosTextClick();
        speak('Yendo a la página de contacto');
      },
      'contáctanos': () => {
        onContactanosTextClick();
        speak('Yendo a la página de contacto');
      },
    };

    registerCommands(voiceCommands);
    console.log('[Home] ✅ Comandos de voz registrados:', Object.keys(voiceCommands).length);

    return () => {
      unregisterCommands();
      console.log('[Home] 🗑️ Comandos de voz eliminados');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak]);

  return (
    <Box className="w-full min-h-screen bg-white overflow-hidden">
      <HeroSection
        onCartaTextClick={onCartaTextClick}
        onDeliveryTextClick={onDeliveryTextClick}
        onTestTextClick={onTestTextClick}
        onContactanosTextClick={onContactanosTextClick}
      />
      <MenuSection />
      <DeliverySection />
    </Box>
  );
};

export default Home;
