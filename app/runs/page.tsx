"use client";

import { useState } from 'react';
import { Flex } from '@/styled-system/jsx';
import { css } from "@/styled-system/css"; 
import { Button } from '@/components/atoms/action';
import { FrameComponent } from "@/components/organisms";
import { Text } from '@/components/atoms/typography';
import { CardComponent } from '@/components/molecules';

// Importações de Ícones
import { Star, Edit, Group } from '@material-symbols-svg/react';

type TabType = 'passageiro' | 'motorista' | 'finalizados';

/* =========================================
   COMPONENTE AUXILIAR: TRAJETO VISUAL
   (Cria aquelas bolinhas ligadas por uma linha)
========================================= */
const RouteDisplay = ({ title, origin, destination }: { title: string, origin: string, destination: string }) => (
  <Flex direction="column" gap="1">
    <Text weight="bold" color="primary">{title}</Text>
    
    <Flex gap="2" alignItems="flex-start" mt="1">
      {/* Container das bolinhas e da linha vertical */}
      <Flex direction="column" alignItems="center" mt="1" width="10px">
        <div className={css({ w: '8px', h: '8px', borderRadius: 'full', border: '2px solid #8c8c8c', bg: 'white', zIndex: 1 })} />
        <div className={css({ w: '2px', h: '16px', bg: '#e2e8f0', my: '-2px' })} />
        <div className={css({ w: '8px', h: '8px', borderRadius: 'full', bg: '#1b1c1c', zIndex: 1 })} />
      </Flex>
      
      {/* Textos de Origem e Destino */}
      <Flex direction="column" gap="1">
        <Text size="sm" color="muted">{origin}</Text>
        <Text size="sm" color="muted">{destination}</Text>
      </Flex>
    </Flex>
  </Flex>
);

/* =========================================
   ABAS DE CONTEÚDO
========================================= */

const PassageiroContent = () => {
  return (
    <Flex direction="column" gap="4" width="100%">
      
      {/* Card 1: Confirmado */}
      <CardComponent
        fullWidth
        direction="row"
        Image={<img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=150&fit=crop" alt="Van" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg' })} />}
        content={
          <RouteDisplay title="Kiwidi Express S01" origin="Pau dos Ferros" destination="Rafael Fernandes" />
        }
        extraContent={
          <Text size="xs" weight="bold" color="success">CONFIRMADO</Text>
        }
      />

      {/* Card 2: Recusado (Imagem Preto e Branco) */}
      <CardComponent
        fullWidth
        direction="row"
        Image={<img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=150&fit=crop&grayscale" alt="Van" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg', filter: 'grayscale(100%)' })} />}
        content={
          <RouteDisplay title="Kiwidi Express S01" origin="Pau dos Ferros" destination="Rafael Fernandes" />
        }
        extraContent={
          <Text size="xs" weight="bold" color="danger">RECUSADO</Text>
        }
      />

      {/* Card 3: Pendente */}
      <CardComponent
        fullWidth
        direction="row"
        Image={<img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&h=150&fit=crop" alt="Van" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg' })} />}
        content={
          <RouteDisplay title="Kiwidi Express S01" origin="Pau dos Ferros" destination="Rafael Fernandes" />
        }
        extraContent={
          <Text size="xs" weight="bold" css={{ color: '#f5a623' }}>PENDENTE</Text>
        }
      />

    </Flex>
  );
};

const MotoristaContent = () => {
  return (
    <Flex direction="column" gap="4" width="100%">
      
      {/* Wrapper do Cartão do Motorista */}
      <div className={css({ bg: 'white', borderRadius: '14px', border: '1px solid', borderColor: 'gray.200', p: '4', boxShadow: 'sm' })}>
        
        {/* HEADER DO CARTÃO: Lógica idêntica ao FrameComponent (Título à esquerda, Ações à direita) */}
        <Flex justifyContent="space-between" alignItems="center" mb="4" borderBottom="1px solid" borderColor="gray.100" paddingBottom="3">
          
          <Text weight="bold" color="primary" size="lg">Mossoró ➔ Pau dos Ferros</Text>
          
          <Flex gap="2">
            <Button variant="ghost" className={css({ height: '8', px: '3', bg: '#fff8f0', color: '#c26d00', gap: '1', fontSize: 'xs' })}>
              <Edit className={css({ fontSize: '16px' })} /> Editar
            </Button>
            <Button variant="ghost" className={css({ height: '8', px: '3', bg: '#eff6ff', color: '#2563eb', gap: '1', position: 'relative', fontSize: 'xs' })}>
              <Group className={css({ fontSize: '16px' })} /> Solicitações
              <div className={css({ position: 'absolute', top: '-6px', right: '-6px', bg: 'red.500', color: 'white', w: '4', h: '4', borderRadius: 'full', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' })}>
                2
              </div>
            </Button>
          </Flex>

        </Flex>

        {/* CONTEÚDO PRINCIPAL (Children do Cartão) */}
        <CardComponent
          fullWidth
          direction="row"
          hasPadding={false}
          backgroundColor="transparent"
          Image={<img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=150&h=150&fit=crop" alt="Estrada" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg' })} />}
          content={
            <Flex direction="column" gap="2" width="100%">
              {/* Reaproveitando o RouteDisplay que criamos na etapa anterior */}
              <RouteDisplay title="Pontos de Parada" origin="Mossoró" destination="Pau dos Ferros" />
              
              <Flex justifyContent="space-between" alignItems="center" mt="2">
                <Flex>
                  <img src="https://i.pravatar.cc/150?img=11" className={css({ w: '24px', h: '24px', borderRadius: 'full', border: '2px solid white' })} />
                  <img src="https://i.pravatar.cc/150?img=5" className={css({ w: '24px', h: '24px', borderRadius: 'full', border: '2px solid white', ml: '-10px' })} />
                  <div className={css({ w: '24px', h: '24px', borderRadius: 'full', border: '2px solid white', ml: '-10px', bg: 'gray.200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' })}>+2</div>
                </Flex>
                <Text size="sm" color="muted">4/6 vagas</Text>
              </Flex>
            </Flex>
          }
          extraContent={
            <Text size="xs" weight="bold" color="success">ATIVA</Text>
          }
        />
      </div>

    </Flex>
  );
};

const FinalizadosContent = () => {
  return (
    <Flex direction="column" gap="4" width="100%">
      
      {/* Card Finalizado: Avaliação */}
      <CardComponent
        fullWidth
        direction="row"
        Image={<img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=150&h=150&fit=crop&grayscale" alt="Carro na estrada" className={css({ w: '80px', h: '80px', objectFit: 'cover', borderRadius: 'lg' })} />}
        content={
          <Flex direction="column" gap="1">
            <Text weight="bold" color="primary">Natal ➔ Mossoró</Text>
            <Text size="sm" color="muted">Viagem Finalizada</Text>
            
            {/* Estrelas */}
            <Flex gap="1" mt="1">
              {[1, 2, 3, 4].map(i => <Star key={i} className={css({ color: '#f5a623', fontSize: '16px' })} />)}
              <Star className={css({ color: '#e2e8f0', fontSize: '16px' })} /> {/* Estrela vazia/cinza */}
            </Flex>
          </Flex>
        }
        extraContent={
          <Text size="sm" color="muted">12 Out</Text>
        }
      />

    </Flex>
  );
};


/* =========================================
   COMPONENTE PRINCIPAL
========================================= */

export default function Runs() {
  const [activeTab, setActiveTab] = useState<TabType>('passageiro');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'passageiro': return <PassageiroContent />;
      case 'motorista': return <MotoristaContent />;
      case 'finalizados': return <FinalizadosContent />;
      default: return null;
    }
  };

  return (
    <Flex direction='column' height='100%' bg="#f9f9f9">
      <FrameComponent
        actions={
          <Flex 
            direction='row' 
            width='100%' 
            height='60px' 
            background='#363636' 
            alignItems='center' 
            gap='10px' 
            padding='6px' 
            borderRadius='10px'
          >
            {/* Atualizado para variant='solid' e 'ghost' conforme instrução */}
            <Button 
              width='full' 
              variant={activeTab === 'passageiro' ? 'solid' : 'ghost'}
              onClick={() => setActiveTab('passageiro')}
              className={css({ color: activeTab === 'passageiro' ? 'white' : 'gray.400' })}
            >
              Passageiro
            </Button>
            
            <Button 
              width='full' 
              variant={activeTab === 'motorista' ? 'solid' : 'ghost'}
              onClick={() => setActiveTab('motorista')}
              className={css({ color: activeTab === 'motorista' ? 'white' : 'gray.400' })}
            >
              Motorista
            </Button>
            
            <Button 
              width='full' 
              variant={activeTab === 'finalizados' ? 'solid' : 'ghost'}
              onClick={() => setActiveTab('finalizados')}
              className={css({ color: activeTab === 'finalizados' ? 'white' : 'gray.400' })}
            >
              Finalizados 
            </Button>
          </Flex>
        }
      >
        <Flex direction="column" paddingY="4">
          {renderTabContent()}
        </Flex>
      </FrameComponent>
    </Flex>
  );
}