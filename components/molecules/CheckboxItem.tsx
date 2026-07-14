"use client"
import { Text,Label,Heading } from '@/components/atoms/typography';
import { Switch,Textarea,Checkbox,Input } from '@/components/atoms/data'

import { Flex } from '@/styled-system/jsx'; 
import { css } from '@/styled-system/css'; 
import { Box } from '@/styled-system/jsx';


interface CheckboxItemProps extends React.ComponentProps<typeof Checkbox> {
  label: string;
  id: string;
}

export const CheckboxItem = ({ label, id, ...props }: CheckboxItemProps) => {
  return (
    // Flex alinha os itens horizontalmente no centro
    <Flex alignItems="center" gap="2">
      <Checkbox id={id} {...props} />
      {/* O Label fica clicável e ativa o checkbox graças ao htmlFor */}
      <Label htmlFor={id} size="md" css={{ cursor: 'pointer' }}>
        {label}
      </Label>
    </Flex>
  );
};