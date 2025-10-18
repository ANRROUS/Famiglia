import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/images/img_logoFamigliawithoutBorders.png'
import empanada from '../assets/images/img_empanadaMixta.png'
import alfajor from '../assets/images/img_plin.png'
import pastel from '../assets/images/img_milhojasFresa.png'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-700 via-brand to-white">
      {/* Navbar propio de la página */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Famiglia" className="h-14" />
        </div>

        <ul className="hidden md:flex gap-8 items-center text-white">
          <li className="hover:underline"><Link to="/">Home</Link></li>
          <li className="hover:underline"><Link to="/catalog">Carta</Link></li>
          <li className="hover:underline"><Link to="/delivery">Delivery</Link></li>
          <li className="hover:underline"><Link to="/test">Test</Link></li>
          <li className="hover:underline"><Link to="/contact">Contáctanos</Link></li>
        </ul>

        <div className="hidden md:flex gap-3">
          <Link to="/register" className="bg-white text-brand px-4 py-2 rounded-md">Registrarse</Link>
          <Link to="/login" className="border border-white text-white px-4 py-2 rounded-md">Iniciar Sesión</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Panadería, <span className="text-yellow-400">pastelería</span>
              <br /> y <span className="text-red-400">snack bar</span>
            </h2>

            <p className="mt-6 text-sm md:text-base opacity-90">Av. Gral. Antonio Álvarez de Arenales 458, Jesús María</p>

            <div className="mt-8">
              <Link to="/reserve" className="bg-brand text-white px-6 py-3 rounded-md font-semibold shadow-md">RESERVA TU PEDIDO</Link>
            </div>
          </div>

          <div className="relative h-64 md:h-80">
            {/* main product floating image */}
            <img src={pastel} alt="pastel" className="absolute right-0 top-0 w-64 md:w-96 transform translate-x-8 -translate-y-8 drop-shadow-xl" />

            {/* small decorations */}
            <img src={empanada} alt="empanada" className="absolute left-8 bottom-8 w-20 md:w-28 drop-shadow-md" />
            <img src={alfajor} alt="alfajor" className="absolute right-20 bottom-0 w-16 md:w-24 drop-shadow-md" />
          </div>
        </div>

        {/* decorative curved white overlay */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </header>
    </div>
  )
}
