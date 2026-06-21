"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { checkPermissions, requestPermissions, getCurrentPosition } from '@tauri-apps/plugin-geolocation';

// Importando a função css do Panda (Ajuste o caminho conforme a sua configuração)
import { css } from '@/styled-system/css';

// Componente para o Marcador
function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15);
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Sua localização exata!</Popup>
    </Marker>
  );
}

// Componente do Botão
function CenterButton({ position, onUpdateLocation }: { position: [number, number] | null, onUpdateLocation: () => void }) {
  const map = useMap();
  
  const handleCenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (position) map.flyTo(position, 15);
    onUpdateLocation();
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className={`leaflet-control ${css({ mb: '24px', mr: '24px' })}`}>
        <button 
          onClick={handleCenter} 
          className={css({
            bg: 'white',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'rgba(0,0,0,0.2)',
            borderRadius: '50%',
            w: '48px',
            h: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s',
            _hover: {
              bg: '#f4f4f4'
            }
          })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#555">
            <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function MapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Declarado antes do useEffect (Resolve o erro do ESLint react-hooks/immutability)
  const getNativeLocation = async () => {
    try {
      const isTauri = '__TAURI_INTERNALS__' in window;
      if (!isTauri) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
          (err) => setError(`Erro Web: ${err.message}`),
          // Adicionando a interface completa no fallback web também
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return;
      }

      let permissions = await checkPermissions();
      if (permissions.location !== 'granted') {
        permissions = await requestPermissions(['location', 'coarseLocation']);
        if (permissions.location !== 'granted') {
          setError("Permissão negada pelo SO.");
          return;
        }
      }

      // CORREÇÃO TS 2345: Passando todos os argumentos exigidos pela interface PositionOptions
      const pos = await getCurrentPosition({ 
        enableHighAccuracy: true, 
        timeout: 10000, // Desiste após 10 segundos
        maximumAge: 0   // Força a buscar uma posição nova em vez de usar cache do SO
      });

      setPosition([pos.coords.latitude, pos.coords.longitude]);
      setError(null);
    } catch (err: unknown) { // CORREÇÃO ANY: Substituído any por unknown
      // Type narrowing para acessar a mensagem de erro com segurança
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Erro: ${errorMessage}`);
    }
  };

  useEffect(() => {
    // CORREÇÃO ANY: Convertendo primeiro para unknown de forma segura, depois injetando a propriedade opcional
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    getNativeLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Altura forçada em 100dvh para impedir que o Webview do Android colapse a div para 0px
    <div className={css({ h: '100dvh', w: '100%', position: 'relative' })}>
      {error && (
        <div className={css({
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          bg: 'red',
          color: 'white',
          p: '10px',
          rounded: '4px'
        })}>
          {error}
        </div>
      )}
      
      <MapContainer 
        center={[-15.7801, -47.9292]} 
        zoom={4} 
        className={css({ h: '100%', w: '100%', zIndex: 1 })}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} />
        <CenterButton position={position} onUpdateLocation={getNativeLocation} />
      </MapContainer>
    </div>
  );
}