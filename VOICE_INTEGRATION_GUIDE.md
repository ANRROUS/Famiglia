# 🎤 Guía de Integración de Voz "Pernity"

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Patrón de Integración](#patrón-de-integración)
3. [Tipos de Comandos](#tipos-de-comandos)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Ejemplos por Página](#ejemplos-por-página)
6. [Confirmaciones Dobles](#confirmaciones-dobles)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Introducción

El sistema de voz "Pernity" permite a los usuarios navegar y controlar la aplicación mediante comandos de voz. Este documento explica cómo integrar comandos de voz en cualquier página de la aplicación.

### Arquitectura
```
Usuario habla → VoiceContext captura → 
Busca comando local → Si existe: ejecuta localmente → 
Si no existe: envía a backend (Gemini/MCP)
```

### Ventajas de Comandos Locales
- ✅ **Ejecución instantánea** (sin latencia del backend)
- ✅ **Feedback inmediato** con Text-to-Speech
- ✅ **Sin consumo de API** de Gemini
- ✅ **Control total** del comportamiento

---

## 🔧 Patrón de Integración

### 1. Template Básico

```jsx
import { useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';

const MiPagina = () => {
  const { speak, registerCommands, unregisterCommands } = useVoice();

  useEffect(() => {
    const voiceCommands = {
      'mi comando': () => {
        // Lógica aquí
        speak('Comando ejecutado');
      },
    };

    registerCommands(voiceCommands);
    
    return () => unregisterCommands();
  }, [speak, registerCommands, unregisterCommands]);

  return <div>{/* contenido */}</div>;
};
```

### 2. Estructura de useEffect

```jsx
useEffect(() => {
  const voiceCommands = {
    // Definir comandos aquí
  };

  registerCommands(voiceCommands);
  console.log('[Pagina] ✅ Comandos registrados:', Object.keys(voiceCommands).length);

  return () => {
    unregisterCommands();
    console.log('[Pagina] 🗑️ Comandos eliminados');
  };
}, [
  // DEPENDENCIAS CRÍTICAS:
  // - Estados usados en comandos
  // - Funciones llamadas por comandos
  // - speak, registerCommands, unregisterCommands
]);
```

---

## 🎯 Tipos de Comandos

### 1. Comandos Exactos (Sin Parámetros)

```jsx
'agregar al carrito': () => {
  handleAddToCart();
  speak('Producto agregado al carrito');
},

'limpiar filtros': () => {
  clearFilters();
  speak('Filtros eliminados');
},
```

**Uso:** `"agregar al carrito"`, `"limpiar filtros"`

---

### 2. Comandos con Parámetros

Usa `(.+)` para capturar texto:

```jsx
'buscar (.+)': (query) => {
  setSearchTerm(query);
  speak(`Buscando ${query}`);
},

'filtrar por (.+)': (categoria) => {
  const cat = categorias.find(c => 
    c.nombre.toLowerCase() === categoria.toLowerCase()
  );
  if (cat) {
    filterByCategory(cat.id);
    speak(`Filtrando por ${categoria}`);
  } else {
    speak(`No encontré la categoría ${categoria}`);
  }
},

'aumentar (.+)': (producto) => {
  const item = items.find(i => 
    i.nombre.toLowerCase().includes(producto.toLowerCase())
  );
  if (item) {
    incrementQuantity(item.id);
    speak(`Aumentando ${item.nombre}`);
  } else {
    speak(`No encontré ${producto}`);
  }
},
```

**Uso:** 
- `"buscar torta de chocolate"`
- `"filtrar por pan"`
- `"aumentar jugo surtido"`

**⚠️ Nota:** La búsqueda es flexible con `.includes()` para mejor UX.

---

### 3. Comandos por Índice

```jsx
'agregar el primero': () => {
  if (products[0]) {
    handleAddToCart(products[0]);
    speak(`Agregando ${products[0].nombre}`);
  } else {
    speak('No hay productos disponibles');
  }
},

'eliminar el segundo': () => {
  if (items[1]) {
    removeItem(items[1].id);
    speak(`Eliminando ${items[1].nombre}`);
  } else {
    speak('No hay un segundo producto');
  }
},
```

**Uso:** `"agregar el primero"`, `"eliminar el tercero"`

---

### 4. Comandos Condicionales

```jsx
'proceder al pago': () => {
  if (cartItems.length === 0) {
    speak('No puedes proceder con el carrito vacío');
    return;
  }
  
  navigate('/payment');
  speak('Yendo a la página de pago');
},

'siguiente página': () => {
  if (currentPage < totalPages) {
    setPage(currentPage + 1);
    speak(`Página ${currentPage + 1} de ${totalPages}`);
  } else {
    speak('Ya estás en la última página');
  }
},
```

---

### 5. Comandos de Navegación

```jsx
'volver al catálogo': () => {
  navigate('/carta');
  speak('Volviendo al catálogo');
},

'ir al perfil': () => {
  navigate('/profile');
  speak('Yendo a tu perfil');
},

'volver': () => {
  navigate(-1);
  speak('Volviendo atrás');
},
```

---

### 6. Comandos de Información

```jsx
'cuánto es el total': () => {
  speak(`El total es ${total.toFixed(2)} soles`);
},

'qué hay en el carrito': () => {
  if (items.length === 0) {
    speak('El carrito está vacío');
    return;
  }
  
  const lista = items.map((item, idx) => 
    `${idx + 1}. ${item.nombre}, ${item.cantidad} unidades`
  ).join(', ');
  
  speak(`Tienes ${items.length} productos: ${lista}`);
},
```

---

## ✅ Mejores Prácticas

### 1. Feedback con Text-to-Speech

**✅ SIEMPRE usa `speak()` para confirmar acciones:**

```jsx
// ✅ CORRECTO
'eliminar producto': () => {
  removeProduct(id);
  speak('Producto eliminado del carrito');
},

// ❌ INCORRECTO (sin feedback)
'eliminar producto': () => {
  removeProduct(id);
},
```

### 2. Manejo de Errores

**✅ Proporciona mensajes claros cuando algo falla:**

```jsx
'aumentar (.+)': (producto) => {
  const item = items.find(i => 
    i.nombre.toLowerCase().includes(producto.toLowerCase())
  );
  
  if (item) {
    incrementQuantity(item.id);
    speak(`Aumentando ${item.nombre}`);
  } else {
    // ✅ Mensaje de error claro
    speak(`No encontré ${producto} en el carrito`);
  }
},
```

### 3. Validaciones Previas

**✅ Valida condiciones antes de ejecutar:**

```jsx
'vaciar carrito': () => {
  if (items.length === 0) {
    speak('El carrito ya está vacío');
    return; // ✅ Previene ejecución innecesaria
  }
  
  // Continuar con lógica de confirmación...
},
```

### 4. Dependencias del useEffect

**✅ Incluir TODAS las dependencias usadas:**

```jsx
useEffect(() => {
  const voiceCommands = {
    'mi comando': () => {
      // Usa: products, handleAdd, currentPage
    },
  };

  registerCommands(voiceCommands);
  return () => unregisterCommands();
}, [
  products,           // ✅ Estado usado
  handleAdd,          // ✅ Función llamada
  currentPage,        // ✅ Variable usada
  speak,              // ✅ Siempre incluir
  registerCommands,   // ✅ Siempre incluir
  unregisterCommands, // ✅ Siempre incluir
]);
```

### 5. Logging para Debug

**✅ Usa console.log para debugging:**

```jsx
registerCommands(voiceCommands);
console.log('[MiPagina] ✅ Comandos registrados:', Object.keys(voiceCommands).length);

return () => {
  unregisterCommands();
  console.log('[MiPagina] 🗑️ Comandos eliminados');
};
```

### 6. Nombres Descriptivos

**✅ Usa nombres de comandos intuitivos:**

```jsx
// ✅ CORRECTO - Natural y descriptivo
'agregar al carrito'
'buscar producto'
'ir a la siguiente página'

// ❌ INCORRECTO - Poco natural
'add cart'
'search'
'next'
```

---

## 📝 Ejemplos por Página

### Catalog.jsx (13 comandos)

```jsx
const voiceCommands = {
  // Agregar productos
  'agregar al carrito': () => { /* ... */ },
  'agregar el primero': () => { /* ... */ },
  'agregar el segundo': () => { /* ... */ },
  
  // Filtros
  'filtrar por (.+)': (categoria) => { /* ... */ },
  'buscar (.+)': (query) => { /* ... */ },
  'limpiar filtros': () => { /* ... */ },
  
  // Navegación
  'siguiente página': () => { /* ... */ },
  'página anterior': () => { /* ... */ },
  'primera página': () => { /* ... */ },
  'última página': () => { /* ... */ },
};
```

### Cart.jsx (16 comandos)

```jsx
const voiceCommands = {
  // Modificar cantidades
  'aumentar (.+)': (producto) => { /* ... */ },
  'disminuir (.+)': (producto) => { /* ... */ },
  
  // Eliminar
  'eliminar (.+)': (producto) => { /* ... */ },
  'eliminar el primero': () => { /* ... */ },
  
  // Vaciar carrito (doble confirmación)
  'vaciar carrito': () => { /* ... */ },
  'confirmar vaciar carrito': () => { /* ... */ },
  'cancelar': () => { /* ... */ },
  
  // Navegación
  'proceder al pago': () => { /* ... */ },
  'volver al catálogo': () => { /* ... */ },
  
  // Información
  'cuánto es el total': () => { /* ... */ },
  'qué hay en el carrito': () => { /* ... */ },
};
```

---

## 🔒 Confirmaciones Dobles

Para **acciones destructivas** como "vaciar carrito", usa confirmación doble:

### 1. Agregar Estado de Confirmación

```jsx
const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
```

### 2. Primera Solicitud

```jsx
'vaciar carrito': () => {
  if (items.length === 0) {
    speak('El carrito ya está vacío');
    return;
  }
  
  setAwaitingConfirmation(true);
  speak('¿Estás seguro de vaciar completamente el carrito? Di "confirmar vaciar carrito" para continuar, o "cancelar" para abortar');
},
```

### 3. Segunda Confirmación

```jsx
'confirmar vaciar carrito': () => {
  if (!awaitingConfirmation) {
    speak('Primero debes decir "vaciar carrito"');
    return;
  }
  
  handleClearCart();
  setAwaitingConfirmation(false);
},
```

### 4. Cancelación

```jsx
'cancelar': () => {
  if (awaitingConfirmation) {
    setAwaitingConfirmation(false);
    speak('Acción cancelada');
  }
},
```

### 5. Cleanup

```jsx
return () => {
  unregisterCommands();
  setAwaitingConfirmation(false); // ✅ Resetear al salir
};
```

---

## 🐛 Troubleshooting

### Problema: Comandos no se ejecutan

**Causa:** No se registraron correctamente o hay un error en la sintaxis.

**Solución:**
```jsx
// Verificar en consola
console.log('[Pagina] ✅ Comandos registrados:', Object.keys(voiceCommands).length);

// Verificar en VoiceContext
console.log('[Voice Context] Comandos actuales:', registeredCommands);
```

### Problema: Comando con parámetro no funciona

**Causa:** Regex mal formado.

**Solución:**
```jsx
// ✅ CORRECTO
'buscar (.+)': (query) => { /* ... */ },

// ❌ INCORRECTO
'buscar (.*)': (query) => { /* ... */ },  // Usar (.+) no (.*)
'buscar {query}': (query) => { /* ... */ }, // No usar {}
```

### Problema: Comando se ejecuta dos veces

**Causa:** Dependencias cambian constantemente, re-registrando comandos.

**Solución:**
```jsx
// ✅ Usa useCallback para funciones estables
const handleAdd = useCallback(() => {
  // lógica
}, [/* deps */]);

useEffect(() => {
  const voiceCommands = {
    'agregar': handleAdd, // ✅ Estable
  };
  
  registerCommands(voiceCommands);
  return () => unregisterCommands();
}, [handleAdd, registerCommands, unregisterCommands]);
```

### Problema: Text-to-Speech no habla

**Causa:** `speak()` no está en las dependencias o no se llamó.

**Solución:**
```jsx
// ✅ Asegurar que speak está en deps
useEffect(() => {
  const voiceCommands = {
    'mi comando': () => {
      speak('Mensaje'); // ✅ Llamar speak
    },
  };
  
  registerCommands(voiceCommands);
  return () => unregisterCommands();
}, [speak, registerCommands, unregisterCommands]); // ✅ speak aquí
```

### Problema: Comandos de página anterior siguen activos

**Causa:** No se llamó `unregisterCommands()` al desmontar.

**Solución:**
```jsx
useEffect(() => {
  const voiceCommands = { /* ... */ };
  registerCommands(voiceCommands);
  
  return () => {
    unregisterCommands(); // ✅ SIEMPRE limpiar
  };
}, [/* deps */]);
```

---

## 📊 Checklist de Integración

Antes de finalizar, verifica:

- [ ] ✅ Importado `useVoice` desde VoiceContext
- [ ] ✅ Extraído `speak`, `registerCommands`, `unregisterCommands`
- [ ] ✅ Comandos definidos en `useEffect`
- [ ] ✅ Llamado `registerCommands(voiceCommands)`
- [ ] ✅ Cleanup con `unregisterCommands()` en return
- [ ] ✅ Todas las dependencias incluidas en array de deps
- [ ] ✅ Cada comando usa `speak()` para feedback
- [ ] ✅ Validaciones previas implementadas
- [ ] ✅ Mensajes de error claros
- [ ] ✅ Logging para debugging
- [ ] ✅ Confirmaciones dobles para acciones destructivas
- [ ] ✅ Probado en navegador

---

## 🎓 Resumen

### Template Mínimo

```jsx
import { useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';

const MiPagina = () => {
  const { speak, registerCommands, unregisterCommands } = useVoice();

  useEffect(() => {
    const voiceCommands = {
      'mi comando': () => {
        // Tu lógica aquí
        speak('Comando ejecutado');
      },
    };

    registerCommands(voiceCommands);
    return () => unregisterCommands();
  }, [speak, registerCommands, unregisterCommands]);

  return <div>{/* contenido */}</div>;
};

export default MiPagina;
```

### Próximos Pasos

1. ✅ Integrar comandos en páginas restantes
2. ✅ Implementar comando de ayuda contextual
3. ✅ Agregar confirmaciones a acciones críticas
4. ✅ Documentar en `COMANDOS_VOZ.md`

---

**Fecha:** Noviembre 2025  
**Versión:** 1.0  
**Autor:** Sistema Pernity - Famiglia E-commerce
