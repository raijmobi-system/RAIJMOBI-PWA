// SliderControl.tsx
import { Box, Flex } from '@/styled-system/jsx';
import { Label,Text  } from '@/components/atoms/typography';
import { RangeSlider } from '@/components/atoms/data';

interface SliderControlProps extends React.ComponentProps<typeof RangeSlider> {
  label: string;
  id: string;
  minLabel: string;
  maxLabel: string;
  currentValue?: string; // Para exibir "R$ 100" no canto direito, se necessário
}

export const SliderControl = ({ 
  label, id, minLabel, maxLabel, currentValue, ...props 
}: SliderControlProps) => {
  return (
    <Box width="full" display="flex" flexDirection="column" gap="3">
      {/* Topo: Label e Valor Atual (opcional) */}
      <Flex justifyContent="space-between" alignItems="center">
        <Label htmlFor={id} size="sm">{label}</Label>
        {currentValue && (
          <Text size="sm" weight="bold" color="special">{currentValue}</Text>
        )}
      </Flex>
      
      {/* O Input em si */}
      <RangeSlider id={id} {...props} />
      
      {/* Base: Etiquetas de Min e Max */}
      <Flex justifyContent="space-between">
        <Text size="xs" color="muted">{minLabel}</Text>
        <Text size="xs" color="muted">{maxLabel}</Text>
      </Flex>
    </Box>
  );
};