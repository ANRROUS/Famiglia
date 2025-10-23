import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, useLocation } from "react-router-dom";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithoutBorders.png";
import RegisterForm from "../forms/RegisterForm"; 
import LoginForm from "../forms/LoginForm";
import { logout } from "../../redux/slices/authSlice";
import { authAPI } from "../../services/api";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Estado de autenticación desde Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  // Referencias a los elementos de navegación
  const navRefs = {
    home: useRef(null),
    carta: useRef(null),
    delivery: useRef(null),
    test: useRef(null),
    contact: useRef(null),
  };

  // Detecta la ruta actual y mueve la línea debajo del enlace activo
  useEffect(() => {
    const path = location.pathname;
    let activeRef;

    if (path === "/") activeRef = navRefs.home;
    else if (path.startsWith("/carta")) activeRef = navRefs.carta;
    else if (path.startsWith("/delivery")) activeRef = navRefs.delivery;
    else if (path.startsWith("/test")) activeRef = navRefs.test;
    else if (path.startsWith("/contact-us")) activeRef = navRefs.contact;

    if (activeRef?.current) {
      const rect = activeRef.current.getBoundingClientRect();
      const parentRect = activeRef.current.parentNode.getBoundingClientRect();

      setUnderlineStyle({
        width: rect.width,
        left: rect.left - parentRect.left,
      });
    }
  }, [location.pathname]);

  // Funciones de navegación
  const handleGoHome = () => navigate("/");
  const handleGoCarta = () => navigate("/carta");
  const handleGoDelivery = () => navigate("/delivery");
  const handleGoTest = () => navigate("/test");
  const handleGoContact = () => navigate("/contact-us");
  const handleGoCart = () => navigate("/cart");
  const handleGoProfile = () => navigate("/profile");

  // Función de logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      dispatch(logout()); // Logout local aunque falle el servidor
      navigate("/");
    }
  };

  return (
    <Box className="w-full bg-white text-[#6b2c2c] font-[Montserrat] border-b-[1.5px] border-[#b17b6b] relative">
      {/* Contenedor principal */}
      <Box className="max-w-7xl mx-auto flex items-center justify-between px-8">
        {/* Logo */}
        <img
          src={imgLogoFamiglia}
          alt="Panadería Famiglia"
          className="w-36 sm:w-44 md:w-48 object-contain cursor-pointer"
          onClick={handleGoHome}
        />

        {/* Links en escritorio */}
        <Box className="hidden md:flex items-center gap-10 text-sm font-medium relative">
          <span ref={navRefs.home} onClick={handleGoHome} className="cursor-pointer hover:text-[#9c4c4c]">
            Home
          </span>
          <span ref={navRefs.carta} onClick={handleGoCarta} className="cursor-pointer hover:text-[#9c4c4c]">
            Carta
          </span>
          <span ref={navRefs.delivery} onClick={handleGoDelivery} className="cursor-pointer hover:text-[#9c4c4c]">
            Delivery
          </span>
          <span ref={navRefs.test} onClick={handleGoTest} className="cursor-pointer hover:text-[#9c4c4c]">
            Test
          </span>
          <span ref={navRefs.contact} onClick={handleGoContact} className="cursor-pointer hover:text-[#9c4c4c]">
            Contáctanos
          </span>

          {/* Línea animada */}
          <Box
            className="absolute bottom-[-4px] h-[2px] bg-[#6b2c2c] transition-all duration-300 ease-in-out"
            style={{
              width: underlineStyle.width,
              left: underlineStyle.left,
            }}
          />
        </Box>

        {/* Botones en escritorio */}
        <Box className="hidden md:flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              {/* Carrito (solo si está autenticado) */}
              <IconButton
                onClick={handleGoCart}
                sx={{
                  color: "#8b3e3e",
                  position: "relative"
                }}
              >
                <ShoppingCartIcon />
                {totalQuantity > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "#e74c3c",
                      color: "white",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  >
                    {totalQuantity}
                  </Box>
                )}
              </IconButton>

              {/* Perfil */}
              <IconButton
                onClick={handleGoProfile}
                sx={{ color: "#8b3e3e" }}
              >
                <AccountCircleIcon />
              </IconButton>

              {/* Nombre de usuario */}
              <span className="text-sm font-medium text-[#8b3e3e]">
                {user?.nombre}
              </span>

              {/* Botón Cerrar Sesión */}
              <Button
                onClick={handleLogout}
                variant="outlined"
                sx={{
                  borderColor: "#8b3e3e",
                  color: "#8b3e3e",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#8b3e3e",
                    color: "#fff",
                    borderColor: "#8b3e3e",
                  },
                }}
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setShowRegister(true)}
                variant="contained"
                sx={{
                  backgroundColor: "#8b3e3e",
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": { backgroundColor: "#742f2f" },
                }}
              >
                Registrarse
              </Button>
              <Button
                onClick={() => setShowLogin(true)}
                variant="outlined"
                sx={{
                  borderColor: "#8b3e3e",
                  color: "#8b3e3e",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#8b3e3e",
                    color: "#fff",
                    borderColor: "#8b3e3e",
                  },
                }}
              >
                Iniciar Sesión
              </Button>
            </>
          )}
        </Box>

        {/* Menú hamburguesa móvil */}
        <Box className="md:hidden">
          <IconButton onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Menú móvil */}
      {menuOpen && (
        <Box className="md:hidden flex flex-col items-center bg-white text-[#6b2c2c] py-6 gap-5 border-t border-[#c9a6a6]">
          <span onClick={handleGoHome} className="cursor-pointer hover:text-[#9c4c4c]">
            Home
          </span>
          <span onClick={handleGoCarta} className="cursor-pointer hover:text-[#9c4c4c]">
            Carta
          </span>
          <span onClick={handleGoDelivery} className="cursor-pointer hover:text-[#9c4c4c]">
            Delivery
          </span>
          <span onClick={handleGoTest} className="cursor-pointer hover:text-[#9c4c4c]">
            Test
          </span>
          <span onClick={handleGoContact} className="cursor-pointer hover:text-[#9c4c4c]">
            Contáctanos
          </span>

          <Box className="flex flex-col gap-3 mt-4 w-[60%]">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleGoCart}
                  variant="contained"
                  sx={{
                    backgroundColor: "#8b3e3e",
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#742f2f" },
                  }}
                >
                  Carrito ({totalQuantity})
                </Button>
                <Button
                  onClick={handleGoProfile}
                  variant="outlined"
                  sx={{
                    borderColor: "#8b3e3e",
                    color: "#8b3e3e",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#8b3e3e",
                      color: "#fff",
                      borderColor: "#8b3e3e",
                    },
                  }}
                >
                  Perfil
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  sx={{
                    borderColor: "#8b3e3e",
                    color: "#8b3e3e",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#8b3e3e",
                      color: "#fff",
                      borderColor: "#8b3e3e",
                    },
                  }}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowRegister(true)}
                  variant="contained"
                  sx={{
                    backgroundColor: "#8b3e3e",
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#742f2f" },
                  }}
                >
                  Registrarse
                </Button>
                <Button
                  onClick={() => setShowLogin(true)}
                  variant="outlined"
                  sx={{
                    borderColor: "#8b3e3e",
                    color: "#8b3e3e",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#8b3e3e",
                      color: "#fff",
                      borderColor: "#8b3e3e",
                    },
                  }}
                >
                  Iniciar Sesión
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Modales */}
      <RegisterForm 
        isOpen={showRegister} 
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
      <LoginForm 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
    </Box>
  );
};

export default Header;