"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Box, Flex, Grid } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { FilterCard } from '@/components/organisms/FilterCard';
import { FormField } from '@/components/molecules/FormFIeld';
import { SelectField } from '@/components/molecules/SelectField';
import { AISearchInput } from '@/components/molecules/AISearchInput';
import { CityAutocomplete, CityOption } from '@/components/molecules/CityAutocomplete';
import { Button } from '@/components/atoms/action';

export interface SearchFormInputs {
  origem: string;
  destino: string;
  raio: number;
  data: string;
  horario: string;
}

// 🌟 1. ADICIONADO O SUPORTE AO 'onApply' NA INTERFACE DO TYPESCRIPT
interface SearchFilterFormProps {
  onClose?: () => void;
  onApply?: (filters: Record<string, any>) => void;
}

// 🌟 2. RECEBENDO O 'onApply' NOS PROPS DO COMPONENTE
export const SearchFilterForm: React.FC<SearchFilterFormProps> = ({ onClose, onApply }) => {
  const router = useRouter();
  const [origemState, setOrigemState] = useState('');
  const [destinoState, setDestinoState] = useState('');

  const { control, handleSubmit } = useForm<SearchFormInputs>({
    defaultValues: {
      origem: '',
      destino: '',
      raio: 20,
      data: '',
      horario: 'qualquer',
    },
  });

  const onSubmit = (data: SearchFormInputs) => {
    // Monta o objeto de filtros limpo para o backend Django
    const filters: Record<string, any> = {};

    if (data.origem.trim()) {
      filters.origin = data.origem.trim();
      if (origemState) filters.origin_state = origemState;
    }
    if (data.destino.trim()) {
      filters.destination = data.destino.trim();
      if (destinoState) filters.destination_state = destinoState;
    }
    if (data.data) {
      filters.start_time_after = data.data;
    }

    // Fecha o modal caso a função exista
    if (onClose) onClose();

    // 🌟 3. SE O 'onApply' FOI PASSADO (COMO NA TELA DE RESULTADOS), USA ELE EM VEZ DE MUDAR DE PÁGINA
    if (onApply) {
      onApply(filters);
      return;
    }

    // Comportamento fallback para quando for usado na tela inicial (Dashboard)
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => searchParams.append(key, String(val)));
    router.push(`/search-results?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box flex="1" overflowY="auto" display="flex" flexDirection="column" gap="4" maxHeight="800px" bg="white" pb="4">
        
        <FilterCard isFeatured icon="🧠">
          <Text weight="medium" css={{ mb: '4' }}>Pesquisa Inteligente com IA</Text>
          <AISearchInput />
          <Text size="xs" color="muted" css={{ mt: '2' }}>
            A IA irá preencher automaticamente os filtros abaixo.
          </Text>
        </FilterCard>

        <FilterCard icon="📍" title="Trajeto">
          <Box display="flex" flexDirection="column" gap="4">
            <Controller
              name="origem"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CityAutocomplete 
                  id="origem" 
                  label="Cidade de Origem" 
                  placeholder="Ex: Mossoró" 
                  value={value}
                  onChange={onChange}
                  onSelectCity={(city: CityOption) => setOrigemState(city.estado)}
                />
              )}
            />

            <Controller
              name="destino"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CityAutocomplete 
                  id="destino" 
                  label="Cidade de Destino" 
                  placeholder="Ex: Pau dos Ferros" 
                  value={value}
                  onChange={onChange}
                  onSelectCity={(city: CityOption) => setDestinoState(city.estado)}
                />
              )}
            />
          </Box>
        </FilterCard>

        <FilterCard icon="📅" title="Data e Hora">
          <Grid columns={2} gap="4">
            <Controller name="data" control={control} render={({ field }) => <FormField {...field} id="data" type="date" label="Data" />} />
            <Controller name="horario" control={control} render={({ field }) => (
              <SelectField {...field} id="horario" label="Horário" options={[
                { value: 'qualquer', label: 'Qualquer' },
                { value: 'manha', label: 'Manhã (06h - 12h)' },
                { value: 'tarde', label: 'Tarde (12h - 18h)' },
                { value: 'noite', label: 'Noite (18h - 00h)' },
              ]} />
            )} />
          </Grid>
        </FilterCard>
      </Box>

      <Flex padding="6" gap="4" borderTopWidth="1px" borderColor="gray.200" bg="white" mt="auto">
        <Box as="button"  flex="1" height="12" borderRadius="md" borderWidth="1px" borderColor="gray.300" bg="white" color="gray.700" fontWeight="medium" cursor="pointer" display="flex" alignItems="center" justifyContent="center" onClick={onClose || (() => router.back())}>
          Cancelar
        </Box>
        <Button type="submit" flex="1" height="12" borderRadius="md" bg="#547812" color="white" fontWeight="medium" cursor="pointer">
          Pesquisar
        </Button>
      </Flex>
    </form>
  );
};