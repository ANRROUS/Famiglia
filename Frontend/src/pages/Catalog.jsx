import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, CircularProgress, Button, useMediaQuery, useTheme } from '@mui/material';
import { ProductosAPI, categoriaAPI } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../redux/slices/cartSlice';
import NotificationSnackbar from '../components/common/NotificationSnackbar';
import BuscadorProductos from '../components/common/BuscadorProductos';
import FiltroCategoria from '../components/common/FiltroCategoria';
import FiltroPrecio from '../components/common/FiltroPrecio';
import ProductCard from '../components/common/ProductCard';

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
          price: Number(p.precio ?? p.price ?? 0) || 0,
          // DB field is `url_imagen`, fallbacks for older payloads
          image: p.url_imagen ?? p.imagen ?? p.image ?? '/images/placeholder-product.jpg',
          id_categoria: p.id_categoria ?? p.categoriaId ?? null,
          totalVendido: p.totalVendido ?? 0,
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
  if (selectedCategory && String(p.id_categoria) !== String(selectedCategory)) return false;
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
      <Box
        sx={{
          width: 260,
          position: 'sticky',
          top: '1rem',
          height: 'fit-content',
          display: { xs: 'none', md: 'block' }
        }}
        data-section="categories"
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            component="h2"
            sx={{ color: '#8b3e3e', fontWeight: 700 }}
          >
            Categorías
          </Typography>
        </Box>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 6 }}
          data-section="category-filters"
        >
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
            data-category="todos"
            aria-label="Mostrar todos los productos"
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
              data-category={cat.nombre?.toLowerCase()}
              aria-label={`Filtrar por ${cat.nombre}`}
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
      <Box sx={{ flex: 1 }} data-section="products">
        {/* Título */}
        <Typography
          component="h1"
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
        <Box
          sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
          data-section="search"
        >
          <BuscadorProductos
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o descripción"
          />
        </Box>

        {/* Filtro de categorías */}
        {/* <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          <FiltroCategoria
            categorias={categorias}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
        </Box> */}
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
          <Typography
            className="text-center text-gray-500 mt-12"
            role="status"
            aria-live="polite"
          >
            No hay productos disponibles con esos filtros.
          </Typography>
        ) : (
          <div
            className="space-y-3"
            data-section="product-list"
            role="list"
            aria-label={`${filteredProducts.length} productos encontrados`}
          >
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  id_producto: p.id,
                  nombre: p.name,
                  descripcion: p.description,
                  precio: p.price,
                  url_imagen: p.image,
                  totalVendido: p.totalVendido || 0,
                  categoria: selectedCategory
                }}
                onAddToCart={(product) => {
                  dispatch(addToCartAsync(product))
                    .unwrap()
                    .then(() => {
                      setNotification({
                        open: true,
                        message: 'Producto agregado al carrito'
                      });
                    })
                    .catch((error) => {
                      setNotification({
                        open: true,
                        message: error.error || 'Error al agregar al carrito'
                      });
                    });
                }}
              />
            ))}
          </div>
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
