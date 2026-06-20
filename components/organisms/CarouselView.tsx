"use client"


import React, { useRef } from "react";
import { css } from "../../styled-system/css";
import FrameComponent from "./FrameComponent";

interface CarouselViewProps {
  // Alterado de string para React.ReactNode para máxima flexibilidade
  titleElements: React.ReactNode; 
  items: React.ReactNode[];
}

export default function CarouselView({ titleElements, items }: CarouselViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: -containerWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({ left: containerWidth, behavior: "smooth" });
    }
  };

  const CarouselActions = (
    <div className={css({ display: 'flex', gap: '8px' })}>
      <button onClick={scrollLeft} aria-label="Rolar para a esquerda" className={css({ padding: '8px', cursor: 'pointer' })}>
        &#8592;
      </button>
      <button onClick={scrollRight} aria-label="Rolar para a direita" className={css({ padding: '8px', cursor: 'pointer' })}>
        &#8594;
      </button>
    </div>
  );

  return (
  <FrameComponent
    titleElements={titleElements} 
    actions={CarouselActions}
  >
    <div
      ref={scrollContainerRef}
      className={css({
        display: 'flex',
        flexDirection: 'row',     // Garante que os itens fiquem lado a lado
        flexWrap: 'nowrap',       // IMPEDE que os cards quebrem linha ou se sobreponham
        gap: '16px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        width: '100%',            // Ocupa toda a largura disponível do Frame
        '&::-webkit-scrollbar': { display: 'none' },
      })}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={css({
            flexShrink: 0,
            scrollSnapAlign: 'start',
            // Mudamos de 'width' para 'minWidth' para o flexbox respeitar o tamanho do card
            minWidth: '280px', 
            maxWidth: '280px',
          })}
        >
          {item}
        </div>
      ))}
    </div>
  </FrameComponent>
);
}