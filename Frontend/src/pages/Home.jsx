import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/layout/Home/HeroSection";
import MenuSection from "../components/layout/Home/MenuSection";
import DeliverySection from "../pages/Delivery";

const Home = () => {
  const navigate = useNavigate();
  
  const onCartaTextClick = () => navigate("/carta");
  const onDeliveryTextClick = () => navigate("/delivery");
  const onTestTextClick = () => navigate("/test");
  const onContactanosTextClick = () => navigate("/contact-us");

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
