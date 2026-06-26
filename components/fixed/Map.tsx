import 'maplibre-gl/dist/maplibre-gl.css';
import { Geolocation } from '@capacitor/geolocation';
import { useState } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';

// 1. Adicionamos a 'accuracy' ao nosso tipo
type UserCoordinates = {
  longitude: number;
  latitude: number;
  accuracy: number; 
};

export default function MyMap() {
  const [viewState, setViewState] = useState({
    longitude: -46.6333,
    latitude: -23.5505,
    zoom: 11
  });
  
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);

  const handleGetLocation = async () => {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const coordinates = await Geolocation.getCurrentPosition();
      
      console.log('📍 DADOS DO GPS:', coordinates);

const newLocation = {
  longitude: coordinates.coords.longitude,
  latitude: coordinates.coords.latitude,
  accuracy: coordinates.coords.accuracy 
};

      setUserLocation(newLocation);

      setViewState({
        longitude: newLocation.longitude,
        latitude: newLocation.latitude,
        zoom: 15
      });
    } catch (error) {
      console.error('Erro ao obter localização', error);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {/* 2. Marcador Customizado com CSS */}
        {userLocation && (
          <Marker 
            longitude={userLocation.longitude} 
            latitude={userLocation.latitude}
            anchor="center" // Garante que o centro do bolinha seja a coordenada exata
          >
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              
              {/* Círculo de precisão (Aura clara) */}
              <div style={{
                position: 'absolute',
                width: '50px', // Você pode fazer um cálculo matemático com base no userLocation.accuracy e no zoom se quiser ser milimétrico
                height: '50px',
                backgroundColor: 'rgba(66, 133, 244, 0.2)', // Azul transparente
                borderRadius: '50%',
                border: '1px solid rgba(66, 133, 244, 0.4)',
              }} />

              {/* Ponto azul central (Posição exata) */}
              <div style={{
                width: '18px',
                height: '18px',
                backgroundColor: '#4285F4', // Azul estilo Google Maps
                border: '3px solid white',
                borderRadius: '50%',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                zIndex: 1
              }} />
              
            </div>
          </Marker>
        )}
      </Map>

      {/* Botão Flutuante */}
      <button 
        onClick={handleGetLocation}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none'
        }}
      >
        <span style={{ fontSize: '20px' }}>📍</span>
      </button>
    </div>
  );
}