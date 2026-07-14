"use client";


import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { css } from '@/styled-system/css';

export interface CityOption {
  nome: string;
  estado: string;
}

interface CityAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: CityOption) => void; // 🌟 Novo: retorna cidade e UF separados!
}

let citiesCache: CityOption[] | null = null;

const removerAcentos = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSelectCity,
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3 || !isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const filtrarCidades = async () => {
      setIsLoading(true);
      try {
        if (!citiesCache) {
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/municipios`
          );
          const data = await response.json();
          citiesCache = data.map((c: any) => ({
            nome: c.nome,
            estado: c.microrregiao?.mesorregiao?.UF?.sigla || '',
          }));
        }

        const termoLimpo = removerAcentos(query.split('-')[0]);
        const matches = (citiesCache || [])
          .filter((c) => removerAcentos(c.nome).includes(termoLimpo))
          .slice(0, 3);

        setSuggestions(matches);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(filtrarCidades, 200);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (city: CityOption) => {
    setQuery(city.nome); // 🌟 Agora mostra no input APENAS O NOME DA CIDADE
    onChange(city.nome);
    if (onSelectCity) {
      onSelectCity(city); // Dispara o retorno do UF e Cidade
    }
    setIsOpen(false);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <Box ref={wrapperRef} position="relative" width="full">
      <Text size="sm" weight="medium" css={{ mb: '1.5', display: 'block' }}>
        {label}
      </Text>
      
      <input
        id={id}
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        autoComplete="off"       // Padrão HTML para desativar histórico
  autoCorrect="off"        // Evita que o iOS/Android tente corrigir o nome da cidade
  autoCapitalize="words"   // Mantém apenas a primeira letra maiúscula (opcional)
  spellCheck={false}
        onFocus={() => setIsOpen(true)}
        className={css({
          width: '100%',
          height: '12',
          px: '3',
          borderWidth: '1px',
          borderColor: 'gray.300',
          borderRadius: 'md',
          fontSize: 'sm',
          outline: 'none',
          bg: 'white',
          _focus: { borderColor: '#547812', borderWidth: '2px' }
        })}
      />

      {isOpen && query.length >= 3 && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          mt="1"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="xl"
          zIndex="9999"
          maxH="200px"
          overflowY="auto"
        >
          {isLoading && (
            <Flex padding="3" justify="center">
              <Text size="xs" color="muted">A buscar cidades...</Text>
            </Flex>
          )}

          {!isLoading && suggestions.length === 0 && (
            <Flex padding="3">
              <Text size="xs" color="muted">Nenhuma cidade encontrada.</Text>
            </Flex>
          )}

          {!isLoading && suggestions.map((item, index) => (
            <Flex
              key={index}
              padding="3"
              align="center"
              justify="space-between"
              cursor="pointer"
              borderBottomWidth={index !== suggestions.length - 1 ? "1px" : "0"}
              borderColor="gray.100"
              className={css({
                _hover: { bg: 'gray.50' },
                _active: { bg: 'gray.100' }
              })}
              onClick={() => handleSelect(item)}
            >
              <Text size="sm" weight="medium">{item.nome}</Text>
              <Box bg="#f0f7e5" px="2" py="0.5" borderRadius="sm">
                <Text size="xs" color="primary" weight="bold">{item.estado}</Text>
              </Box>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};