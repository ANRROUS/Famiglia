/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx,html}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Marca basada en tonos rojizos/cálidos para la panadería
				brand: {
					DEFAULT: '#7a2f2f',
					50: '#fff5f5',
					100: '#feeaea',
					200: '#f7c9c9',
					300: '#f0a8a8',
					400: '#e66b6b',
					500: '#dc2f2f',
					600: '#b02222',
					700: '#7a1a1a',
					800: '#4d1212',
					900: '#2a0b0b',
				},
				// Mantener compatibilidad con `rose-*` si se usa en componentes
			},
			fontFamily: {
				display: ['"Playfair Display"', 'serif'],
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial'],
			},
			container: {
				center: true,
				padding: {
					DEFAULT: '1rem',
					md: '2rem',
					lg: '4rem',
				},
			},
		},
	},
	plugins: [],
}

