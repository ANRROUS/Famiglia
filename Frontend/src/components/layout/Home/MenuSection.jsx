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
  const hasDragged = useRef(false);
  const pointerTypeRef = useRef(null);

  const clickThreshold = 6; // px - umbral para diferenciar clic/drag

  const categorias = [
    { nombre: "Postres", img: imgTartaDurazno },
    { nombre: "Tortas", img: imgTartaMokaChocolate },
    { nombre: "Sandwiches", img: imgSandwich },
    { nombre: "Salados", img: imgEmpanadaPollo },
    { nombre: "Bebidas", img: imgJugoArandano },
  ];

  // Duplicamos categorías para crear efecto infinito
  const items = [...categorias, ...categorias, ...categorias];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    // Iniciamos en el 1/3
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

    // Guardamos tipo de pointer (mouse | touch | pen)
    pointerTypeRef.current = e.pointerType;

    isPointerDown.current = true;
    hasDragged.current = false;

    // Sólo capturamos el pointer si es touch (evita comportamientos raros con mouse)
    try {
      if (e.pointerType === "touch") slider.setPointerCapture(e.pointerId);
    } catch (err) {}

    // Use clientX + getBoundingClientRect para obtener posición fiable
    const rect = slider.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    startX.current = pointerX;
    currentPointerX.current = pointerX;
    prevScrollLeft.current = slider.scrollLeft;

    // No poner cursor 'grabbing' aquí: lo ponemos solo cuando haya movimiento real
    // slider.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    const slider = sliderRef.current;
    if (!slider || !isPointerDown.current) return;

    // posición fiable
    const rect = slider.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    currentPointerX.current = pointerX;

    const distance = (pointerX - startX.current) * 1.2;

    // Si supera umbral lo consideramos drag
    if (Math.abs(distance) > clickThreshold) {
      hasDragged.current = true;
      // Ahora sí cambiamos el cursor a grabbing (sólo cuando hay arrastre)
      slider.style.cursor = "grabbing";
    }

    // Actualizamos scroll
    slider.scrollLeft = prevScrollLeft.current - distance;
  };

  const onPointerUp = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;

    isPointerDown.current = false;

    // Liberar capture si lo hemos hecho
    try {
      if (pointerTypeRef.current === "touch") slider.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // Restaurar cursor a grab por defecto (o eliminar estilo)
    slider.style.cursor = "grab";

    // Detectar si fue clic (movimiento pequeño)
    const movedDistance = Math.abs(currentPointerX.current - startX.current);
    if (movedDistance < clickThreshold) {
      // Buscar el elemento con data-category: usamos e.target (puede ser imagen, texto, etc.)
      const clickedElement = e.target && e.target.closest ? e.target.closest("[data-category]") : null;
      if (clickedElement) {
        const categoria = clickedElement.dataset.category;
        handleCategoryClick(categoria);
      }
    }

    prevScrollLeft.current = slider.scrollLeft;
    // reset pointer type
    pointerTypeRef.current = null;
  };

  // Evita selección de texto al arrastrar
  useEffect(() => {
    const preventSelect = (ev) => {
      if (isPointerDown.current) ev.preventDefault();
    };
    document.addEventListener("selectstart", preventSelect);
    return () => document.removeEventListener("selectstart", preventSelect);
  }, []);

  // Acción al click
  const handleCategoryClick = (categoria) => {
    navigate("/carta")
  };

  return (
    <Box
      className="relative w-full overflow-hidden select-none"
      sx={{
        paddingTop: { xs: "60px", sm: "80px", md: "20px" },
        paddingBottom: { xs: "80px", sm: "100px", md: "120px" },
      }}
    >
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

        <Box
          ref={sliderRef}
          // IMPORTANTE: touchAction controla comportamiento nativo del navegador.
          // pan-y permite scroll vertical de la página, y evita que el navegador
          // capture el gesto horizontal (nosotros controlamos el drag horizontal).
          sx={{
            gap: { xs: 3, sm: 4, md: 5 },
            scrollSnapType: "x mandatory",
            justifyContent: "flex-start",
            paddingY: { xs: 1, sm: 1, md: 1 },
            minHeight: { xs: 180, sm: 220, md: 260 },
            // touchAction en sx:
            touchAction: "pan-y",
            // cursor por defecto:
            cursor: "grab",
          }}
          className="flex overflow-x-scroll scrollbar-hide select-none"
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {items.map(({ nombre, img }, index) => (
            <Box
              key={index}
              data-category={nombre}
              // NO onClick aquí; lo detectamos en pointerup para que funcione con pointer capture
              className="flex flex-col items-center justify-center flex-shrink-0 cursor-pointer
                         transition-transform duration-300 hover:scale-105
                         hover:drop-shadow-[0_8px_12px_rgba(255,255,255,0.3)] active:scale-95"
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
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
