import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './index.css'
import App from './App.jsx'

// Exponer el store en window para acceso desde MCP Playwright
if (typeof window !== 'undefined') {
  window.__REDUX_STORE__ = store;
  
  // Debug: verificar que el store está disponible
  console.log('[Famiglia] Redux store expuesto en window.__REDUX_STORE__');
  
  // Debug: mostrar estado inicial del carrito
  const initialState = store.getState();
  console.log('[Famiglia] Estado inicial del carrito:', initialState.cart);
  
  // Debug: escuchar cambios en el store
  store.subscribe(() => {
    const state = store.getState();
    console.log('[Famiglia] Carrito actualizado:', {
      items: state.cart.items?.length || 0,
      total: state.cart.totalAmount || 0
    });
  });
}

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
)
