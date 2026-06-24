import React from "react";
import { flex } from '../../styled-system/patterns'; 
import { css } from '../../styled-system/css'; 

interface CardComponentProps {
  Image?: React.ReactNode;
  content?: React.ReactNode;
  extraContent?: React.ReactNode;
  direction?: 'row' | 'column' | 'row-wrap';
  animate?: boolean; 
  hasPadding?: boolean; 
  fullWidth?: boolean;   
  backgroundColor?: string; // Adicione esta linha
}

export default function CardComponent({ 
  Image, 
  content, 
  extraContent,
  direction = 'column', 
  animate = false,
  hasPadding = true, 
  fullWidth = false,
  backgroundColor = 'white', // Defina o valor padrão
}: CardComponentProps) {

  const flexStyles = {
    direction: direction === 'row-wrap' ? 'row' : direction,
    wrap: direction === 'row-wrap' ? 'wrap' : 'nowrap'
  };

  return (
    <div 
      className={flex({
        direction: flexStyles.direction,
        
        
        // CORREÇÃO: Se for coluna, estica os itens. Se for linha, centraliza verticalmente.
        alignItems: direction === 'column' ? 'stretch' : 'center', 
        
        gap: '4', 
        borderRadius: '14px', 
        overflow: 'hidden', 
        transition: 'all 0.3s ease',
        _hover: animate ? { transform: 'translateY(-4px)', boxShadow: 'md' } : {},
        width: fullWidth ? '100%' : '318px', 
        justifyContent: 'space-between',
        background: backgroundColor,
        minHeight: '72px',
        paddingInline: hasPadding ? '4' : '0', 
        paddingBlock: hasPadding ? '4' : '0', 
        border: '1px solid',
        borderColor: 'gray.200',
      })}
    >
      {Image && (
        <div className={css({ flexShrink: '0', display: 'flex', alignItems: 'center', maxH: '200px', width: '100%' })}>
          {Image}
        </div>
      )}
      
      {content}
      {extraContent}
    </div>
  );
}