import { Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HeroSection from "../components/layout/Home/HeroSection";
import MenuSection from "../components/layout/Home/MenuSection";
import DeliverySection from "../components/layout/Home/DeliverySection";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const onCartaTextClick = () => navigate("/carta");
  const onDeliveryTextClick = () => {
    // Si ya estamos en Home, scroll a la sección
    const deliverySection = document.getElementById("delivery-section");
    if (deliverySection) {
      deliverySection.scrollIntoView({ behavior: "smooth" });
    }
  };
  const onTestTextClick = () => navigate("/test");
  const onContactanosTextClick = () => navigate("/contact-us");
  const onGroupContainerClick = () => {};
  const onGroupContainerClick1 = () => {};

  // Manejar el scroll a delivery cuando se llega desde otra página
  useEffect(() => {
    if (location.hash === "#delivery") {
      const deliverySection = document.getElementById("delivery-section");
      if (deliverySection) {
        deliverySection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <Box className="w-full min-h-screen bg-white overflow-hidden">
      <HeroSection
        onCartaTextClick={onCartaTextClick}
        onDeliveryTextClick={onDeliveryTextClick}
        onTestTextClick={onTestTextClick}
        onContactanosTextClick={onContactanosTextClick}
        onGroupContainerClick={onGroupContainerClick}
        onGroupContainerClick1={onGroupContainerClick1}
      />
      <MenuSection />
      <DeliverySection id="delivery-section" />
    </Box>
  );
};

export default Home;
