// FilterCard.tsx
import { Box, Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { ReactNode } from 'react';

interface FilterCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  isFeatured?: boolean; // Para o card de "Pesquisa Inteligente" que tem fundo levemente verde
}

export const FilterCard = ({ title, icon, children, isFeatured }: FilterCardProps) => {
  return (
    <Box 
      bg={isFeatured ? '#f3f6ee' : 'white'} // Fundo esverdeado sutil se for feature
      borderRadius="md" 
      p="4" 
      boxShadow="sm" 
      mb="4"
      borderWidth="1px"
      borderColor={isFeatured ? 'green.200' : 'gray.100'}
    >
      {/* Cabeçalho do Card (Opcional) */}
      {title && (
        <Flex alignItems="center" gap="2" mb="4">
          {icon && <Box color="gray.600">{icon}</Box>}
          <Text weight="medium" color="primary">{title}</Text>
        </Flex>
      )}
      
      {/* Conteúdo (Moléculas e Átomos) */}
      <Box>
        {children}
      </Box>
    </Box>
  );
};