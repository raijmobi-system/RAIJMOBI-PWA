import React from 'react';
import { Flex, Box } from '../../styled-system/jsx';
import { css } from '../../styled-system/css';
import { Text } from '../atoms/typography';
import { Avatar } from '../atoms/presentation';

interface ChatMessageProps {
  isMe: boolean;
  text: string;
  time: string;
  author: string;
  avatarSrc: string;
}

export default function ChatMessage({ isMe, text, time, author, avatarSrc }: ChatMessageProps) {
  return (
    <Flex 
      direction={isMe ? 'row-reverse' : 'row'} // Inverte a ordem (Avatar -> Texto) se for você
      align="flex-start" 
      gap="3" 
      w="100%"
    >
      <Avatar src={avatarSrc} size="sm" />
      
      <Flex direction="column" align={isMe ? 'flex-end' : 'flex-start'} maxW="80%">
        <Text size="sm" color='muted' className={css({ mb: '1' })}>
          {author}
        </Text>
        
        {/* Balão da mensagem */}
        <Box 
          className={css({
            bg: isMe ? 'green.700' : 'white',
            p: '3',
            borderRadius: '16px',
            borderTopLeftRadius: isMe ? '16px' : '4px',
            borderTopRightRadius: isMe ? '4px' : '16px',
            boxShadow: 'sm',
          })}
        >
          <Text color={isMe ? 'white' : 'cupom'} >{text}</Text>
        </Box>
        
        <Text size="xs" color='muted'>
          {time}
        </Text>
      </Flex>
    </Flex>
  );
}