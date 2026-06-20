// app/page.tsx
"use client"
import dynamic from 'next/dynamic';

// Isso desabilita a renderização no servidor para este componente
const MapWithNoSSR = dynamic(() => import('@/components/fixed/Map'), {
  ssr: false,
  loading: () => <p>Carregando o mapa...</p> // Tela de carregamento amigável
});

export default function Monitoring() {
  return (
    <main style={{ padding: '24px' }}>
      <h1>Meu App com Mapa</h1>
      <div style={{ marginTop: '20px', height: '400px' }}>
        <MapWithNoSSR />
      </div>
    </main>
  );
}