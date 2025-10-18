import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
	const [open, setOpen] = useState(false)
	const location = useLocation()
	const menuRef = useRef(null)

	const links = [
		{ to: '/', label: 'Home' },
		{ to: '/catalog', label: 'Carta' },
		{ to: '/delivery', label: 'Delivery' },
		{ to: '/test', label: 'Test' },
		{ to: '/contact', label: 'Contactanos' },
	]

	// Close mobile menu on route change
	useEffect(() => {
		setOpen(false)
	}, [location.pathname])

	// Close on Escape key
	useEffect(() => {
		function onKey(e) {
			if (e.key === 'Escape') setOpen(false)
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [])

	return (
		<nav className="w-full" aria-label="Main navigation">
			<div className="flex items-center justify-between w-full">
				{/* nav links - desktop */}
				<ul className="hidden md:flex gap-8 items-center text-sm text-brand-700">
					{links.map((l) => {
						const active = location.pathname === l.to
						return (
							<li key={l.to}>
								<Link
									to={l.to}
									className={`hover:underline hover:underline-offset-4 transition ${
										active ? 'text-brand font-semibold' : 'text-brand-700'
									}`}
								>
									{l.label}
								</Link>
							</li>
						)
					})}
				</ul>

				{/* auth buttons - desktop */}
				<div className="hidden md:flex items-center gap-4">
					<Link
						to="/register"
						className="bg-brand text-white px-4 py-2 rounded-md shadow-sm hover:bg-brand-600 transition"
					>
						Registrarse
					</Link>
					<Link
						to="/login"
						className="border border-brand text-brand px-4 py-2 rounded-md hover:bg-brand-50 transition"
					>
						Iniciar Sesión
					</Link>
				</div>

				{/* mobile hamburger */}
				<button
					aria-label="Toggle menu"
					aria-expanded={open}
					aria-controls="mobile-menu"
					onClick={() => setOpen((v) => !v)}
					className="md:hidden p-2 rounded-md text-brand focus:outline-none focus:ring-2 focus:ring-brand-200"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{open ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</div>

			{/* mobile menu - slide down */}
			{open && (
				<div id="mobile-menu" ref={menuRef} className="md:hidden mt-3 space-y-3" role="menu">
					<ul className="flex flex-col gap-2 text-sm text-brand-700">
						{links.map((l) => (
							<li key={l.to} role="none">
								<Link role="menuitem" to={l.to} onClick={() => setOpen(false)} className="block px-2 py-1">
									{l.label}
								</Link>
							</li>
						))}
					</ul>

					<div className="flex gap-3 pt-2">
						<Link
							to="/register"
							onClick={() => setOpen(false)}
							className="bg-brand text-white px-3 py-2 rounded-md w-full text-center"
						>
							Registrarse
						</Link>
						<Link
							to="/login"
							onClick={() => setOpen(false)}
							className="border border-brand text-brand px-3 py-2 rounded-md w-full text-center"
						>
							Iniciar Sesión
						</Link>
					</div>
				</div>
			)}
		</nav>
	)
}

