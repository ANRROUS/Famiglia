import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";

// 🔹 Controla la visibilidad del Header
function Layout() {
  const location = useLocation();
  const hideHeader = location.pathname === "/" || location.pathname === "/home";

  return (
    <>
      {!hideHeader && <Header />}
      <main className="min-h-screen flex justify-center items-center">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
