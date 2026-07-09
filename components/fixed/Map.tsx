"use client";

import React, { useState, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  DirectionsService, 
  DirectionsRenderer 
} from '@react-google-maps/api';
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';

// O Google exige que o mapa tenha um tamanho explícito
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Ponto central padrão enquanto carrega a rota (ex: Brasil)
const defaultCenter = {
  lat: -15.7801,
  lng: -47.9292
};

interface MapProps {
  originText: string;
  destinationText: string;
}

export default function Map({ originText, destinationText }: MapProps) {
  // 🌟 INSIRA SUA CHAVE DA API AQUI (Restrinja no painel do Google Cloud!)
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "SUA_CHAVE_AQUI"
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
      setDirectionsError(`Não foi possível traçar a rota: ${status}`);
    }
  };

  if (loadError) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text color="danger">Erro ao carregar o Google Maps.</Text>
      </Flex>
    );
  }

  if (!isLoaded) {
    return (
      <Flex justify="center" align="center" height="100%">
        <Text color="muted">Iniciando GPS...</Text>
      </Flex>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={4}
      options={{
        disableDefaultUI: true, // Desativa botões poluentes do Google (StreetView, etc)
        zoomControl: true,      // Mantém apenas o controle de zoom
      }}
    >
      {/* O DirectionsService pega os textos, converte em coordenadas (Geocoding) 
        e calcula o trajeto de carro (DRIVING).
      */}
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

      {/* O DirectionsRenderer desenha a linha azul e os pinos A e B no mapa */}
      {directionsResponse && (
        <DirectionsRenderer
          options={{
            directions: directionsResponse,
          }}
        />
      )}
    </GoogleMap>
  );
}