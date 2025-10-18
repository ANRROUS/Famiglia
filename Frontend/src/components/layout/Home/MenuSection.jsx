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

  return (
    <Box className="relative w-full text-center bg-white py-16 md:py-20 font-[Montserrat] overflow-hidden">
      {/* Fondo del slider */}
      <img
        src={imgSliderMenu}
        alt="Fondo del menú"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-95"
      />

      {/* Título */}
      <Typography
        variant="h2"
        className="relative font-['Potta_One'] text-[#8f3c3c] text-left px-6 md:px-20 mb-10"
        sx={{
          fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
          lineHeight: "90%",
        }}
      >
        MENÚ
      </Typography>

      {/* Contenedor de categorías */}
      <Box className="relative z-10 flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-12 px-6 md:px-16 lg:px-28">
        {categorias.map((cat, index) => (
          <Box
            key={index}
            className={`flex flex-col items-center justify-center transition-transform hover:scale-105 ${
              index === 0 || index === categorias.length - 1
                ? "opacity-60"
                : "opacity-100"
            }`}
          >
            <img
              src={cat.img}
              alt={cat.nombre}
              className="rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover shadow-lg"
            />
            <Typography
              variant="h6"
              className="mt-4 text-[#753b3b] font-bold tracking-tight"
              sx={{
                fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
              }}
            >
              {cat.nombre}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MenuSection;
