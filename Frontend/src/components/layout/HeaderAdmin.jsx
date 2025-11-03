import { Box, Button, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import imgLogoFamiglia from "../../assets/images/img_logoFamigliawithoutBorders.png";

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("");
  };

  const navLinks = [
    { label: "Pedidos", path: "/pedidos-admin" },
    { label: "Catálogo", path: "/catalogo-admin" },
  ];

  return (
    <Box
      className="w-full bg-white text-[#6b2c2c] font-[Montserrat] border-b-[1.5px] border-[#b17b6b] relative"
      sx={{ py: 1.5, px: { xs: 2, sm: 6, md: 10 } }}
    >
      <Box
        className="max-w-7xl mx-auto flex items-center justify-between"
      >
        {/* Logo */}
        <img
          src={imgLogoFamiglia}
          alt="Panadería Famiglia"
          className="w-36 object-contain cursor-pointer"
          onClick={() => navigate("/admin/pedidos")}
        />

        {/* Menú principal */}
        <Box className="flex items-center gap-6">
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              onClick={() => navigate(path)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color:
                  location.pathname === path ? "#8b3e3e" : "#6b2c2c",
                borderBottom:
                  location.pathname === path
                    ? "2px solid #8b3e3e"
                    : "2px solid transparent",
                "&:hover": { color: "#8b3e3e" },
              }}
            >
              {label}
            </Button>
          ))}

          {/* Logout */}
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#8b3e3e",
              "&:hover": { color: "#a34747" },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderAdmin;
