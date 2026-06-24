"use client";

import { useState } from 'react';
import { Flex } from '../styled-system/jsx';
import { SearchComponent } from '../components/organisms';
import { Tune, WandStars } from '@material-symbols-svg/react';
import { Icon, Avatar } from '../components/atoms/presentation';
import { Text } from '../components/atoms/typography';
import { Button, IconButton } from '../components/atoms/action';
import { CardComponent } from '@/components/molecules';
import { css } from "../styled-system/css"; 
import Modal from '../components/fixed/Modal'; 
import RideSummary from '@/components/template/RideSummary';


import { PercentDiscount,VerifiedUser } from '@material-symbols-svg/react'

// 1. Importando o CarouselView no lugar do FrameComponent
import CarouselView from '../components/organisms/CarouselView'; // Ajuste a pasta se não for organisms

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Criando os cards das caronas para alimentar o carrossel
  const rideCards = [
    <CardComponent
  key="ride-1"
  direction='column'
  fullWidth={true} // <-- Adicione essa linha! Faz o card respeitar os 280px do Carousel
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
    <IconButton variant='detail' size='full' className={css({margin: '0.75rem'})}>
      <Text color='white'>Participar</Text>
    </IconButton>
  }
/>,
    // Duplicando o card para o carrossel ter o que rolar na tela
    <CardComponent
  key="ride-2"
  direction='column'
  fullWidth={true} // <-- Adicione essa linha! Faz o card respeitar os 280px do Carousel
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
    <IconButton variant='detail' size='full' className={css({margin: '0.75rem'})}>
      <Text color='white'>Participar</Text>
    </IconButton>
  }
/>,
<CardComponent
  key="ride-3"
  direction='column'
  fullWidth={true} // <-- Adicione essa linha! Faz o card respeitar os 280px do Carousel
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
      <IconButton variant='detail' size='full' className={css({margin: '0.75rem'})} onClick={() => setIsModalOpen(true)}>
      <Text color='white'>Participar</Text>
    </IconButton>
    </Flex>
  }
/>
  ];

  return (
    <Flex aria-roledescription='decorative' direction="column" gap="4">
     
      <SearchComponent 
        placeholder="Filtrar corridas..."
        showFilter={true}
        showAI={true}
        filterIcon={<Tune />}
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Kiwidi Express - Natal"
      >
        <Flex direction="column" gap="4" >
          
            <Flex direction='row' justifyContent='space-between' >
              <Flex className={css({background: '#f0f7e5'})} padding='4px 10px' borderRadius='10px' gap='10px'>
                <PercentDiscount color='#547812'/>
                <Text color='special'>#KIW-003</Text>
              </Flex>
              <Text fontSize='20px' color='special' weight='medium' >39,99</Text>
            </Flex>
            <CardComponent direction='row'
            Image={
            <Avatar src='/cliente.jpeg'>

            </Avatar>
          }
          content={
            <Flex direction='column'>
              <Text color='danger'>
                Mariana Kwidi
              </Text>
              <Flex direction='row'>
                <Text>4.9</Text>
              </Flex>
            </Flex>
          }
          extraContent={
            <VerifiedUser/>
          }
          >
              
            </CardComponent>

            <Button width='full'>
              <Text color='white' weight='bold'>
                Participar
              </Text>
            </Button>


          
        </Flex>
      </Modal>

    </Flex>
  );
}