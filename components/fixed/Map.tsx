'use client'; // Necessário no Next.js App Router porque o mapa usa o DOM

import * as React from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MyMap() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        initialViewState={{
          longitude: -46.6333, // Exemplo: São Paulo
          latitude: -23.5505,
          zoom: 11
        }}
        // Estilo Positron (claro) gratuito da Carto
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </div>
  );
}