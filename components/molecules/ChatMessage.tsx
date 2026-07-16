import React from 'react';
import { Flex, Box } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography/Text';
import { Avatar } from '@/components/atoms/presentation';

interface ChatMessageProps {
  isMe: boolean;
  text: string;
  time: string;
  author: string;
  avatarSrc?: string;
}

export default function ChatMessage({ isMe, text, time, author, avatarSrc }: ChatMessageProps) {
  return (
    <Flex 
      // 🌟 row-reverse inverte a ordem física dos elementos (Avatar vai para a direita se isMe)
      direction={isMe ? 'row-reverse' : 'row'} 
      align="flex-start" 
      gap="3" 
      width="100%"
      className={css({ mb: '2' })}
    >
      {/* 🌟 CONTAINER DO AVATAR COM LARGURA TRAVADA CONTRA ENCOLHIMENTO */}
      <div className={css({ flexShrink: 0 })}>
        <Avatar src={avatarSrc || "/driver-placeholder.png"} />
      </div>

      {/* Bloco de conteúdo (Autor, Balão e Hora) */}
      <Flex 
        direction="column" 
        // 🌟 Força o alinhamento do texto à direita se for meu, ou à esquerda se for do outro
        align={isMe ? 'flex-end' : 'flex-start'} 
        // 🌟 flex-grow: 1 com width: auto garante que ele ocupe o espaço e empurre o avatar para o canto
        className={css({ flex: '1', minWidth: '0' })}
      >
        {/* Nome do Autor */}
        <Text 
          size="xs" 
          color="muted" 
          weight="medium"
          className={css({ px: '1' })}
        >
          {author}
        </Text>

        {/* Balão de Mensagem */}
        <Box 
          className={css({
            px: '4',
            py: '2.5',
            borderRadius: '20px',
            // Ponta do balão simula o aplicativo real da sua foto
            borderTopRightRadius: isMe ? '4px' : '20px',
            borderTopLeftRadius: isMe ? '20px' : '4px',
            bg: isMe ? '#547812' : '#f5f5f5', 
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            // Evita que o balão quebre todo o layout em textos longos
            maxW: '80%', 
            wordBreak: 'break-word'
          })}
        >
          <Text 
            className={css({ 
              color: isMe ? 'white !important' : '#1b1c1c !important',
              fontSize: '14px',
              lineHeight: 'relaxed'
            })}
          >
            {text}
          </Text>
        </Box>

        {/* Horário de Envio */}
        <Text 
          size="xs" 
          color="muted"
          className={css({ px: '2', fontSize: '11px', mt: '0.5' })}
        >
          {time}
        </Text>
      </Flex>
    </Flex>
  );
}