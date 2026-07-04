"use client";

import { useState ,useEffect} from 'react';
import { Flex } from '@/styled-system/jsx';
import { SearchComponent } from '@/components/organisms';
import { Tune, WandStars, PercentDiscount, VerifiedUser } from '@material-symbols-svg/react';
import { Icon, Avatar } from '@/components/atoms/presentation';
import { Text } from '@/components/atoms/typography';
import { Button, IconButton } from '@/components/atoms/action';
import { CardComponent } from '@/components/molecules';
import { css } from "@/styled-system/css"; 
import Modal from '@/components/fixed/Modal'; 
import RideSummary from '@/components/template/RideSummary';
import CarouselView from '@/components/organisms/CarouselView'; 
import { SearchFilterForm } from '@/components/template/SearchFilterForm'
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { useRouter } from 'next/navigation';

type ModalType = 'none' | 'filter' | 'ride_details';

// 2. Extraímos o conteúdo antigo do Modal para um componente limpo e isolado
const RideDetailsContent = ({ onClose }: { onClose: () => void }) => {
  return (
    <Flex direction="column" gap="4">
      <Flex direction='row' justifyContent='space-between'>
        <Flex className={css({background: '#f0f7e5'})} padding='4px 10px' borderRadius='10px' gap='10px'>
          <PercentDiscount color='#547812'/>
          <Text color='special'>#KIW-003</Text>
        </Flex>
        <Text fontSize='20px' color='special' weight='medium'>39,99</Text>
      </Flex>
      
      <CardComponent 
        direction='row'
        Image={
          <Avatar src='/cliente.jpeg' />
        }
        content={
          <Flex direction='column'>
            <Text color='danger'>Mariana Kwidi</Text>
            <Flex direction='row'>
              <Text>4.9</Text>
            </Flex>
          </Flex>
        }
        extraContent={
          <VerifiedUser/>
        }
      />

      <Button width='full' onClick={onClose}>
        <Text color='white' weight='bold'>Participar</Text>
      </Button>
    </Flex>
  );
};

export default function Dashboard() {
  // 3. O estado agora guarda "qual" modal está aberto, e não apenas se está aberto
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  const closeModal = () => setActiveModal('none');

  const rideCards = [
    <CardComponent
      key="ride-1"
      direction='column'
      fullWidth={true}
      hasPadding={false}
      Image={<img src='trajeto.png' alt="Trajeto" className={css({ height: '118px', w: '100%', maxH: '118px', objectFit: 'cover'})} />}
      content={
        <RideSummary 
          title="Kiwidi Express - Mossoró"
          seats="4/6 lugares"
          price="R$ 49,99"
          origin="Pau dos Ferros"
          destination="Rafael Fernandes"
        />
      }
      extraContent={
        <Flex>
          <IconButton 
            variant='detail' 
            size='full' 
            className={css({margin: '0.75rem'})} 
            onClick={() => setActiveModal('ride_details')}
          >
            <Text color='white'>Participar</Text>
          </IconButton>
        </Flex>
      }
    />,
    
    
    <CardComponent
      key="ride-3"
      direction='column'
      fullWidth={true}
      hasPadding={false}
      Image={<img src='trajeto.png' alt="Trajeto" className={css({ height: '118px', w: '100%', maxH: '118px', objectFit: 'cover'})} />}
      content={
        <RideSummary 
          title="Kiwidi Express - Mossoró"
          seats="4/6 lugares"
          price="R$ 49,99"
          origin="Pau dos Ferros"
          destination="Rafael Fernandes"
        />
      }
      extraContent={
        <Flex>
          <IconButton 
            variant='detail' 
            size='full' 
            className={css({margin: '0.75rem'})} 
            onClick={() => setActiveModal('ride_details')}
          >
            <Text color='white'>Participar</Text>
          </IconButton>
        </Flex>
      }
    />
  ];

  const getModalTitle = () => {
    if (activeModal === 'filter') return 'Filtros de Pesquisa';
    if (activeModal === 'ride_details') return 'Kiwidi Express - Natal';
    return '';
  };
  const router = useRouter();
  return (
    <Flex aria-roledescription='decorative' direction="column" gap="4">
     
      <SearchComponent 
        placeholder="De {Origem} para {Destino}..."
        showFilter={true}
        showAI={true}
        filterIcon={<Tune />}
        // 6. Você precisará garantir que o SearchComponent receba e dispare essa prop ao clicar no ícone Tune
        onFilterClick={() => setActiveModal('filter')} 
      />

      <CarouselView
        titleElements={
          <Flex direction="row" align="center" gap="2">
            <Icon size='lg'>✨</Icon>
            <Text weight='bold' size='lg'>Pensado para você</Text>
          </Flex>
        }
        items={rideCards}
      />

      {/* 7. O Modal agora reage ao estado dinâmico e injeta o conteúdo correspondente */}
      <Modal 
        isOpen={activeModal !== 'none'} 
        onClose={closeModal}
        title={getModalTitle()}
      >
        {activeModal === 'filter' && (
          <SearchFilterForm />
        )}

        {activeModal === 'ride_details' && (
          <RideDetailsContent onClose={closeModal} />
        )}
      </Modal>

    </Flex>
  );
}