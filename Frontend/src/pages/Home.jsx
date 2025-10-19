import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/layout/Home/HeroSection";
import MenuSection from "../components/layout/Home/MenuSection";
import DeliverySection from "../components/layout/Home/DeliverySection";

const Home = () => {
  const navigate = useNavigate();
  
  const onCartaTextClick = () => {};
  const onDeliveryTextClick = () => {};
  const onTestTextClick = () => {};
  const onContactanosTextClick = () => navigate("/contact-us");
  const onGroupContainerClick = () => {};
  const onGroupContainerClick1 = () => {};

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
      <DeliverySection />
    </Box>
  );
};

export default Home;
