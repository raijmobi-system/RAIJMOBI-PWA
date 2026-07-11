"use client";

import { useState, useEffect } from 'react';
import { Flex } from '@/styled-system/jsx';
import { SearchComponent } from '@/components/organisms';
import { Tune, PercentDiscount, VerifiedUser } from '@material-symbols-svg/react';
import { Icon, Avatar } from '@/components/atoms/presentation';
import { Text } from '@/components/atoms/typography';
import { Button, IconButton } from '@/components/atoms/action';
import { CardComponent } from '@/components/molecules';
import { css } from "@/styled-system/css"; 
import Modal from '@/components/fixed/Modal'; 
import RideSummary from '@/components/template/RideSummary';
import CarouselView from '@/components/organisms/CarouselView'; 
import { SearchFilterForm } from '@/components/template/SearchFilterForm';
import { useRouter } from 'next/navigation';

import { RideService } from '@/services/ride/rideService';
import { Ride } from '@/types/apiType';

type ModalType = 'none' | 'filter' | 'ride_details';

export default function Dashboard() {
  const router = useRouter();
  
  // Estados para Controle de Modais
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Estados para as Recomendações da IA (Carrossel)
  const [recommendations, setRecommendations] = useState<Ride[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Estados para a Pesquisa (IA ou Filtro Convencional)
  const [searchResults, setSearchResults] = useState<Ride[] | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const closeModal = () => setActiveModal('none');

  // ==========================================
  // 1. CARREGAR RECOMENDAÇÕES (ON MOUNT)
  // ==========================================
 // ==========================================
  // 1. CARREGAR RECOMENDAÇÕES DA IA (ON MOUNT)
  // ==========================================
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const response = await RideService.getRecommendations(5);
        
        // 🌟 DEBUG: Olhe no console do navegador (F12) o que chegou exatamente
        console.log("👉 Resposta bruta da API:", response);
        console.log("👉 Dados recebidos (response.data):", response.data);

        // Se response.data for um array direto, usa ele. Se for um objeto com .results, extrai!
        const recsArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any)?.results || [];

        console.log("👉 Array final que vai para a tela:", recsArray);
        setRecommendations(recsArray);
      } catch (error) {
        console.error("❌ Erro ao buscar recomendações da IA:", error);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, []);
  // ==========================================
  // 2. FUNÇÃO DE PESQUISA INTELIGENTE (IA FILTER)
  // ==========================================
  const handleAISearch = async (text: string) => {
    if (!text.trim()) {
      setSearchResults(null);
      return;
    }

    setLoadingSearch(true);
    try {
      const response = await RideService.aiFilter(text);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Erro ao buscar caronas com filtro IA:", error);
      alert("Não foi possível processar sua pesquisa. Tente novamente.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // ==========================================
  // 3. FUNÇÃO PARA FILTROS TRADICIONAIS (MODAL)
  // ==========================================
  const handleAppliedFilters = async (formFilters: any) => {
    setLoadingSearch(true);
    closeModal();

    try {
      const response = await RideService.getAll(formFilters);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Erro ao aplicar filtros tradicionais:", error);
      alert("Erro ao aplicar os filtros de busca.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // ==========================================
  // FUNÇÃO AUXILIAR PARA FORMATAR LOCALIZAÇÃO
  // ==========================================
  const formatLocation = (loc: any) => {
    if (!loc) return 'Desconhecido';
    if (typeof loc === 'string') return loc; // Se já for texto, retorna como está
    const parts = [loc.city, loc.state].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : (loc.address || 'Local não especificado');
  };

  // ==========================================
  // RENDERIZADOR DINÂMICO DE CARDS
  // ==========================================
  const renderRideCards = (rides: Ride[]) => {
    if (rides.length === 0) {
      return [<Text key="empty" color="muted">Nenhuma carona encontrada.</Text>];
    }

    return rides.map((ride: any) => {
      // Converte os objetos {city, state} em string legível
      const originText = formatLocation(ride.origin);
      const destText = formatLocation(ride.destination);

      return (
        <CardComponent
          key={ride.id}
          direction='column'
          fullWidth={true}
          hasPadding={false}
          Image={<img src='/trajeto.png' alt="Trajeto" className={css({ height: '118px', w: '100%', maxH: '118px', objectFit: 'cover'})} />}
          content={
            <RideSummary 
              title={`Para ${destText}`}
              seats={`${ride.available_seats} vagas livres`}
              price={`R$ ${ride.price}`}
              origin={originText}
              destination={destText}
            />
          }
          extraContent={
            <Flex>
              <IconButton 
                variant='detail' 
                size='full' 
                className={css({margin: '0.75rem'})} 
                onClick={() => {
                  setSelectedRide(ride);
                  setActiveModal('ride_details');
                }}
              >
                <Text color='white'>Participar</Text>
              </IconButton>
            </Flex>
          }
        />
      );
    });
  };

  const getModalTitle = () => {
    if (activeModal === 'filter') return 'Filtros de Pesquisa';
    if (activeModal === 'ride_details' && selectedRide) {
      return `Para ${formatLocation(selectedRide.destination)}`;
    }
    return '';
  };

  return (
    <Flex aria-roledescription='decorative' direction="column" gap="4">
      
      <SearchComponent 
        placeholder="Descreva a carona que precisa..."
        showFilter={true}
        showAI={true}
        filterIcon={<Tune />}
        onFilterClick={() => setActiveModal('filter')}
        onChange={(e: any) => setSearchText(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') handleAISearch(searchText);
        }}
      />

      {/* ÁREA DE RESULTADOS DA PESQUISA (IA OU TRADICIONAL) */}
      {searchResults !== null && (
        <Flex direction="column" gap="4" mt="4">
          <Flex direction="row" justifyContent="space-between" align="center">
            <Text weight="bold" size="lg">Resultados da Busca</Text>
            <Button variant="ghost" size="sm" onClick={() => setSearchResults(null)}>
              <Text color="special" size="sm">Limpar Resultados</Text>
            </Button>
          </Flex>
          
          {loadingSearch ? (
            <Text color="muted">Buscando as melhores opções...</Text>
          ) : (
            <Flex direction="column" gap="4">
              {renderRideCards(searchResults)}
            </Flex>
          )}
        </Flex>
      )}

      {/* CARROSSEL DE RECOMENDAÇÕES (Oculto se houver busca ativa) */}
      {searchResults === null && (
        <CarouselView
          titleElements={
            <Flex direction="row" align="center" gap="2">
              <Icon size='lg'>✨</Icon>
              <Text weight='bold' size='lg'>Pensado para você</Text>
            </Flex>
          }
          items={loadingRecs ? [<Text key="loading">Gerando recomendações IA...</Text>] : renderRideCards(recommendations)}
        />
      )}

      {/* MODAL DE DETALHES OU FILTRO */}
      <Modal 
        isOpen={activeModal !== 'none'} 
        onClose={closeModal}
        title={getModalTitle()}
      >
        {activeModal === 'filter' && (
          <SearchFilterForm 
            onClose={closeModal} 
            onApplyFilters={handleAppliedFilters} 
          />
        )}

        {activeModal === 'ride_details' && selectedRide && (
          <Flex direction="column" gap="4">
            <Flex direction='row' justifyContent='space-between'>
              <Flex className={css({background: '#f0f7e5'})} padding='4px 10px' borderRadius='10px' gap='10px'>
                <PercentDiscount color='#547812'/>
                <Text color='special'>ID teste</Text>
              </Flex>
              <Text fontSize='20px' color='special' weight='medium'>{selectedRide.price}</Text>
            </Flex>
            
            <CardComponent 
              direction='row'
              Image={<Avatar src='/cliente.jpeg' />}
              content={
                <Flex direction='column'>
                  <Text color='danger'>Ver Detalhes do Motorista</Text>
                </Flex>
              }
              extraContent={<VerifiedUser/>}
            />

            <Button width='full' onClick={() => alert("Chamar fluxo de Pagamento/Reserva")}>
              <Text color='white' weight='bold'>Participar</Text>
            </Button>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
}