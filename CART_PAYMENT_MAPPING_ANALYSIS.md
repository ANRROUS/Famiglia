# 📋 **Análisis Completo de Estructura de Carrito y Pago - Famiglia**

## 🛒 **ESTRUCTURA DE DATOS DEL CARRITO**

### **Redux Store Structure (cartSlice.js)**
```javascript
// Estado inicial del carrito
const initialState = {
  items: [],           // Array de productos en el carrito
  totalQuantity: 0,    // Cantidad total de items
  totalAmount: 0,      // Monto total en soles (S/)
  orderId: null,       // ID del pedido actual
  isLoading: false,    // Estado de carga
  error: null          // Errores
};

// Estructura de cada item en el carrito
const cartItem = {
  id_detalle: "SA-4FC82B26-001",    // ID único del item en el carrito
  id_producto: 43,                   // ID del producto en la base de datos
  nombre: "Baguette dulce navideño", // Nombre del producto
  precio: 4.00,                      // Precio unitario
  cantidad: 1,                       // Cantidad actual
  subtotal: 4.00,                    // precio × cantidad
  url_imagen: "/images/baguette.jpg" // URL de la imagen
};
```

### **APIs del Carrito (Backend)**
```javascript
// Endpoints disponibles
POST   /api/pedido/carrito/add        // Agregar producto
PUT    /api/pedido/carrito/update     // Actualizar cantidad
DELETE /api/pedido/carrito/remove/:id // Eliminar producto
GET    /api/pedido/carrito            // Obtener carrito actual
```

---

## 🎛️ **MAPEO DE CONTROLES DEL CARRITO**

### **1. Estructura DOM del Carrito**
```jsx
// Cada producto en el carrito tiene esta estructura:
<Box data-item-id={product.id_detalle}>  // 🔑 CLAVE: data-item-id para targeting
  
  {/* Botón Eliminar */}
  <CloseIcon 
    onClick={() => handleRemoveProduct(product.id_detalle)}
    testid="delete-product-button"
  />
  
  {/* Información del Producto */}
  <Box>
    <img src={product.url_imagen} alt={product.nombre} />
    <Typography>{product.nombre}</Typography>
  </Box>
  
  {/* Precio Unitario */}
  <Typography>S/{product.precio.toFixed(2)}</Typography>
  
  {/* Selector de Cantidad */}
  <QuantitySelector 
    value={localQuantities[product.id_detalle] || product.cantidad}
    onChange={(newQty) => handleQuantityChange(product.id_detalle, newQty)}
  />
  
  {/* Total Parcial */}
  <Typography>S/{((cantidad * precio).toFixed(2))}</Typography>
</Box>
```

### **2. Componente QuantitySelector**
```jsx
const QuantitySelector = ({ value, onChange }) => (
  <Box sx={{ /* estilos del container */ }}>
    
    {/* Botón Disminuir (-) */}
    <IconButton onClick={handleDecrease}>
      <Remove fontSize="small" />  // data-testid="RemoveIcon"
    </IconButton>
    
    {/* Cantidad Actual */}
    <Typography className="MuiTypography-root">
      {value}  // 🔑 TEXTO DE LA CANTIDAD
    </Typography>
    
    {/* Botón Aumentar (+) */}
    <IconButton onClick={handleIncrease}>
      <Add fontSize="small" />     // data-testid="AddIcon"
    </IconButton>
    
  </Box>
);
```

### **3. Selectores para MCP Tools**
```javascript
// IMPORTANTE: Los IDs reales en el DOM son diferentes a los del Redux
// Redux devuelve: "SA-4FC82B26-001" 
// DOM real tiene: data-item-id="43" (ID del producto)

// Selectores correctos para updateCartQuantity:
`[data-item-id="${realProductId}"]`                    // Container del producto
`[data-item-id="${realProductId}"] .MuiTypography-root` // Texto de cantidad
`[data-item-id="${realProductId}"] button:has(svg[data-testid="AddIcon"])`    // Botón +
`[data-item-id="${realProductId}"] button:has(svg[data-testid="RemoveIcon"])` // Botón -
`[data-item-id="${realProductId}"] svg[data-testid="CloseIcon"]`              // Botón eliminar
```

### **4. Botón Continuar al Pago**
```jsx
<Box
  data-testid="cart-continue-button"
  role="button"
  aria-label="Continuar al pago"
  onClick={handleContinue}  // Navigate to /payment
>
  Continuar
</Box>
```

---

## 💳 **ESTRUCTURA DE LA VISTA DE PAGO**

### **1. Métodos de Pago Disponibles**
```jsx
// RadioGroup para selección de método
<RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
  
  {/* Opción Yape */}
  <FormControlLabel 
    value="yape"
    control={<Radio />}
    label={
      <Box>
        <img src={yapeLogo} alt="Yape" />
        <Typography>Yape</Typography>
      </Box>
    }
  />
  
  {/* Opción Plin */}
  <FormControlLabel 
    value="plin" 
    control={<Radio />}
    label={
      <Box>
        <img src={plinLogo} alt="Plin" />
        <Typography>Plin</Typography>
      </Box>
    }
  />
  
</RadioGroup>
```

### **2. Inputs de Información de Pago**
```jsx
// Campo Número de Teléfono
<TextField
  fullWidth
  label="Número de Teléfono"
  placeholder="987654321"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
  error={!!errors.phoneNumber}
  helperText={errors.phoneNumber}
  // Validación: /^9\d{8}$/ (9 dígitos, comenzando con 9)
/>

// Campo Código de Verificación  
<TextField
  fullWidth
  label="Código de Verificación"
  placeholder="123456"
  value={verificationCode}
  onChange={(e) => setVerificationCode(e.target.value)}
  error={!!errors.verificationCode}
  helperText={errors.verificationCode}
  // Validación: mínimo 4 dígitos
/>
```

### **3. Botón Confirmar Pago**
```jsx
<Button
  fullWidth
  variant="contained"
  onClick={handlePayment}
  disabled={isLoading}
  sx={{ /* estilos personalizados */ }}
>
  {isLoading ? (
    <>
      <CircularProgress size={20} />
      Procesando...
    </>
  ) : (
    "Confirmar Pago"
  )}
</Button>
```

### **4. Estados del Componente Payment**
```javascript
const [paymentMethod, setPaymentMethod] = useState("yape");      // "yape" | "plin"
const [phoneNumber, setPhoneNumber] = useState("");             // String: número teléfono
const [verificationCode, setVerificationCode] = useState("");   // String: código verificación
const [errors, setErrors] = useState({});                       // Objeto de errores
const [isLoading, setIsLoading] = useState(false);             // Boolean: estado carga
const [apiError, setApiError] = useState("");                  // String: error de API
```

---

## 🎤 **COMANDOS DE VOZ IMPLEMENTADOS**

### **Carrito (Cart.jsx)**
```javascript
// Gestión de cantidades
'aumentar (.+)': (nombreProducto) => { /* Incrementa +1 */ }
'disminuir (.+)': (nombreProducto) => { /* Decrementa -1 */ }

// Eliminar productos
'eliminar (.+)': (nombreProducto) => { /* Elimina por nombre */ }
'eliminar el primero|segundo|tercero': () => { /* Elimina por posición */ }

// Vaciar carrito (doble confirmación)
'vaciar carrito': () => { /* Solicita confirmación */ }
'confirmar vaciar carrito': () => { /* Ejecuta limpieza */ }

// Navegación
'proceder al pago': () => { /* Navigate to /payment */ }
'volver al inicio': () => { /* Navigate to / */ }

// Información
'cuántos productos hay': () => { /* Cuenta items */ }
'cuáles son los productos': () => { /* Lista productos */ }
'cuánto es el total': () => { /* Lee total */ }
```

### **Pago (Payment.jsx)**
```javascript
// Selección método de pago
'seleccionar yape|plin': () => { /* Cambia método */ }
'pagar con yape|plin': () => { /* Cambia método */ }

// Llenar campos
'teléfono (.+)': (numero) => { /* Ingresa teléfono */ }
'código (.+)': (codigo) => { /* Ingresa código */ }

// Procesar pago
'confirmar pago': () => { /* Ejecuta handlePayment */ }
'procesar pago': () => { /* Ejecuta handlePayment */ }

// Navegación
'volver al carrito': () => { /* Navigate to /cart */ }
'cancelar': () => { /* Navigate to /cart */ }

// Información
'cuánto es el total': () => { /* Lee totalAmount */ }
'qué método tengo': () => { /* Lee paymentMethod */ }
'qué campos faltan': () => { /* Valida campos */ }

// Utilidades
'limpiar teléfono|código': () => { /* Limpia campos */ }
```

---

## 🔧 **SELECTORES PARA MCP TOOLS**

### **Cart Management**
```javascript
// getCartState - Accede al Redux store
window.__REDUX_STORE__.getState().cart

// updateCartQuantity - Target por data-item-id
`[data-item-id="${productId}"] button:has(svg[data-testid="AddIcon"])`    // Botón +
`[data-item-id="${productId}"] button:has(svg[data-testid="RemoveIcon"])` // Botón -
`[data-item-id="${productId}"] .MuiTypography-root`                       // Cantidad actual

// removeFromCart - Botón eliminar
`[data-item-id="${productId}"] svg[data-testid="CloseIcon"]`

// proceedToPayment - Botón continuar
`[data-testid="cart-continue-button"]`
```

### **Payment Management**
```javascript
// Seleccionar método de pago
`input[value="yape"]`    // Radio button Yape
`input[value="plin"]`    // Radio button Plin

// Llenar campos
`input[placeholder="987654321"]`  // Campo teléfono
`input[placeholder="123456"]`     // Campo código verificación

// Confirmar pago
`button:contains("Confirmar Pago")` // Botón submit
`button:contains("Procesando...")` // Estado loading
```

---

## 📊 **FLUJO DE DATOS**

### **Cart Flow**
```
1. Usuario → Comando de voz
2. Cart.jsx → handleQuantityChange(id_detalle, newQty)
3. Redux → dispatch(updateCartItemAsync({ id_detalle, cantidad }))
4. API → PUT /api/pedido/carrito/update
5. Backend → Actualiza base de datos
6. Response → Actualiza Redux store
7. UI → Re-render con nuevos datos
```

### **Payment Flow**
```
1. Usuario → Llena campos (método, teléfono, código)
2. Payment.jsx → handlePayment()
3. API → pagoAPI.procesarPago({ medio, numero, cod_ver, envio })
4. Backend → POST /api/pedido/pago
5. Response → Datos del pedido y pago
6. Navigate → /order-confirmation con state
```

---

## ⚠️ **PROBLEMAS IDENTIFICADOS Y SOLUCIONES**

### **1. ID Mismatch en updateCartQuantity**
**Problema:** `getCartState` devuelve IDs como "SA-4FC82B26-001" pero el DOM usa IDs numéricos como "43"

**Solución:** Implementado mapeo por nombre de producto como fallback
```javascript
// Si itemId no existe, buscar por productName
if (!targetExists.exists) {
  realItemId = await buscarPorNombreProducto(debugInfo, productName);
}
```

### **2. Playwright Argument Error**
**Problema:** "Too many arguments" en p.evaluate()

**Solución:** Empaquetar argumentos en objeto
```javascript
// ❌ Incorrecto
await p.evaluate((arg1, arg2, arg3) => {}, param1, param2, param3);

// ✅ Correcto  
await p.evaluate(({ arg1, arg2, arg3 }) => {}, { arg1: param1, arg2: param2, arg3: param3 });
```

---

## 🚀 **PRÓXIMAS MEJORAS RECOMENDADAS**

1. **Unificar IDs:** Hacer que data-item-id use el mismo formato que Redux store
2. **Debounce mejorado:** Optimizar actualización en tiempo real de cantidades
3. **Voice feedback:** Mejorar respuestas de voz con estado actual
4. **Error handling:** Manejo robusto de errores de red y validación
5. **Accessibility:** Mejorar labels ARIA para navegación por voz

---

*📝 Documento generado el $(date) para análisis técnico del sistema de carrito y pago de Famiglia*