import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Home from "./pages/Home";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Catalog from "./pages/Catalog";
import PreferencesTest from './pages/PreferencesTest';
import ProtectedRoute from "./components/common/ProtectedRoute";
import Complaints from "./pages/Complaints";
import { setUser } from "./redux/slices/authSlice";
import { authAPI } from "./services/api";

// 🔹 Controla la visibilidad del Header
function Layout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const hideHeader = location.pathname === "/" || location.pathname === "/home";

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
        // Usuario no autenticado, no hacer nada
        console.log("Usuario no autenticado");
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
      <main className="min-h-screen flex justify-center items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/test" element={<PreferencesTest />} />
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
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
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
      <Layout />
    </BrowserRouter>
  );
}

export default App;
