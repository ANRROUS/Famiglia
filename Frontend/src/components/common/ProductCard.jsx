import React, { useState } from 'react';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);

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
    url_imagen
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

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-[#b17b6b] overflow-hidden hover:shadow-lg transition-shadow duration-300 font-['Montserrat']">
      {/* Imagen del producto */}
      <div className="aspect-w-16 aspect-h-9 bg-[#f5e6d3]">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Nombre */}
        <h3 className="text-xl font-bold text-[#6b2c2c] mb-2">
          {name}
        </h3>

        {/* Descripción */}
        <p className="text-[#6b2c2c] opacity-80 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Precio */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#6b2c2c]">
            ${price?.toFixed(2)}
          </span>
          <button
            className="px-4 py-2 bg-[#6b2c2c] text-white rounded-lg hover:bg-[#5a2424] transition-colors duration-200"
            onClick={() => {
              // Aquí puedes agregar la lógica para agregar al carrito
              console.log('Agregar al carrito:', product);
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

// Usar React.memo para evitar re-renders innecesarios
export default React.memo(ProductCard);
