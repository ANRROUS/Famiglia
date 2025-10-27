import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { ProductosAPI, categoriaAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';

export default function Catalog() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          ProductosAPI.getAll(),
          categoriaAPI.getAll()
        ]);
        setProductos(productosRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? productos.filter(p => p.id_categoria === selectedCategory)
    : productos;

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress sx={{ color: '#8b3e3e' }} />
      </Box>
    );
  }

  return (
    <Box className="w-full min-h-screen bg-[#FFF5F0] py-12 px-4">
      <Box className="max-w-7xl mx-auto">
        {/* Header */}
        <Typography 
          variant="h3" 
          className="text-center font-bold text-[#8b3e3e] mb-8"
        >
          Nuestra Carta
        </Typography>

        {/* Filtros de categorías */}
        <Box className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === null
                ? 'bg-[#8b3e3e] text-white'
                : 'bg-white text-[#8b3e3e] hover:bg-[#EACCCC]'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              onClick={() => setSelectedCategory(cat.id_categoria)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat.id_categoria
                  ? 'bg-[#8b3e3e] text-white'
                  : 'bg-white text-[#8b3e3e] hover:bg-[#EACCCC]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </Box>

        {/* Grid de productos */}
        {filteredProducts.length === 0 ? (
          <Typography className="text-center text-gray-500 mt-12">
            No hay productos disponibles en esta categoría
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {filteredProducts.map((producto) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id_producto}>
                <ProductCard product={producto} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
