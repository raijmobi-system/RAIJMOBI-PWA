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
import { SearchFilterForm } from '@/components/template/SearchFilterForm';

// Serviços da API
import { RideService } from '@/services/ride/rideService';
import { ReservationService } from '@/services/ride/reservationService';
import { VehicleService } from '@/services/ride/vehicleService'; // 🌟 Importado para buscar dados do veículo
import { api } from '@/services/InterceptRequisition'; // 🌟 Usado para buscar os dados reais do motorista
import { toast } from '@/lib/toast';

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

const GATEWAY_URL = 'http://localhost:8000'; // Altere para o seu IP/Domínio público de produção quando necessário

/* ==========================================================================
   🌟 FUNÇÃO BLINDADA DE RESOLUÇÃO DE URL DE IMAGENS
   Intercepta qualquer formato de URL do Django/Docker e aponta para o Gateway
   ========================================================================== */
const getImageUrl = (rawPhoto: string | null | undefined, defaultFolder: string = 'vehicles'): string | null => {
  if (!rawPhoto || typeof rawPhoto !== 'string') return null;

  const cleanPhoto = rawPhoto.trim();
  if (!cleanPhoto) return null;

  // 1. Se contém /media/ ou media/ em qualquer parte (ex: http://ride-service:8000/media/vehicles/foto.jpg)
  // Cortamos tudo que vem antes e forçamos o uso do GATEWAY_URL público!
  const mediaIndex = cleanPhoto.indexOf('/media/');
  if (mediaIndex !== -1) {
    const mediaPath = cleanPhoto.substring(mediaIndex);
    return `${GATEWAY_URL}${mediaPath}`;
  }

  const mediaIndexNoSlash = cleanPhoto.indexOf('media/');
  if (mediaIndexNoSlash !== -1) {
    const mediaPath = cleanPhoto.substring(mediaIndexNoSlash - 1);
    return `${GATEWAY_URL}${mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`}`;
  }

  // 2. Se for uma URL externa legítima (Google, Facebook, AWS S3, etc) sem /media/
  if (cleanPhoto.startsWith('http://') || cleanPhoto.startsWith('https://')) {
    return cleanPhoto;
  }

  // 3. Se veio apenas o caminho relativo do banco de dados (ex: "vehicles/fordka.jpg")
  const pathWithoutSlash = cleanPhoto.startsWith('/') ? cleanPhoto.slice(1) : cleanPhoto;
  if (pathWithoutSlash.includes('/')) {
    return `${GATEWAY_URL}/media/${pathWithoutSlash}`;
  }

  return `${GATEWAY_URL}/media/${defaultFolder}/${pathWithoutSlash}`;
};

/* ==========================================================================
   1. COMPONENTE: DETALHES COMPLETO DA CARONA (MODAL COM SELETOR DE VAGAS)
   ========================================================================== */
interface RideDetailsProps {
  ride: any;
  vehicleMap: Record<string, any>; // 🌟 Recebe o mapa com os veículos buscados
  driverMap: Record<string, any>; // 🌟 Recebe o mapa com os motoristas buscados (nome, foto, avaliação real)
  onClose: () => void;
  onSuccess: () => void;
}

const RideDetailsContent = ({ ride, vehicleMap, driverMap, onClose, onSuccess }: RideDetailsProps) => {
  const [requestedSeats, setRequestedSeats] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🌟 Resolve o veículo buscando no mapa caso a API tenha mandado apenas a string do UUID
  const vehicleId = typeof ride?.vehicle === 'string' ? ride.vehicle : ride?.vehicle?.id;
  const vehicle = typeof ride?.vehicle === 'object' ? ride.vehicle : (vehicleId ? vehicleMap[vehicleId] : (ride?.vehicle_detail || {}));

  // 🌟 Resolve o motorista buscando no mapa caso a API tenha mandado apenas a string do UUID
  const driverId = typeof vehicle?.user === 'string' ? vehicle.user : vehicle?.user?.id;
  const driver = typeof vehicle?.user === 'object' ? vehicle.user : (driverId ? driverMap[driverId] : (vehicle?.user_detail || (typeof ride?.driver === 'object' ? ride.driver : {})));
  
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

      toast.success("🎉 Reserva solicitada com sucesso!");
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
        <Avatar src={getImageUrl(driver?.photo, 'avatars') || '/driver-placeholder.png'} size="md" />
        <Flex direction="column" flex="1">
          <Flex direction="row" alignItems="center" gap="1">
            <Text weight="bold" color="primary">{driver?.name || 'Motorista Parceiro'}</Text>
            <VerifiedUser className={css({ color: '#547812', fontSize: '16px' })} />
          </Flex>
          <Text size="xs" color="muted">
            {driver?.average_rating && Number(driver.average_rating) > 0
              ? `Avaliação: ★ ${Number(driver.average_rating).toFixed(1)}`
              : 'Motorista novo por aqui'}
          </Text>
        </Flex>
      </Flex>

      <Flex direction="column" gap="2" p="3" borderWidth="1px" borderColor="gray.100" borderRadius="xl">
        <Flex gap="2" align="center" className={css({ color: 'gray.500' })}>
          <DirectionsCar /> <Text weight="bold" size="sm" color="primary">Veículo da Viagem</Text>
        </Flex>

        {/* 🌟 Exibe a foto do veículo dentro do Modal de Detalhes se estiver disponível */}
        {vehicle?.photo && (
          <Flex justify="center" my="2">
            <img 
              src={getImageUrl(vehicle.photo, 'vehicles') || ''} 
              alt={vehicle?.model || 'Veículo'} 
              className={css({ maxH: '150px', w: 'full', objectFit: 'cover', borderRadius: 'lg', border: '1px solid', borderColor: 'gray.200' })} 
            />
          </Flex>
        )}

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

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  // 🌟 ESTADO DO MAPA DE VEÍCULOS (Armazena { [id_do_veiculo]: objeto_completo })
  const [vehicleMap, setVehicleMap] = useState<Record<string, any>>({});
  // 🌟 ESTADO DO MAPA DE MOTORISTAS (Armazena { [id_do_motorista]: objeto_completo, com average_rating real })
  const [driverMap, setDriverMap] = useState<Record<string, any>>({});

  const originQuery = searchParams.get('origin') || '';
  const destinationQuery = searchParams.get('destination') || '';

  // 🌟 FUNÇÃO QUE BUSCA VEÍCULOS NO FRONTEND (Contorna a limitação do Serializer no Backend)
  const fetchVehicleDetails = useCallback(async (ridesList: any[]) => {
    const idsToFetch = Array.from(
      new Set(
        ridesList
          .map(r => (typeof r?.vehicle === 'string' ? r.vehicle : r?.vehicle?.id))
          .filter(id => id && typeof id === 'string' && !vehicleMap[id])
      )
    );

    if (idsToFetch.length > 0) {
      const newVehicleMap: Record<string, any> = {};
      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const response = await VehicleService.getById(id);
            newVehicleMap[id] = response.data;
          } catch (err) {
            console.warn(`Não foi possível carregar o veículo ${id}:`, err);
            newVehicleMap[id] = { model: 'Veículo Parceiro', photo: null };
          }
        })
      );

      setVehicleMap(prev => ({ ...prev, ...newVehicleMap }));

      // 🌟 Com os veículos em mãos, busca os dados reais do motorista (nome, foto, average_rating)
      const driverIdsToFetch = Array.from(
        new Set(
          Object.values(newVehicleMap)
            .map((v: any) => v?.user)
            .filter((id: any) => id && typeof id === 'string' && !driverMap[id])
        )
      );

      if (driverIdsToFetch.length > 0) {
        const newDriverMap: Record<string, any> = {};
        await Promise.all(
          driverIdsToFetch.map(async (id) => {
            try {
              const response = await api.get(`/api/ride/users/${id}/`);
              newDriverMap[id] = response.data;
            } catch (err) {
              console.warn(`Não foi possível carregar o motorista ${id}:`, err);
            }
          })
        );

        setDriverMap(prev => ({ ...prev, ...newDriverMap }));
      }
    }
  }, [vehicleMap, driverMap]);

  const fetchRides = useCallback(async (customFilters?: any) => {
    setLoading(true);
    try {
      const params: any = {
        origin: originQuery || undefined,
        destination: destinationQuery || undefined,
        ...customFilters
      };
      const response = await RideService.getAll(params);
      const data = response.data;
      const resultsList = data?.results || (Array.isArray(data) ? data : []);
      
      setRides(resultsList);

      // 🌟 O RideSerializer só manda o UUID do veículo (não vem aninhado),
      // então buscamos os detalhes reais do veículo e do motorista aqui.
      fetchVehicleDetails(resultsList);

    } catch (err) {
      console.error("Erro ao buscar caronas:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

            // 🌟 O backend só manda o UUID do veículo em ride.vehicle; resolvemos no vehicleMap
            const rideVehicleId = typeof ride.vehicle === 'string' ? ride.vehicle : ride.vehicle?.id;
            const vehicle = (typeof ride.vehicle === 'object' ? ride.vehicle : (rideVehicleId ? vehicleMap[rideVehicleId] : null)) || {};

            const vehicleModel = vehicle.model || 'Veículo Parceiro';
            const vehiclePhoto = getImageUrl(vehicle.photo, 'vehicles') || '/driver-placeholder.png';

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
                      className={css({ w: '56px', h: '56px', objectFit: 'cover', borderRadius: 'xl', border: '1px solid', borderColor: 'gray.100' })} 
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

      {/* MODAL 1: FILTROS DE PESQUISA */}
      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Pesquisa"
      >
        <SearchFilterForm 
          onClose={() => setIsFilterOpen(false)} 
          onApply={(formFilters: any) => {
            setIsFilterOpen(false);
            fetchRides(formFilters);
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
            vehicleMap={vehicleMap}
            driverMap={driverMap}
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