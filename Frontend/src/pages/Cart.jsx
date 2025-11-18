import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  removeFromCartAsync, 
  updateCartItemAsync,
  loadCartAsync
} from "../redux/slices/cartSlice";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';
import imgMilhojasFresa from "../assets/images/img_milhojasFresa.png";
import { useVoice } from "../context/VoiceContext";

// ============================================
// FUNCIÓN DE BÚSQUEDA INTELIGENTE DE PRODUCTOS
// ============================================
/**
 * Calcula la similitud entre dos strings usando distancia de Levenshtein
 * Retorna un valor entre 0 (completamente diferente) y 1 (idéntico)
 */
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
};

/**
 * Busca un producto en el carrito usando búsqueda inteligente
 * @param {Array} products - Lista de productos en el carrito
 * @param {string} searchTerm - Término de búsqueda del usuario
 * @returns {Object} { product, confidence, alternatives }
 */
const findProductInCart = (products, searchTerm) => {
  if (!searchTerm || products.length === 0) {
    return { product: null, confidence: 0, alternatives: [] };
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Calcular similitud para cada producto
  const matches = products.map(product => {
    const productName = product.nombre.toLowerCase();

    // 1. Coincidencia exacta (máxima prioridad)
    if (productName === normalizedSearch) {
      return { product, score: 1.0, matchType: 'exact' };
    }

    // 2. Contiene el término completo
    if (productName.includes(normalizedSearch)) {
      return { product, score: 0.9, matchType: 'contains' };
    }

    // 3. El término contiene el nombre del producto
    if (normalizedSearch.includes(productName)) {
      return { product, score: 0.85, matchType: 'reverse-contains' };
    }

    // 4. Coincidencia por palabras clave (ignorar palabras comunes)
    const stopWords = ['de', 'del', 'la', 'el', 'y', 'con', 'a', 'en'];
    const searchWords = normalizedSearch.split(' ').filter(w => !stopWords.includes(w));
    const productWords = productName.split(' ').filter(w => !stopWords.includes(w));

    const wordMatches = searchWords.filter(sw =>
      productWords.some(pw => pw.includes(sw) || sw.includes(pw))
    );

    if (wordMatches.length > 0) {
      const wordScore = wordMatches.length / Math.max(searchWords.length, productWords.length);
      if (wordScore > 0.5) {
        return { product, score: 0.7 + (wordScore * 0.1), matchType: 'keywords' };
      }
    }

    // 5. Similitud de Levenshtein (fuzzy matching)
    const similarity = calculateSimilarity(productName, normalizedSearch);
    return { product, score: similarity * 0.6, matchType: 'fuzzy' };
  });

  // Ordenar por score descendente
  matches.sort((a, b) => b.score - a.score);

  const bestMatch = matches[0];
  const threshold = 0.5; // Umbral mínimo de confianza

  // Si el mejor match no supera el umbral, no hay coincidencia
  if (bestMatch.score < threshold) {
    return { product: null, confidence: 0, alternatives: [] };
  }

  // Buscar alternativas similares con umbral más estricto para ambigüedad
  const alternatives = matches
    .slice(1)
    .filter(m => m.score >= bestMatch.score * 0.8 && m.score >= threshold) // 80% del mejor match
    .slice(0, 4) // Máximo 4 alternativas
    .map(m => ({ product: m.product, score: m.score, matchType: m.matchType }));

  // Detectar ambigüedad: si hay alternativas con score muy cercano al mejor
  const isAmbiguous = alternatives.length > 0 && alternatives[0].score >= bestMatch.score * 0.9;

  return {
    product: bestMatch.product,
    confidence: bestMatch.score,
    matchType: bestMatch.matchType,
    alternatives,
    isAmbiguous
  };
};

// Selector de cantidad compacto tipo checkbox
const QuantitySelector = ({ value, onChange }) => {
  const handleIncrease = () => onChange(value + 1);
  const handleDecrease = () => onChange(Math.max(1, value - 1));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ff9c9c",
        borderRadius: "6px",
        overflow: "hidden",
        width: "70px",
        height: "32px",
        backgroundColor: "#fff",
      }}
    >
      <IconButton
        size="small"
        onClick={handleDecrease}
        sx={{
          width: "24px",
          height: "24px",
          color: "#771919",
          "&:hover": { backgroundColor: "#ffe5e5" },
        }}
      >
        <Remove fontSize="small" />
      </IconButton>

      <Typography
        sx={{
          width: "24px",
          textAlign: "center",
          fontSize: "0.9rem",
          fontWeight: 500,
        }}
      >
        {value}
      </Typography>

      <IconButton
        size="small"
        onClick={handleIncrease}
        sx={{
          width: "24px",
          height: "24px",
          color: "#771919",
          "&:hover": { backgroundColor: "#ffe5e5" },
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, totalAmount, isLoading } = useSelector((state) => state.cart);

  // Hook de voz con autenticación
  const { speak, registerCommands, unregisterCommands, requireAuth, isAuthenticated } = useVoice();

  // Estado local para las cantidades mientras el usuario edita
  const [localQuantities, setLocalQuantities] = useState({});

  // Estado para confirmación de vaciar carrito
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Estado para desambiguación de productos
  const [pendingAction, setPendingAction] = useState(null);
  const [ambiguousProducts, setAmbiguousProducts] = useState([]);

  // Refs para los temporizadores de debounce
  const debounceTimers = useRef({});

  // Cargar carrito al montar el componente
  useEffect(() => {
    dispatch(loadCartAsync());
  }, [dispatch]);

  // Inicializar cantidades locales cuando se cargan los productos
  useEffect(() => {
    if (products && products.length > 0) {
      const quantities = {};
      products.forEach(product => {
        quantities[product.id_detalle] = product.cantidad;
      });
      setLocalQuantities(quantities);
    }
  }, [products]);

  // Función debounced para actualizar en el backend
  const debouncedUpdate = useCallback((id_detalle, cantidad) => {
    // Limpiar el temporizador anterior si existe
    if (debounceTimers.current[id_detalle]) {
      clearTimeout(debounceTimers.current[id_detalle]);
    }

    // Crear nuevo temporizador que espera 2 segundos
    debounceTimers.current[id_detalle] = setTimeout(() => {
      console.log(`Guardando cantidad ${cantidad} para producto ${id_detalle}`);
      dispatch(updateCartItemAsync({ id_detalle, cantidad }));
      delete debounceTimers.current[id_detalle];
    }, 2000); // 2 segundos de espera
  }, [dispatch]);

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleQuantityChange = (id_detalle, newQuantity) => {
    if (newQuantity > 0) {
      // Actualizar inmediatamente en el estado local (UI instantánea)
      setLocalQuantities(prev => ({
        ...prev,
        [id_detalle]: newQuantity
      }));
      
      // Programar actualización en el backend con debounce
      debouncedUpdate(id_detalle, newQuantity);
    }
  };

  const handleRemoveProduct = (id_detalle) => {
    // Limpiar el temporizador si existe para este producto
    if (debounceTimers.current[id_detalle]) {
      clearTimeout(debounceTimers.current[id_detalle]);
      delete debounceTimers.current[id_detalle];
    }
    dispatch(removeFromCartAsync(id_detalle));
  };

  const handleContinue = () => {
    navigate("/payment");
  };

  const handleAddProduct = () => {
    navigate("/carta");
  };

  // Calcular el total local basado en las cantidades que el usuario está editando
  const calculateLocalTotal = () => {
    if (!products || products.length === 0) return 0;
    
    return products.reduce((total, product) => {
      const quantity = localQuantities[product.id_detalle] || product.cantidad;
      return total + (product.precio * quantity);
    }, 0);
  };

  const localTotal = calculateLocalTotal();
  const isCartEmpty = products.length === 0;

  // ============================================
  // FUNCIÓN PARA VACIAR CARRITO
  // ============================================
  const handleClearCart = useCallback(() => {
    // Eliminar todos los productos uno por uno
    products.forEach((product) => {
      dispatch(removeFromCartAsync(product.id_detalle));
    });
    speak('Carrito vaciado exitosamente');
    setAwaitingConfirmation(false);
  }, [products, dispatch, speak]);

  // ============================================
  // COMANDOS DE VOZ ESPECÍFICOS DE CARRITO
  // ============================================
  useEffect(() => {
    // 🎯 FUNCIÓN HELPER PARA AUMENTAR CANTIDAD (usada por múltiples comandos)
    const aumentarProducto = (nombreProducto) => {
      const nombreLimpio = nombreProducto.trim();
      const result = findProductInCart(products, nombreLimpio);

      if (!result.product) {
        speak(`No encontré ningún producto similar a ${nombreLimpio} en el carrito`);
        return;
      }

      // Si hay ambigüedad, pedir aclaración
      if (result.isAmbiguous && result.alternatives.length > 0) {
        const allOptions = [result.product, ...result.alternatives.map(a => a.product)];
        setAmbiguousProducts(allOptions);
        setPendingAction({ type: 'aumentar', searchTerm: nombreLimpio });

        const opciones = allOptions.map((p, idx) => `${idx + 1}. ${p.nombre}`).join(', ');
        speak(`Encontré varios productos similares: ${opciones}. Di el número de la opción que quieres`);
        return;
      }

      // Ejecutar acción sin ambigüedad
      const producto = result.product;
      const currentQty = localQuantities[producto.id_detalle] || producto.cantidad;
      const newQty = currentQty + 1;

      handleQuantityChange(producto.id_detalle, newQty);
      speak(`Aumentando ${producto.nombre} a ${newQty} unidad${newQty > 1 ? 'es' : ''}`);
    };

    // 🎯 FUNCIÓN HELPER PARA DISMINUIR CANTIDAD
    const disminuirProducto = (nombreProducto) => {
      const nombreLimpio = nombreProducto.trim();
      const result = findProductInCart(products, nombreLimpio);

      if (!result.product) {
        speak(`No encontré ningún producto similar a ${nombreLimpio} en el carrito`);
        return;
      }

      // Si hay ambigüedad, pedir aclaración
      if (result.isAmbiguous && result.alternatives.length > 0) {
        const allOptions = [result.product, ...result.alternatives.map(a => a.product)];
        setAmbiguousProducts(allOptions);
        setPendingAction({ type: 'disminuir', searchTerm: nombreLimpio });

        const opciones = allOptions.map((p, idx) => `${idx + 1}. ${p.nombre}`).join(', ');
        speak(`Encontré varios productos similares: ${opciones}. Di el número de la opción que quieres`);
        return;
      }

      const producto = result.product;
      const currentQty = localQuantities[producto.id_detalle] || producto.cantidad;

      if (currentQty > 1) {
        const newQty = currentQty - 1;
        handleQuantityChange(producto.id_detalle, newQty);
        speak(`Disminuyendo ${producto.nombre} a ${newQty} unidad${newQty > 1 ? 'es' : ''}`);
      } else {
        speak(`${producto.nombre} ya está en una unidad. Di "eliminar ${producto.nombre}" para quitarlo del carrito`);
      }
    };

    const voiceCommands = {
      // Aumentar cantidad - VARIANTES
      'aumentar (.+)': aumentarProducto,
      'agregar (.+) más': (nombreProducto) => aumentarProducto(nombreProducto),
      'agrega (.+) más': (nombreProducto) => aumentarProducto(nombreProducto),
      'añadir (.+) más': (nombreProducto) => aumentarProducto(nombreProducto),
      'añade (.+) más': (nombreProducto) => aumentarProducto(nombreProducto),
      'agregar un (.+) más': (nombreProducto) => aumentarProducto(nombreProducto),
      'agrega un (.+) más': (nombreProducto) => aumentarProducto(nombreProducto),
      'más (.+)': (nombreProducto) => aumentarProducto(nombreProducto),

      // Disminuir cantidad - VARIANTES
      'disminuir (.+)': disminuirProducto,
      'quitar (.+)': disminuirProducto,
      'quita (.+)': disminuirProducto,
      'reducir (.+)': disminuirProducto,
      'reduce (.+)': disminuirProducto,
      'menos (.+)': disminuirProducto,

      // COMANDOS DE DESAMBIGUACIÓN - Selección por número
      'opción (.+)': (numero) => {
        if (!pendingAction || ambiguousProducts.length === 0) {
          speak('No hay ninguna selección pendiente');
          return;
        }

        const idx = parseInt(numero) - 1;
        if (isNaN(idx) || idx < 0 || idx >= ambiguousProducts.length) {
          speak(`Opción inválida. Di un número entre 1 y ${ambiguousProducts.length}`);
          return;
        }

        const producto = ambiguousProducts[idx];
        const action = pendingAction.type;

        // Ejecutar la acción pendiente con el producto seleccionado
        if (action === 'aumentar') {
          const currentQty = localQuantities[producto.id_detalle] || producto.cantidad;
          const newQty = currentQty + 1;
          handleQuantityChange(producto.id_detalle, newQty);
          speak(`Aumentando ${producto.nombre} a ${newQty} unidad${newQty > 1 ? 'es' : ''}`);
        } else if (action === 'disminuir') {
          const currentQty = localQuantities[producto.id_detalle] || producto.cantidad;
          if (currentQty > 1) {
            const newQty = currentQty - 1;
            handleQuantityChange(producto.id_detalle, newQty);
            speak(`Disminuyendo ${producto.nombre} a ${newQty} unidad${newQty > 1 ? 'es' : ''}`);
          } else {
            speak(`${producto.nombre} ya está en una unidad`);
          }
        } else if (action === 'eliminar') {
          handleRemoveProduct(producto.id_detalle);
          speak(`Eliminando ${producto.nombre} del carrito`);
        }

        // Limpiar estado de desambiguación
        setPendingAction(null);
        setAmbiguousProducts([]);
      },

      'el (.+)': (numero) => {
        // Alias para "opción": "el uno", "el dos", etc.
        const numeros = { 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5' };
        const numStr = numeros[numero.toLowerCase()] || numero;

        if (!pendingAction || ambiguousProducts.length === 0) {
          speak('No hay ninguna selección pendiente');
          return;
        }

        const idx = parseInt(numStr) - 1;
        if (isNaN(idx) || idx < 0 || idx >= ambiguousProducts.length) {
          speak(`Opción inválida. Di un número entre 1 y ${ambiguousProducts.length}`);
          return;
        }

        const producto = ambiguousProducts[idx];
        const action = pendingAction.type;

        if (action === 'aumentar') {
          const currentQty = localQuantities[producto.id_detalle] || producto.cantidad;
          const newQty = currentQty + 1;
          handleQuantityChange(producto.id_detalle, newQty);
          speak(`Aumentando ${producto.nombre} a ${newQty} unidad${newQty > 1 ? 'es' : ''}`);
        } else if (action === 'disminuir') {
          const currentQty = localQuantities[producto.id_detalle] || producto.cantidad;
          if (currentQty > 1) {
            const newQty = currentQty - 1;
            handleQuantityChange(producto.id_detalle, newQty);
            speak(`Disminuyendo ${producto.nombre} a ${newQty} unidad${newQty > 1 ? 'es' : ''}`);
          } else {
            speak(`${producto.nombre} ya está en una unidad`);
          }
        } else if (action === 'eliminar') {
          handleRemoveProduct(producto.id_detalle);
          speak(`Eliminando ${producto.nombre} del carrito`);
        }

        setPendingAction(null);
        setAmbiguousProducts([]);
      },

      // Eliminar producto del carrito (CON BÚSQUEDA INTELIGENTE)
      'eliminar (.+)': (nombreProducto) => {
        const nombreLimpio = nombreProducto.trim();
        const result = findProductInCart(products, nombreLimpio);

        if (!result.product) {
          speak(`No encontré ningún producto similar a ${nombreLimpio} en el carrito`);
          return;
        }

        // Si hay ambigüedad, pedir aclaración
        if (result.isAmbiguous && result.alternatives.length > 0) {
          const allOptions = [result.product, ...result.alternatives.map(a => a.product)];
          setAmbiguousProducts(allOptions);
          setPendingAction({ type: 'eliminar', searchTerm: nombreLimpio });

          const opciones = allOptions.map((p, idx) => `${idx + 1}. ${p.nombre}`).join(', ');
          speak(`Encontré varios productos similares: ${opciones}. Di el número de la opción que quieres eliminar`);
          return;
        }

        const producto = result.product;
        handleRemoveProduct(producto.id_detalle);
        speak(`Eliminando ${producto.nombre} del carrito`);
      },

      // Eliminar por posición (primero, segundo, tercero)
      'eliminar el primero': () => {
        if (products[0]) {
          handleRemoveProduct(products[0].id_detalle);
          speak(`Eliminando ${products[0].nombre} del carrito`);
        } else {
          speak('No hay productos en el carrito');
        }
      },
      'eliminar el segundo': () => {
        if (products[1]) {
          handleRemoveProduct(products[1].id_detalle);
          speak(`Eliminando ${products[1].nombre} del carrito`);
        } else {
          speak('No hay un segundo producto en el carrito');
        }
      },
      'eliminar el tercero': () => {
        if (products[2]) {
          handleRemoveProduct(products[2].id_detalle);
          speak(`Eliminando ${products[2].nombre} del carrito`);
        } else {
          speak('No hay un tercer producto en el carrito');
        }
      },

      // VACIAR CARRITO - Primera confirmación
      'vaciar carrito': () => {
        if (products.length === 0) {
          speak('El carrito ya está vacío');
          return;
        }
        setAwaitingConfirmation(true);
        speak('¿Estás seguro de vaciar completamente el carrito? Di "confirmar vaciar carrito" para continuar, o "cancelar" para abortar');
      },

      // VACIAR CARRITO - Segunda confirmación (doble confirmación)
      'confirmar vaciar carrito': () => {
        if (!awaitingConfirmation) {
          speak('Primero debes decir "vaciar carrito"');
          return;
        }
        handleClearCart();
      },

      // Cancelar vaciar carrito
      'cancelar': () => {
        if (awaitingConfirmation) {
          setAwaitingConfirmation(false);
          speak('Acción cancelada');
        }
      },

      // Proceder al pago (🔐 requiere autenticación)
      'proceder al pago': () => {
        if (products.length === 0) {
          speak('No puedes proceder al pago con el carrito vacío');
          return;
        }
        
        // Validar autenticación antes de proceder
        requireAuth(
          () => {
            navigate('/payment');
            speak('Yendo a la página de pago');
          },
          'Debes iniciar sesión para proceder al pago'
        );
      },

      // Continuar comprando / volver al catálogo
      'volver al catálogo': () => {
        navigate('/carta');
        speak('Volviendo al catálogo');
      },
      'seguir comprando': () => {
        navigate('/carta');
        speak('Volviendo al catálogo');
      },

      // Ver total
      'cuánto es el total': () => {
        speak(`El total es ${localTotal.toFixed(2)} soles`);
      },
      'cuál es el total': () => {
        speak(`El total es ${localTotal.toFixed(2)} soles`);
      },

      // Listar productos en el carrito
      'qué hay en el carrito': () => {
        if (products.length === 0) {
          speak('El carrito está vacío');
          return;
        }
        const lista = products.map((p, idx) => 
          `${idx + 1}. ${p.nombre}, ${localQuantities[p.id_detalle] || p.cantidad} unidades`
        ).join(', ');
        speak(`Tienes ${products.length} productos: ${lista}`);
      },
      'listar productos': () => {
        if (products.length === 0) {
          speak('El carrito está vacío');
          return;
        }
        const lista = products.map((p, idx) => 
          `${idx + 1}. ${p.nombre}`
        ).join(', ');
        speak(`Productos en el carrito: ${lista}`);
      },

      // Cambiar cantidad directamente (CON BÚSQUEDA INTELIGENTE)
      'cambiar cantidad del (.+) a (.+)': (nombreProducto, cantidad) => {
        const result = findProductInCart(products, nombreProducto);
        const cantidadNum = parseInt(cantidad);

        if (!result.product) {
          speak(`No encontré ningún producto similar a ${nombreProducto} en el carrito`);
          return;
        }
        if (isNaN(cantidadNum) || cantidadNum < 1) {
          speak('Cantidad no válida. Debe ser un número mayor a cero');
          return;
        }

        const producto = result.product;
        handleQuantityChange(producto.id_detalle, cantidadNum);
        speak(`Cantidad de ${producto.nombre} cambiada a ${cantidadNum} unidad${cantidadNum > 1 ? 'es' : ''}`);
      },

      'establecer (.+) en (.+)': (nombreProducto, cantidad) => {
        const result = findProductInCart(products, nombreProducto);
        const cantidadNum = parseInt(cantidad);

        if (!result.product) {
          speak(`No encontré ningún producto similar a ${nombreProducto} en el carrito`);
          return;
        }
        if (isNaN(cantidadNum) || cantidadNum < 1) {
          speak('Cantidad no válida. Debe ser un número mayor a cero');
          return;
        }

        const producto = result.product;
        handleQuantityChange(producto.id_detalle, cantidadNum);
        speak(`${producto.nombre} establecido en ${cantidadNum} unidad${cantidadNum > 1 ? 'es' : ''}`);
      },

      // Cuántos productos hay (NUEVO)
      'cuántos productos hay en el carrito': () => {
        if (products.length === 0) {
          speak('El carrito está vacío');
        } else {
          const totalItems = products.reduce((sum, p) => 
            sum + (localQuantities[p.id_detalle] || p.cantidad), 0
          );
          speak(`Tienes ${products.length} productos diferentes, con un total de ${totalItems} unidades`);
        }
      },
    };

    // Registrar comandos para esta página
    registerCommands(voiceCommands);
    console.log('[Cart] ✅ Comandos de voz registrados:', Object.keys(voiceCommands).length);

    // Cleanup: eliminar comandos al desmontar
    return () => {
      unregisterCommands();
      setAwaitingConfirmation(false); // Resetear confirmación
      console.log('[Cart] 🗑️ Comandos de voz eliminados');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    products,
    localQuantities,
    localTotal,
    awaitingConfirmation,
    // NO incluir registerCommands ni unregisterCommands para evitar loop infinito
  ]);

  return (
    <Box
      className="relative w-full bg-[#fff] overflow-hidden text-left text-base text-[#000] font-[Montserrat]"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 150px)",
        padding: "40px 0",
      }}
    >
      {/* CONTENEDOR PRINCIPAL */}
      <Box
        sx={{
          position: "relative",
          width: "90%",
          maxWidth: "1300px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "2rem",
        }}
      >
        {/* TABLA DE PRODUCTOS (LADO IZQUIERDO) */}
        <Box sx={{ flex: "1 1 65%", position: "relative" }}>
          {/* ENCABEZADO PERMANENTE */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto minmax(250px, 1fr) 0.6fr 0.6fr 0.6fr",
              fontWeight: "600",
              mb: 2,
              alignItems: "center",
            }}
          >
            <div></div>
            <div>Producto</div>
            <div style={{ textAlign: "center", paddingLeft: "30px" }}>
              Precio
            </div>
            <div style={{ textAlign: "center", paddingLeft: "20px" }}>
              Cantidad
            </div>
            <div style={{ textAlign: "center", paddingLeft: "10px" }}>
              Total Parcial
            </div>
          </Box>

          {!isCartEmpty ? (
            // CARRITO NO VACÍO: FILAS Y BOTÓN CONTINUAR
            <>
              {/* FILAS DE PRODUCTOS */}
              {products.map((product) => (
                <Box
                  key={product.id_detalle}
                  data-item-id={product.id_detalle}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto minmax(250px, 1fr) 0.6fr 0.6fr 0.6fr",
                    alignItems: "center",
                    borderTop: "1px solid #ff9c9c",
                    py: 2,
                    columnGap: "1rem",
                  }}
                >
                  <CloseIcon
                    onClick={() => handleRemoveProduct(product.id_detalle)}
                    sx={{
                      color: "#771919", 
                      fontSize: 22,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#ffcccc", borderRadius: '50%', padding: '4px', border: '1px solid #ff9c9c'},
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Box
                      sx={{
                        width: "74px",
                        height: "62px",
                        borderRadius: "10px",
                        backgroundColor: "#ffe3d9",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={product.url_imagen || '/images/placeholder-product.jpg'}
                        alt={product.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        textOverflow: 'clip',
                      }}
                    >
                      {product.nombre}
                    </Typography>
                  </Box>
                  <Typography sx={{ textAlign: "center" }}>
                    S/{product.precio.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <QuantitySelector
                      value={localQuantities[product.id_detalle] || product.cantidad}
                      onChange={(newQty) =>
                        handleQuantityChange(product.id_detalle, newQty)
                      }
                    />
                  </Box>
                  <Typography sx={{ textAlign: "center" }}>
                    S/{((localQuantities[product.id_detalle] || product.cantidad) * product.precio).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              {/* BOTÓN CONTINUAR */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Box
                  data-testid="cart-continue-button"
                  role="button"
                  aria-label="Continuar al pago"
                  onClick={handleContinue}
                  sx={{
                    backgroundColor: "#ffe5e5",
                    color: "#771919",
                    px: 3,
                    py: 1.5,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#ffcccc" },
                  }}
                >
                  Continuar
                </Box>
              </Box>
            </>
          ) : (
            // CARRITO VACÍO: MENSAJE Y BOTÓN AGREGAR PRODUCTO
            <>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 5,
                  borderTop: "1px solid #ff9c9c",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {/* *** MENSAJE CON ICONO SentimentDissatisfiedOutlinedIcon *** */}
                <Typography variant="h6" sx={{ color: '#803e38', display: 'flex', alignItems: 'center', gap: 1 }}>
                  No tiene productos en el carrito <SentimentDissatisfiedOutlinedIcon sx={{ color: '#803e38', fontSize: '1.5rem' }} />
                </Typography>
                <Box
                  onClick={handleAddProduct}
                  sx={{
                    display: 'inline-block',
                    backgroundColor: "#ffe5e5",
                    color: "#771919",
                    px: 3,
                    py: 1.5,
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { backgroundColor: "#ffcccc" },
                    alignSelf: 'flex-end',
                  }}
                >
                  Agregar Producto
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* PANEL LATERAL: RESUMEN DE COMPRA */}
        <Box
          sx={{
            flex: "0 0 280px",
            maxWidth: "280px",
            minWidth: "280px",
            border: "1px solid #ff9c9c",
            borderRadius: "10px",
            padding: "2.5rem 2.5rem",
            backgroundColor: "#fff",
            mt: "-50px",
            mb: "-80px",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* SOLO MOSTRAR EL TÍTULO Y LA LÍNEA */}
          <Box>
            <Typography
              sx={{
                color: "#803e38",
                fontWeight: "700",
                textAlign: "center",
                mb: 3,
              }}
            >
              Resumen de Compra
            </Typography>
            <Box sx={{ borderTop: "1px solid #ff9c9c", my: 1 }} />
          </Box>
          
          {/* CONTENIDO CONDICIONAL (FILAS Y BOTÓN PROCESO) */}
          {!isCartEmpty && (
            <>
              {/* Bloque 2: DETALLES DE COMPRA */}
              <Box
                sx={{
                  flexGrow: 1,
                  mt: 7,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 5,
                  }}
                >
                  <Typography sx={{ fontWeight: "600" }}>ID-Compra:</Typography>
                  <Typography>C-001</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 5,
                  }}
                >
                  <Typography sx={{ fontWeight: "600" }}>Envío:</Typography>
                  <Typography>Recojo en tienda</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 5,
                    mb: 0,
                  }}
                >
                  <Typography sx={{ fontWeight: "600" }}>Total:</Typography>
                  <Typography
                    sx={{
                      color: "#f00000",
                      fontWeight: "700",
                      fontSize: "1.1rem",
                    }}
                  >
                    S/{localTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Bloque 3: Botón "Proceder al Pago" */}
              <Box
                onClick={() => navigate('/payment')}
                sx={{
                  backgroundColor: "#ff9c9c",
                  color: "#fff",
                  px: 3,
                  py: 1.5,
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    backgroundColor: "#ff7a7a",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(255, 156, 156, 0.3)",
                  },
                }}
              >
                Proceder al Pago
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Cart;