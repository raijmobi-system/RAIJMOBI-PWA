"use client";

import React, { useState, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  DirectionsService, 
  DirectionsRenderer,
  Marker 
} from '@react-google-maps/api';
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -15.7801,
  lng: -47.9292
};

interface MapProps {
  originText: string;
  destinationText: string;
  userLocation?: { lat: number; lng: number } | null;
}

export default function Map({ originText, destinationText, userLocation }: MapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

  useEffect(() => {
    //eslint-disable-next-line
    setDirectionsResponse(null);
    setDirectionsError(null);
  }, [originText, destinationText]);

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === 'OK' && result) {
      setDirectionsResponse(result);
    } else {
      console.error("❌ Erro ao calcular trajeto:", status);
      setDirectionsError(`Não foi possível traçar a rota: ${status}`);
    }
  };

  if (loadError) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text color="danger">Erro ao carregar o Google Maps. Verifique a chave de API.</Text>
      </Flex>
    );
  }

  if (!isLoaded) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text color="muted">A iniciar GPS e a carregar mapa...</Text>
      </Flex>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || defaultCenter}
      zoom={userLocation ? 13 : 4}
      options={{
        disableDefaultUI: true, 
        zoomControl: true,      
      }}
    >
      {/* 1. SERVIÇO DE TRAÇADO: Converte os textos em coordenadas e calcula a rota nas estradas */}
      {originText && destinationText && !directionsResponse && !directionsError && (
        <DirectionsService
          options={{
            origin: originText,
            destination: destinationText,
            travelMode: google.maps.TravelMode.DRIVING,
          }}
          callback={directionsCallback}
        />
      )}

      {/* 2. DESENHISTA DA ROTA: Desenha a linha azul da estrada e ajusta o zoom automaticamente */}
      {directionsResponse && (
        <DirectionsRenderer
          options={{
            directions: directionsResponse,
            suppressMarkers: false, // Mantém os pinos A (origem) e B (destino) padrão do Google
          }}
        />
      )}

      {/* 3. PINO DO GPS EM TEMPO REAL: Mostra exatamente onde a pessoa está no mapa! */}
      {userLocation && (
        <Marker
          position={userLocation}
          title="Você está aqui"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  );
}