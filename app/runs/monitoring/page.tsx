"use client"
import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Flex } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';

// 🌟 Importações adicionadas para o GPS funcionar universalmente
import { Geolocation } from '@capacitor/geolocation';
import { RideService } from '@/services/ride/rideService'; 

const MapWithNoSSR = dynamic(() => import('@/components/fixed/Map'), {
  ssr: false,
  loading: () => (
    <Flex justify="center" align="center" height="100%">
      <p className={css({ color: 'gray.500' })}>Carregando o mapa...</p>
    </Flex>
  ) 
});

function MonitoringContent() {
  const searchParams = useSearchParams();
  const rideId = searchParams.get('id'); // Pega o ?id=... da URL[cite: 16]

  const [originStr, setOriginStr] = useState("");
  const [destStr, setDestStr] = useState("");
  // 🌟 Estado para guardar a latitude e longitude do usuário
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // 🌟 Função para capturar a localização atual do aparelho (PC ou Celular)
  const buscarLocalizacaoAtual = async () => {
    try {
      const permissao = await Geolocation.checkPermissions();
      if (permissao.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const posicao = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      setUserCoords({
        lat: posicao.coords.latitude,
        lng: posicao.coords.longitude
      });
    } catch (erro) {
      console.warn("Não foi possível obter a localização atual:", erro);
    }
  };

  // Executa a busca automática do GPS assim que a tela abre
  useEffect(() => {
    //eslint-disable-next-line
    buscarLocalizacaoAtual();
  }, []);

  useEffect(() => {
    const fetchRideDetails = async () => {
      if (!rideId) {
        setLoading(false);
        return;
      }

      try {
        const response = await RideService.getById(rideId);
        const ride = response.data;

        // 🌟 CORREÇÃO: Adicionado ", Brasil" no final para o Directions API do Google funcionar sem erros
        const origem = typeof ride.origin === 'object' 
          ? `${ride.origin.city}, ${ride.origin.state}, Brasil` 
          : `${ride.origin}, Brasil`;
          
        const destino = typeof ride.destination === 'object' 
          ? `${ride.destination.city}, ${ride.destination.state}, Brasil` 
          : `${ride.destination}, Brasil`;

        setOriginStr(origem);
        setDestStr(destino);
      } catch (error) {
        console.error("Erro ao buscar detalhes da carona para o mapa:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100%" width="100%">
        <Text color="muted">Buscando rota...</Text>
      </Flex>
    );
  }

  if (!originStr || !destStr) {
    return (
      <Flex justify="center" align="center" height="100%" width="100%">
        <Text color="danger">Nenhuma carona selecionada ou erro ao carregar.</Text>
      </Flex>
    );
  }

  return (
    <div className={css({ flex: 1, minHeight: '50vh', width: '100%', position: 'relative' })}>
      {/* 🌟 Passamos o userLocation para o seu componente Map desenhar a bolinha azul */}
      <MapWithNoSSR originText={originStr} destinationText={destStr} userLocation={userCoords} />

      {/* 🌟 O BOTÃO QUE FALTAVA: Fica flutuando discretamente no canto inferior direito do mapa */}
      <button
        onClick={buscarLocalizacaoAtual}
        title="Centralizar na minha posição"
        className={css({
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 10,
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: 'full',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          _hover: { backgroundColor: 'gray.100' },
          _active: { transform: 'scale(0.95)' }
        })}
      >
        <span style={{ fontSize: '20px' }}>🎯</span>
      </button>
    </div>
  );
}

export default function Monitoring() {
  return (
    <Flex direction='column' height='100%' width="100%">
      <Suspense fallback={<Flex justify="center" align="center" height="100%"><Text>Aguarde...</Text></Flex>}>
        <MonitoringContent />
      </Suspense>
    </Flex>
  );
}