"use client"

import { ReactNode, ChangeEvent, KeyboardEvent } from 'react'; // 1. Adicionados os tipos de evento
import { Input } from '../atoms/data';
import { Icon } from '../atoms/presentation';
import { Button } from '../atoms/action';
import { Search } from '@material-symbols-svg/react';
import { css } from '../../styled-system/css';

interface SearchComponentProps {
  placeholder?: string;
  showFilter?: boolean;
  showAI?: boolean;
  filterIcon?: ReactNode; 
  aiIcon?: ReactNode;     
  onFilterClick?: () => void;
  onAIClick?: () => void;
  
  // 2. 🌟 Adicionamos as props essenciais para a pesquisa via texto funcionar
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function SearchComponent({
  placeholder = "Search...", 
  showFilter = false,        
  showAI = false,
  filterIcon,
  aiIcon,
  onFilterClick,
  onAIClick,
  onChange,   // 3. Recebe a prop
  onKeyDown,  // 3. Recebe a prop
  value       // 3. Recebe a prop
}: SearchComponentProps) {
  return (
    <div className={css({ 
      display: 'flex', 
      alignItems: 'center',           
      padding: '2.5',
      backgroundColor: 'white',
      borderRadius: '10px',
      gap: '2', 
      marginInline: '20px',
      marginTop: '20px',
      boxShadow: 'sm'
    })}>
      
      <Icon size='lg'>
        <Search />
      </Icon>
      
      {/* 4. 🌟 Repassamos os eventos e o valor para o Input nativo (ou seu átomo) */}
      <Input 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        // Nota: tirei o onClick={onFilterClick} daqui, pois abria o modal apenas ao clicar no texto.
      />

      {showAI && aiIcon && (
        <Button variant='solid' className='IA-suggest' onClick={onAIClick}>
          <Icon size='lg'>
            {aiIcon}
          </Icon>
        </Button>
      )}

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