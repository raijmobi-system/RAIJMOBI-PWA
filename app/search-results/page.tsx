"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Flex, Grid } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';
import { Button, IconButton } from '@/components/atoms/action';
import { Avatar } from '@/components/atoms/presentation';
import { PercentDiscount, VerifiedUser } from '@material-symbols-svg/react';

// Serviços e Tipos
import { RideService } from '@/services/ride/rideService'; // Ajuste o caminho se necessário (ex: '@/services/ride/rideService')
import { ReservationService } from '@/services/ride/reservationService'; // Ajuste o caminho se necessário
import { Ride, RideFilterParams } from '@/types/apiType';

// Componentes visuais do seu projeto
import CardComponent from '@/components/molecules/CardComponent';
import RideSummary from '@/components/template/RideSummary';
// ==========================================
// 1. COMPONENTE DO MODAL DE RESERVA
// ==========================================
interface RideDetailsContentProps {
  ride: Ride;
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RideDetailsContent = ({ 
  ride, 
  currentUserId, 
  onClose, 
  onSuccess 
}: RideDetailsContentProps) => {
  const [requestedSeats, setRequestedSeats] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = Number(ride.price) * requestedSeats;

  const handleIncrement = () => {
    if (requestedSeats < ride.available_seats) {
      setRequestedSeats(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (requestedSeats > 1) {
      setRequestedSeats(prev => prev - 1);
    }
  };

  const handleParticipate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Envia o payload exato que o seu Django espera no ReservationSerializer
      await ReservationService.create({
        ride: ride.uuid,
        passenger: currentUserId,
        requested_seats: requestedSeats,
        status: 'pendente',
      } as any);

      // Dispara o callback para recarregar a lista de caronas na tela de trás
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao realizar reserva:", err);
      const backendMessage = err.response?.data?.requested_seats || err.response?.data?.non_field_errors;
      setError(backendMessage || "Não foi possível realizar a reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="5">
      {/* Topo: Identificador e Preço */}
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex className={css({ background: '#f0f7e5' })} padding="4px 10px" borderRadius="10px" gap="6px">
          <PercentDiscount color="#547812" />
          <Text color="special" weight="bold">
  #{ride.uuid ? ride.uuid.slice(0, 6).toUpperCase() : 'KIW-000'}
</Text>
        </Flex>
        <Box textAlign="right">
          <Text fontSize="22px" color="special" weight="bold">
            R$ {totalPrice.toFixed(2)}
          </Text>
          {requestedSeats > 1 && (
            <Text size="xs" color="muted">({requestedSeats}x R$ {Number(ride.price).toFixed(2)})</Text>
          )}
        </Box>
      </Flex>

      {/* Dados do Motorista */}
      <Flex direction="row" gap="3" alignItems="center" padding="3" borderWidth="1px" borderColor="gray.200" borderRadius="lg">
        <Avatar src="/cliente.jpeg" size="md" />
        <Flex direction="column" flex="1">
          <Flex direction="row" alignItems="center" gap="1">
            <Text weight="bold">Motorista Kiwidi</Text>
            <VerifiedUser />
          </Flex>
          <Text size="xs" color="muted">
            Saída: {new Date(ride.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Flex>
      </Flex>

      {/* Seletor de Vagas */}
      <Box bg="gray.50" padding="4" borderRadius="lg">
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text weight="medium">Quantidade de Vagas</Text>
            <Text size="xs" color="muted">Restam apenas {ride.available_seats} vagas</Text>
          </Box>

          <Flex alignItems="center" gap="3">
            <Button 
              size="sm" 
              bg="white" 
              borderWidth="1px" 
              borderColor="gray.300"
              onClick={handleDecrement}
              disabled={requestedSeats <= 1 || loading}
            >
              -
            </Button>
            
            <Text weight="bold" size="lg">{requestedSeats}</Text>

            <Button 
              size="sm" 
              bg="white" 
              borderWidth="1px" 
              borderColor="gray.300"
              onClick={handleIncrement}
              disabled={requestedSeats >= ride.available_seats || loading}
            >
              +
            </Button>
          </Flex>
        </Flex>
      </Box>

      {error && (
        <Box bg="red.50" p="3" borderRadius="md">
          <Text size="sm" color="danger">{error}</Text>
        </Box>
      )}

      <Button 
        width="full" 
        bg="#547812" 
        onClick={handleParticipate}
        disabled={loading || ride.available_seats === 0}
      >
        <Text color="white" weight="bold">
          {loading ? 'Reservando...' : `Reservar ${requestedSeats} vaga${requestedSeats > 1 ? 's' : ''}`}
        </Text>
      </Button>
    </Flex>
  );
};


// ==========================================
// 2. COMPONENTE PRINCIPAL DA PÁGINA
// ==========================================
const ResultadosContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para gerenciar a abertura do Modal
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const originQuery = searchParams.get('origin');
  const destinationQuery = searchParams.get('destination');

  // Função centralizada para buscar as caronas no Django
  const fetchFilteredRides = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: RideFilterParams = {
      origin: originQuery || undefined,
      destination: destinationQuery || undefined,
      start_time_after: searchParams.get('start_time_after') || undefined,
    };

    try {
      const response = await RideService.getAll(params);
      const data = response.data;
      
      if (data && Array.isArray(data.results)) {
        setRides(data.results);
      } else if (Array.isArray(data)) {
        setRides(data);
      } else {
        setRides([]);
      }
    } catch (err) {
      console.error("Erro ao buscar caronas:", err);
      setError("Não foi possível carregar as caronas. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, [originQuery, destinationQuery, searchParams]);

  useEffect(() => {
    fetchFilteredRides();
  }, [fetchFilteredRides]);

  // Manipuladores de abertura/fechamento do modal
  const handleOpenModal = (ride: Ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  return (
    <Box padding="8" maxWidth="1200px" margin="0 auto" position="relative">
      {/* Cabeçalho */}
      <Flex justifyContent="space-between" alignItems="center" mb="6">
        <Box>
          <Text size="lg" weight="bold">Caronas Disponíveis</Text>
          <Text size="sm" color="muted">
            {originQuery ? `Origem: ${originQuery}` : 'Todas as origens'} 
            {destinationQuery ? ` ➔ Destino: ${destinationQuery}` : ''}
          </Text>
        </Box>
        <Button 
          onClick={() => router.push('/')}
          bg="gray.100" 
          color="gray.800"
        >
          Nova Pesquisa
        </Button>
      </Flex>

      {/* Feedback de Carregamento / Erro */}
      {loading && (
        <Flex justifyContent="center" padding="12">
          <Text size="md" color="muted">Buscando caronas ideais para você...</Text>
        </Flex>
      )}

      {error && (
        <Box bg="red.50" padding="4" borderRadius="md" mb="6">
          <Text color="danger">{error}</Text>
        </Box>
      )}

      {/* Estado Vazio */}
      {!loading && !error && rides.length === 0 && (
        <Flex direction="column" alignItems="center" padding="12" bg="gray.50" borderRadius="lg">
          <Text size="lg" weight="medium" mb="2">Nenhuma carona encontrada 😔</Text>
          <Text size="sm" color="muted" mb="6">
            Não encontramos motoristas para esse trajeto ou data específica.
          </Text>
          <Button onClick={() => router.back()} bg="#547812" color="white">
            Voltar e alterar filtros
          </Button>
        </Flex>
      )}

      {/* Grid com o seu CardComponent e RideSummary exatos */}
      {!loading && !error && rides.length > 0 && (
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
          {rides.map((ride) => (
            <CardComponent
              key={ride.uuid}
              direction="column"
              fullWidth={true}
              hasPadding={false}
              Image={
                <img 
                  src="/trajeto.png" 
                  alt="Trajeto" 
                  className={css({ 
                    height: '118px', 
                    w: '100%', 
                    maxH: '118px', 
                    objectFit: 'cover'
                  })} 
                />
              }
              content={
                <RideSummary 
                  title={`Carona - ${ride.destination?.city || 'Destino'}`}
                  seats={`${ride.available_seats} vagas disponíveis`}
                  price={`R$ ${Number(ride.price).toFixed(2)}`}
                  origin={ride.origin?.city || 'Origem'}
                  destination={ride.destination?.city || 'Destino'}
                />
              }
              extraContent={
                <Flex width="100%">
                  <IconButton 
                    variant="detail" 
                    size="full" 
                    className={css({ margin: '0.75rem', width: '100%' })} 
                    // Abre o Modal passando a corrida selecionada
                    onClick={() => handleOpenModal(ride)}
                  >
                    <Text color="white">Participar</Text>
                  </IconButton>
                </Flex>
              }
            />
          ))}
        </Grid>
      )}

      {/* OVERLAY DO MODAL */}
      {isModalOpen && selectedRide && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex="1000"
          alignItems="center"
          justifyContent="center"
          padding="4"
        >
          <Box
            bg="white"
            borderRadius="2xl"
            padding="6"
            maxWidth="480px"
            width="100%"
            boxShadow="2xl"
            position="relative"
            maxHeight="90vh"
            overflowY="auto"
          >
            {/* Botão de Fechar no topo */}
            <Box
              as="button"
              position="absolute"
              top="4"
              right="4"
              cursor="pointer"
              onClick={handleCloseModal}
              className={css({ fontSize: '18px', color: 'gray.500', _hover: { color: 'black' } })}
            >
              ✕
            </Box>

            {/* Conteúdo da Reserva e Atualização de Vagas */}
            <RideDetailsContent
              ride={selectedRide}
              currentUserId="5a63d8a7-5b63-41c4-ba3e-5d1bb27ea261" // Ex: passe via AuthContext ou props do seu sistema
              onClose={handleCloseModal}
              onSuccess={() => {
                // Ao recarregar aqui, o Django já devolve o available_seats reduzido 
                // e o Card re-renderiza exibindo o novo número real de vagas!
                fetchFilteredRides();
              }}
            />
          </Box>
        </Flex>
      )}
    </Box>
  );
};

// Envelopamento com Suspense obrigatório no Next.js (App Router)
export default function ResultadosPage() {
  return (
    <Suspense fallback={
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Text>Carregando página de busca...</Text>
      </Flex>
    }>
      <ResultadosContent />
    </Suspense>
  );
}