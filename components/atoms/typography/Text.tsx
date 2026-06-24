import { styled } from '../../../styled-system/jsx';
import { cva } from '../../../styled-system/css';

const textRecipe = cva({
  base: {
    margin: 0,
  },
  variants: {
    size: {
      xs: { fontSize: 'xs', lineHeight: 'tight' },
      sm: { fontSize: 'sm', lineHeight: 'tight' },
      md: { fontSize: 'md', lineHeight: 'normal' },
      lg: { fontSize: 'lg', lineHeight: 'relaxed' },
    },
    weight: {
      thin: { fontWeight: 'thin'},
      normal: { fontWeight: 'normal' },
      medium: { fontWeight: 'medium' },
      bold: { fontWeight: 'bold' },
    },
    color: {
      primary: { color: 'gray.900' },
      white: { color: 'white' },
      muted: { color: 'gray' },
      danger: { color: 'red' },
      success: { color: 'green !important' },
      cupom: { color: '#1b1c1c'},
      special: {color: '#547812'}
    },
    align: {
      left: { textAlign: 'left' },
      center: { textAlign: 'center' },
      right: { textAlign: 'right' },
    }
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    color: 'primary',
    align: 'left',
  }
});


export const Text = styled('p', textRecipe);