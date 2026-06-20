import React from "react";
import { cva } from '../../styled-system/css';
import { flex } from '../../styled-system/patterns';
import Link from "next/link";

// 1. Definição do CVA (As regras visuais ficam isoladas aqui fora)
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
  // 3. Compound Variants (Regras especiais baseadas na combinação de propriedades)
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
}

export default function LinkMolecule({
  href,
  Icon,
  text,
  extraElement,
  direction,
  width
}: LinkMoleculeProps) {
  
  // Executa o CVA passando as props recebidas
  const className = linkMoleculeRecipe({ direction, width });

  return (
    // 2. Usando o <Link> do Next.js para navegação otimizada
    <Link href={href} className={className}>
      {/* Container do Bloco Principal (Ícone + Texto) */}
      <div className={flex({ 
        direction: direction, 
        alignItems: 'center', 
        gap: '2',
        justifyContent: 'center',
        width: direction === 'column' ? '100%' : 'auto'
      })}>
        <span className={flex({ shrink: 0, alignItems: 'center', justifyContent: 'center' })}>{Icon}</span>
        {text && <span className="text-sm font-medium text-gray-700 truncate">{text}</span>}
      </div>

      {/* Elemento Extra */}
      {extraElement && width !== 'fixed-square' && (
        <span className={flex({ shrink: 0 })}>{extraElement}</span>
      )}
    </Link>
  );
}