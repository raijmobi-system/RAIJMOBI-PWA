// RangeSlider.tsx
import { styled } from '../../../styled-system/jsx';
import { cva } from '../../../styled-system/css';

const rangeSliderRecipe = cva({
  base: {
    appearance: 'none', // Remove o estilo padrão do navegador
    width: '100%',
    height: '1.5',
    backgroundColor: 'gray.300', // Cor de fundo da trilha
    borderRadius: 'full',
    outline: 'none',
    
    // Estilo da "bolinha" (thumb) no Chrome/Safari/Edge
    '&::-webkit-slider-thumb': {
      appearance: 'none',
      width: '4',
      height: '4',
      backgroundColor: 'gray.500',
      border: '2px solid white',
      borderRadius: 'full',
      cursor: 'pointer',
      boxShadow: 'md',
      marginTop: '-5px', // Centraliza a bolinha na trilha
    },
    
    // Estilo da "bolinha" no Firefox
    '&::-moz-range-thumb': {
      width: '4',
      height: '4',
      backgroundColor: 'gray.500',
      border: '2px solid white',
      borderRadius: 'full',
      cursor: 'pointer',
      boxShadow: 'md',
    }
  }
});

export const RangeSlider = styled('input', {
  ...rangeSliderRecipe,
  defaultProps: { type: 'range' }
});