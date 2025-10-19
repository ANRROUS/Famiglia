import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-["Montserrat"]';
  
  const variants = {
    primary: 'bg-[#6b2c2c] text-white hover:bg-[#5a2424] focus:ring-[#6b2c2c]',
    secondary: 'bg-[#f5e6d3] text-[#6b2c2c] hover:bg-[#e8d4bb] focus:ring-[#b17b6b]',
    outline: 'border-2 border-[#6b2c2c] text-[#6b2c2c] hover:bg-[#fef9f3] focus:ring-[#6b2c2c]',
    danger: 'bg-[#b17b6b] text-white hover:bg-[#9c6a5d] focus:ring-[#b17b6b]'
  };

  const variantStyles = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
