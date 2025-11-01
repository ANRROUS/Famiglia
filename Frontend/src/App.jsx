import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LoginModalProvider } from "./context/LoginModalContext";
import { useLoginModal } from "./context/LoginModalContext";
import LoginForm from "./components/forms/LoginForm";
import Home from "./pages/Home";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import OrderConfirmation from "./pages/OrderConfirmation";
import Profile from "./pages/Profile";
import Catalog from "./pages/Catalog";
import PreferencesTest from './pages/PreferencesTest';
import TerminosPage from './pages/TerminosPage';
import PrivacidadPage from './pages/PrivacidadPage';
import QuienesSomosPage from './pages/QuienesSomosPage';
import ProtectedRoute from "./components/common/ProtectedRoute";
import Complaints from "./pages/Complaints";
import { setUser, authCheckComplete } from "./redux/slices/authSlice";
import { authAPI } from "./services/api";

// 🔹 Controla la visibilidad del Header
function Layout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const hideHeader = location.pathname === "/" || location.pathname === "/home";
  const { isLoginModalOpen, hideLoginModal } = useLoginModal();

  // Verificar autenticación al cargar la app (SOLO UNA VEZ)
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await authAPI.getPerfil();
        if (isMounted) {
          dispatch(setUser(response.data.usuario));
        }
      } catch (error) {
        // Usuario no autenticado, marcar verificación como completa
        console.log("Usuario no autenticado");
        if (isMounted) {
          dispatch(authCheckComplete());
        }
      }
    };

    checkAuth();

    // Cleanup para evitar memory leaks
    return () => {
      isMounted = false;
    };
  }, []); // ✅ Array vacío = ejecutar SOLO una vez al montar

  return (
    <>
      {!hideHeader && <Header />}
      <main className="min-h-screen flex justify-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/quienes-somos" element={<QuienesSomosPage />} />
          <Route path="/carta" element={<Catalog />} />

          {/* Rutas protegidas */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/test" element={
          <ProtectedRoute> 
            <PreferencesTest />
          </ProtectedRoute>
            } />
        </Routes>
      </main>
      <Footer />
      <LoginForm isOpen={isLoginModalOpen} onClose={hideLoginModal} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <LoginModalProvider>
        <Layout />
      </LoginModalProvider>
    </BrowserRouter>
  );
}

export default App;
