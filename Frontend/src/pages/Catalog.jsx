import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, CircularProgress, Button, useMediaQuery, useTheme } from '@mui/material';
import { ProductosAPI, categoriaAPI } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import NotificationSnackbar from '../components/common/NotificationSnackbar';
import BuscadorProductos from '../components/common/BuscadorProductos';
import FiltroCategoria from '../components/common/FiltroCategoria';
import FiltroPrecio from '../components/common/FiltroPrecio';

export default function Catalog() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notification, setNotification] = useState({ open: false, message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [priceBounds, setPriceBounds] = useState([0, 100]);
  
  const cartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          ProductosAPI.getAll(),
          categoriaAPI.getAll()
        ]);

        const prods = productosRes.data || [];
        // normalize fields to consistent keys
        const normalized = prods.map((p) => ({
          id: p.id_producto ?? p.id ?? null,
          name: p.nombre ?? p.name ?? '',
          description: p.descripcion ?? p.description ?? '',
          price: Number(p.precio ?? p.price ?? 0),
          image: p.imagen ?? p.image ?? '/images/placeholder-product.jpg',
          id_categoria: p.id_categoria ?? p.categoriaId ?? null,
        }));

        setProductos(normalized);
        setCategorias(categoriasRes.data || []);

        const prices = normalized.map((x) => x.price || 0);
        const min = prices.length ? Math.min(...prices) : 0;
        const max = prices.length ? Math.max(...prices) : 100;
        setPriceBounds([min, max]);
        setPriceRange([min, max]);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      if (!p) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedCategory && p.id_categoria !== selectedCategory) return false;
      if (searchTerm) {
        const q = searchTerm.trim().toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [productos, priceRange, selectedCategory, searchTerm]);

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
        py: { xs: 4, md: 8 },   // padding vertical
        px: { xs: 3, sm: 6, md: 10, lg: 16 }, // padding horizontal responsive
      }}
    >

    <Box className="max-w-7xl mx-auto" sx={{ 
      display: 'flex', 
      gap: { xs: 2, md: 8 },
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* SIDEBAR - Solo visible en desktop */}
      <Box sx={{ 
        width: 260,
        position: 'sticky',
        top: '1rem',
        height: 'fit-content',
        display: { xs: 'none', md: 'block' }
      }}>
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ color: '#8b3e3e', fontWeight: 700 }}>
            Categorías
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 6 }}>
          <Button
            onClick={() => setSelectedCategory(null)}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              color: selectedCategory === null ? '#fff' : '#8b3e3e',
              backgroundColor: selectedCategory === null ? '#8b3e3e' : 'transparent',
              borderRadius: '999px',
              px: 2,
              '&:hover': { backgroundColor: selectedCategory === null ? '#8b3e3e' : '#EACCCC' }
            }}
          >
            TODOS
          </Button>

          {categorias.map((cat) => (
            <Button
              key={cat.id_categoria}
              onClick={() => setSelectedCategory(cat.id_categoria)}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                color: selectedCategory === cat.id_categoria ? '#fff' : '#8b3e3e',
                backgroundColor: selectedCategory === cat.id_categoria ? '#8b3e3e' : 'transparent',
                borderRadius: '999px',
                px: 2,
                '&:hover': { backgroundColor: '#EACCCC' }
              }}
            >
              {cat.nombre}
            </Button>
          ))}
        </Box>

        <Box sx={{ mt: 4 }}>
          <FiltroPrecio
            min={priceBounds[0]}
            max={priceBounds[1]}
            value={priceRange}
            onChange={setPriceRange}
          />
        </Box>
      </Box>

      {/* MAIN */}
      <Box sx={{ flex: 1 }}>
        {/* Título */}
        <Typography
          variant="h3"
          sx={{ 
            textAlign: 'center', 
            fontWeight: 700, 
            color: '#8b3e3e',
            fontSize: { xs: '1.75rem', md: '3rem' },
            mb: 4
          }}
        >
          Nuestra Carta
        </Typography>

        {/* Buscador centrado */}
        <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
          <BuscadorProductos
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o descripción"
          />
        </Box>

        {/* Filtro de categorías */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          <FiltroCategoria
            categorias={categorias}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
        </Box>
        {/* Filtro de precio visible solo en móvil */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            mb: 6,
          }}
        >
          <Box sx={{ width: '80%', maxWidth: 500 }}>
            <FiltroPrecio
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={priceRange}
              onChange={setPriceRange}
            />
          </Box>
        </Box>


        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <Typography className="text-center text-gray-500 mt-12">
            No hay productos disponibles con esos filtros.
          </Typography>
        ) : (
          <Box>
            {filteredProducts.map((p) => (
              <Box
                key={p.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 180px',
                  gap: 3,
                  alignItems: 'center',
                  py: 4,
                  borderTop: '1px solid #ff9c9c'
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 90,
                    borderRadius: 2,
                    backgroundColor: '#ffe3d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/images/placeholder-product.jpg';
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#6b2c2c' }}>{p.name}</Typography>
                  <Typography sx={{ color: '#6b2c2c', opacity: 0.85, mt: 1 }}>
                    {p.description}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'row', sm: 'column' }, 
                  alignItems: 'center', 
                  justifyContent: { xs: 'space-between', sm: 'center' },
                  gap: 2,
                  gridColumn: { xs: '1 / -1', sm: 'auto' },
                  mt: { xs: 2, sm: 0 }
                }}>
                  <Typography sx={{ 
                    color: '#f00000', 
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}>
                    S/{p.price.toFixed(2)}
                  </Typography>
                  <Button
                    sx={{
                      backgroundColor: '#ffe5e5',
                      color: '#771919',
                      px: { xs: 2, sm: 3 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      borderRadius: 2,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { backgroundColor: '#ffcccc' }
                    }}
                    onClick={() => {
                      const existingItem = cartItems.find(item => item.id === p.id);
                      dispatch(addToCart({ ...p, quantity: 1 }));
                      setNotification({
                        open: true,
                        message: existingItem ? 
                          'Producto actualizado en el carrito' : 
                          'Producto agregado al carrito'
                      });
                    }}
                  >
                    Añadir al carrito
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>

    {/* Notification */}
    <NotificationSnackbar 
      open={notification.open}
      message={notification.message}
      onClose={() => setNotification({ ...notification, open: false })}
    />
  </Box>
);

}
