// Select.tsx
import { styled } from '../../../styled-system/jsx';
import { cva } from '../../../styled-system/css';

const selectRecipe = cva({
  base: {
    width: '100%',
    height: '11',
    paddingX: '3',
    fontSize: 'sm',
    backgroundColor: 'white',
    borderWidth: '1px',
    borderColor: 'gray.300', // Um pouco mais visível que o input por padrão
    borderRadius: 'md',
    color: 'gray.900',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    
    // Foco
    _focus: {
      borderColor: 'blue.500',
      boxShadow: '0 0 0 1px token(colors.blue.500)',
    },
    
    // Desabilitado
    _disabled: {
      backgroundColor: 'gray.50',
      color: 'gray.400',
      cursor: 'not-allowed',
    }
  }
});

export const Select = styled('select', selectRecipe);