import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithBorders.png";
import imgFooter from "../../assets/images/img_footer.png";
import imgBook from "../../assets/images/img_book.png";
import imgFacebookLogo from "../../assets/images/img_facebookLogo.png";
import imgIgLogo from "../../assets/images/img_igLogo.png";
import imgXLogo from "../../assets/images/img_xLogo.png";
import imgYtLogo from "../../assets/images/img_ytLogo.png";
import { ModalTerminos, ModalPrivacidad, ModalQuienesSomos } from "../common/Modal";

const Footer = () => {
  const [openModal, setOpenModal] = useState(null); // null | "terminos" | "privacidad" | "quienes"
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (item === "Ubicación") {
      window.open("https://maps.app.goo.gl/rYYDD2HYf5QmBSDq7", "_blank");
    } else if (item === "Contacto") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate("/contact-us");
    }
  };

  const handleDescubreClick = (item) => {
    if (item === "Nuestra carta") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate("/carta");
    } else if (item === "Delivery") {
      navigate("/home");
      // Esperamos a que se monte el componente Home antes de hacer scroll
      setTimeout(() => {
        const deliverySection = document.querySelector(
          '[data-scroll-to="rESERVASDEPEDIDOS"]'
        );
        if (deliverySection) {
          deliverySection.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  };

  // 🔹 Nuevo: función para redirigir las categorías a /carta
  const handleCategoriaClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/carta");
  };

  return (
    <Box className="w-full font-[Montserrat] overflow-hidden">
      {/* Header del Footer */}
      <Box className="flex flex-col md:flex-row w-full">
        <Box className="bg-[#8f3c3c] p-4 md:p-6 flex justify-center items-center md:min-w-[330px] md:max-w-[330px]">
          <img
            src={imgLogoFamiglia}
            alt="Logo Famiglia"
            className="w-[230px] md:w-[260px] object-contain"
          />
        </Box>

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

      {/* Imagen decorativa */}
      <Box
        className="w-full relative leading-none"
        sx={{
          background: "linear-gradient(to bottom, transparent 80%, #8f3c3c 100%)",
        }}
      >
        <img src={imgFooter} alt="Decoración" className="w-full object-cover block" />
      </Box>

      {/* Contenido textual */}
      <Box className="bg-[#8f3c3c] text-white pt-12 pb-16">
        <Box className="max-w-[1200px] mx-auto px-6 md:px-10">
          <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-left">
            {[
              {
                title: "Sobre nosotros",
                items: [
                  { text: "Quiénes somos", action: () => setOpenModal("quienes") },
                  { text: "Ubicación", action: () => handleItemClick("Ubicación") },
                  { text: "Contacto", action: () => handleItemClick("Contacto") },
                ],
              },
              {
                title: "Descubre",
                items: [
                  { text: "Nuestra carta", action: () => handleDescubreClick("Nuestra carta") },
                  { text: "Delivery", action: () => handleDescubreClick("Delivery") },
                ],
              },
              {
                title: "Categorías",
                items: [
                  { text: "Postres" },
                  { text: "Tortas" },
                  { text: "Salados" },
                  { text: "Sandwiches" },
                  { text: "Bebidas" },
                ],
              },
              {
                title: "Legales",
                items: [
                  { text: "Términos y condiciones", action: () => setOpenModal("terminos") },
                  { text: "Política de privacidad", action: () => setOpenModal("privacidad") },
                ],
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
                      onClick={item.action || (section.title === "Categorías" ? handleCategoriaClick : null)}
                      className={`text-white cursor-pointer ${
                        item.action || section.title === "Categorías" ? "hover:underline" : ""
                      }`}
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 400,
                        fontSize: "20px",
                      }}
                    >
                      {item.text}
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

              <Box
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  navigate("/complaints");
                }}
                className="bg-white text-[#753b3b] rounded-md px-5 py-3 flex items-center
                justify-center gap-2 text-[0.9rem] font-medium shadow-md hover:bg-[#fde3e3]
                transition-all cursor-pointer"
              >
                <img src={imgBook} alt="Libro de Reclamaciones" className="w-5 h-5" />
                Libro de Reclamaciones
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Pie */}
      <Box className="bg-white text-[#b63434] text-center py-4 text-sm md:text-base font-medium">
        Pastelería Famiglia © 2025 - Todos los derechos reservados
      </Box>

      {/* Modales */}
      <ModalTerminos isOpen={openModal === "terminos"} onClose={() => setOpenModal(null)} />
      <ModalPrivacidad isOpen={openModal === "privacidad"} onClose={() => setOpenModal(null)} />
      <ModalQuienesSomos isOpen={openModal === "quienes"} onClose={() => setOpenModal(null)} />
    </Box>
  );
};

export default Footer;
