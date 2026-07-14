import { styled } from '../../../styled-system/jsx';
import { cva } from '../../../styled-system/css';

const buttonRecipe = cva({
  base: {
    display: 'flex',
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2', // Espaço entre um ícone e o texto, se houver
    fontWeight: 'semibold',
    borderRadius: 'md',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    // Estilo para quando o botão recebe a prop 'disabled'
    _disabled: { 
      opacity: 0.6, 
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
  variants: {
    variant: {
      solid: { 
        backgroundColor: '#547812', 
        color: 'white', 
        _hover: {  } 
      },
      outline: { 
        backgroundColor: 'transparent',
        borderWidth: '1px', 
        borderColor: 'blue.600', 
        color: 'blue.600', 
        _hover: { backgroundColor: 'blue.50' } 
      },
      ghost: { 
        backgroundColor: 'transparent',
        color: 'gray.300', 
        _hover: { color: 'white' } 
      },
      special: { 
        backgroundColor: 'white',
        color: 'gray.300',
        borderColor: 'gray.800', 
        
      },
    },
    size: {
      sm: { height: '8', paddingX: '3', fontSize: 'sm' },
      md: { height: '10', paddingX: '4', fontSize: 'md' },
      lg: { height: '12', paddingX: '6', fontSize: 'lg' },
    },
    // Adicionando variantes para largura
    width: {
      auto: { width: 'auto' },
      full: { width: '100%' },
      'fixed-square' : { width: '40px', height: '40px' }
    }
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    width: 'fixed-square'
  }
});

export const Button = styled('button', buttonRecipe);