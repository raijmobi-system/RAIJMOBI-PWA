"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flex } from '@/styled-system/jsx';
import { css } from "@/styled-system/css"; 

// Importação das Ferramentas Nativas do Capacitor + JWT
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { jwtDecode } from "jwt-decode";

// Componentes do seu Sistema
import { Button } from '@/components/atoms/action';
import { FrameComponent } from "@/components/organisms";
import { Text } from '@/components/atoms/typography';
import { CardComponent } from '@/components/molecules';
import Modal from "@/components/fixed/Modal";

// Serviço da API Real
import { RideService } from '@/services/ride/rideService';

// Ícones do Material Symbols (Corrigido para usar LocationOn)
import { 
  Star, 
  Group, 
  Percent, 
  VerifiedUser,
  Add,
  LocationOn
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
   COMPONENTE: CONTEÚDO DE DETALHES DA CARONA
========================================= */
interface RideDetailsProps {
  ride: any;
  role: 'motorista' | 'passageiro';
  onClose: () => void;
  onEditClick: (ride: any) => void;
}

const RideDetailsContent = ({ ride, role, onClose, onEditClick }: RideDetailsProps) => {
  const isLocked = ['em_andamento', 'finalizada'].includes(ride.status);

  const handleCancelParticipation = () => {
    const confirm = window.confirm("Deseja realmente cancelar sua participação nesta carona?");
    if (confirm) {
      // TODO: Conectar com o seu ReservationService no futuro se necessário
      alert("Participação cancelada.");
      onClose();
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Flex direction='row' justifyContent='space-between'>
        <Flex className={css({ background: '#f0f7e5' })} padding='4px 10px' borderRadius='10px' gap='10px'>
          <Percent className={css({ color: '#547812', fontSize: '20px' })} />
          <Text color='special' weight="bold">#{ride.id?.toString().padStart(3, '0') || '000'}</Text>
        </Flex>
        <Text fontSize='20px' color='special' weight='bold'>R$ {ride.price || '0,00'}</Text>
      </Flex>
      
      {/* Exibição do Dono da Carona / Detalhes Visuais */}
      <CardComponent 
        hasPadding={false}
        backgroundColor="transparent"
        direction='row'
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
          <VerifiedUser className={css({ color: '#3182ce' })} />
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
            className={css({ bg: 'red.50', border: '1px solid', borderColor: 'red.200' })}
          >
            <Text color='danger' weight='bold'>Cancelar Participação</Text>
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

/* =========================================
   PÁGINA PRINCIPAL: HISTÓRICO DE CORRIDAS
========================================= */
export default function Runs() {
  const router = useRouter();
  
  // Estados de controle de abas e modais
  const [activeTab, setActiveTab] = useState<TabType>('passageiro');
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  
  // Estados do Infinite Scroll
  const [rides, setRides] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ==========================================
  // FUNÇÃO DE CONEXÃO COM A API PAGINADA
  // ==========================================
  const fetchRides = async (pageNumber: number, tab: TabType) => {
    setLoading(true);
    try {
      const params: any = { page: pageNumber };

      // Se estiver na aba motorista, descriptografa o token do Capacitor para buscar o ID real
      if (tab === 'motorista') {
        try {
          const { value: token } = await SecureStoragePlugin.get({ key: 'access_token' });
          if (token) {
            const decoded: any = jwtDecode(token);
            params.driver = decoded.user_id; // Passa o UUID dinâmico para o filtro do Django
          }
        } catch (storageError) {
          console.warn("Nenhum token encontrado no SecureStorage do Capacitor", storageError);
        }
      } 

      // Chama o endpoint real de listagem
      const response = await RideService.getAll(params);
      
      const newRides = response.data?.results || response.data || [];
      
      // Controla se o Django possui mais páginas a serem carregadas
      setHasMore(!!response.data?.next);

      // Agrupa os resultados dependendo da página solicitada
      setRides(prev => pageNumber === 1 ? newRides : [...prev, ...newRides]);

    } catch (error) {
      console.error("Erro ao buscar caronas do servidor:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para resetar os estados e recomeçar a busca limpa quando trocar de aba
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setRides([]);
    fetchRides(1, activeTab);
  }, [activeTab]);

  // Efeito disparado na rolagem contínua para buscar as próximas páginas
  useEffect(() => {
    if (page > 1) {
      fetchRides(page, activeTab);
    }
  }, [page]);

  // ==========================================
  // APURAÇÃO DO INTERSECTION OBSERVER (NATIVO)
  // ==========================================
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return; 
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1); // Passa para a próxima página do Django
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Negação de Modais e Fluxo de Navegação
  const openDetails = (ride: any) => setSelectedRide(ride);
  const closeModal = () => setSelectedRide(null);
  
  const handleEditRedirect = (ride: any) => {
    closeModal();
    router.push(`/runs/create?edit=${ride.id}`); // Redireciona passando o ID da PK para a página híbrida
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
          
          {/* BOTÃO DE REDIRECIONAMENTO DE CRIAÇÃO (Exclusivo Motorista) */}
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

          {/* ESTADO VAZIO */}
          {rides.length === 0 && !loading && (
            <Text color="muted" css={{ textAlign: "center", mt: "4" }}>Nenhuma carona encontrada.</Text>
          )}

          {/* CONTEÚDO MAPRADO EM CARDS */}
          {rides.map((ride, index) => {
            const isLastElement = rides.length === index + 1;
            
            // Tratamento defensivo para renderizar as strings de endereço vindas do JSONField
            const originStr = typeof ride.origin === 'object' ? `${ride.origin.city}, ${ride.origin.state}` : ride.origin;
            const destStr = typeof ride.destination === 'object' ? `${ride.destination.city}, ${ride.destination.state}` : ride.destination;

            return (
              <div 
                key={ride.id} 
                ref={isLastElement ? lastElementRef : null} // O observer monitora a visibilidade deste item
                onClick={() => openDetails(ride)} 
                className={css({ cursor: 'pointer' })}
              >
                <CardComponent
                  fullWidth
                  direction="row"
                  Image={<img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=150&fit=crop" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg', filter: ride.status === 'cancelada' ? 'grayscale(100%)' : 'none' })} />}
                  content={<RouteDisplay title={`Viagem #${ride.id?.toString().padStart(3, '0') || ''}`} origin={originStr} destination={destStr} />}
                  extraContent={
                    <Text size="xs" weight="bold" color={ride.status === 'em_andamento' ? 'success' : 'danger'}>
                      {ride.status.toUpperCase()}
                    </Text>
                  }
                />
              </div>
            );
          })}

          {/* RETORNO VISUAL DE CARREGAMENTO */}
          {loading && (
            <Flex justify="center" py="4">
              <Text color="muted" weight="bold">Carregando viagens...</Text>
            </Flex>
          )}

        </Flex>
      </FrameComponent>

      {/* MODAL GLOBAL DE DETALHES DE CARONA */}
      <Modal isOpen={!!selectedRide} onClose={closeModal} title="Detalhes da Carona">
        {selectedRide && (
          <RideDetailsContent 
            ride={selectedRide} 
            role={activeTab === 'motorista' ? 'motorista' : 'passageiro'} 
            onClose={closeModal} 
            onEditClick={handleEditRedirect}
          />
        )}
      </Modal>

    </Flex>
  );
}