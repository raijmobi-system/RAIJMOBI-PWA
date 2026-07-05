"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flex } from '@/styled-system/jsx';
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

// Serviços Reais da API
import { RideService } from '@/services/ride/rideService';
import { ReservationService } from '@/services/ride/reservationService';

// Ícones do Material Symbols
import { 
  Star, 
  Percent, 
  VerifiedUser,
  Add,
} from '@material-symbols-svg/react';

type TabType = 'passageiro' | 'motorista';

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
}

const RideDetailsContent = ({ item, role, onClose, onEditClick, onSuccessCancel }: RideDetailsProps) => {
  const [canceling, setCanceling] = useState(false);

  // Na aba passageiro, os dados visuais da carona estão dentro de item.ride (objeto)
  const ride = role === 'passageiro' ? item.ride : item;
  const reservationId = role === 'passageiro' ? item.id : null;
  const reservationStatus = role === 'passageiro' ? item.status : null;

  const isLocked = ['em_andamento', 'finalizada'].includes(ride?.status);
  const isAlreadyCanceled = reservationStatus === 'cancelada';

  // EXECUÇÃO REAL NA API VIA PATCH
  const handleCancelParticipation = async () => {
    if (!reservationId) return;
    
    const confirm = window.confirm("Deseja realmente cancelar sua participação nesta carona? Suas vagas serão liberadas no sistema.");
    
    if (confirm) {
      setCanceling(true);
      try {
        // Envia requisição real PATCH para /api/ride/reservations/{id}/ com { status: 'cancelada' }
        await ReservationService.updateStatus(String(reservationId), 'cancelada');
        alert("Participação cancelada com sucesso!");
        onClose();
        onSuccessCancel(); // Recarrega os dados diretamente da API
      } catch (error: any) {
        console.error("Erro real na API ao cancelar reserva:", error);
        const errorMsg = error.response?.data?.detail || JSON.stringify(error.response?.data) || "Erro ao conectar com o servidor.";
        alert(`Falha no cancelamento: ${errorMsg}`);
      } finally {
        setCanceling(false);
      }
    }
  };

  if (!ride || typeof ride !== 'object') return null;

  return (
    <Flex direction="column" gap="4">
      <Flex direction='row' justifyContent='space-between'>
        <Flex className={css({ background: '#f0f7e5' })} padding='4px 10px' borderRadius='10px' gap='10px'>
          <Percent className={css({ color: '#547812', fontSize: '20px' })} />
          <Text color='special' weight="bold">#{ride.id?.toString().padStart(3, '0') || '000'}</Text>
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
        {role === 'motorista' ? (
          <Button 
            width='full' 
            onClick={() => onEditClick(ride)} 
            disabled={isLocked}
            className={css({ bg: isLocked ? 'muted' : 'primary' })}
          >
            <Text color={isLocked ? 'muted' : 'white'} weight='bold'>
              {isLocked ? 'Carona Bloqueada para Edição' : 'Editar Carona'}
            </Text>
          </Button>
        ) : (
          <Button 
            width='full' 
            onClick={handleCancelParticipation}
            disabled={isAlreadyCanceled || canceling || isLocked}
            className={css({ 
              bg: isAlreadyCanceled || isLocked ? 'gray.100' : 'red.50', 
              border: '1px solid', 
              borderColor: isAlreadyCanceled || isLocked ? 'gray.300' : 'red.200' 
            })}
          >
            <Text color={isAlreadyCanceled || isLocked ? 'muted' : 'white'} weight='bold'>
              {canceling ? 'Cancelando no servidor...' : isAlreadyCanceled ? 'Reserva Já Cancelada' : isLocked ? 'Viagem em Andamento' : 'Cancelar Participação'}
            </Text>
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

/* =========================================
   PÁGINA PRINCIPAL: RUNS (INTEGRAÇÃO API)
========================================= */
export default function Runs() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>('passageiro');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // BUSCA REAL NAS ROTAS DO DJANGO VIA AXIOS INTERCEPTOR
  const fetchItems = async (pageNumber: number, tab: TabType) => {
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
        // Consulta real: GET /api/ride/rides/?driver={userId}
        if (userId) params.driver = userId;
        response = await RideService.getAll(params);
      } else {
        // Consulta real: GET /api/ride/reservations/?passenger={userId}
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
  };

  const reloadCurrentTab = () => {
    setPage(1);
    setHasMore(true);
    setItems([]);
    fetchItems(1, activeTab);
  };

  useEffect(() => {
    reloadCurrentTab();
  }, [activeTab]);

  useEffect(() => {
    if (page > 1) {
      fetchItems(page, activeTab);
    }
  }, [page]);

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
          
          {activeTab === 'motorista' && (
            <Button 
              onClick={() => router.push('/runs/create')}
              width="full"
              variant="outline"
              className={css({ border: '2px dashed', borderColor: 'primary', height: '60px' })}
            >
              <Add color="#547812"/> 
              <Text weight="bold" color='primary'>Criar Nova Carona</Text>
            </Button>
          )}

          {items.length === 0 && !loading && (
            <Text color="muted" css={{ textAlign: "center", mt: "4" }}>
              {activeTab === 'motorista' ? 'Você ainda não criou nenhuma carona.' : 'Você não está participando de nenhuma carona.'}
            </Text>
          )}

          {items.map((item, index) => {
            const isLastElement = items.length === index + 1;
            
            // Na aba de passageiros, a viagem real vem em item.ride
            const rideData = activeTab === 'passageiro' ? item.ride : item;
            const displayStatus = activeTab === 'passageiro' ? item.status : item.status;

            // Evita erro visual caso a API retorne apenas uma string UUID em vez de objeto populado
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

      <Modal isOpen={!!selectedItem} onClose={closeModal} title={activeTab === 'motorista' ? "Detalhes da Carona" : "Detalhes da Reserva"}>
        {selectedItem && (
          <RideDetailsContent 
            item={selectedItem} 
            role={activeTab} 
            onClose={closeModal} 
            onEditClick={handleEditRedirect}
            onSuccessCancel={reloadCurrentTab}
          />
        )}
      </Modal>

    </Flex>
  );
}