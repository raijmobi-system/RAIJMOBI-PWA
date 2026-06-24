import { Box, Flex, Grid } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { FilterCard } from '@/components/organisms/FilterCard';
import { FormField } from '@/components/molecules/FormFIeld';
import { SelectField } from '@/components/molecules/SelectField';
import { SliderControl } from '@/components/molecules/SliderControl';
import { CheckboxItem } from '@/components/molecules/CheckboxItem';
import { AISearchInput } from '@/components/molecules/AISearchInput';

export const SearchFilterForm = () => {
  return (
    // Container principal do formulário (pode ser o miolo do seu Modal)
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100%" 
      maxHeight="800px" // Simula o limite da tela
      bg="white"
    >
      {/* Área de conteúdo com Scroll */}
      <Box 
        flex="1" 
        overflowY="auto" 
        padding="6" 
        display="flex" 
        flexDirection="column" 
        gap="4"
      >
        
        {/* 1. Seção: Pesquisa Inteligente com IA */}
        <FilterCard isFeatured icon="🧠">
          <Text weight="medium" css={{ mb: '4' }}>Pesquisa Inteligente com IA</Text>
          <AISearchInput />
          <Text size="xs" color="muted" css={{ mt: '2' }}>
            A IA irá preencher automaticamente os filtros abaixo com base na sua descrição.
          </Text>
        </FilterCard>

        {/* 2. Seção: Trajeto */}
        <FilterCard icon="📍" title="Trajeto">
          <Box display="flex" flexDirection="column" gap="4">
            <FormField 
              id="origem" 
              label="Origem" 
              placeholder="Cidade de partida" 
            />
            <FormField 
              id="destino" 
              label="Destino" 
              placeholder="Cidade de destino" 
            />
            <Box mt="2">
              <SliderControl 
                id="raio"
                label="Raio de busca (km)"
                minLabel="0 km"
                maxLabel="100 km"
                currentValue="20 km"
              />
            </Box>
          </Box>
        </FilterCard>

        {/* 3. Seção: Data e Hora */}
        <FilterCard icon="📅" title="Data e Hora">
          <Grid columns={2} gap="4">
            <FormField 
              id="data" 
              type="date" // O tipo date aciona o calendário nativo do navegador
              label="Data" 
            />
            <SelectField 
              id="horario" 
              label="Horário" 
              options={[
                { value: 'qualquer', label: 'Qualquer' },
                { value: 'manha', label: 'Manhã (06h - 12h)' },
                { value: 'tarde', label: 'Tarde (12h - 18h)' },
                { value: 'noite', label: 'Noite (18h - 00h)' },
              ]} 
            />
          </Grid>
        </FilterCard>

        {/* 4. Seção: Preço e Vagas */}
        <FilterCard icon="💵" title="Preço e Vagas">
          <Box display="flex" flexDirection="column" gap="6">
            <SliderControl 
              id="preco"
              label="Preço máximo"
              minLabel=""
              maxLabel=""
              currentValue="R$ 100"
            />
            <SelectField 
              id="vagas" 
              label="Vagas disponíveis" 
              options={[
                { value: 'qualquer', label: 'Qualquer' },
                { value: '1', label: '1 vaga' },
                { value: '2', label: '2 vagas' },
                { value: '3+', label: '3 ou mais' },
              ]} 
            />
          </Box>
        </FilterCard>

        {/* 5. Seção: Veículo */}
        <FilterCard icon="🚗" title="Veículo">
          <Grid columns={2} gap="4">
            <CheckboxItem id="carro" label="Carro" defaultChecked />
            <CheckboxItem id="suv" label="SUV" defaultChecked />
            <CheckboxItem id="van" label="Van" defaultChecked />
            <CheckboxItem id="moto" label="Moto" />
          </Grid>
        </FilterCard>
      </Box>

      {/* Rodapé Fixo com Botões de Ação */}
      <Flex 
        padding="6" 
        gap="4" 
        borderTopWidth="1px" 
        borderColor="gray.200" 
        bg="white"
      >
        <Box 
          as="button" 
          flex="1" 
          height="12" 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="gray.300" 
          bg="white" 
          color="gray.700" 
          fontWeight="medium"
          cursor="pointer"
        >
          Limpar Filtros
        </Box>
        
        <Box 
          as="button" 
          flex="1" 
          height="12" 
          borderRadius="md" 
          bg="#547812" // O verde exato do seu design
          color="white" 
          fontWeight="medium"
          cursor="pointer"
        >
          Aplicar Filtros
        </Box>
      </Flex>
    </Box>
  );
};