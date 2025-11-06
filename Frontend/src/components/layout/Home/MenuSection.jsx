import { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import imgSliderMenu from "../../../assets/images/img_sliderMenu.png";
import imgTartaDurazno from "../../../assets/images/img_tartaDurazno.png";
import imgTartaMokaChocolate from "../../../assets/images/img_tartaMokaChocolate.png";
import imgSandwich from "../../../assets/images/img_sandwich.png";
import imgEmpanadaPollo from "../../../assets/images/img_empanadaPollo.png";
import imgJugoArandano from "../../../assets/images/img_jugoArandanos.png";

const MenuSection = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const prevScrollLeft = useRef(0);
  const currentPointerX = useRef(0);

  const categorias = [
    { nombre: "Postres", img: imgTartaDurazno },
    { nombre: "Tortas", img: imgTartaMokaChocolate },
    { nombre: "Sandwiches", img: imgSandwich },
    { nombre: "Salados", img: imgEmpanadaPollo },
    { nombre: "Bebidas", img: imgJugoArandano },
  ];

  const items = [...categorias, ...categorias, ...categorias];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const oneThird = slider.scrollWidth / 3;
    slider.scrollLeft = oneThird;
    prevScrollLeft.current = oneThird;
  }, []);

  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const { scrollWidth: total, clientWidth: visible, scrollLeft: left } = slider;
    const oneThird = total / 3;
    const margin = 50;

    if (left <= margin) {
      slider.scrollLeft = left + oneThird;
    } else if (left + visible >= total - margin) {
      slider.scrollLeft = left - oneThird;
    }

    prevScrollLeft.current = slider.scrollLeft;
    startX.current = currentPointerX.current;
  };

  const onPointerDown = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;

    isPointerDown.current = true;
    slider.setPointerCapture(e.pointerId);

    const pointerX = e.pageX - slider.offsetLeft;
    startX.current = pointerX;
    currentPointerX.current = pointerX;
    prevScrollLeft.current = slider.scrollLeft;

    slider.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    const slider = sliderRef.current;
    if (!slider || !isPointerDown.current) return;

    e.preventDefault();
    const pointerX = e.pageX - slider.offsetLeft;
    currentPointerX.current = pointerX;

    const distance = (pointerX - startX.current) * 1.2;
    slider.scrollLeft = prevScrollLeft.current - distance;
  };

  const onPointerUp = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;

    isPointerDown.current = false;
    slider.style.cursor = "grab";

    try {
      slider.releasePointerCapture(e.pointerId);
    } catch {}

    prevScrollLeft.current = slider.scrollLeft;
  };

  useEffect(() => {
    const preventSelect = (e) => {
      if (isPointerDown.current) e.preventDefault();
    };
    document.addEventListener("selectstart", preventSelect);
    return () => document.removeEventListener("selectstart", preventSelect);
  }, []);

  const handleCategoryClick = () => { 
    navigate("/carta");
  }

  return (
    <Box
      className="relative w-full overflow-hidden select-none"
      sx={{
        paddingTop: { xs: "60px", sm: "80px", md: "20px" },
        paddingBottom: { xs: "80px", sm: "100px", md: "120px" },
      }}
    >
      {/* Fondo */}
      <img
        src={imgSliderMenu}
        alt="Fondo del menú"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        draggable={false}
      />

      <Box
        className="relative z-10 py-10 md:py-14"
        sx={{ position: "relative", top: { xs: "-30px", sm: "-40px", md: "-40px" } }}
      >
        {/* Título */}
        <Box sx={{ px: { xs: 3, sm: 3, md: 5 } }}>
          <Typography
            sx={{
              fontFamily: "'Potta One', cursive",
              color: "white",
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
              mb: 6,
              position: "relative",
              top: { xs: "10px", sm: "40px", md: "20px" },
            }}
          >
            MENÚ
          </Typography>
        </Box>

        {/* Carrusel */}
        <Box
          ref={sliderRef}
          className="flex overflow-x-scroll scrollbar-hide cursor-grab select-none"
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          sx={{
            gap: { xs: 3, sm: 4, md: 5 },
            scrollSnapType: "x mandatory",
            justifyContent: "flex-start",
            paddingY: { xs: 1, sm: 1, md: 1 },
            minHeight: { xs: 180, sm: 220, md: 260 },
          }}
        >
          {items.map(({ nombre, img }, index) => (
            <Box
              key={index}
              onClick={handleCategoryClick}
              className="flex flex-col items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <Box
                sx={{
                  width: { xs: 115, sm: 150, md: 190 },
                  height: { xs: 115, sm: 150, md: 190 },
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={img}
                  alt={nombre}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </Box>

              <Typography
                sx={{
                  mt: 3,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  color: "white",
                  textAlign: "center",
                  letterSpacing: "-0.5px",
                  fontSize: { xs: "20px", sm: "28px", md: "34px" },
                }}
              >
                {nombre}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MenuSection;
