import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Box, Typography, Avatar, Paper, Tabs, Tab, Card, CardContent, Chip, CircularProgress, Alert, Divider } from '@mui/material';
import { ShoppingBag, Quiz, CalendarToday, LocationOn, CreditCard } from "@mui/icons-material";
import { pedidoAPI, preferencesAPI } from "../services/api";
import crypto from 'crypto-js';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [pedidos, setPedidos] = useState([]);
  const [tests, setTests] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [error, setError] = useState("");

  // Función para generar el hash del ID del pedido
  const hashOrderId = (id) => {
    const hash = crypto.SHA256(id.toString()).toString();
    return `SA-${hash.substring(0, 8).toUpperCase()}`;
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchPedidos();
    } else if (tabValue === 1) {
      fetchTests();
    }
  }, [tabValue]);

  const fetchPedidos = async () => {
    setLoadingPedidos(true);
    setError("");
    try {
      const response = await pedidoAPI.getHistorialPedidos();
      setPedidos(response.data || []);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      setError("Error al cargar el historial de pedidos");
    } finally {
      setLoadingPedidos(false);
    }
  };

  const fetchTests = async () => {
    setLoadingTests(true);
    setError("");
    try {
      const response = await preferencesAPI.getHistorialTests();
      setTests(response.data.data || []);
    } catch (error) {
      console.error("Error al obtener tests:", error);
      setError("Error al cargar el historial de tests");
    } finally {
      setLoadingTests(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      confirmado: "#4caf50",
      pendiente: "#ff9800",
      enviado: "#2196f3",
      entregado: "#8bc34a",
      cancelado: "#f44336",
    };
    return colors[estado?.toLowerCase()] || "#999";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fef7f5", pt: 10, pb: 6, px: 2, fontFamily: "'Montserrat', sans-serif" }}>
      <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header del Perfil */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: "16px", background: "linear-gradient(135deg, #ff9c9c 0%, #ffb3b3 100%)", color: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar src={user?.url_imagen} alt={user?.nombre} sx={{ width: 100, height: 100, border: "4px solid #fff", fontSize: "40px", bgcolor: "#fff", color: "#ff9c9c" }}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "700", mb: 1 }}>{user?.nombre}</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>{user?.correo}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3, borderRadius: "12px" }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered
            sx={{ "& .MuiTab-root": { textTransform: "none", fontSize: "16px", fontWeight: "600", py: 2 }, "& .Mui-selected": { color: "#ff9c9c" }, "& .MuiTabs-indicator": { backgroundColor: "#ff9c9c" } }}>
            <Tab icon={<ShoppingBag />} label="Mis Pedidos" iconPosition="start" />
            <Tab icon={<Quiz />} label="Mis Tests" iconPosition="start" />
          </Tabs>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Tab 0: Pedidos */}
        {tabValue === 0 && (
          <Box>
            {loadingPedidos ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#ff9c9c" }} /></Box>
            ) : pedidos.length === 0 ? (
              <Paper elevation={2} sx={{ p: 6, textAlign: "center", borderRadius: "12px" }}>
                <ShoppingBag sx={{ fontSize: 80, color: "#ddd", mb: 2 }} />
                <Typography variant="h6" color="textSecondary">No tienes pedidos realizados</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {pedidos.map((pedido) => (
                  <Card key={pedido.id_pedido} elevation={2} sx={{ borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease", "&:hover": { boxShadow: 6 } }}>
                    <Box sx={{ bgcolor: "#ff9c9c", color: "#fff", px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="h6" sx={{ fontWeight: "600" }}>Pedido #{hashOrderId(pedido.id_pedido)}</Typography>
                      <Chip label={pedido.estado} sx={{ bgcolor: getEstadoColor(pedido.estado), color: "#fff", fontWeight: "600", textTransform: "capitalize" }} />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarToday sx={{ color: "#999", fontSize: 20 }} />
                          <Typography variant="body2" color="textSecondary">{formatDate(pedido.fecha)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LocationOn sx={{ color: "#999", fontSize: 20 }} />
                          <Typography variant="body2" color="textSecondary">{pedido.envio || "Por definir"}</Typography>
                        </Box>
                        {pedido.pago && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CreditCard sx={{ color: "#999", fontSize: 20 }} />
                            <Typography variant="body2" color="textSecondary">{pedido.pago.medio}</Typography>
                          </Box>
                        )}
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: "600", mb: 2, color: "#666" }}>Productos:</Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {pedido.items.map((item) => (
                          <Box key={item.id_detalle} sx={{ display: "flex", gap: 2, alignItems: "center", p: 2, bgcolor: "#f9f9f9", borderRadius: "8px" }}>
                            <Box sx={{ width: 60, height: 60, borderRadius: "8px", overflow: "hidden", bgcolor: "#ffe3d9", flexShrink: 0 }}>
                              <img src={item.producto.url_imagen || "/images/placeholder-product.jpg"} alt={item.producto.nombre}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { e.target.src = "/images/placeholder-product.jpg"; }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: "500" }}>{item.producto.nombre}</Typography>
                              <Typography variant="body2" color="textSecondary">Cantidad: {item.cantidad} x S/{item.producto.precio.toFixed(2)}</Typography>
                            </Box>
                            <Typography sx={{ fontWeight: "600", color: "#ff9c9c", fontSize: "16px" }}>S/{(item.cantidad * item.producto.precio).toFixed(2)}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: "700" }}>Total:</Typography>
                        <Typography variant="h5" sx={{ fontWeight: "700", color: "#f00000" }}>S/{pedido.total.toFixed(2)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Tests */}
        {tabValue === 1 && (
          <Box>
            {loadingTests ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: "#ff9c9c" }} /></Box>
            ) : tests.length === 0 ? (
              <Paper elevation={2} sx={{ p: 6, textAlign: "center", borderRadius: "12px" }}>
                <Quiz sx={{ fontSize: 80, color: "#ddd", mb: 2 }} />
                <Typography variant="h6" color="textSecondary">No has realizado tests de preferencias</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 3 }}>
                {tests.map((test) => (
                  <Card key={test.id} elevation={2} sx={{ borderRadius: "12px", overflow: "hidden", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: 6 } }}>
                    {test.url_resultado && (
                      <Box sx={{ height: 200, overflow: "hidden", bgcolor: "#ffe3d9" }}>
                        <img src={test.url_resultado} alt="Resultado del test" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.src = "/images/placeholder-product.jpg"; }} />
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "12px" }}>{formatDate(test.fecha)}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: "600", mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{test.consulta}</Typography>
                      <Chip label="Ver recomendación" size="small" sx={{ bgcolor: "#ff9c9c", color: "#fff", fontWeight: "500" }} />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
