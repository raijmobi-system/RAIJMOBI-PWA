"use client"
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
  backgroundColor?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function CardComponent({ 
  Image, 
  content, 
  extraContent,
  direction = 'column', 
  animate = false,
  hasPadding = true, 
  fullWidth = false,
  backgroundColor = 'white',
  onClick
  
}: CardComponentProps) {

  const flexStyles = {
    direction: direction === 'row-wrap' ? 'row' : direction,
    wrap: direction === 'row-wrap' ? 'wrap' : 'nowrap'
  };

  return (
    <div 
      onClick={onClick}
      className={flex({
        direction: flexStyles.direction,
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
        boxShadow: 'xs'
      })}
      
    >
      {Image && (
        <div 
          className={css({ 
            flexShrink: '0', 
            display: 'flex', 
            alignItems: 'center', 
            maxH: '200px', 
            // CORREÇÃO 1: A imagem só deve ter 100% de largura se o card for uma coluna. 
            // Se for linha, ela deve assumir o tamanho natural ("auto").
            width: direction === 'column' ? '100%' : 'auto' 
          })}
        >
          {Image}
        </div>
      )}
      
      {/* CORREÇÃO 2: Envolvemos o conteúdo para garantir que ele expanda e não quebre */}
      {content && (
        <div 
          className={css({ 
            flex: 1, // Faz o conteúdo ocupar todo o espaço restante
            minWidth: 0, // DICA DE OURO: Evita que textos grandes quebrem o flexbox pai
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          })}
        >
          {content}
        </div>
      )}

      {extraContent && (
        <div className={css({ flexShrink: 0 })}>
           {extraContent}
        </div>
      )}
    </div>
  );
}