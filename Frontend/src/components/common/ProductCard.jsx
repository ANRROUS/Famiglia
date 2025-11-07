import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginModal } from '../../context/LoginModalContext';

const ProductCard = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const dispatch = useDispatch();
  const { openLoginModal } = useLoginModal();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Validaciones básicas
  if (!product) {
    console.error('ProductCard: No se recibió ningún producto');
    return null;
  }

  // Validar que el producto tenga todas las propiedades necesarias
  if (!product.nombre || typeof product.precio !== 'number') {
    console.error('ProductCard: Producto con datos inválidos:', product);
    return null;
  }

  const {
    nombre: name,
    descripcion: description = 'Sin descripción disponible',
    precio: price,
    imagen,
    url_imagen,
    totalVendido = 0
  } = product;

  // Usar url_imagen si existe, sino usar imagen, sino placeholder
  const image = imageError 
    ? '/images/placeholder-product.jpg' 
    : (url_imagen || imagen || '/images/placeholder-product.jpg');

  // Validar que el precio sea positivo
  if (price < 0) {
    console.error('ProductCard: Precio inválido:', price);
    return null;
  }

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Si no está autenticado, abrir modal de login
      openLoginModal();
      return;
    }
    
    // Si está autenticado, agregar al carrito
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Determinar si es el más vendido (threshold: más de 5 ventas)
  const isBestSeller = totalVendido > 5;

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 font-['Montserrat'] border border-gray-200 mb-3"
      data-product-card
      data-product-id={product.id || product._id}
      data-product-name={name}
      data-product-price={price}
      data-product-category={product.categoria || product.category}
    >
      {/* Contenedor Principal - Layout Horizontal */}
      <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center px-4 py-4">
        {/* Imagen del producto */}
        <div className="w-[100px] h-[90px] rounded-xl overflow-hidden bg-[#ffe3d9] flex items-center justify-center">
          <img
            src={image}
            alt={`Imagen de ${name}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>

        {/* Información del producto */}
        <div className="flex flex-col justify-center">
          {/* Nombre del producto */}
          <h3 className="text-base font-bold text-black mb-1">
            {name}
          </h3>

          {/* Descripción */}
          <p className="text-gray-700 text-sm mb-2 line-clamp-2">
            {description}
          </p>

          {/* Etiqueta Más Vendido */}
          {isBestSeller && (
            <div className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded text-xs font-medium w-fit">
              Más comprado
            </div>
          )}
        </div>

        {/* Precio y Botón */}
        <div className="flex flex-col items-end gap-2">
          {/* Precio */}
          <div
            className="text-xl font-bold text-red-600"
            data-product-price-display
            aria-label={`Precio: ${price?.toFixed(2)} soles`}
          >
            S/{price?.toFixed(2)}
          </div>

          {/* Botón Añadir al carrito */}
          <button
            className="px-4 py-2 bg-pink-50 text-[#771919] rounded-lg hover:bg-pink-100 transition-colors duration-200 font-medium text-sm border border-pink-200"
            onClick={handleAddToCart}
            aria-label={`Añadir ${name} al carrito`}
            data-add-to-cart
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

// Usar React.memo para evitar re-renders innecesarios
export default React.memo(ProductCard);
