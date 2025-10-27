import React from 'react';
import { Box, Chip } from '@mui/material';

const FiltroCategoria = ({ categorias = [], selectedCategory, onChange }) => {
  return (
    <Box className="flex flex-wrap gap-3">
      <Chip
        label="TODOS"
        clickable
        onClick={() => onChange(null)}
        variant={selectedCategory === null ? 'filled' : 'outlined'}
        sx={{
          backgroundColor: selectedCategory === null ? '#8b3e3e' : '#fff',
          color: selectedCategory === null ? '#fff' : '#8b3e3e',
          borderRadius: '999px',
          px: 2,
        }}
      />

      {categorias.map((cat) => (
        <Chip
          key={cat.id_categoria}
          label={cat.nombre}
          clickable
          onClick={() => onChange(cat.id_categoria)}
          variant={selectedCategory === cat.id_categoria ? 'filled' : 'outlined'}
          sx={{
            backgroundColor: selectedCategory === cat.id_categoria ? '#8b3e3e' : '#fff',
            color: selectedCategory === cat.id_categoria ? '#fff' : '#8b3e3e',
            borderRadius: '999px',
            px: 2,
          }}
        />
      ))}
    </Box>
  );
};

export default FiltroCategoria;
