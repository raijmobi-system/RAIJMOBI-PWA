"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Box, Flex, Grid } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { FilterCard } from '@/components/organisms/FilterCard';
import { FormField } from '@/components/molecules/FormFIeld';
import { SelectField } from '@/components/molecules/SelectField';
import { SliderControl } from '@/components/molecules/SliderControl';
import { AISearchInput } from '@/components/molecules/AISearchInput';
import { Button } from '@/components/atoms/action';

export interface SearchFormInputs {
  origem: string;
  destino: string;
  raio: number;
  data: string;
  horario: string;
}

export const SearchFilterForm = () => {
  const router = useRouter();

  const { control, handleSubmit } = useForm<SearchFormInputs>({
    defaultValues: {
      origem: '',
      destino: '',
      data: '',
      horario: 'qualquer',
    },
  });

  const onSubmit = (data: SearchFormInputs) => {
    const searchParams = new URLSearchParams();

    // Mapeia os campos preenchidos para a URL
    if (data.origem.trim()) {
      searchParams.append('origin', data.origem.trim());
    }
    if (data.destino.trim()) {
      searchParams.append('destination', data.destino.trim());
    }
    if (data.data) {
      searchParams.append('start_time_after', data.data);
    }
    if (data.raio) {
      searchParams.append('raio', String(data.raio));
    }

    // Redireciona para a página do Passo 4 mantendo os parâmetros
    router.push(`/search-results?${searchParams.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box 
        flex="1" 
        overflowY="auto" 
        display="flex" 
        flexDirection="column" 
        gap="4"
        maxHeight="800px" 
        bg="white"
      >
        {/* IA Search */}
        <FilterCard isFeatured icon="🧠">
          <Text weight="medium" css={{ mb: '4' }}>Pesquisa Inteligente com IA</Text>
          <AISearchInput />
          <Text size="xs" color="muted" css={{ mt: '2' }}>
            A IA irá preencher automaticamente os filtros abaixo com base na sua descrição.
          </Text>
        </FilterCard>

        {/* Trajeto */}
        <FilterCard icon="📍" title="Trajeto">
          <Box display="flex" flexDirection="column" gap="4">
            <Controller
              name="origem"
              control={control}
              render={({ field }) => (
                <FormField 
                  {...field}
                  id="origem" 
                  label="Origem (Cidade ou Estado)" 
                  placeholder="Ex: Campinas ou SP" 
                />
              )}
            />

            <Controller
              name="destino"
              control={control}
              render={({ field }) => (
                <FormField 
                  {...field}
                  id="destino" 
                  label="Destino (Cidade ou Estado)" 
                  placeholder="Ex: São Paulo ou RJ" 
                />
              )}
            />

            <Box mt="2">
              <Controller
                name="raio"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <SliderControl 
                    id="raio"
                    label="Raio de busca"
                    minLabel="0 km"
                    maxLabel="100 km"
                    currentValue={`${value} km`}
                    value={value}
                    onChange={(e) => onChange(Number((e.target as HTMLInputElement).value))}
                  />
                )}
              />
            </Box>
          </Box>
        </FilterCard>

        {/* Data e Hora */}
        <FilterCard icon="📅" title="Data e Hora">
          <Grid columns={2} gap="4">
            <Controller
              name="data"
              control={control}
              render={({ field }) => (
                <FormField 
                  {...field}
                  id="data" 
                  type="date" 
                  label="Data" 
                />
              )}
            />

            <Controller
              name="horario"
              control={control}
              render={({ field }) => (
                <SelectField 
                  {...field}
                  id="horario" 
                  label="Horário" 
                  options={[
                    { value: 'qualquer', label: 'Qualquer' },
                    { value: 'manha', label: 'Manhã (06h - 12h)' },
                    { value: 'tarde', label: 'Tarde (12h - 18h)' },
                    { value: 'noite', label: 'Noite (18h - 00h)' },
                  ]} 
                />
              )}
            />
          </Grid>
        </FilterCard>
      </Box>

      {/* Rodapé Fixo */}
      <Flex 
        padding="6" 
        gap="4" 
        borderTopWidth="1px" 
        borderColor="gray.200" 
        bg="white"
        mt="auto"
      >
        <Box 
          as="button"
          type="button"
          flex="1" 
          height="12" 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="gray.300" 
          bg="white" 
          color="gray.700" 
          fontWeight="medium"
          cursor="pointer"
          onClick={() => router.back()}
        >
          Cancelar
        </Box>
        
        <Button
          type="submit"
          flex="1" 
          height="12" 
          borderRadius="md" 
          bg="#547812" 
          color="white" 
          fontWeight="medium"
          cursor="pointer"
        >
          Pesquisar
        </Button>
      </Flex>
    </form>
  );
};