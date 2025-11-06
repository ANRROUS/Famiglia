import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F29D4C", // Tu color principal (naranja de tu página)
    },
    secondary: {
      main: "#8B3E3E", // Un color de acento (puedes cambiarlo)
    },
    background: {
      default: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif",
  },
});

export default theme;