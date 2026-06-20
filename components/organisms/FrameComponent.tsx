"use client"

import React from "react";
import { css } from "../../styled-system/css"; 

interface FrameComponentProps {
  titleElements?: React.ReactNode;
  actions?: React.ReactNode;      
  children: React.ReactNode;      
}

export default function FrameComponent({ titleElements, actions, children }: FrameComponentProps) {
  return (
    <section 
      className={css({ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        height: 'auto',    
        width: '100%',
        paddingInline: '5',
        paddingY: '5'     
      })}
    >
      {/* 1. DIV DO HEADER: titleElements e actions juntos na mesma div/row */}
      <div 
        className={css({
          display: 'flex',
          flexDirection: 'row', // Garante que fiquem na mesma linha
          alignItems: 'center', // Alinha verticalmente ao centro
          gap: '16px',          // Espaçamento entre os elementos do header
          justifyContent: 'space-between', // Distribui titleElements à esquerda e actions à direita                 
          
        })} 
        aria-label="decorative"
      >
        {titleElements}
        {actions}
      </div>

      {/* 2. DIV DO CHILDREN: Conteúdo Principal */}
      <div 
        className={css({
          display:'flex',
          flexDirection:'column',
          flex: '1',          
          paddingY: '4'     
        })} 
        aria-label="main"
      >
        {children} 
      </div>
    </section>
  );
}