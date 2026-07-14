"use client";

import { Flex } from "@/styled-system/jsx";
import { css } from "@/styled-system/css";
import { Text } from "@/components/atoms/typography";

interface SegmentedControlProps {
  activeTab: 'passenger' | 'driver';
  onTabChange: (tab: 'passenger' | 'driver') => void;
}

export default function SegmentedControl({ activeTab, onTabChange }: SegmentedControlProps) {
  return (
    <Flex 
      direction="row" 
      gap="1" 
      className={css({
        background: 'gray.800',
        padding: '1.5',
        borderRadius: 'xl',
        width: '100%', // Ocupa o lado esquerdo do seu header do Frame
        maxWidth: '320px' // Limita para não esticar demais em telas maiores
      })}
    >
      <button
        onClick={() => onTabChange('passenger')}
        className={css({
          flex: '1',
          padding: '2.5',
          borderRadius: 'lg',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          background: activeTab === 'passenger' ? 'brand.main' : 'transparent',
          color: activeTab === 'passenger' ? 'white' : 'gray.400',
        })}
      >
        <Text weight={activeTab === 'passenger' ? 'bold' : 'medium'} size='md'>
          Passageiro
        </Text>
      </button>

      <button
        onClick={() => onTabChange('driver')}
        className={css({
          flex: '1',
          padding: '2.5',
          borderRadius: 'lg',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          background: activeTab === 'driver' ? 'brand.main' : 'transparent',
          color: activeTab === 'driver' ? 'white' : 'gray.400',
        })}
      >
        <Text weight={activeTab === 'driver' ? 'bold' : 'medium'} size='md'>
          Motorista
        </Text>
      </button>
    </Flex>
  );
}