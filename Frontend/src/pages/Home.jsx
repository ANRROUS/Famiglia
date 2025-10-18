import { Box } from "@mui/material";
import HeroSection from "../components/layout/Home/HeroSection";
import MenuSection from "../components/layout/Home/MenuSection";
import DeliverySection from "../components/layout/Home/DeliverySection";

const Home = () => {
  // callbacks opcionales que ya tenías (si los usas dentro de HeroSection)
  const onCartaTextClick = () => {};
  const onDeliveryTextClick = () => {};
  const onTestTextClick = () => {};
  const onContctanosTextClick = () => {};
  const onGroupContainerClick = () => {};
  const onGroupContainerClick1 = () => {};

  return (
    <Box className="w-full min-h-screen bg-white overflow-hidden">
      <HeroSection
        onCartaTextClick={onCartaTextClick}
        onDeliveryTextClick={onDeliveryTextClick}
        onTestTextClick={onTestTextClick}
        onContctanosTextClick={onContctanosTextClick}
        onGroupContainerClick={onGroupContainerClick}
        onGroupContainerClick1={onGroupContainerClick1}
      />
      <MenuSection />
      <DeliverySection />
    </Box>
  );
};

export default Home;
