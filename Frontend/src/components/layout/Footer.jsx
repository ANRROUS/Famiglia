import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/img_logoFamigliawithBorders.png'
import footerImg from '../../assets/images/img_footer.png'
import fb from '../../assets/images/img_facebookLogo.png'
import ig from '../../assets/images/img_igLogo.png'
import x from '../../assets/images/img_xLogo.png'
import yt from '../../assets/images/img_ytLogo.png'

export default function Footer() {
  return (
    <footer className="bg-brand text-white mt-12" role="contentinfo">
      <div className="container mx-auto px-4">
        {/* Top band with logo and tagline */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 py-6">
          <div className="w-full md:w-1/4 flex justify-center md:justify-start">
            <img src={logo} alt="Famiglia logo" className="h-20 object-contain" />
          </div>

          <div className="w-full md:w-3/4 text-center md:text-left text-white">
            <h3 className="text-xl md:text-2xl font-semibold">Tu mesa de siempre, en la esquina de Arenales.</h3>
            <p className="mt-1 text-sm opacity-90">¡Siempre pensando en ustedes!</p>
          </div>
        </div>

        {/* Decorative image */}
        <div className="w-full overflow-hidden rounded-md">
          <img src={footerImg} alt="Bandeja de productos" className="w-full h-40 object-cover opacity-90" />
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-8 text-sm">
          <div>
            <h4 className="font-semibold mb-3">Sobre nosotros</h4>
            <ul className="space-y-2 opacity-90">
              <li><Link to="/about">Quienes somos</Link></li>
              <li><Link to="/location">Ubicación</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Descubre</h4>
            <ul className="space-y-2 opacity-90">
              <li><Link to="/catalog">Nuestra carta</Link></li>
              <li><Link to="/delivery">Delivery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Categorías</h4>
            <ul className="space-y-2 opacity-90">
              <li><Link to="/category/postres">Postres</Link></li>
              <li><Link to="/category/tortas">Tortas</Link></li>
              <li><Link to="/category/salados">Salados</Link></li>
              <li><Link to="/category/sandwiches">Sandwiches</Link></li>
              <li><Link to="/category/bebidas">Bebidas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legales</h4>
            <ul className="space-y-2 opacity-90">
              <li><Link to="/terms">Términos y condiciones</Link></li>
              <li><Link to="/privacy">Política de privacidad</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Síguenos</h4>
            <div className="flex items-center gap-3 mb-4">
              <a href="#" aria-label="Facebook"><img src={fb} alt="facebook" className="h-6 w-6"/></a>
              <a href="#" aria-label="Instagram"><img src={ig} alt="instagram" className="h-6 w-6"/></a>
              <a href="#" aria-label="X"><img src={x} alt="x" className="h-6 w-6"/></a>
              <a href="#" aria-label="YouTube"><img src={yt} alt="youtube" className="h-6 w-6"/></a>
            </div>

            <button className="bg-white text-brand px-3 py-2 rounded-md">Reclamaciones</button>
          </div>
        </div>

        <div className="border-t border-brand-400 pt-4 pb-8 text-center text-sm opacity-90">
          Pastelería Famiglia © 2025 - Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}
