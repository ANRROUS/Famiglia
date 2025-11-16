// Profile.jsx (completo, reemplaza tu archivo)
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Button,
} from "@mui/material";
import {
  ShoppingBag,
  Quiz,
  CameraAlt,
  Edit,
  CalendarToday,
  LocationOn,
  CreditCard,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import defaultAvatar from "../assets/images/img-default-avatar.png";
import { pedidoAPI, preferencesAPI } from "../services/api";
import { twofaAPI } from "../services/api/twofaAPI";
import * as crypto from "crypto-js";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();

  const defaultFoto = defaultAvatar;
  const [foto, setFoto] = useState(() => {
    // carga desde localStorage si existe
    return localStorage.getItem("fotoPerfil") || user?.url_imagen || defaultFoto;
  });


  // pagination
  const itemsPerPage = 6;
  const [page, setPage] = useState(0);

  const [tabValue, setTabValue] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [tests, setTests] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [error, setError] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [codigo2FA, setCodigo2FA] = useState("");
  const [twofaEnabled, setTwofaEnabled] = useState(
    user?.autenticacion_2fa?.habilitado || false
  );

  const palette = {
    dark: "#6B3730",
    dark2: "#AF442F",
    accent: "#EF9D58",
    primary: "#C94549", // used for headers / chips
    pastel: "#EBBABC",
    white: "#FFFFFF",
    pageBg: "#FBF2F2", // soft background derived from palette
  };

  const hashOrderId = (id) => {
    const hash = crypto.SHA256(id.toString()).toString();
    return `SA-${hash.substring(0, 8).toUpperCase()}`;
  };

  useEffect(() => {
    if (tabValue === 0) fetchPedidos();
    if (tabValue === 1) fetchTests();
    // reset page when tab changes
    setPage(0);
  }, [tabValue]);


  // Guarda la foto en localStorage cuando cambia
  useEffect(() => {
    if (foto) {
      localStorage.setItem("fotoPerfil", foto);
    }
  }, [foto]);


  const fetchPedidos = async () => {
    setLoadingPedidos(true);
    setError("");
    try {
      const response = await pedidoAPI.getHistorialPedidos();
      setPedidos(response.data || []);
    } catch (err) {
      console.error(err);
      setError("❌ Error al cargar pedidos");
    } finally {
      setLoadingPedidos(false);
    }
  };

  const fetchTests = async () => {
    setLoadingTests(true);
    setError("");
    try {
      const response = await preferencesAPI.getHistorialTests();
      setTests(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("❌ Error al cargar tests");
    } finally {
      setLoadingTests(false);
    }
  };

  const getEstadoColor = (estado) => {
    const map = {
      confirmado: "#4caf50",
      pendiente: "#ff9800",
      enviado: "#2196f3",
      entregado: "#8bc34a",
      cancelado: "#f44336",
    };
    return map[estado?.toLowerCase()] || palette.dark2;
  };

  // date dd/mm/yy
  const formatDateShort = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  // slice for pagination
  const displayedPedidos = pedidos;
  const displayedTests = tests;
  const totalItems = tabValue === 0 ? displayedPedidos.length : displayedTests.length;
  const pageData =
    (tabValue === 0 ? displayedPedidos : displayedTests).slice(
      page * itemsPerPage,
      (page + 1) * itemsPerPage
    );

  return (
    <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 800, color: palette.dark, mb: 4, mt: 4 }}>
        Mi Perfil
      </Typography>

      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" }, }}>
        {/* LEFT PANEL - fixed width, independent height, vertically centered */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: "#fcfbf9ff",
            width: { xs: "100%", md: 340 },
            borderRadius: 2,
            p: 3,

          }}
        >
          {/* avatar box (fixed rectangle) */}
          <Box
            sx={{
              width: "100%",
              height: 200,
              borderRadius: 2,
              bgcolor: palette.pastel,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              mb: 2,
            }}
          >
            {foto ? (
              <img
                src={foto || "/images/img-default-avatar.png"}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <CameraAlt sx={{ fontSize: 80, color: palette.primary }} />
            )}

            {/* input oculto para subir imagen */}
            <input
              type="file"
              accept="image/*"
              id="input-foto"
              style={{ display: "none" }}
              onChange={(e) => {
                const archivo = e.target.files[0];
                if (archivo) {
                  setFoto(URL.createObjectURL(archivo));
                  // Aquí podrías luego subir la imagen al backend si deseas.
                }
              }}
            />

            {/* botón con ícono de cámara que abre el selector */}
            <label htmlFor="input-foto">
              <IconButton
                component="span"
                size="small"
                aria-label="Cambiar foto"
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  bgcolor: palette.primary,
                  color: "#fff",
                  "&:hover": { bgcolor: palette.dark2 },
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            </label>

          </Box>
          {/* Nombre */}
          <Typography sx={{ color: palette.primary, fontWeight: 700, mb: 0.5 }}>Nombre</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ color: palette.dark, fontWeight: 800, fontSize: 18 }}>
              {user?.nombre || "—"}
            </Typography>
          </Box>

          {/* Correo */}
          <Typography sx={{ color: palette.primary, fontWeight: 700, mb: 0.5 }}>Correo</Typography>
          <Typography sx={{ color: "#5A5A5A" }}>{user?.correo || "—"}</Typography>

          {/* Sección de Autenticación en Dos Factores */}
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ color: palette.primary, fontWeight: 700, mb: 0.5 }}>
            Seguridad
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography sx={{ color: "#5A5A5A" }}>
              Autenticación en dos factores (2FA)
            </Typography>

            {/* QR dinámico */}
            {qrImageUrl && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                  mb: 1,
                  flexDirection: "column",
                }}
              >
                <Typography sx={{ mb: 1, color: "#333", fontWeight: 600 }}>
                  Escanea este código con Google Authenticator:
                </Typography>
                <img
                  src={qrImageUrl}
                  alt="QR 2FA"
                  style={{
                    width: "180px",
                    height: "180px",
                    borderRadius: "8px",
                    border: `2px solid ${palette.primary}`,
                  }}
                />
              </Box>
            )}

            {/* Input para código 2FA */}
            {!twofaEnabled && qrImageUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 14, mb: 0.5, color: "#333" }}>
                  Ingresa el código de 6 dígitos generado por tu app:
                </Typography>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={codigo2FA || ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCodigo2FA(valor);
                  }}
                  placeholder="000000"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${palette.primary}`,
                    outline: "none",
                    fontSize: 16,
                    textAlign: "center",
                    width: "93%",
                    letterSpacing: 4,
                    fontWeight: 700,
                  }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={codigo2FA.length !== 6}
                  sx={{
                    mt: 2,
                    bgcolor: palette.primary,
                    "&:hover": { bgcolor: palette.dark2 },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={async () => {
                    try {
                      if (!codigo2FA || codigo2FA.length !== 6) {
                        enqueueSnackbar("⚠️ Por favor ingresa un código válido de 6 dígitos", { variant: "warning" });
                        return;
                      }

                      const res = await twofaAPI.verify(codigo2FA);
                      enqueueSnackbar(res.data.message || "✅ 2FA activado correctamente", { variant: "success" });
                      setTwofaEnabled(true);
                      setQrImageUrl(null);
                      setCodigo2FA("");
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                      const errorMsg = err.response?.data?.message || "❌ Código incorrecto o error al verificar 2FA";
                      enqueueSnackbar(errorMsg, { variant: "error" });
                    }
                  }}
                >
                  Verificar y Activar
                </Button>
              </Box>
            )}

            {/* Botón activar / desactivar */}
            <Button
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: twofaEnabled ? palette.dark2 : palette.primary,
                "&:hover": { bgcolor: palette.dark },
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={async () => {
                try {
                  if (twofaEnabled) {
                    await twofaAPI.disable();
                    enqueueSnackbar("✅ 2FA desactivado correctamente", { variant: "success" });
                    setTwofaEnabled(false);
                    window.location.reload();
                  } else {
                    const res = await twofaAPI.setup();
                    setQrImageUrl(res.data.qrImageUrl);
                    enqueueSnackbar("📲 Escanea el código QR", { variant: "info" });
                  }
                } catch (err) {
                  console.error(err);
                  enqueueSnackbar("❌ Error al cambiar el estado del 2FA", { variant: "error" });
                }
              }}
            >
              {twofaEnabled ? "Desactivar 2FA" : "Activar 2FA"}
            </Button>
          </Box>

        </Paper>

        {/* RIGHT PANEL - flexible */}
        <Box sx={{ flex: 1,
                  minWidth: 0,
                  minHeight: "600px", // 👈 evita que se encoja
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}>
          {/* Tabs panel */}
          <Paper elevation={2} sx={{ bgcolor: "#fcfbf9ff", borderRadius: 2, mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              centered
              sx={{
                "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
                "& .Mui-selected": { color: palette.dark },
                "& .MuiTabs-indicator": { backgroundColor: palette.primary },
              }}
            >
              <Tab icon={<ShoppingBag sx={{ color: palette.primary }} />} label="Mis Pedidos" iconPosition="start" />
              <Tab icon={<Quiz sx={{ color: palette.dark }} />} label="Mis Tests" iconPosition="start" />
            </Tabs>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* CONTENT GRID (Pedidos or Tests) */}
          {tabValue === 0 ? (
            loadingPedidos ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : displayedPedidos.length === 0 ? (
              <Paper sx={{ bgcolor: "#fcfbf9ff", p: 6, textAlign: "center" }}>No tienes pedidos</Paper>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    },
                    alignItems: "start",
                  }}
                >
                  {pageData.map((p) => {
                    // product list vertical centering when few items:
                    const fewItems = (p.items?.length || 0) <= 1;
                    return (
                      <Card key={p.id_pedido} sx={{ bgcolor: "#fcfbf9ff", borderRadius: 2, display: "flex", flexDirection: "column", height: "100%" }}>
                        {/* header */}
                        <Box sx={{ bgcolor: palette.primary, color: "#fff", px: 2, py: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                          <Typography fontWeight={700} sx={{ fontSize: 15 }}>
                            Pedido #{hashOrderId(p.id_pedido)}
                          </Typography>

                          {/* separation and chip */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip label={p.estado} size="small" sx={{ bgcolor: getEstadoColor(p.estado), color: "#fff", fontWeight: 700, ml: 1 }} />
                          </Box>
                        </Box>

                        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
                          {/* date / envio / pago */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <CalendarToday sx={{ fontSize: 16, color: palette.dark }} />
                            <Typography sx={{ fontSize: 13, color: "#333" }}>{formatDateShort(p.fecha)}</Typography>

                            {/* delivery & payment (same row) */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, ml: 2 }}>
                              <LocationOn sx={{ fontSize: 16, color: "#666" }} />
                              <Typography sx={{ fontSize: 13, color: "#666" }}>{p.envio || "Por definir"}</Typography>
                            </Box>

                            {p.pago?.medio && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, ml: 2 }}>
                                <CreditCard sx={{ fontSize: 16, color: "#666" }} />
                                <Typography sx={{ fontSize: 13, color: "#666" }}>{p.pago.medio}</Typography>
                              </Box>
                            )}
                          </Box>

                          <Divider />

                          {/* productos: this container will center items vertically when few */}
                          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: fewItems ? "center" : "flex-start", gap: 1 }}>
                            <Typography sx={{ fontWeight: 700 }}>Productos</Typography>

                            {p.items?.map((item) => (
                              <Box key={item.id_detalle} sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
                                <img
                                  src={item.producto?.url_imagen || "/images/placeholder-product.jpg"}
                                  width={56}
                                  height={56}
                                  style={{ borderRadius: 8, objectFit: "cover" }}
                                  onError={(e) => (e.target.src = "/images/placeholder-product.jpg")}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.producto?.nombre}</Typography>
                                  <Typography sx={{ fontSize: 13, color: "#777" }}>
                                    Cantidad: {item.cantidad} × S/{Number(item.producto?.precio).toFixed(2)}
                                  </Typography>
                                </Box>

                                {/* subtotal for this product: cantidad * precio */}
                                <Typography sx={{ fontWeight: 700, color: palette.dark }}>
                                  S/{(item.cantidad * Number(item.producto?.precio || 0)).toFixed(2)}
                                </Typography>
                              </Box>
                            ))}

                          </Box>

                          <Divider />

                          {/* Footer (total) aligned to bottom via CardContent flex column) */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                            <Typography sx={{ fontWeight: 800 }}>Total:</Typography>
                            <Typography sx={{ fontWeight: 800, color: palette.primary }}>
                              S/{Number(p.total).toFixed(2)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>

                {/* Pagination (Atrás / Siguiente) */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => setPage((s) => Math.max(0, s - 1))}
                    disabled={page === 0}
                    sx={{ color: page === 0 ? "#bbb" : palette.dark }}
                  >
                    Atrás
                  </Button>

                  <Typography sx={{ color: "#666" }}>
                    Página {page + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                  </Typography>

                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => setPage((s) => s + 1)}
                    disabled={(page + 1) * itemsPerPage >= totalItems}
                    sx={{ color: (page + 1) * itemsPerPage >= totalItems ? "#bbb" : palette.dark }}
                  >
                    Siguiente
                  </Button>
                </Box>
              </>
            )
          ) : (
            // TAB: TESTS (grid same behaviour)
            loadingTests ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : displayedTests.length === 0 ? (
              <Paper sx={{ bgcolor: "#fff6eeff", p: 6, textAlign: "center" }}>No tienes tests</Paper>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    },
                  }}
                >
                  {pageData.map((t) => (
                    <Card key={t.id} sx={{ bgcolor: "#fff6eeff", borderRadius: 2 }}>
                      {t.url_resultado && (
                        <img
                          src={t.url_resultado}
                          alt="resultado"
                          style={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                          }}
                        />
                      )}

                      <CardContent>
                        <Typography fontSize={12} color="#777">{formatDateShort(t.fecha)}</Typography>
                        <Typography fontWeight={800} sx={{ mt: 1 }}>{t.consulta}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Pagination for tests */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 6 }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => setPage((s) => Math.max(0, s - 1))}
                    disabled={page === 0}
                    sx={{ color: page === 0 ? "#bbb" : palette.dark }}
                  >
                    Atrás
                  </Button>

                  <Typography sx={{ color: "#666" }}>
                    Página {page + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                  </Typography>

                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => setPage((s) => s + 1)}
                    disabled={(page + 1) * itemsPerPage >= totalItems}
                    sx={{ color: (page + 1) * itemsPerPage >= totalItems ? "#bbb" : palette.dark }}
                  >
                    Siguiente
                  </Button>
                </Box>
              </>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
}
