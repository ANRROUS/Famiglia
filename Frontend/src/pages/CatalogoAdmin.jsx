import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Button, useMediaQuery, useTheme } from '@mui/material';
import { ProductosAPI, categoriaAPI } from '../services/api';
import BuscadorProductos from '../components/common/BuscadorProductos';
import FiltroPrecio from '../components/common/FiltroPrecio';
import ProductCard from '../components/common/ProductCard';
import { useVoice } from '../context/VoiceContext';

export default function CatalogoAdmin() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Hook de voz
  const { speak, registerCommands, unregisterCommands } = useVoice();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [priceBounds, setPriceBounds] = useState([0, 100]);

  // Carga inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          ProductosAPI.getAll(),
          categoriaAPI.getAll(),
        ]);

        const prods = productosRes.data || [];

        const normalized = prods.map((p) => ({
          id: p.id_producto ?? p.id ?? null,
          name: p.nombre ?? p.name ?? '',
          description: p.descripcion ?? p.description ?? '',
          price: Number(p.precio ?? p.price ?? 0) || 0,
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

  // Filtro combinado
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

  // Comandos de voz para CatalogoAdmin
  useEffect(() => {
    const voiceCommands = {
      // Búsqueda
      'buscar (.+)': (query) => {
        setSearchTerm(query);
        speak(`Buscando ${query}`);
      },
      'limpiar búsqueda': () => {
        setSearchTerm('');
        speak('Búsqueda limpiada');
      },

      // Filtrado por categoría
      'filtrar por (.+)': (categoria) => {
        const categoriaEncontrada = categorias.find(
          (cat) => cat.nombre.toLowerCase() === categoria.toLowerCase()
        );
        if (categoriaEncontrada) {
          setSelectedCategory(categoriaEncontrada.id_categoria);
          speak(`Filtrando por ${categoriaEncontrada.nombre}`);
        } else {
          speak(`No se encontró la categoría ${categoria}`);
        }
      },
      'mostrar todas las categorías': () => {
        setSelectedCategory(null);
        speak('Mostrando todas las categorías');
      },
      'mostrar todos los productos': () => {
        setSelectedCategory(null);
        setSearchTerm('');
        setPriceRange(priceBounds);
        speak('Mostrando todos los productos');
      },

      // Control de precio
      'precio mínimo (.+)': (precio) => {
        const precioNum = parseInt(precio);
        if (!isNaN(precioNum)) {
          setPriceRange([precioNum, priceRange[1]]);
          speak(`Precio mínimo establecido en ${precioNum} soles`);
        } else {
          speak('Precio no válido');
        }
      },
      'precio máximo (.+)': (precio) => {
        const precioNum = parseInt(precio);
        if (!isNaN(precioNum)) {
          setPriceRange([priceRange[0], precioNum]);
          speak(`Precio máximo establecido en ${precioNum} soles`);
        } else {
          speak('Precio no válido');
        }
      },
      'restablecer precios': () => {
        setPriceRange(priceBounds);
        speak('Rango de precios restablecido');
      },

      // Consultas de información
      'cuántos productos hay': () => {
        speak(`Hay ${filteredProducts.length} productos en el catálogo`);
      },
      'qué categoría está activa': () => {
        if (selectedCategory) {
          const cat = categorias.find(c => c.id_categoria === selectedCategory);
          speak(`Categoría activa: ${cat?.nombre || 'Desconocida'}`);
        } else {
          speak('Todas las categorías están activas');
        }
      },
      'listar categorías': () => {
        const nombres = categorias.map(c => c.nombre).join(', ');
        speak(`Categorías disponibles: ${nombres}`);
      },

      // Navegación
      'ir al inicio': () => {
        window.location.href = '/';
      },
      'ir al catálogo público': () => {
        window.location.href = '/carta';
      },
    };

    registerCommands(voiceCommands);
    console.log('[CatalogoAdmin] ✅ Comandos registrados:', Object.keys(voiceCommands).length);

    return () => {
      unregisterCommands();
      console.log('[CatalogoAdmin] 🗑️ Comandos eliminados');
    };
  }, [
    categorias,
    selectedCategory,
    searchTerm,
    priceRange,
    priceBounds,
    filteredProducts,
    speak,
    // NO incluir registerCommands ni unregisterCommands para evitar loop infinito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

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
        {/* SIDEBAR */}
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
            <Typography sx={{ color: '#8b3e3e', fontWeight: 700 }}>Categorías</Typography>
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
                '&:hover': {
                  backgroundColor: selectedCategory === null ? '#8b3e3e' : '#EACCCC',
                },
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
                  backgroundColor:
                    selectedCategory === cat.id_categoria ? '#8b3e3e' : 'transparent',
                  borderRadius: '999px',
                  px: 2,
                  '&:hover': { backgroundColor: '#EACCCC' },
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
            Catálogo Administrativo
          </Typography>

          <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
            <BuscadorProductos
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar productos por nombre o descripción"
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

          {/* LISTA DE PRODUCTOS */}
          {filteredProducts.length === 0 ? (
            <Typography className="text-center text-gray-500 mt-12">
              No hay productos disponibles con esos filtros.
            </Typography>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id_producto: p.id,
                    nombre: p.name,
                    descripcion: p.description,
                    precio: p.price,
                    url_imagen: p.image,
                    totalVendido: p.totalVendido || 0,
                  }} showAddButton={false}

                />
              ))}
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
}
