"use client";

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
  isActive?: boolean; 
}

export default function LinkMolecule({
  href,
  Icon,
  text,
  extraElement,
  direction,
  width,
  isActive = false 
}: LinkMoleculeProps) {
  
  const className = linkMoleculeRecipe({ direction, width });

  // Definimos as cores exatas
  const kiwidiGreen = '#547812';
  const inactiveGray = '#8c8c8c';
  
  const activeColor = isActive ? kiwidiGreen : inactiveGray;

  return (
    <Link 
      href={href} 
      className={className}
      // 1. Forçamos a cor na raiz do Link usando style nativo
      style={{ color: activeColor }}
    >
      <div className={flex({ 
        direction: direction, 
        alignItems: 'center', 
        gap: '2',
        justifyContent: 'center',
        width: direction === 'column' ? '100%' : 'auto',
      })}>
        
        {/* 2. O ícone herda a cor automaticamente via currentColor */}
        <span 
          className={flex({ 
            shrink: 0, 
            alignItems: 'center', 
            justifyContent: 'center'
          })}
          style={{ color: activeColor }}
        >
          {Icon}
        </span>
        
        {text && (
          <span 
            className={flex({
              fontSize: 'xs', 
              fontWeight: isActive ? 'bold' : 'medium', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            })}
            // 3. Forçamos a cor no texto também para garantir
            style={{ color: activeColor }}
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