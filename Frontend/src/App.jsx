import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import ContactUs from './pages/ContactUs'
import PreferencesTest from './pages/PreferencesTest'

// 🔹 Componente interno para controlar la visibilidad del Header
function Layout() {
  const location = useLocation()

  // Si la ruta actual es "/" o "/home", NO mostrar el header
  const hideHeader = location.pathname === '/' || location.pathname === '/home'

  return (
    <>
      {!hideHeader && <Header />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/test" element={<PreferencesTest />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
