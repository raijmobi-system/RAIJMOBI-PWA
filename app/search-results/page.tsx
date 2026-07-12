"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Flex, Grid } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action';
import { Avatar } from '@/components/atoms/presentation';

// Componentes Reutilizáveis do Projeto
import CardComponent from '@/components/molecules/CardComponent';
import Modal from '@/components/fixed/Modal';
import { SearchFilterForm } from '@/components/template/SearchFilterForm'; // 🌟 1. IMPORTADO O FORMULÁRIO DE FILTRO

// Serviços da API
import { RideService } from '@/services/ride/rideService';
import { ReservationService } from '@/services/ride/reservationService';

// Ícones
import { 
  DirectionsCar, 
  LocationOn, 
  Schedule, 
  Group, 
  VerifiedUser,
  ArrowBack,
  ManageSearch
} from '@material-symbols-svg/react';

/* ==========================================================================
   1. COMPONENTE: DETALHES COMPLETO DA CARONA (MODAL COM SELETOR DE VAGAS)
   ========================================================================== */
interface RideDetailsProps {
  ride: any;
  onClose: () => void;
  onSuccess: () => void;
}

const RideDetailsContent = ({ ride, onClose, onSuccess }: RideDetailsProps) => {
  const [requestedSeats, setRequestedSeats] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const vehicle = typeof ride?.vehicle === 'object' ? ride.vehicle : (ride?.vehicle_detail || {});
  const driver = typeof vehicle?.user === 'object' ? vehicle.user : (vehicle?.user_detail || {});
  
  const priceUnit = Number(ride?.price || 0);
  const totalPrice = priceUnit * requestedSeats;

  const dataSaida = ride?.start_time ? new Date(ride.start_time).toLocaleDateString('pt-BR') : '--/--/----';
  const horaSaida = ride?.start_time ? new Date(ride.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00';

  const formatLocation = (loc: any) => {
    if (!loc) return 'Não informado';
    return typeof loc === 'object' ? `${loc.city || ''}, ${loc.state || ''}` : loc;
  };

  const handleParticipate = async () => {
    setLoading(true);
    setError(null);
    try {
      await ReservationService.create({
        ride: ride.id,
        requested_seats: requestedSeats,
        status: 'pendente',
      } as any);

      alert("🎉 Reserva solicitada com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao solicitar reserva:", err);
      setError("Não foi possível realizar a reserva. Verifique se você já possui uma solicitação ou se o limite foi atingido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex className={css({ background: '#f0f7e5', px: '3', py: '1', borderRadius: 'lg' })} gap="2">
          <Text color="special" weight="bold" size="sm">
            #{ride.id?.toString().substring(0, 6).toUpperCase() || '000'}
          </Text>
        </Flex>
        <Text fontSize="22px" color="special" weight="bold">
          {priceUnit === 0 ? 'Grátis' : `R$ ${totalPrice.toFixed(2)}`}
        </Text>
      </Flex>

      <Flex direction="row" gap="3" alignItems="center" p="3" bg="gray.50" borderRadius="xl">
        <Avatar src={driver?.photo || '/driver-placeholder.png'} size="md" />
        <Flex direction="column" flex="1">
          <Flex direction="row" alignItems="center" gap="1">
            <Text weight="bold" color="primary">{driver?.name || 'Motorista Parceiro'}</Text>
            <VerifiedUser className={css({ color: '#547812', fontSize: '16px' })} />
          </Flex>
          <Text size="xs" color="muted">Avaliação: ★ 4.9</Text>
        </Flex>
      </Flex>

      <Flex direction="column" gap="2" p="3" borderWidth="1px" borderColor="gray.100" borderRadius="xl">
        <Flex gap="2" align="center" className={css({ color: 'gray.500' })}>
          <DirectionsCar /> <Text weight="bold" size="sm" color="primary">Veículo</Text>
        </Flex>
        <Grid columns={2} gap="2" mt="1">
          <Box><Text size="xs" color="muted">Modelo</Text><Text size="sm" weight="medium">{vehicle?.model || 'Não informado'}</Text></Box>
          <Box><Text size="xs" color="muted">Cor</Text><Text size="sm" weight="medium">{vehicle?.color || 'Não informada'}</Text></Box>
          <Box><Text size="xs" color="muted">Placa</Text><Text size="sm" weight="medium">{vehicle?.plate || '---'}</Text></Box>
          <Box><Text size="xs" color="muted">Assentos</Text><Text size="sm" weight="medium">{vehicle?.seats || '4'} vagas</Text></Box>
        </Grid>
      </Flex>

      <Flex direction="column" gap="2" p="3" borderWidth="1px" borderColor="gray.100" borderRadius="xl">
        <Flex gap="2" align="center" className={css({ color: 'gray.500' })}>
          <LocationOn /> <Text weight="bold" size="sm" color="primary">Trajeto da Viagem</Text>
        </Flex>
        <Flex gap="2" alignItems="flex-start" mt="2" pl="1">
          <Flex direction="column" alignItems="center" mt="1">
            <div className={css({ w: '8px', h: '8px', borderRadius: 'full', border: '2px solid', borderColor: '#547812', bg: 'white' })} />
            <div className={css({ w: '2px', h: '20px', bg: 'gray.200' })} />
            <div className={css({ w: '8px', h: '8px', borderRadius: 'full', bg: 'red.500' })} />
          </Flex>
          <Flex direction="column" gap="2">
            <Box><Text size="xs" color="muted">Origem</Text><Text size="sm" weight="medium">{formatLocation(ride.origin)}</Text></Box>
            <Box><Text size="xs" color="muted">Destino</Text><Text size="sm" weight="medium">{formatLocation(ride.destination)}</Text></Box>
          </Flex>
        </Flex>
      </Flex>

      <Grid columns={2} gap="3">
        <Flex direction="column" p="3" bg="gray.50" borderRadius="xl" align="center">
          <Schedule className={css({ color: 'gray.400', mb: '1' })} />
          <Text size="xs" color="muted">Data da Saída</Text>
          <Text size="sm" weight="bold">{dataSaida}</Text>
        </Flex>
        <Flex direction="column" p="3" bg="gray.50" borderRadius="xl" align="center">
          <Schedule className={css({ color: 'gray.400', mb: '1' })} />
          <Text size="xs" color="muted">Horário Previsto</Text>
          <Text size="sm" weight="bold">{horaSaida}</Text>
        </Flex>
      </Grid>

      <Flex justify="between" align="center" p="3" bg="gray.50" borderRadius="xl" mt="1">
        <Box>
          <Text size="sm" weight="bold">Quantidade de Vagas</Text>
          <Text size="xs" color="muted">Restam apenas {ride.available_seats} vagas</Text>
        </Box>
        <Flex align="center" gap="3">
          <button 
            type="button" 
            onClick={() => setRequestedSeats(p => Math.max(1, p - 1))} 
            disabled={requestedSeats <= 1 || loading}
            className={css({ w: "32px", h: "32px", borderRadius: "full", border: "1px solid", borderColor: "gray.300", bg: "white", cursor: "pointer", _disabled: { opacity: 0.4 } })}
          >
            -
          </button>
          <Text weight="bold" color="primary" className={css({ minW: "24px", textAlign: "center" })}>{requestedSeats}</Text>
          <button 
            type="button" 
            onClick={() => setRequestedSeats(p => Math.min(ride.available_seats, p + 1))} 
            disabled={requestedSeats >= ride.available_seats || loading}
            className={css({ w: "32px", h: "32px", borderRadius: "full", border: "1px solid", borderColor: "gray.300", bg: "white", cursor: "pointer", _disabled: { opacity: 0.4 } })}
          >
            +
          </button>
        </Flex>
      </Flex>

      {error && <Text size="xs" color="danger" weight="medium">{error}</Text>}

      <Button 
        width="full" 
        onClick={handleParticipate} 
        disabled={loading || ride.available_seats <= 0}
        className={css({ bg: '#547812', height: '11 !important', mt: '2' })}
      >
        <Text color="white" weight="bold">
          {loading ? "Reservando..." : `Solicitar ${requestedSeats} vaga${requestedSeats > 1 ? 's' : ''}`}
        </Text>
      </Button>
    </Flex>
  );
};

/* ==========================================================================
   2. CONTEÚDO PRINCIPAL: LISTAGEM DE CARDS COM FILTRAGEM VIA MODAL
   ========================================================================== */
function ResultadosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);

  // 🌟 2. ESTADO DE CONTROLE DO MODAL DE FILTROS
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const originQuery = searchParams.get('origin') || '';
  const destinationQuery = searchParams.get('destination') || '';

  // 🌟 FUNÇÃO ATUALIZADA: Agora aceita receber filtros extras do SearchFilterForm
  const fetchRides = useCallback(async (customFilters?: any) => {
    setLoading(true);
    try {
      const params: any = {
        origin: originQuery || undefined,
        destination: destinationQuery || undefined,
        ...customFilters // Sobrescreve com os filtros aplicados no Modal
      };
      const response = await RideService.getAll(params);
      const data = response.data;
      
      setRides(data?.results || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Erro ao buscar caronas:", err);
    } finally {
      setLoading(false);
    }
  }, [originQuery, destinationQuery]);

  useEffect(() => {
    //eslint-disable-next-line
    fetchRides();
  }, [fetchRides]);

  const getCityName = (loc: any) => {
    if (!loc) return '---';
    return typeof loc === 'object' ? (loc.city || loc.state || '') : loc;
  };

  return (
    <Flex direction="column" gap="4" width="full" p="4">
      
      {/* Cabeçalho de Navegação */}
      <Flex justify="space-between" align="center" pb="2" borderBottom="1px solid" borderColor="gray.200">
        <Flex align="center" gap="3">
          <button onClick={() => router.back()} className={css({ cursor: 'pointer', bg: 'transparent', display: 'flex' })}>
            <ArrowBack />
          </button>
          <Box>
            <Text size="lg" weight="bold" color="primary">Caronas Disponíveis</Text>
            <Text size="xs" color="muted">
              {originQuery ? `${originQuery} ➔ ` : 'Todas as origens ➔ '} 
              {destinationQuery ? destinationQuery : 'Todos os destinos'}
            </Text>
          </Box>
        </Flex>

        {/* 🌟 3. BOTÃO VERDE CONECTADO AO MODAL DE FILTRO */}
        <Button 
          size="md" 
          variant="solid" 
          onClick={() => setIsFilterOpen(true)}
          className={css({ width: '60px', bg: '#547812', color: 'white', _hover: { bg: '#43610e' } })}
        >
          <ManageSearch />
        </Button>
      </Flex>

      {/* FEEDBACK DE CARREGAMENTO / VAZIO */}
      {loading ? (
        <Flex justify="center" align="center" py="16">
          <Text color="muted" weight="bold">Buscando caronas disponíveis...</Text>
        </Flex>
      ) : rides.length === 0 ? (
        <Flex direction="column" align="center" justify="center" py="16" bg="gray.50" borderRadius="2xl">
          <Text size="md" weight="bold" color="muted" mb="1">Nenhuma carona encontrada 😔</Text>
          <Text size="xs" color="muted" mb="4">Não encontramos motoristas para esse trajeto no momento.</Text>
          <Button size="sm" onClick={() => setIsFilterOpen(true)}>Alterar Filtros de Busca</Button>
        </Flex>
      ) : (
        /* LISTA DE CARDS COMPACTOS */
        <Flex direction="column" gap="3">
          {rides.map((ride) => {
            const destCity = getCityName(ride.destination);
            const origCity = getCityName(ride.origin);
            const priceVal = Number(ride.price || 0);

            const vehicle = typeof ride?.vehicle === 'object' ? ride.vehicle : {};
            const vehicleModel = vehicle?.model || 'Carona Parceira';
            const rawPhoto = vehicle?.photo;

            // IP adaptável para a rede Wi-Fi local ou Gateway
            const BACKEND_BASE_URL = "http://10.41.89.110:8000"; 

            const vehiclePhoto = rawPhoto 
              ? (rawPhoto.startsWith('http') ? rawPhoto : `${BACKEND_BASE_URL}${rawPhoto}`)
              : '/driver-placeholder.png';

            return (
              <div 
                key={ride.id} 
                onClick={() => setSelectedRide(ride)}
                className={css({ cursor: 'pointer', width: '100%', transition: 'transform 0.1s', _hover: { transform: 'scale(1.01)' } })}
              >
                <CardComponent
                  direction="row"
                  fullWidth={true}
                  hasPadding={true}
                  Image={
                    <img 
                      src={vehiclePhoto} 
                      alt={vehicleModel} 
                      className={css({ w: '56px', h: '56px', objectFit: 'cover', borderRadius: 'xl' })} 
                    />
                  }
                  content={
                    <Flex direction="column" gap="1" flex="1" pl="3">
                      <Flex align="center" gap="1">
                        <Group className={css({ color: 'gray.400', fontSize: '16px' })} />
                        <Text size="xs" color="muted" weight="medium">
                          {ride.available_seats}/6 lugares
                        </Text>
                      </Flex>

                      <Text weight="bold" size="md" color="primary">
                        {vehicleModel} - {destCity}
                      </Text>
                      
                      <Flex direction="column" pl="1" mt="1">
                        <Flex align="center" gap="2">
                          <div className={css({ w: '6px', h: '6px', borderRadius: 'full', border: '1px solid', borderColor: 'gray.500' })} />
                          <Text size="xs" color="muted">{origCity}</Text>
                        </Flex>
                        <Flex align="center" gap="2" mt="0.5">
                          <div className={css({ w: '6px', h: '6px', borderRadius: 'full', bg: 'primary' })} />
                          <Text size="xs" color="muted" weight="medium">{destCity}</Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  }
                  extraContent={
                    <Flex direction="column" align="end" justify="space-between" height="100%" minW="90px">
                      <Text weight="bold" color="success" size="lg">
                        {priceVal === 0 ? 'Grátis' : `R$ ${priceVal.toFixed(2)}`}
                      </Text>

                      <Button 
                        width='full'
                        className={css({ bg: '#242424', color: 'white', borderRadius: 'xl', px: '4', py: '1.5', _hover: { bg: 'black' } })}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRide(ride);
                        }}
                      >
                        <Text color="white" size="xs" weight="bold">Participar</Text>
                      </Button>
                    </Flex>
                  }
                />
              </div>
            );
          })}
        </Flex>
      )}

      {/* 🌟 MODAL 1: FILTROS DE PESQUISA */}
      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Pesquisa"
      >
        <SearchFilterForm 
          onClose={() => setIsFilterOpen(false)} 
          onApply={(formFilters: any) => {
            setIsFilterOpen(false);
            fetchRides(formFilters); // Filtra os resultados instantaneamente sem recarregar a tela!
          }}
        />
      </Modal>

      {/* MODAL 2: DETALHES COMPLETO DA VIAGEM */}
      <Modal 
        isOpen={!!selectedRide} 
        onClose={() => setSelectedRide(null)}
        title="Detalhes da Viagem"
      >
        {selectedRide && (
          <RideDetailsContent 
            ride={selectedRide}
            onClose={() => setSelectedRide(null)}
            onSuccess={() => {
              fetchRides();
            }}
          />
        )}
      </Modal>

    </Flex>
  );
}

// 3. EXPORT PRINCIPAL COM PROTEÇÃO DE SUSPENSE
export default function ResultadosPage() {
  return (
    <Suspense fallback={<Flex justify="center" align="center" height="100vh"><Text color="muted">Carregando...</Text></Flex>}>
      <ResultadosContent />
    </Suspense>
  );
}