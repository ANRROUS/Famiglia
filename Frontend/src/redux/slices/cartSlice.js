import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/api/axiosInstance';

// Thunks asíncronos para sincronizar con el backend
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (product, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/pedido/carrito/add', {
        id_producto: product.id_producto,
        cantidad: product.cantidad || 1
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al agregar al carrito');
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItemAsync',
  async ({ id_detalle, cantidad }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/api/pedido/carrito/update', {
        id_detalle,
        cantidad
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al actualizar el carrito');
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (id_detalle, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/pedido/carrito/remove/${id_detalle}`);
      return { id_detalle, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al eliminar del carrito');
    }
  }
);

export const loadCartAsync = createAsyncThunk(
  'cart/loadCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/pedido/carrito');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error al cargar el carrito');
    }
  }
);

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  orderId: null,
  isLoading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.orderId = null;
    },
    setOrderId: (state, action) => {
      state.orderId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        state.orderId = action.payload.orderId || state.orderId;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Load cart
      .addCase(loadCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.totalAmount = action.payload.totalAmount || 0;
        state.orderId = action.payload.orderId || null;
      })
      .addCase(loadCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCart, setOrderId } = cartSlice.actions;

export default cartSlice.reducer;
