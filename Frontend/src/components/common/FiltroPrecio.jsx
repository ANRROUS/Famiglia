import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

const valorTexto = (v) => `S/${v.toFixed(2)}`;

const FiltroPrecio = ({ min = 0, max = 100, value = [0, 100], onChange }) => {
  const handleChange = (e, newValue) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography sx={{ color: '#8b3e3e', fontWeight: 600, mb: 1 }}>Precios</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ color: '#6b2c2c' }}>{valorTexto(value[0])}</Typography>
        <Typography sx={{ color: '#6b2c2c' }}>{valorTexto(value[1])}</Typography>
      </Box>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="off"
        min={min}
        max={max}
        sx={{ color: '#8b3e3e' }}
      />
    </Box>
  );
};

export default FiltroPrecio;
