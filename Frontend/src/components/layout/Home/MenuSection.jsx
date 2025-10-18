import { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import imgSliderMenu from "../../../assets/images/img_sliderMenu.png";
import imgTartaDurazno from "../../../assets/images/img_tartaDurazno.png";
import imgTartaMokaChocolate from "../../../assets/images/img_tartaMokaChocolate.png";
import imgSandwich from "../../../assets/images/img_sandwich.png";
import imgEmpanadaPollo from "../../../assets/images/img_empanadaPollo.png";
import imgJugoArandano from "../../../assets/images/img_jugoArandanos.png";

const MenuSection = () => {
  const categorias = [
    { nombre: "Postres", img: imgTartaDurazno },
    { nombre: "Tortas", img: imgTartaMokaChocolate },
    { nombre: "Sandwiches", img: imgSandwich },
    { nombre: "Salados", img: imgEmpanadaPollo },
    { nombre: "Bebidas", img: imgJugoArandano },
  ];

  // Duplicamos para loop: 3 veces (prevención de "saltos" visibles)
  const items = [...categorias, ...categorias, ...categorias];

  const sliderRef = useRef(null);

  // refs mutables para arrastre/pointer (no re-render)
  const isPointerDown = useRef(false);
  const startX = useRef(0); // pointer position when started
  const prevScrollLeft = useRef(0); // scrollLeft when pointerdown started
  const currentPointerX = useRef(0);

  // inicializar en la "tercera parte" (centro)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const oneThird = slider.scrollWidth / 3;
    slider.scrollLeft = oneThird;
    prevScrollLeft.current = slider.scrollLeft;
  }, []);

  // Ajuste de loop: cuando pasamos umbrales, desplazamos ±oneThird y sincronizamos refs
  const handleScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const total = slider.scrollWidth;
    const visible = slider.clientWidth;
    const oneThird = total / 3;
    const left = slider.scrollLeft;

    // margen de seguridad para el loop (en píxeles, no porcentaje)
    const margin = 50;

    // 🔁 Si llega muy cerca del inicio, saltamos una sección hacia adelante
    if (left <= margin) {
      slider.scrollLeft = left + oneThird;
      prevScrollLeft.current = slider.scrollLeft;
      startX.current = currentPointerX.current;
    }

    // 🔁 Si llega muy cerca del final, saltamos una sección hacia atrás
    else if (left + visible >= total - margin) {
      slider.scrollLeft = left - oneThird;
      prevScrollLeft.current = slider.scrollLeft;
      startX.current = currentPointerX.current;
    }
  };

  // Pointer handlers para mouse y touch unificados
  const onPointerDown = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;
    isPointerDown.current = true;
    slider.setPointerCapture(e.pointerId);

    // guardar posiciones
    startX.current = e.pageX - slider.offsetLeft;
    currentPointerX.current = e.pageX - slider.offsetLeft;
    prevScrollLeft.current = slider.scrollLeft;
    // cambiar cursor
    slider.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    const slider = sliderRef.current;
    if (!slider || !isPointerDown.current) return;
    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;
    currentPointerX.current = x;
    const walk = (x - startX.current) * 1.2; // velocidad
    slider.scrollLeft = prevScrollLeft.current - walk;
    // no actualizar prevScrollLeft aquí; lo mantenemos fijo hasta pointerup
  };

  const onPointerUp = (e) => {
    const slider = sliderRef.current;
    if (!slider) return;
    isPointerDown.current = false;
    try {
      slider.releasePointerCapture(e.pointerId);
    } catch (err) { }
    slider.style.cursor = "grab";

    // después de terminar el drag, actualizamos prevScrollLeft para futuras operaciones
    prevScrollLeft.current = slider.scrollLeft;
  };

  // Evitar selección accidental de texto al arrastrar (adicional)
  useEffect(() => {
    const preventSelect = (ev) => {
      if (isPointerDown.current) ev.preventDefault();
    };
    document.addEventListener("selectstart", preventSelect);
    return () => document.removeEventListener("selectstart", preventSelect);
  }, []);

  return (
    <Box
      className="relative w-full overflow-hidden select-none"
      sx={{
        paddingTop: { xs: "60px", sm: "80px", md: "20px" },
        paddingBottom: { xs: "80px", sm: "100px", md: "120px" },
      }}>
      {/* Fondo curvado */}
      <img
        src={imgSliderMenu}
        alt="Fondo del menú"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        draggable={false}
      />

      {/* Contenido (MENÚ + slider) */}
      <Box
        className="relative z-10 py-10 md:py-14"
        sx={{
          position: "relative",
          top: { xs: "-30px", sm: "-40px", md: "-40px" },
        }}
      >
        {/* Contenedor solo para el título con padding horizontal */}
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

        {/* Slider infinito */}
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
          }}
        >
          {items.map((cat, i) => (
            <Box
              key={i}
              className="flex flex-col items-center justify-center flex-shrink-0"
              sx={{
                width: "auto",
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: 115,
                    sm: 150,
                    md: 190,
                  },
                  height: {
                    xs: 115,
                    sm: 150,
                    md: 190,
                  },
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={cat.img}
                  alt={cat.nombre}
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
                  fontSize: {
                    xs: "20px",
                    sm: "28px",
                    md: "34px",
                  },
                }}
              >
                {cat.nombre}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MenuSection;
