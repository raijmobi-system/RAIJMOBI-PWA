"use client"

import { ReactNode } from 'react';
import { Input } from '../atoms/data';
import { Icon } from '../atoms/presentation';
import { Button } from '../atoms/action';
import { Search } from '@material-symbols-svg/react';
import { css } from '../../styled-system/css';

// 1. Definimos a interface de Props para dar flexibilidade ao componente
interface SearchComponentProps {
  placeholder?: string;
  showFilter?: boolean;
  showAI?: boolean;
  filterIcon?: ReactNode; // Permite passar o ícone dinamicamente
  aiIcon?: ReactNode;     // Permite passar o ícone dinamicamente
  onFilterClick?: () => void;
  onAIClick?: () => void;
}

export default function SearchComponent({
  placeholder = "Search...", // Valor padrão caso não seja passado
  showFilter = false,        // Por padrão, não mostra (evita quebrar onde já é usado)
  showAI = false,
  filterIcon,
  aiIcon,
  onFilterClick,
  onAIClick
}: SearchComponentProps) {
  return (
    <div className={css({ 
      display: 'flex', 
      alignItems: 'center',           
      padding: '2.5',
      backgroundColor: 'white',
      borderRadius: '10px',
      gap: '2', // Adicionado para os itens não colarem uns nos outros
      marginInline: '20px',
      marginTop: '20px',
      boxShadow: 'sm'
    })}>
      
      {/* O ícone de lupa geralmente é padrão para busca, mas fica fixo */}
      <Icon size='lg'>
        <Search />
      </Icon>
      
      <Input placeholder={placeholder} onClick={onFilterClick}/>

      {/* 2. Renderização condicional para o botão de IA */}
      {showAI && aiIcon && (
        <Button variant='solid' className='IA-suggest' onClick={onAIClick}>
          <Icon size='lg'>
            {aiIcon}
          </Icon>
        </Button>
      )}

      {/* 3. Renderização condicional para o botão de Filtro */}
      {showFilter && filterIcon && (
        <Button className='Filter' onClick={onFilterClick}>
          <Icon>
            {filterIcon}
          </Icon>
        </Button>
      )}
      
    </div>
  );
}