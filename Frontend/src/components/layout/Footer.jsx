import { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import PropTypes from "prop-types";

const Footer = ({
  className = "",
  tuMesaDeContainerHeight,
  frameBoxMinWidth,
  categorasDisplay,
  categorasMinWidth,
  siguenosDisplay,
  siguenosHeight,
  siguenosAlignItems,
  socialIconsWidth,
  icoutlineFacebookMaxHeight,
  mdiinstagramMaxHeight,
  frameBoxBorder,
  frameBoxBackgroundColor,
  frameBoxWidth,
  tablerbook,
  rectangle31,
}) => {
  const tuMesaDeContainerStyle = useMemo(() => {
    return {
      height: tuMesaDeContainerHeight,
    };
  }, [tuMesaDeContainerHeight]);

  const frameBoxStyle = useMemo(() => {
    return {
      minWidth: frameBoxMinWidth,
    };
  }, [frameBoxMinWidth]);

  const categorasStyle = useMemo(() => {
    return {
      display: categorasDisplay,
      minWidth: categorasMinWidth,
    };
  }, [categorasDisplay, categorasMinWidth]);

  const siguenosStyle = useMemo(() => {
    return {
      display: siguenosDisplay,
      height: siguenosHeight,
      alignItems: siguenosAlignItems,
    };
  }, [siguenosDisplay, siguenosHeight, siguenosAlignItems]);

  const socialIconsStyle = useMemo(() => {
    return {
      width: socialIconsWidth,
    };
  }, [socialIconsWidth]);

  const icoutlineFacebookIconStyle = useMemo(() => {
    return {
      maxHeight: icoutlineFacebookMaxHeight,
    };
  }, [icoutlineFacebookMaxHeight]);

  const mdiinstagramIconStyle = useMemo(() => {
    return {
      maxHeight: mdiinstagramMaxHeight,
    };
  }, [mdiinstagramMaxHeight]);

  const frameBox1Style = useMemo(() => {
    return {
      border: frameBoxBorder,
      backgroundColor: frameBoxBackgroundColor,
      width: frameBoxWidth,
    };
  }, [frameBoxBorder, frameBoxBackgroundColor, frameBoxWidth]);

  return (
    <section
      className={`self-stretch bg-[#fff] overflow-hidden flex flex-col items-start !pt-[99px] !pb-[18px] !pl-0 !pr-0 box-border gap-[18px] max-w-full text-center text-[35px] text-[#fff] font-[Montserrat] lg:!pt-16 lg:!pb-5 lg:box-border mq450:!pt-[42px] mq450:box-border ${className}`}
    >
      <Box className="self-stretch bg-[#8f3c3c] flex flex-col items-end !pt-[37px] !pb-[9px] !pl-[3px] !pr-11 box-border relative gap-[37px] max-w-full mq825:gap-[18px] mq825:!pt-6 mq825:!pr-[22px] mq825:!pb-5 mq825:box-border">
        <Box className="w-[1443px] h-[703px] relative bg-[#8f3c3c] hidden max-w-full z-[0]" />
        <div
          className="w-[985px] relative tracking-[0.01em] leading-[117%] flex items-center max-w-full box-border !pl-5 z-[1] mq450:text-[21px] mq450:leading-[25px] mq825:text-[28px] mq825:leading-[33px]"
          style={tuMesaDeContainerStyle}
        >
          <span className="w-full">
            <Typography className="!m-0" variant="inherit">
              Tu mesa de siempre, en la esquina de Arenales.
            </Typography>
            <Typography className="!m-0" variant="inherit">
              ¡Siempre pensando en ustedes!
            </Typography>
          </span>
        </div>
        <Box className="!mr-[-47px] flex flex-col items-start gap-11 max-w-[104%] mq825:gap-[22px]">
          <img
            className="self-stretch relative max-w-full overflow-hidden max-h-full object-cover z-[1]"
            loading="lazy"
            alt=""
            src="/Background-Footer@2x.png"
          />
          <section className="w-[1413px] flex items-start !pt-0 !pb-0 !pl-[68px] !pr-[68px] box-border max-w-full text-left text-[25px] text-[#fff] font-[Montserrat] mq1400:!pl-[34px] mq1400:!pr-[34px] mq1400:box-border">
            <Box className="flex-1 flex flex-col items-start max-w-full">
              <Box className="w-[1173px] flex items-start justify-between gap-5 max-w-full lg:flex-wrap lg:gap-5">
                <Typography
                  className="!m-0 relative z-[1] mq450:text-[20px] mq450:leading-7"
                  variant="inherit"
                  variantMapping={{ inherit: "h2" }}
                  sx={{
                    fontWeight: "700",
                    lineHeight: "140%",
                    letterSpacing: "-0.04em",
                  }}
                >
                  Sobre nosotros
                </Typography>
                <Box className="flex items-start !pt-0 !pb-0 !pl-0 !pr-[161px] box-border gap-[90px] max-w-full mq450:gap-[22px] mq450:!pr-5 mq450:box-border mq825:gap-[45px] mq825:flex-wrap mq825:!pr-20 mq825:box-border">
                  <Box
                    className="flex-[0.9444] flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-[7px] box-border min-w-[82px] mq450:flex-1"
                    style={frameBoxStyle}
                  >
                    <Typography
                      className="!m-0 relative inline-block min-w-[119px] z-[1] mq450:text-[20px] mq450:leading-7"
                      variant="inherit"
                      variantMapping={{ inherit: "h2" }}
                      sx={{
                        fontWeight: "700",
                        lineHeight: "140%",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      Descubre
                    </Typography>
                  </Box>
                  <Typography
                    className="!m-0 flex-1 relative inline-block min-w-[86px] z-[1] mq450:text-[20px] mq450:leading-7"
                    variant="inherit"
                    variantMapping={{ inherit: "h2" }}
                    sx={{
                      fontWeight: "700",
                      lineHeight: "140%",
                      letterSpacing: "-0.04em",
                    }}
                    style={categorasStyle}
                  >
                    Categorías
                  </Typography>
                  <Typography
                    className="!m-0 relative inline-block min-w-[95px] z-[1] mq450:text-[20px] mq450:leading-7"
                    variant="inherit"
                    variantMapping={{ inherit: "h2" }}
                    sx={{
                      fontWeight: "700",
                      lineHeight: "140%",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Legales
                  </Typography>
                </Box>
                <Typography
                  className="!m-0 relative inline-block min-w-[114px] z-[1] mq450:text-[19px] mq450:leading-[27px]"
                  variant="inherit"
                  variantMapping={{ inherit: "h3" }}
                  sx={{
                    fontWeight: "700",
                    fontSize: "24px",
                    lineHeight: "140%",
                    letterSpacing: "-0.04em",
                  }}
                  style={siguenosStyle}
                >
                  Siguenos
                </Typography>
              </Box>
              <Box className="self-stretch flex items-start gap-[90px] !mt-[-2px] relative text-[20px] mq450:gap-[22px] mq825:gap-[45px] mq1400:flex-wrap">
                <Box className="flex flex-col items-start !pt-0 !pb-0 !pl-0 !pr-5">
                  <div className="relative tracking-[-0.04em] leading-[196%] z-[1] mq450:text-[16px] mq450:leading-[31px]">
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
                </Box>
                <Box className="flex flex-col items-start !pt-2 !pb-0 !pl-0 !pr-0">
                  <div className="relative tracking-[-0.04em] leading-[196%] z-[1] mq450:text-[16px] mq450:leading-[31px]">
                    <Typography className="!m-0" variant="inherit">
                      Nuestra carta
                    </Typography>
                    <Typography className="!m-0" variant="inherit">
                      Delivery
                    </Typography>
                  </div>
                </Box>
                <Box className="flex flex-col items-start !pt-2 !pb-0 !pl-0 !pr-[18px]">
                  <div className="relative tracking-[-0.04em] leading-[196%] inline-block min-h-[234px] z-[1] mq450:text-[16px] mq450:leading-[31px]">
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
                  </div>
                </Box>
                <Box className="flex flex-col items-start !pt-2 !pb-0 !pl-0 !pr-5">
                  <div className="relative tracking-[-0.04em] leading-[196%] z-[1] mq450:text-[16px] mq450:leading-[31px]">
                    <Typography className="!m-0" variant="inherit">
                      Términos y condiciones
                    </Typography>
                    <Typography className="!m-0" variant="inherit">
                      Política de privacidad
                    </Typography>
                  </div>
                </Box>
                <Box
                  className="flex flex-col items-start !pt-[27px] !pb-0 !pl-0 !pr-0"
                  style={socialIconsStyle}
                >
                  <Box className="flex flex-col items-start gap-[51px]">
                    <Box className="flex items-start gap-[15px]">
                      <img
                        className="w-[49px] relative max-h-full z-[1]"
                        alt=""
                        src="/ic-outline-facebook.svg"
                        style={icoutlineFacebookIconStyle}
                      />
                      <img
                        className="w-[49px] relative max-h-full z-[1]"
                        alt=""
                        src="/mdi-instagram.svg"
                        style={mdiinstagramIconStyle}
                      />
                      <Box
                        className="flex flex-col items-start !pt-2.5 !pb-0 !pl-0 !pr-0"
                        style={frameBox1Style}
                      >
                        <img
                          className="w-[38.1px] h-[29.7px] relative object-cover z-[1]"
                          alt=""
                          src="/Group@2x.png"
                        />
                      </Box>
                      <img
                        className="w-[50px] relative max-h-full z-[1]"
                        loading="lazy"
                        alt=""
                        src="/mdi-youtube.svg"
                      />
                    </Box>
                    <Box className="flex items-start !pt-0 !pb-0 !pl-[22px] !pr-[25px]">
                      <button className="cursor-pointer [border:none] !pt-[13px] !pb-[11px] !pl-[17px] !pr-4 bg-[#fff] rounded-[7px] flex items-start gap-[3px] z-[1]">
                        <Box className="h-14 w-[184px] relative rounded-[7px] bg-[#fff] hidden" />
                        <img
                          className="w-8 relative max-h-full z-[1]"
                          alt=""
                          src={tablerbook}
                        />
                        <Box className="flex flex-col items-start !pt-[5px] !pb-0 !pl-0 !pr-0">
                          <div className="relative text-[16px] tracking-[-0.04em] leading-[140%] font-[500] font-[Montserrat] text-[rgba(0,0,0,0.75)] text-left z-[1]">
                            Reclamaciones
                          </div>
                        </Box>
                      </button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </section>
        </Box>
        <img
          className="w-[352px] absolute !!m-[0 important] top-[-50px] left-[71px] max-h-full object-cover z-[1]"
          loading="lazy"
          alt=""
          src="/Logo@2x.png"
        />
      </Box>
      <img
        className="w-[129px] h-[30px] relative hidden"
        alt=""
        src={rectangle31}
      />
      <footer className="flex items-start !pt-0 !pb-0 !pl-[489px] !pr-[411px] text-left text-[20px] text-[#b63434] font-[Montserrat] mq450:!pl-5 mq450:!pr-5 mq450:box-border mq825:!pl-[244px] mq825:!pr-[205px] mq825:box-border">
        <div className="relative tracking-[-0.04em] leading-[196%] mq450:text-[16px] mq450:leading-[31px]">
          Pastelería Famiglia © 2025 - Todos los derechos reservados
        </div>
      </footer>
    </section>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
  tablerbook: PropTypes.string,
  rectangle31: PropTypes.string,

  /** Style props */
  tuMesaDeContainerHeight: PropTypes.string,
  frameBoxMinWidth: PropTypes.string,
  categorasDisplay: PropTypes.string,
  categorasMinWidth: PropTypes.string,
  siguenosDisplay: PropTypes.string,
  siguenosHeight: PropTypes.string,
  siguenosAlignItems: PropTypes.string,
  socialIconsWidth: PropTypes.string,
  icoutlineFacebookMaxHeight: PropTypes.string,
  mdiinstagramMaxHeight: PropTypes.string,
  frameBoxBorder: PropTypes.string,
  frameBoxBackgroundColor: PropTypes.string,
  frameBoxWidth: PropTypes.string,
};

export default Footer;
