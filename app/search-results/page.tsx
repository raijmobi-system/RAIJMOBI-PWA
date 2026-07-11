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
  ArrowBack
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

  // Extração segura de dados (prepara para dados aninhados ou IDs simples)
  const vehicle = typeof ride?.vehicle === 'object' ? ride.vehicle : (ride?.vehicle_detail || {});
  const driver = typeof vehicle?.user === 'object' ? vehicle.user : (vehicle?.user_detail || {});
  
  const priceUnit = Number(ride?.price || 0);
  const totalPrice = priceUnit * requestedSeats;

  // Formatação segura de datas
  const dataSaida = ride?.start_time ? new Date(ride.start_time).toLocaleDateString('pt-BR') : '--/--/----';
  const horaSaida = ride?.start_time ? new Date(ride.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00';

  // Formatação de Localidade (cidade/estado ou string)
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
      {/* Topo: Identificador e Preço Total */}
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

      {/* Bloco: Motorista */}
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

      {/* Bloco: Veículo */}
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

      {/* Bloco: Trajeto */}
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

      {/* Bloco: Data e Horário */}
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

      {/* SELETOR INTERATIVO DE VAGAS */}
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

      {/* Botão Final de Solicitação */}
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
   2. CONTEÚDO PRINCIPAL: LISTAGEM DE CARDS HORIZONTAIS
   ========================================================================== */
function ResultadosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);

  // Lê os parâmetros da URL vindos da tela de pesquisa
  const originQuery = searchParams.get('origin') || '';
  const destinationQuery = searchParams.get('destination') || '';

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        origin: originQuery || undefined,
        destination: destinationQuery || undefined,
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

  // Função auxiliar para pegar nome de cidade
  const getCityName = (loc: any) => {
    if (!loc) return '---';
    return typeof loc === 'object' ? (loc.city || loc.state || '') : loc;
  };

  return (
    <Flex direction="column" gap="4" width="full" maxW="700px" margin="0 auto" p="4">
      
      {/* Cabeçalho de Navegação Simples */}
      <Flex justify="between" align="center" pb="2" borderBottom="1px solid" borderColor="gray.200">
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
        <Button size="sm" variant="outline" onClick={() => router.push('/')}>
          Nova Busca
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
          <Button size="sm" onClick={() => router.push('/')}>Tentar outro destino</Button>
        </Flex>
      ) : (
        /* LISTA DE CARDS COMPACTOS (ESTILO DA SUA IMAGEM 1) */
        <Flex direction="column" gap="3">
          {rides.map((ride) => {
            const destCity = getCityName(ride.destination);
            const origCity = getCityName(ride.origin);
            const priceVal = Number(ride.price || 0);

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
                    <Flex justify="center" align="center" w="56px" h="56px" bg="#f0f7e5" borderRadius="xl">
                      <span style={{ fontSize: '28px' }}>🗺️</span>
                    </Flex>
                  }
                  content={
                    <Flex direction="column" gap="1" flex="1" pl="3">
                      {/* Vagas no topo esquerdo */}
                      <Flex align="center" gap="1">
                        <Group className={css({ color: 'gray.400', fontSize: '16px' })} />
                        <Text size="xs" color="muted" weight="medium">
                          {ride.available_seats}/6 lugares
                        </Text>
                      </Flex>

                      {/* Título com Destino Principal */}
                      <Text weight="bold" size="md" color="primary">
                        Kiwidi Express - {destCity}
                      </Text>
                      
                      {/* Trajeto Visual em Linha */}
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
                      {/* Preço ou Grátis no topo direito */}
                      <Text weight="bold" color="success" size="lg">
                        {priceVal === 0 ? 'Grátis' : `R$ ${priceVal.toFixed(2)}`}
                      </Text>

                      {/* Botão Escuro 'Participar' na base direita */}
                      <Button 
                        width='full'
                        className={css({ bg: '#242424', color: 'white', borderRadius: 'xl', px: '4', py: '1.5', _hover: { bg: 'black' } })}
                        onClick={(e) => {
                          e.stopPropagation(); // Evita clique duplo na div
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

      {/* MODAL DE DETALHES COMPLETO DA VIAGEM */}
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
              fetchRides(); // Recarrega a lista para atualizar o número de vagas no card
            }}
          />
        )}
      </Modal>

    </Flex>
  );
}

// 3. EXPORT PRINCIPAL COM PROTEÇÃO DE SUSPENSE (Obrigatório no Next.js)
export default function ResultadosPage() {
  return (
    <Suspense fallback={<Flex justify="center" align="center" height="100vh"><Text color="muted">Carregando...</Text></Flex>}>
      <ResultadosContent />
    </Suspense>
  );
}