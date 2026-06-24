import React from "react";
import { cva } from '../../styled-system/css';
import { flex } from '../../styled-system/patterns';
import Link from "next/link";

const linkMoleculeRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'transparent', 
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    gap: '2',
  },
  variants: {
    direction: {
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingInline: '3',
      },
      column: {
        flexDirection: 'column',
        justifyContent: 'center',
        paddingInline: '2',
        height: 'auto', 
        minHeight: '40px',
      }
    },
    width: {
      full: { width: '100%' },
      auto: { width: 'auto' },
      'fixed-square': { 
        width: '40px', 
        height: '40px',
        paddingInline: '0', 
        justifyContent: 'center' 
      }
    },
    color: {
      muted: { color: 'rgba(255, 255, 255, 0.6)' },
      active: { color: 'gray' },
    }
  },
  compoundVariants: [
    {
      direction: 'column',
      width: 'fixed-square',
      css: {
        height: '40px', 
      }
    }
  ],
  defaultVariants: {
    direction: 'row',
    width: 'full'
  }
});

interface LinkMoleculeProps {
  href: string;
  Icon: React.ReactNode;
  text?: string;
  extraElement?: React.ReactNode;
  direction?: 'row' | 'column';
  width?: 'auto' | 'full' | 'fixed-square';
  isActive?: boolean; // Adicionado como opcional para não quebrar outros lugares
}

export default function LinkMolecule({
  href,
  Icon,
  text,
  extraElement,
  direction,
  width,
  isActive = false // Padrão falso caso não seja enviado
}: LinkMoleculeProps) {
  
  const className = linkMoleculeRecipe({ direction, width });

  // Define dinamicamente a cor com base no estado ativo
  const activeColor = isActive ? 'blue.500' : 'gray.500';

  return (
    <Link 
      href={href} 
      className={className}
      // Garante que todo o container (incluindo ícones sem estilo próprio) herde a cor correta
      style={{ color: `var(--colors-${activeColor.replace('.', '-')}, ${isActive ? 'blue' : 'gray'})` }}
    >
      <div className={flex({ 
        direction: direction, 
        alignItems: 'center', 
        gap: '2',
        justifyContent: 'center',
        width: direction === 'column' ? '100%' : 'auto',
        color: activeColor // Panda CSS aplica a cor no bloco principal
      })}>
        <span className={flex({ shrink: 0, alignItems: 'center', justifyContent: 'center' })}>
          {Icon}
        </span>
        
        {text && (
          <span 
            className={flex({
              fontSize: 'sm',
              fontWeight: 'medium',
              color: activeColor, // Força a cor do texto a seguir o estado ativo
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            })}
          >
            {text}
          </span>
        )}
      </div>

      {extraElement && width !== 'fixed-square' && (
        <span className={flex({ shrink: 0 })}>{extraElement}</span>
      )}
    </Link>
  );
}