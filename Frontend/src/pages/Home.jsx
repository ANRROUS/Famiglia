import imgWhatsappLogo from "../assets/images/img_wspLogo.png";
import imgRappiLogo from "../assets/images/img_rappiLogo.png";
import imgJugoArandano from "../assets/images/img_jugoArandanos.png";
import imgEmpanadaPollo from "../assets/images/img_empanadaPollo.png";
import imgSandwich from "../assets/images/img_sandwich.png";
import imgTartaMokaChocolate from "../assets/images/img_tartaMokaChocolate.png";
import imgTartaDurazno from "../assets/images/img_tartaDurazno.png";
import imgMilhojasFresa from "../assets/images/img_milhojasFresa.png";
import imgAlfajor from "../assets/images/img_alfajor.png";
import imgEmpanadaMixta from "../assets/images/img_empanadaMixta.png";
import imgDegradado from "../assets/images/img_degradado.png";
import imgFooter from "../assets/images/img_footer.png";
import imgXLogo from "../assets/images/img_xLogo.png";
import imgFacebookLogo from "../assets/images/img_facebookLogo.png";
import imgIgLogo from "../assets/images/img_igLogo.png";
import imgYtLogo from "../assets/images/img_ytLogo.png";
import imgLogoFamiglia from "../assets/images/img_logoFamigliawithBorders.png";
import imgLogoFamigliawithourBorders from "../assets/images/img_logoFamigliawithoutBorders.png";
import imgSliderMenu from "../assets/images/img_sliderMenu.png";
import imgPointMap from "../assets/images/img_map.png";
import imgBook from "../assets/images/img_book.png";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";

const Home = () => {
  const onCartaTextClick = useCallback(() => {
    // Please sync "Catálogo" to the project
  }, []);

  const onDeliveryTextClick = useCallback(() => {
    const anchor = document.querySelector(
      "[data-scroll-to='rESERVASDEPEDIDOS']"
    );
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onTestTextClick = useCallback(() => {
    // Please sync "Test de Preferencias" to the project
  }, []);

  const onContctanosTextClick = useCallback(() => {
    // Please sync "Contactanos" to the project
  }, []);

  const onGroupContainerClick = useCallback(() => {
    // Please sync "Inicio de sesion" to the project
  }, []);

  const onGroupContainerClick1 = useCallback(() => {
    // Please sync "Registro" to the project
  }, []);

  return (
    <Box className="w-full h-[3078px] relative bg-[#fff] overflow-hidden text-center text-3xl text-[#fff] font-[Montserrat]">
      <Box className="absolute top-[1848px] left-[809px] w-[404px] h-[49px] text-[25px]">
        <Box className="absolute top-[0px] left-[0px] w-[404px] h-[49px]">
          <Box className="absolute top-[0px] left-[0px] rounded-[27.5px] bg-[#24cc63] w-[404px] h-[49px]" />
          <Typography
            className="absolute top-[7px] left-[37px] flex items-center justify-center w-[331px]"
            variant="inherit"
            variantMapping={{ inherit: "b" }}
            sx={{
              lineHeight: "140%",
              letterSpacing: "-0.04em",
              fontWeight: "700",
            }}
          >
            949978664 | 949870092
          </Typography>
        </Box>
      </Box>
      <Box className="absolute top-[1667px] left-[943px] w-[159px] h-[150.6px]">
        <Box className="absolute top-[0px] left-[159px] shadow-[-3px_2px_26.3px_-2px_rgba(0,_0,_0,_0.25)_inset] rounded-tl-[200px] rounded-tr-[212px] rounded-br-[27px] rounded-bl-[200px] bg-[#25d366] w-[159px] h-[150.6px] [transform:_rotate(180deg)] [transform-origin:0_0]" />
        <img
          className="absolute top-[9.8px] left-[13.3px] rounded-[150px] w-[131px] h-[131px] object-cover"
          alt=""
          src={imgWhatsappLogo}
        />
      </Box>
      <div className="absolute top-[2109px] left-[918px] text-[28px] tracking-[-0.04em] leading-[140%] font-semibold text-[#000]">
        Fácil y Rápido
      </div>
      <Typography
        className="absolute top-[1968px] left-[837px] flex text-[#000] items-center justify-center w-[349px]"
        variant="inherit"
        variantMapping={{ inherit: "i" }}
        sx={{ fontWeight: "300", lineHeight: "140%", letterSpacing: "-0.04em" }}
      >
        Separa tus pedidos y pide delivery de forma directa
      </Typography>
      <Box className="absolute top-[1685px] left-[263px] w-[317px] h-[212px]">
        <Box className="absolute top-[163px] left-[10px] w-[298px] h-[49px]">
          <Box className="absolute top-[0px] left-[0px] rounded-[27.5px] bg-[#ff441f] w-[298px] h-[49px]" />
          <div className="absolute top-[4px] left-[49px] tracking-[-0.04em] leading-[140%] font-semibold">
            Haz click aquí
          </div>
        </Box>
        <img
          className="absolute top-[0px] left-[0px] w-[317px] h-[133px] object-cover"
          alt=""
          src={imgRappiLogo}
        />
      </Box>
      <Typography
        className="absolute top-[1968px] left-[212px] flex text-[#000] items-center justify-center w-[421px]"
        variant="inherit"
        variantMapping={{ inherit: "i" }}
        sx={{ fontWeight: "300", lineHeight: "140%", letterSpacing: "-0.04em" }}
      >
        Aprovecha de nuestros combos y enterate de nuestras ofertas online
      </Typography>
      <div className="absolute top-[2109px] left-[333px] text-[28px] tracking-[-0.04em] leading-[140%] font-semibold text-[#000]">
        Envío GRATIS
      </div>
      <div className="absolute top-[1544px] left-[423px] text-xl tracking-[-0.04em] leading-[140%] text-[#000] flex items-center justify-center w-[625px] h-[68px]">
        Te ofrecemos distintas opciones para que no te quedes con las ganas
      </div>
      <Typography
        className="absolute top-[1422px] left-[calc(50%_-_306px)] flex text-[#8f3c3c] items-center justify-center w-[673px]"
        variant="inherit"
        variantMapping={{ inherit: "b" }}
        sx={{
          fontSize: "32px",
          lineHeight: "137%",
          letterSpacing: "0.22em",
          fontWeight: "700",
        }}
      >{`RESERVAS DE PEDIDOS & DELIVERY`}</Typography>
      <Box className="absolute top-[809px] left-[-229px] w-[1704px] h-[542px] text-[35px]">
        <img
          className="absolute top-[0px] left-[0px] w-[1704px] h-[519px]"
          alt=""
          src={imgSliderMenu}
        />
        <Box className="absolute top-[162px] left-[209px] w-[1414px] h-[282px]">
          <Box className="absolute top-[15px] left-[1201.1px] w-[212.9px] h-[259.5px] opacity-[0.5] text-3xl">
            <img
              className="absolute top-[0px] left-[6.2px] rounded-[148px] w-[200.4px] h-[200.4px] object-cover"
              alt=""
              src={imgJugoArandano}
            />
            <Typography
              className="absolute top-[216.9px] left-[0px] flex items-center justify-center w-[212.9px] h-[42.5px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{ lineHeight: "141%", fontWeight: "700" }}
            >
              Bebidas
            </Typography>
          </Box>
          <Box className="absolute top-[0px] left-[889.5px] w-[233.5px] h-[282px]">
            <img
              className="absolute top-[0px] left-[8.9px] rounded-[1161px] w-[219.3px] h-[219.3px] object-cover"
              alt=""
              src={imgEmpanadaPollo}
            />
            <Typography
              className="absolute top-[235.8px] left-[0px] flex items-center justify-center w-[233.5px] h-[46.2px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{ lineHeight: "141%", fontWeight: "700" }}
            >
              Salados
            </Typography>
          </Box>
          <Box className="absolute top-[0px] left-[582.4px] w-[234.7px] h-[282px]">
            <img
              className="absolute top-[0px] left-[11.3px] rounded-[1000px] w-[218.9px] h-[218.9px] object-cover"
              alt=""
              src={imgSandwich}
            />
            <Typography
              className="absolute top-[235.6px] left-[0px] flex items-center justify-center w-[234.7px] h-[46.4px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{ lineHeight: "141%", fontWeight: "700" }}
            >
              Sandwiches
            </Typography>
          </Box>
          <Box className="absolute top-[0px] left-[278.7px] w-[231.8px] h-[282px]">
            <Typography
              className="absolute top-[236.1px] left-[0px] flex items-center justify-center w-[231.8px] h-[45.9px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{ lineHeight: "141%", fontWeight: "700" }}
            >
              Tortas
            </Typography>
            <img
              className="absolute top-[0px] left-[8.1px] rounded-[168.5px] w-[218.4px] h-[218.4px] object-cover"
              alt=""
              src={imgTartaMokaChocolate}
            />
          </Box>
          <Box className="absolute top-[15px] left-[0px] w-[212.9px] h-[259.5px] opacity-[0.5] text-3xl">
            <img
              className="absolute top-[0px] left-[8.1px] rounded-[1089.5px] w-[200.8px] h-[200.7px] object-cover"
              alt=""
              src={imgTartaDurazno}
            />
            <Typography
              className="absolute top-[217.3px] left-[0px] flex items-center justify-center w-[212.9px] h-[42.2px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{ lineHeight: "141%", fontWeight: "700" }}
            >
              Postres
            </Typography>
          </Box>
        </Box>
        <div className="absolute top-[39px] left-[calc(50%_-_560px)] text-[70px] leading-[90.9%] font-['Potta_One'] text-left inline-block w-[220px] h-[63px]">
          MENÚ
        </div>
      </Box>
      <img
        className="absolute top-[-1px] left-[-1px] w-[1446px] h-[536px]"
        alt=""
        src={imgDegradado}
      />
      <Box className="absolute top-[595px] left-[86px] w-[582px] h-[43px] text-justify text-xl text-[#000]">
        <div className="absolute top-[9px] left-[45px] tracking-[0.01em] leading-[135.4%] font-extralight inline-block w-[537px] h-[34px]">
          Av. Gral. Antonio Álvarez de Arenales 458, Jesús María
        </div>
        <img
          className="absolute top-[0px] left-[0px] w-[39px] h-[39px]"
          alt=""
          src={imgPointMap}
        />
      </Box>
      <Box className="absolute top-[496px] left-[135px] w-[488px] h-[77px] text-left text-[40px] font-['Lilita_One']">
        <Box className="absolute top-[0px] left-[0px] rounded-[10px] bg-[#8f3c3c] w-[488px] h-[77px]" />
        <div className="absolute top-[9px] left-[66px] flex items-center w-[361px] h-[60px]">
          RESERVA TU PEDIDO
        </div>
      </Box>
      <div className="absolute top-[200px] left-[88px] text-[70px] font-['Lilita_One'] text-left flex items-center w-[677px] h-[340px] text-[#753b3b]">
        <span className="w-full">
          <Typography variant="inherit" variantMapping={{ inherit: "span" }}>
            Panadería,
          </Typography>
          <Typography
            className="text-[#fd9d50]"
            variant="inherit"
            variantMapping={{ inherit: "span" }}
          >
            {" "}
            pastelería
          </Typography>
          <Typography
            variant="inherit"
            variantMapping={{ inherit: "span" }}
          >{` `}</Typography>
          <Typography
            className="text-[#da3644]"
            variant="inherit"
            variantMapping={{ inherit: "span" }}
          >
            y snack bar
          </Typography>
        </span>
      </div>
      <Box className="absolute top-[85px] left-[603px] w-[922px] h-[724px]">
        <img
          className="absolute top-[0px] left-[82px] w-[724px] h-[724px] object-cover"
          alt=""
          src={imgMilhojasFresa}
        />
        <img
          className="absolute top-[329px] left-[680px] w-[242px] h-[242px] object-cover"
          alt=""
          src={imgAlfajor}
        />
        <img
          className="absolute top-[48px] left-[0px] w-[252.9px] h-[252.9px] object-contain"
          alt=""
          src={imgEmpanadaMixta}
        />
      </Box>
      <Box className="absolute top-[55px] left-[calc(50%_-_339px)] w-[608px] h-[30px] flex items-center justify-center gap-[66px] text-left text-lg">
        <div className="relative">Home</div>
        <div className="relative cursor-pointer" onClick={onCartaTextClick}>
          Carta
        </div>
        <div className="relative cursor-pointer" onClick={onDeliveryTextClick}>
          Delivery
        </div>
        <div className="relative cursor-pointer" onClick={onTestTextClick}>
          Test
        </div>
        <div
          className="relative cursor-pointer"
          onClick={onContctanosTextClick}
        >
          Contáctanos
        </div>
      </Box>
      <Box
        className="absolute top-[47px] left-[1210px] w-[142px] h-[38px] cursor-pointer text-left text-base"
        onClick={onGroupContainerClick}
      >
        <Box className="absolute top-[0px] left-[0px] rounded-[7px] bg-[rgba(255,91,0,0)] border-[#fff] border-solid border-[2px] box-border w-[142px] h-[38px]" />
        <div className="absolute top-[9px] left-[14px] font-semibold inline-block w-[118px] h-[22px]">
          Iniciar Sesión
        </div>
      </Box>
      <Box
        className="absolute top-[47px] left-[1072px] w-[114px] h-[38px] cursor-pointer text-left text-base text-[#8f3c3c]"
        onClick={onGroupContainerClick1}
      >
        <Box className="absolute top-[0px] left-[0px] shadow-[0px_0px_29px_rgba(255,_91,_0,_0.15)] rounded-[7px] bg-[#fff] w-[114px] h-[38px]" />
        <div className="absolute top-[9px] left-[10px] font-semibold">
          Registrarse
        </div>
      </Box>
      <img
        className="absolute top-[59px] left-[46px] w-[322px] h-[258px] object-cover"
        alt=""
        src={imgLogoFamigliawithourBorders}
      />
      <Box className="absolute top-[2201px] left-[0px] bg-[#fff] w-[1440px] h-[877px] overflow-hidden text-left text-xl">
        <Box className="absolute top-[49px] left-[0px] w-[1443px] h-[810px]">
          <div className="absolute top-[771px] left-[489px] tracking-[-0.04em] leading-[196%] text-[#b63434]">
            Pastelería Famiglia © 2025 - Todos los derechos reservados
          </div>
          <Box className="absolute top-[50px] left-[0px] bg-[#8f3c3c] w-[1443px] h-[703px]" />
          <div className="absolute top-[87px] left-[431px] text-[35px] tracking-[0.01em] leading-[117%] text-center flex items-center w-[965px] h-[84px]">
            <span className="w-full">
              <Typography className="!m-0" variant="inherit">
                Tu mesa de siempre, en la esquina de Arenales.
              </Typography>
              <Typography className="!m-0" variant="inherit">
                ¡Siempre pensando en ustedes!
              </Typography>
            </span>
          </div>
          <img
            className="absolute top-[208px] left-[3px] w-[1440px] h-[214px] object-cover"
            alt=""
            src={imgFooter}
          />
          <Box className="absolute top-[630px] left-[1139px] w-[184px] h-14 text-base text-[rgba(0,0,0,0.75)]">
            <Box className="absolute top-[0px] left-[0px] rounded-[7px] bg-[#fff] w-[184px] h-14" />
            <div className="absolute top-[18px] left-[52px] tracking-[-0.04em] leading-[140%] font-medium">
              Reclamaciones
            </div>
            <img
              className="absolute top-[13px] left-[17px] w-8 h-8"
              alt=""
              src={imgBook}
            />
          </Box>
          <Box className="absolute top-[466px] left-[1117px] w-[231px] h-[113px] text-2xl">
            <Typography
              className="absolute top-[0px] left-[13px] flex items-center w-[114px] h-[38px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{
                lineHeight: "140%",
                letterSpacing: "-0.04em",
                fontWeight: "700",
              }}
            >
              Siguenos
            </Typography>
            <Box className="absolute top-[63px] left-[0px] w-[231px] h-[50px]">
              <img
                className="absolute top-[0px] left-[0px] w-[49px] h-[49px]"
                alt=""
                src={imgFacebookLogo}   
              />
              <img
                className="absolute top-[0px] left-[64px] w-[49px] h-[49px]"
                alt=""
                src={imgIgLogo}
              />
              <img
                className="absolute h-[59.4%] w-[16.49%] top-[20%] right-[28.53%] bottom-[20.6%] left-[54.98%] max-w-full overflow-hidden max-h-full object-cover"
                alt=""
                src={imgXLogo}
              />
              <img
                className="absolute top-[0px] left-[181px] w-[50px] h-[50px]"
                alt=""
                src={imgYtLogo}
              />
            </Box>
          </Box>
          <Box className="absolute top-[466px] left-[784px] w-[218px] h-[122px]">
            <div className="absolute top-[44px] left-[0px] tracking-[-0.04em] leading-[196%]">
              <Typography className="!m-0" variant="inherit">
                Términos y condiciones
              </Typography>
              <Typography className="!m-0" variant="inherit">
                Política de privacidad
              </Typography>
            </div>
            <Typography
              className="absolute top-[0px] left-[0px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{
                fontSize: "25px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
                fontWeight: "700",
              }}
            >
              Legales
            </Typography>
          </Box>
          <Box className="absolute top-[466px] left-[562px] w-[132px] h-[278px]">
            <div className="absolute top-[44px] left-[0px] tracking-[-0.04em] leading-[196%] flex items-center w-[114px]">
              <span className="[line-break:anywhere] w-full">
                <Typography className="!m-0" variant="inherit">
                  Postres
                </Typography>
                <Typography className="!m-0" variant="inherit">
                  Tortas
                </Typography>
                <Typography className="!m-0" variant="inherit">
                  Salados
                </Typography>
                <Typography className="!m-0" variant="inherit">
                  Sandwiches
                </Typography>
                <Typography className="!m-0" variant="inherit">
                  Bebidas
                </Typography>
              </span>
            </div>
            <Typography
              className="absolute top-[0px] left-[0px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{
                fontSize: "25px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
                fontWeight: "700",
              }}
            >
              Categorías
            </Typography>
          </Box>
          <Box className="absolute top-[466px] left-[346px] w-[126px] h-[122px]">
            <div className="absolute top-[44px] left-[0px] tracking-[-0.04em] leading-[196%]">
              <Typography className="!m-0" variant="inherit">
                Nuestra carta
              </Typography>
              <Typography className="!m-0" variant="inherit">
                Delivery
              </Typography>
            </div>
            <Typography
              className="absolute top-[0px] left-[0px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{
                fontSize: "25px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
                fontWeight: "700",
              }}
            >
              Descubre
            </Typography>
          </Box>
          <Box className="absolute top-[466px] left-[71px] w-[185px] h-[153px]">
            <div className="absolute top-[36px] left-[0px] tracking-[-0.04em] leading-[196%]">
              <Typography className="!m-0" variant="inherit">
                Quienes somos
              </Typography>
              <Typography className="!m-0" variant="inherit">
                Ubicación
              </Typography>
              <Typography className="!m-0" variant="inherit">
                Contacto
              </Typography>
            </div>
            <Typography
              className="absolute top-[0px] left-[0px]"
              variant="inherit"
              variantMapping={{ inherit: "b" }}
              sx={{
                fontSize: "25px",
                lineHeight: "140%",
                letterSpacing: "-0.04em",
                fontWeight: "700",
              }}
            >
              Sobre nosotros
            </Typography>
          </Box>
          <img
            className="absolute top-[0px] left-[71px] w-[352px] h-[171px] object-cover"
            alt=""
            src={imgLogoFamiglia}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
