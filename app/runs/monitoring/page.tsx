"use client"
import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Flex } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';

// Importe o seu serviço de caronas (ajuste o caminho se necessário)
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
  const rideId = searchParams.get('id'); // Pega o ?id=... da URL

  const [originStr, setOriginStr] = useState("");
  const [destStr, setDestStr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRideDetails = async () => {
      if (!rideId) {
        setLoading(false);
        return;
      }

      try {
        // Busca a carona real no backend usando a instância do axios blindada
        const response = await RideService.getById(rideId);
        const ride = response.data;

        // Trata os dados dependendo de como você salva (JSON ou String simples)
        const origem = typeof ride.origin === 'object' ? `${ride.origin.city}, ${ride.origin.state}` : ride.origin;
        const destino = typeof ride.destination === 'object' ? `${ride.destination.city}, ${ride.destination.state}` : ride.destination;

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
      <MapWithNoSSR originText={originStr} destinationText={destStr} />
    </div>
  );
}

// O Next.js exige que páginas que usem useSearchParams sejam envolvidas em um Suspense
export default function Monitoring() {
  return (
    <Flex direction='column' height='100%' width="100%">
      <Suspense fallback={<Flex justify="center" align="center" height="100%"><Text>Aguarde...</Text></Flex>}>
        <MonitoringContent />
      </Suspense>
    </Flex>
  );
}