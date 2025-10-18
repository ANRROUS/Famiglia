import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function Header() {
	return (
		<header className="bg-white border-b border-brand-100 header-underline" role="banner">
			<div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
				<Link to="/" className="flex items-center gap-3 mr-4">
					<img src="/logo192.png" alt="Famiglia" className="h-12 w-auto" />
					<div className="hidden sm:block">
						<h1 className="text-2xl font-extrabold text-brand">Famiglia</h1>
						<p className="text-xs text-muted text-brand-600">Panadería · 1950</p>
					</div>
				</Link>

				<div className="flex-1">
					<Navbar />
				</div>
			</div>
		</header>
	)
}

