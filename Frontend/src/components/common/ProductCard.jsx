import React from 'react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    name,
    description,
    price,
    image = '/images/placeholder-product.jpg'
  } = product;

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-[#b17b6b] overflow-hidden hover:shadow-lg transition-shadow duration-300 font-['Montserrat']">
      {/* Imagen del producto */}
      <div className="aspect-w-16 aspect-h-9 bg-[#f5e6d3]">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder-product.jpg';
          }}
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

export default ProductCard;
