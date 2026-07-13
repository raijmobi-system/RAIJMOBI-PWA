"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Box } from '@/styled-system/jsx';
import { css } from "@/styled-system/css"; 

// Ferramentas Nativas do Capacitor + JWT
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { jwtDecode } from "jwt-decode";

// Componentes do Sistema
import { Button } from '@/components/atoms/action';
import { FrameComponent } from "@/components/organisms";
import { Text } from '@/components/atoms/typography';
import { CardComponent } from '@/components/molecules';
import Modal from "@/components/fixed/Modal"; 
import RatingModal from "@/components/template/RatingModal"; 

// Serviços Reais da API
import { api } from '@/services/InterceptRequisition';
import { RideService } from '@/services/ride/rideService';
import { ReservationService } from '@/services/ride/reservationService';
import { StripePaymentServiceFront } from '@/services/stripe/stripeService';

// Ícones do Material Symbols
import { 
  Star, 
  Percent, 
  VerifiedUser,
  Add,
} from '@material-symbols-svg/react';

type TabType = 'passageiro' | 'motorista';

/* =========================================
   COMPONENTE AUXILIAR: BANNER DE FEEDBACK EM TELA
========================================= */
const FeedbackBanner = ({ type, message }: { type: 'success' | 'error' | null, message: string | null }) => {
  if (!type || !message) return null;
  const isSuccess = type === 'success';
  return (
    <Box 
      p="3" 
      mb="3" 
      borderRadius="xl"
      border="1px solid"
      bg={isSuccess ? "#f0f7e5" : "red.50"} 
      borderColor={isSuccess ? "#cce5a3" : "red.200"}
    >
      <Text size="sm" color={isSuccess ? "success" : "danger"} weight="medium">
        {isSuccess ? "✓ " : "✕ "} {message}
      </Text>
    </Box>
  );
};

/* =========================================
   COMPONENTE AUXILIAR: TRAJETO VISUAL
========================================= */
const RouteDisplay = ({ title, origin, destination }: { title: string, origin: string, destination: string }) => (
  <Flex direction="column" gap="1">
    <Text weight="bold" color="primary">{title}</Text>
    <Flex gap="2" alignItems="flex-start" mt="1">
      <Flex direction="column" alignItems="center" mt="1" width="10px">
        <div className={css({ w: '8px', h: '8px', borderRadius: 'full', border: '2px solid', borderColor: 'muted', bg: 'white', zIndex: 1 })} />
        <div className={css({ w: '2px', h: '16px', bg: '#e2e8f0', my: '-2px' })} />
        <div className={css({ w: '8px', h: '8px', borderRadius: 'full', bg: 'cupom', zIndex: 1 })} />
      </Flex>
      <Flex direction="column" gap="1">
        <Text size="sm" color="muted">{origin}</Text>
        <Text size="sm" color="muted">{destination}</Text>
      </Flex>
    </Flex>
  </Flex>
);

/* =========================================
   COMPONENTE: DETALHES NO MODAL (Ações Reais)
========================================= */
interface RideDetailsProps {
  item: any; 
  role: 'motorista' | 'passageiro';
  onClose: () => void;
  onEditClick: (ride: any) => void;
  onSuccessCancel: () => void;
  onRatingClick?: (item: any) => void;
}

const RideDetailsContent = ({ item, role, onClose, onEditClick, onSuccessCancel, onRatingClick }: RideDetailsProps) => {
  const router = useRouter(); 
  
  const [canceling, setCanceling] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false); 

  // 🌟 ESTADOS LOCAIS PARA SUBSTITUIR OS ALERTS DENTRO DO MODAL
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const ride = role === 'passageiro' ? item.ride : item;
  const reservationId = role === 'passageiro' ? item.id : null;
  const reservationStatus = role === 'passageiro' && item?.status ? String(item.status).toLowerCase() : null;

  const isLocked = ['em_andamento', 'finalizada'].includes(ride?.status?.toLowerCase());
  const isAlreadyCanceled = reservationStatus === 'cancelada';

  const clearFeedbackAfterDelay = (callback?: () => void) => {
    setTimeout(() => {
      setFeedbackType(null);
      setFeedbackMsg(null);
      if (callback) callback();
    }, 1800);
  };

  // LÓGICA DE INICIAR OU TERMINAR CARONA (Apenas Motorista)
  const handleUpdateRideStatus = async (newStatus: 'em_andamento' | 'finalizada') => {
    if (!ride?.id) return;

    const confirmMessage = newStatus === 'em_andamento' 
      ? "Quer mesmo começar essa carona?" 
      : "Quer mesmo terminar essa carona?";

    if (window.confirm(confirmMessage)) {
      setUpdatingStatus(true);
      setFeedbackType(null);
      try {
        await RideService.update(String(ride.id), { status: newStatus });
        setFeedbackType('success');
        setFeedbackMsg(`Carona ${newStatus === 'em_andamento' ? 'iniciada' : 'finalizada'} com sucesso!`);
        clearFeedbackAfterDelay(() => {
          onClose();
          onSuccessCancel();
        });
      } catch (error) {
        console.error("Erro ao atualizar status da carona:", error);
        setFeedbackType('error');
        setFeedbackMsg("Não foi possível atualizar o status da carona. Tente novamente.");
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  // CANCELAMENTO DE RESERVA (Passageiro)
  const handleCancelParticipation = async () => {
    if (!reservationId) return;
    
    const confirm = window.confirm("Deseja realmente cancelar sua participação nesta carona? Suas vagas serão liberadas no sistema.");
    if (confirm) {
      setCanceling(true);
      setFeedbackType(null);
      try {
        await ReservationService.updateStatus(String(reservationId), 'cancelada');
        setFeedbackType('success');
        setFeedbackMsg("Participação cancelada com sucesso!");
        clearFeedbackAfterDelay(() => {
          onClose();
          onSuccessCancel();
        });
      } catch (error: any) {
        console.error("Erro na API ao cancelar reserva:", error);
        const errorMsg = error.response?.data?.detail || JSON.stringify(error.response?.data) || "Erro ao conectar com o servidor.";
        setFeedbackType('error');
        setFeedbackMsg(`Falha no cancelamento: ${errorMsg}`);
      } finally {
        setCanceling(false);
      }
    }
  };

  // FLUXO DE PAGAMENTO STRIPE (Passageiro)
  const handleFazerPagamento = async () => {
    if (!reservationId) return;

    setPagando(true);
    setFeedbackType(null);
    try {
      const sucesso = await StripePaymentServiceFront.executarPagamento(reservationId);
      if (sucesso) {
        setFeedbackType('success');
        setFeedbackMsg("Pagamento aprovado com sucesso!");
        clearFeedbackAfterDelay(() => {
          onClose();
          onSuccessCancel();
        });
      }
    } catch (error: any) {
      console.error("Erro no checkout:", error);
      const msg = error.response?.data?.error || error.message || "Não foi possível iniciar o pagamento.";
      setFeedbackType('error');
      setFeedbackMsg(`Erro: ${msg}`);
    } finally {
      setPagando(false);
    }
  };

  if (!ride || typeof ride !== 'object') return null;

  return (
    <Flex direction="column" gap="4">
      {/* 🌟 EXIBIÇÃO DE MENSAGENS EM TELA DENTRO DO MODAL */}
      <FeedbackBanner type={feedbackType} message={feedbackMsg} />

      <Flex direction='row' justifyContent='space-between'>
        <Flex className={css({ background: '#f0f7e5' })} padding='4px 10px' borderRadius='10px' gap='10px'>
          <Percent className={css({ color: '#547812', fontSize: '20px' })} />
          <Text color='special' weight="bold">#{ride.status?.toString().padStart(3, '0') || '000'}</Text>
        </Flex>
        <Text fontSize='20px' color='special' weight='bold'>R$ {ride.price || '0,00'}</Text>
      </Flex>
      
      <CardComponent 
        hasPadding={true}
        backgroundColor="transparent"
        direction='row'
        fullWidth={true}
        Image={
          <img src='https://i.pravatar.cc/150?img=47' alt="Motorista" className={css({ w: '50px', h: '50px', borderRadius: 'full' })} />
        }
        content={
          <Flex direction='column'>
            <Text weight="bold" color='primary'>Motorista Parceiro</Text>
            <Flex direction='row' alignItems="center" gap="1">
              <Star className={css({ color: '#f5a623', fontSize: '14px' })} />
              <Text size="sm" color="muted">4.9</Text>
            </Flex>
          </Flex>
        }
        extraContent={
          <VerifiedUser className={css({ color: '#547812' })} />
        }
      />

      <Flex direction="column" gap="2" mt="2">
        <Button 
          width='full' 
          onClick={() => {
            onClose(); 
            router.push(`/runs/monitoring?id=${ride.id}`);
          }} 
          className={css({ bg: '#3b82f6' })} 
        >
          <Text color='white' weight='bold'>Acompanhar Rota no Mapa</Text>
        </Button>

        {role === 'motorista' ? (
          <>
            {['pendente', 'confirmada'].includes(ride.status?.toLowerCase()) && (
              <>
                <Button 
                  width='full' 
                  onClick={() => handleUpdateRideStatus('em_andamento')} 
                  disabled={updatingStatus}
                  className={css({ bg: '#547812' })} 
                >
                  <Text color='white' weight='bold'>
                    {updatingStatus ? 'Iniciando...' : 'Começar Carona'}
                  </Text>
                </Button>

                <Button 
                  width='full' 
                  onClick={() => onEditClick(ride)} 
                  disabled={updatingStatus}
                  variant="outline"
                  className={css({ borderColor: 'primary' })}
                >
                  <Text color='primary' weight='bold'>Editar Detalhes</Text>
                </Button>
              </>
            )}

            {ride.status?.toLowerCase() === 'em_andamento' && (
              <Button 
                width='full' 
                onClick={() => handleUpdateRideStatus('finalizada')} 
                disabled={updatingStatus}
                className={css({ bg: 'red.500' })} 
              >
                <Text color='white' weight='bold'>
                  {updatingStatus ? 'Finalizando...' : 'Terminar Carona'}
                </Text>
              </Button>
            )}

            {['finalizada', 'cancelada'].includes(ride.status?.toLowerCase()) && (
              <Button width='full' disabled className={css({ bg: 'gray.200' })}>
                <Text color='muted' weight='bold'>
                  Carona {ride.status === 'finalizada' ? 'Finalizada' : 'Cancelada'}
                </Text>
              </Button>
            )}
          </>
        ) : (
          <>
            {ride.status?.toLowerCase() === 'finalizada' && reservationStatus === 'confirmada' && (
              <Button
                width="full"
                onClick={() => {
                  onClose(); 
                  if (onRatingClick) onRatingClick(item); 
                }}
                className={css({ bg: '#FFC107', _hover: { bg: '#FFA000' } })}
              >
                <Text color="white" weight="bold">⭐ Avaliar Motorista</Text>
              </Button>
            )}

            {!isAlreadyCanceled && reservationStatus === 'pendente' && (
              <Button
                width="full"
                onClick={handleFazerPagamento}
                disabled={pagando || isLocked || canceling}
                className={css({ bg: pagando || isLocked ? 'muted' : '#547812' })}
              >
                <Text color="white" weight='bold'>
                  {pagando ? 'Abrindo Pagamento...' : isLocked ? 'Carona Encerrada' : 'Fazer Pagamento'}
                </Text>
              </Button>
            )}

            <Button 
              width='full' 
              onClick={handleCancelParticipation}
              disabled={isAlreadyCanceled || canceling || isLocked || pagando}
              className={css({ 
                bg: isAlreadyCanceled || isLocked ? 'gray.100' : 'red.50', 
                border: '1px solid', 
                borderColor: isAlreadyCanceled || isLocked ? 'gray.300' : 'red.200' 
              })}
            >
              <Text color={isAlreadyCanceled || isLocked ? 'muted' : 'white'} weight='bold'>
                {canceling ? 'Cancelando...' : isAlreadyCanceled ? 'Reserva Já Cancelada' : isLocked ? 'Viagem em Andamento' : 'Cancelar Participação'}
              </Text>
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};

/* ====================================================
   CONTEÚDO DA PÁGINA (Isolado para suportar Suspense)
====================================================== */
function RunsContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const [activeTab, setActiveTab] = useState<TabType>('passageiro');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 🌟 ESTADOS PARA MENSAGENS DE FEEDBACK EXTERNAS (PAGAMENTO WEB RETORNO)
  const [screenFeedbackType, setScreenFeedbackType] = useState<'success' | 'error' | null>(null);
  const [screenFeedbackMsg, setScreenFeedbackMsg] = useState<string | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ reservationId: '', driverId: '', driverName: '' });

  const fetchItems = useCallback(async (pageNumber: number, tab: TabType) => {
    setLoading(true);
    try {
      const params: any = { page: pageNumber };
      let userId = null;

      try {
        const { value: token } = await SecureStoragePlugin.get({ key: 'access_token' });
        if (token) {
          const decoded: any = jwtDecode(token);
          userId = decoded.user_id;
        }
      } catch (storageError) {
        console.warn("Nenhum token encontrado no SecureStorage", storageError);
      }

      let response;
      if (tab === 'motorista') {
        if (userId) params.driver = userId;
        response = await RideService.getAll(params);
      } else {
        if (userId) params.passenger = userId;
        response = await ReservationService.getAll(params);
      }
      
      const newResults = response.data?.results || response.data || [];
      setHasMore(!!response.data?.next);
      setItems(prev => pageNumber === 1 ? newResults : [...prev, ...newResults]);
    } catch (error) {
      console.error("Erro ao carregar dados da API real:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadCurrentTab = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setItems([]);
    fetchItems(1, activeTab);
  }, [fetchItems, activeTab]);

  // ESCUTA RETORNO DO STRIPE WEB E CONFIRMA NO BACKEND
  useEffect(() => {
    const verificarPagamentoWeb = async () => {
      const paymentStatus = searchParams.get('payment');
      const reservationId = searchParams.get('res');

      if (paymentStatus === 'success' && reservationId) {
        try {
          await api.patch(`api/ride/reservations/${reservationId}/`, { status: 'confirmada' });
          setScreenFeedbackType('success');
          setScreenFeedbackMsg("Pagamento aprovado via Web com sucesso!");
          router.replace('/runs');
          reloadCurrentTab();
        } catch (error) {
          console.error("Erro ao confirmar reserva paga via web:", error);
        }
      } else if (paymentStatus === 'cancel') {
        setScreenFeedbackType('error');
        setScreenFeedbackMsg("O pagamento via web foi cancelado pelo usuário.");
        router.replace('/runs');
      }
      
      // Limpa a mensagem da tela após 4 segundos
      if (paymentStatus) {
        setTimeout(() => {
          setScreenFeedbackType(null);
          setScreenFeedbackMsg(null);
        }, 4000);
      }
    };

    verificarPagamentoWeb();
  }, [searchParams, router, reloadCurrentTab]);

  useEffect(() => {
    //eslint-disable-next-line
    reloadCurrentTab();
  }, [reloadCurrentTab]);

  useEffect(() => {
    if (page > 1) {
      //eslint-disable-next-line
      fetchItems(page, activeTab);
    }
  }, [page, fetchItems, activeTab]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return; 
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const openDetails = (item: any) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);
  
  const handleEditRedirect = (ride: any) => {
    closeModal();
    router.push(`/runs/create?edit=${ride.id}`);
  };

  return (
    <Flex direction='column' height='100%' bg="#f9f9f9">
      <FrameComponent
        actions={
          <Flex direction='row' width='100%' height='60px' background='#363636' alignItems='center' gap='10px' padding='6px' borderRadius='10px'>
            <Button 
              width='full' 
              variant={activeTab === 'passageiro' ? 'solid' : 'ghost'} 
              onClick={() => setActiveTab('passageiro')} 
              className={css({ color: activeTab === 'passageiro' ? 'white' : 'muted' })}
            >
              Passageiro
            </Button>
            <Button 
              width='full' 
              variant={activeTab === 'motorista' ? 'solid' : 'ghost'} 
              onClick={() => setActiveTab('motorista')} 
              className={css({ color: activeTab === 'motorista' ? 'white' : 'muted' })}
            >
              Motorista
            </Button>
          </Flex>
        }
      >
        <Flex direction="column" paddingY="4" gap="4">
          
          {/* 🌟 BANNER DE FEEDBACK PARA RETORNO DE SESSÕES WEB DO STRIPE */}
          <FeedbackBanner type={screenFeedbackType} message={screenFeedbackMsg} />

          {activeTab === 'motorista' && (
            <Button 
              onClick={() => router.push('/runs/create')}
              width="full"
              variant="outline"
              className={css({ border: '2px dashed', borderColor: '#547812', height: '60px' })}
            >
              <Add color="#547812"/> 
              <Text weight="bold" color='success'>Criar Nova Carona</Text>
            </Button>
          )}

          {items.length === 0 && !loading && (
            <Text color="muted" className={css({ textAlign: "center", mt: "4" })}>
              {activeTab === 'motorista' ? 'Você ainda não criou nenhuma carona.' : 'Você não está participando de nenhuma carona.'}
            </Text>
          )}

          {items.map((item, index) => {
            const isLastElement = items.length === index + 1;
            const rideData = activeTab === 'passageiro' ? item.ride : item;
            const displayStatus = activeTab === 'passageiro' ? item.status : item.status;

            if (!rideData || typeof rideData !== 'object') return null;

            const originStr = typeof rideData.origin === 'object' ? `${rideData.origin.city}, ${rideData.origin.state}` : rideData.origin;
            const destStr = typeof rideData.destination === 'object' ? `${rideData.destination.city}, ${rideData.destination.state}` : rideData.destination;

            return (
              <div 
                key={item.id} 
                ref={isLastElement ? lastElementRef : null}
                onClick={() => openDetails(item)} 
                className={css({ cursor: 'pointer' })}
              >
                <CardComponent
                  fullWidth
                  direction="row"
                  Image={<img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=150&fit=crop" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg', filter: displayStatus === 'cancelada' ? 'grayscale(100%)' : 'none' })} />}
                  content={<RouteDisplay title={`Viagem #${rideData.id?.toString().padStart(3, '0') || ''}`} origin={originStr} destination={destStr} />}
                  extraContent={
                    <Flex direction="column" alignItems="flex-end" gap="1">
                      <Text size="xs" weight="bold" color={displayStatus === 'em_andamento' || displayStatus === 'confirmada' ? 'success' : displayStatus === 'cancelada' ? 'danger' : 'muted'}>
                        {displayStatus?.toUpperCase()}
                      </Text>
                      {activeTab === 'passageiro' && (
                        <Text size="xs" color="muted">{item.requested_seats} vaga(s)</Text>
                      )}
                    </Flex>
                  }
                />
              </div>
            );
          })}

          {loading && (
            <Flex justify="center" py="4">
              <Text color="muted" weight="bold">Carregando viagens...</Text>
            </Flex>
          )}

        </Flex>
      </FrameComponent>

      {/* MODAL TRADICIONAL DE DETALHES DA VIAGEM */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={closeModal} 
        title={activeTab === 'motorista' ? 'Detalhes da Carona' : 'Detalhes da Reserva'}
      >
        {selectedItem && (
          <RideDetailsContent 
            item={selectedItem} 
            role={activeTab} 
            onClose={closeModal} 
            onEditClick={handleEditRedirect}
            onSuccessCancel={reloadCurrentTab}
            onRatingClick={(reservation) => {
              setRatingData({
                reservationId: reservation.id,
                driverId: reservation.ride?.vehicle?.user?.id || reservation.ride?.vehicle?.user || '',
                driverName: reservation.ride?.vehicle?.user?.name || 'Motorista Parceiro'
              });
              setShowRatingModal(true);
            }}
          />
        )}
      </Modal>

      {/* MODAL DE NOTAS INTERATIVO COMPLEMENTAR */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        reservationId={ratingData.reservationId}
        driverId={ratingData.driverId}
        driverName={ratingData.driverName}
        onSuccess={() => {
          setScreenFeedbackType('success');
          setScreenFeedbackMsg("Obrigado por avaliar o motorista parceiro!");
          reloadCurrentTab();
          setTimeout(() => {
            setScreenFeedbackType(null);
            setScreenFeedbackMsg(null);
          }, 3500);
        }}
      />

    </Flex>
  );
}

/* ====================================================
   EXPORT PRINCIPAL 
====================================================== */
export default function Runs() {
  return (
    <Suspense fallback={
      <Flex justify="center" align="center" height="100vh">
        <Text color="muted" weight="bold">Sincronizando viagens...</Text>
      </Flex>
    }>
      <RunsContent />
    </Suspense>
  );
}