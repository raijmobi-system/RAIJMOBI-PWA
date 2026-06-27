import { styled } from '../../../styled-system/jsx';
import { cva } from '../../../styled-system/css';


const checkboxRecipe = cva({
  base: {
    // Escondemos a caixa padrão feia do navegador e criamos a nossa
    appearance: 'none',
    width: '5',
    height: '5',
    backgroundColor: 'white',
    borderWidth: '1px',
    borderColor: 'gray.300',
    borderRadius: 'sm',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    position: 'relative',

    // Quando estiver checado
    _checked: {
      backgroundColor: '#547812',
      borderColor: 'blue.600',
      
      // Criamos o "V" de checado usando um pseudo-elemento sutil
      _after: {
        content: '""',
        width: '4px',
        height: '8px',
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: '0 2px 2px 0',
        transform: 'rotate(45deg) translate(-1px, -1px)',
        display: 'block',
      }
    },
    
    _focus: {
      boxShadow: '0 0 0 2px token(colors.blue.100)',
    },
    
    _disabled: {
      backgroundColor: 'gray.100',
      borderColor: 'gray.200',
      cursor: 'not-allowed',
    }
  }
});

export const Checkbox = styled('input', {
  ...checkboxRecipe,
  // Forçamos o tipo nativo para que o React e o HTML saibam o que ele é
  defaultProps: { type: 'checkbox' } 
});