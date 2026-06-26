// app/page.tsx
"use client"
import dynamic from 'next/dynamic';
import { Flex }from '@/styled-system/jsx'

// Isso desabilita a renderização no servidor para este componente
const MapWithNoSSR = dynamic(() => import('@/components/fixed/Map'), {
  ssr: false,
  loading: () => <p>Carregando o mapa...</p> // Tela de carregamento amigável
});

export default function Monitoring() {
  return (
    <Flex direction='column' height='100%'>
      
      
        <MapWithNoSSR />
      
      </Flex>
    
  );
}