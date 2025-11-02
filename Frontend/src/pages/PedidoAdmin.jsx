import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { pedidoAPI } from '../services/api';
import BuscadorProductos from '../components/common/BuscadorProductos';
import PedidoCard from '../components/common/PedidoCard';

export default function PedidosAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Carga inicial de pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const res = await pedidoAPI.getPedidosAdmin();
        const data = res.data || [];

        // Normalización por si el backend usa BigInt o diferentes campos
        const normalized = data.map((p) => ({
          id_pedido: Number(p.id_pedido) || 0,
          fecha: p.fecha ?? null,
          estado: p.estado ?? 'Desconocido',
          envio: p.envio ?? '',
          usuario: p.usuario ?? { nombre: 'Sin usuario' },
          detalle_pedido: p.detalle_pedido ?? [],
          pago: p.pago ?? [],
        }));

        setPedidos(normalized);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  // 🔍 Filtro combinado
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      if (!p) return false;

      // Filtro por estado
      if (selectedEstado !== 'todos' && p.estado?.toLowerCase() !== selectedEstado) {
        return false;
      }

      // Filtro de búsqueda
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const fechaStr = p.fecha ? new Date(p.fecha).toLocaleDateString('es-PE') : '';
        return (
          String(p.id_pedido).includes(q) ||
          p.usuario?.nombre?.toLowerCase().includes(q) ||
          fechaStr.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [pedidos, selectedEstado, searchTerm]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress sx={{ color: '#8b3e3e' }} />
      </Box>
    );
  }

  return (
    <Box
      className="w-full min-h-screen bg-[#FFF5F0] font-['Montserrat']"
      sx={{
        py: { xs: 4, md: 8 },
        px: { xs: 3, sm: 6, md: 10, lg: 16 },
      }}
    >
      <Box
        className="max-w-7xl mx-auto"
        sx={{
          display: 'flex',
          gap: { xs: 2, md: 8 },
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* SIDEBAR DE FILTROS */}
        <Box
          sx={{
            width: 260,
            position: 'sticky',
            top: '1rem',
            height: 'fit-content',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ color: '#8b3e3e', fontWeight: 700 }}>
              Filtrar por estado
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Todos', value: 'todos' },
              { label: 'Reservados', value: 'reservado' },
              { label: 'Entregados', value: 'entregado' },
            ].map((f) => (
              <Button
                key={f.value}
                onClick={() => setSelectedEstado(f.value)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  color: selectedEstado === f.value ? '#fff' : '#8b3e3e',
                  backgroundColor:
                    selectedEstado === f.value ? '#8b3e3e' : 'transparent',
                  borderRadius: '999px',
                  px: 2,
                  '&:hover': {
                    backgroundColor:
                      selectedEstado === f.value ? '#8b3e3e' : '#EACCCC',
                  },
                }}
              >
                {f.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* MAIN */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: '#8b3e3e',
              fontSize: { xs: '1.75rem', md: '3rem' },
              mb: 4,
            }}
          >
            Pedidos Administrativos
          </Typography>

          <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
            <BuscadorProductos
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por código, usuario o fecha"
            />
          </Box>

          {/* Lista de pedidos */}
          {filteredPedidos.length === 0 ? (
            <Typography className="text-center text-gray-500 mt-12">
              No hay pedidos que coincidan con esos filtros.
            </Typography>
          ) : (
            <div className="space-y-3">
              {filteredPedidos.map((pedido) => (
                <PedidoCard key={pedido.id_pedido} pedido={pedido} />
              ))}
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
}
