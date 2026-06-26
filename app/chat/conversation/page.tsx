"use client";

import { Flex, Box } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';
import { Avatar, Icon } from '@/components/atoms/presentation';
import { ArrowBack, Send } from '@material-symbols-svg/react'; // Ajuste seus ícones
import ChatMessage from '@/components/molecules/ChatMessage';
import { useRouter } from 'next/navigation';


export default function ChatPage() {
  

  return (
    <Flex direction="column" h="100%" w="100%">
      
      {/* 1. Header Dinâmico Específico do Chat */}
      

      {/* 2. Área de Mensagens (Papel de Parede) */}
      <Flex 
        direction="column" 
        flex="1" 
        p="4" 
        gap="6"
        className={css({ 
          bg: 'gray.100', // Papel de parede sólido. Pode trocar por backgroundImage: 'url(...)' no Panda se quiser textura
          overflowY: 'auto', // Permite rolagem só aqui dentro
        })}
      >
        <ChatMessage 
          isMe={false}
          author="Rafael"
          text="Fala Fernando, beleza?"
          time="14:20"
          avatarSrc="/Rafael.jpeg"
        />
        
        <ChatMessage 
          isMe={true}
          author="Fernando"
          text="Tudo certo! E aí, confirmou a carona?"
          time="14:22"
          avatarSrc="/Fernando.jpeg"
        />

        <ChatMessage 
          isMe={false}
          author="Rafael"
          text="Sim! Tô chegando no ponto de encontro!"
          time="14:25"
          avatarSrc="/Rafael.jpeg"
        />
      </Flex>

      {/* 3. Área do Input (Rodapé do Chat) */}
      <Flex 
        p="4" 
        bg="white" 
        align="center" 
        gap="3"
        className={css({ borderTop: '1px solid', borderColor: 'gray.200', flexShrink: 0 })}
      >
        <Box 
          className={css({ 
            flex: '1', 
            bg: 'gray.100', 
            borderRadius: 'full', 
            px: '4', 
            py: '3' 
          })}
        >
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className={css({ bg: 'transparent', outline: 'none', w: '100%', color: 'gray.800' })}
          />
        </Box>
        
        <button 
          className={css({ 
            bg: 'green.700', 
            color: 'white', 
            p: '3', 
            borderRadius: 'full', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          })}
        >
          <Icon><Send /></Icon>
        </button>
      </Flex>

    </Flex>
  );
}