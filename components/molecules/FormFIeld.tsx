"use client"
import { Text, Label, Heading } from '@/components/atoms/typography';
import { Switch, Textarea, Checkbox, Input } from '@/components/atoms/data'
import { Flex, Box } from '@/styled-system/jsx'; // Juntei os imports do styled-system
import React from 'react';

// Estendemos as propriedades nativas do Input para repassá-las facilmente
interface FormFieldProps extends React.ComponentProps<typeof Input> {
  label: string;
  id: string;
  icon?: React.ReactNode;
}

// CORREÇÃO AQUI: Adicionado 'icon' na desestruturação
export const FormField = ({ label, id, icon, ...props }: FormFieldProps) => {
  return (
    // Box com display flex em coluna e um pequeno gap entre o label e o input
    <Box display="flex" flexDirection="column" gap="1.5">
      <Label htmlFor={id} size="sm">
        {label}
      </Label>
      <Flex direction='row' height='fit-content'>
        {icon}
        <Input id={id} {...props} />
      </Flex>
      
    </Box>
  );
};