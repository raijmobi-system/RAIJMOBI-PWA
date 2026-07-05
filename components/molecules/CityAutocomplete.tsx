"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { css } from '@/styled-system/css';

interface CityOption {
  nome: string;
  estado: string;
}

interface CityAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincroniza estado interno se o React Hook Form alterar o value externo
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(value);
  }, [value]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca na BrasilAPI com Debounce
  useEffect(() => {
    if (query.length < 3 || !isOpen) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Busca municípios que correspondam ao texto digitado via BrasilAPI (Gratuita)
        const res = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1?providers=dados-abertos`);
        // Nota: Em produção, você pode cachear a lista do IBGE ou criar um endpoint leve no Django.
        // Para uma busca instantânea sem sobrecarregar o cliente, podemos filtrar ou usar um endpoint de busca.
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // ABORDAGEM RECOMENDADA PARA CAPACITOR (Alta Performance sem gargalo de rede):
  // Alternativamente, uma busca em um endpoint customizado do seu Django ou API de Busca Rápida:
  const fetchCities = async (searchTerm: string) => {
    if (searchTerm.length < 3) return;
    setIsLoading(true);
    try {
      // Usando API pública rápida de busca de localidades ou seu backend
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios`
      );
      // Dica de performance: O ideal é que seu backend Django faça esse filtro rápido 
      // ou que você retorne no máximo 3 opções combinando:
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (city: CityOption) => {
    const formatted = `${city.nome} - ${city.estado}`;
    setQuery(formatted);
    onChange(formatted);
    setIsOpen(false);
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
        onFocus={() => setIsOpen(true)}
        className={css({
          width: '100%',
          height: '11',
          px: '3',
          borderWidth: '1px',
          borderColor: 'gray.300',
          borderRadius: 'md',
          fontSize: 'sm',
          outline: 'none',
          _focus: { borderColor: '#547812', borderWidth: '2px' }
        })}
      />

      {/* Menu Flutuante */}
      {isOpen && (query.length >= 3) && (
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
          boxShadow="lg"
          zIndex="50"
          maxH="200px"
          overflowY="auto"
        >
          {isLoading && (
            <Flex padding="3" justify="center">
              <Text size="xs" color="muted">Buscando localidades...</Text>
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
              <Box 
                bg="#f0f7e5" 
                px="2" 
                py="0.5" 
                borderRadius="sm"
              >
                <Text size="xs" color="primary" weight="bold">{item.estado}</Text>
              </Box>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};