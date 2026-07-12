'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { chatSocketService, MessageData } from '@/services/chat_socket';
import { chatService, ChatRoomData } from '@/services/chat_service';
import { FrameComponent } from "@/components/organisms";
import { IconButton } from '@/components/atoms/action';
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import { css } from "@/styled-system/css";

function ConversationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caronaId = String(searchParams.get('id') || '');

  const [roomInfo, setRoomInfo] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('usuario_id') || '' : '';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!caronaId) {
      setError('ID da carona não fornecido.');
      setLoading(false);
      return;
    }

    async function inicializarChat() {
      try {
        const roomData = await chatService.getRoomDetail(caronaId);
        setRoomInfo(roomData);

        const historicalData = await chatService.getHistoricalMessages(caronaId);

        const formattedHistory: MessageData[] = historicalData.map((msg) => {
          const userIdFromMsg = String(msg.usuario?.id || '');
          return {
            message: msg.conteudo,
            usuario_id: userIdFromMsg,
            is_me: userIdFromMsg !== '' && userIdFromMsg === String(currentUserId),
            data_envio: msg.data_envio,
          };
        });

        setMessages(formattedHistory);

        await chatSocketService.connect(
          caronaId,
          (newData: MessageData) => {
            const messageWithAuth: MessageData = {
              ...newData,
              is_me: String(newData.usuario_id) === String(currentUserId) || newData.is_me
            };

            setMessages((prev) => {
              if (prev.some((m) => m.data_envio === messageWithAuth.data_envio && m.message === messageWithAuth.message)) {
                return prev;
              }
              return [...prev, messageWithAuth];
            });
          },
          () => {
            console.warn("⚠️ WebSocket foi desconectado.");
          }
        );

      } catch (err: any) {
        console.error("❌ Erro ao inicializar fluxo de chat:", err);
        setError('Não foi possível carregar o chat ou conectar ao servidor.');
      } finally {
        setLoading(false);
      }
    }

    inicializarChat();
  }, [caronaId, currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      chatSocketService.sendMessage(inputMessage);
      
      const temporaryMsg: MessageData = {
        message: inputMessage,
        usuario_id: currentUserId,
        is_me: true,
        data_envio: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, temporaryMsg]);
      setInputMessage('');
    } catch (err) {
      console.error("❌ Falha ao enviar mensagem pelo socket:", err);
    }
  };

  if (loading) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" minHeight="50vh">
          <Text color="muted">Carregando mensagens da conversa...</Text>
        </Flex>
      </FrameComponent>
    );
  }

  if (error) {
    return (
      <FrameComponent>
        <Flex direction="column" justify="center" align="center" minHeight="50vh" gap="4" p="4">
          <Text color="danger" weight="bold">{error}</Text>
          <IconButton onClick={() => window.location.reload()}>
            <Text color="white">Tentar Novamente</Text>
          </IconButton>
        </Flex>
      </FrameComponent>
    );
  }

  return (
    <FrameComponent>
      {roomInfo && (
        <Flex
          direction="row"
          align="center"
          gap="3"
          className={css({ p: '4', bg: 'gray.50', borderBottom: '1px solid', borderColor: 'gray.200' })}
        >
          <Avatar src="/driver-placeholder.png" />
          <Flex direction="column">
            <Text weight="bold">{roomInfo.driver?.name || "Motorista"}</Text>
            <Text size="xs" color="muted">Preço da vaga: {roomInfo.price}</Text>
          </Flex>
        </Flex>
      )}

      <Flex direction="column" gap="3" className={css({ p: '4', overflowY: 'auto', minHeight: '60vh' })}>
        {messages.map((msg, index) => {
          const isMyMessage = msg.is_me || (msg.usuario_id && String(msg.usuario_id) === String(currentUserId));

          return (
            <Flex
              key={index}
              direction="column"
              className={css({
                maxWidth: '75%',
                p: '3',
                borderRadius: 'xl',
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                bg: isMyMessage ? '#4c6b12' : '#f3f4f6', 
                color: isMyMessage ? 'white' : 'gray.800',
                border: isMyMessage ? 'none' : '1px solid',
                borderColor: 'gray.200',
              })}
            >
              <Text className={css({ fontSize: 'sm', color: 'inherit' })}>{msg.message}</Text>
            </Flex>
          );
        })}
        <div ref={chatEndRef} />
      </Flex>

      <form onSubmit={handleSend} className={css({ p: '4', bg: 'white', borderTop: '1px solid', borderColor: 'gray.200' })}>
        <Flex direction="row" gap="3" align="center" width="full">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escreva sua mensagem aqui..."
            className={css({ 
              flex: '1', 
              minWidth: '0', 
              px: '4', 
              py: '2.5', 
              border: '1px solid', 
              borderColor: 'gray.300', 
              borderRadius: 'lg',
              fontSize: 'sm'
            })}
          />
          <IconButton 
            type="submit" 
            style={{ 
              backgroundColor: '#4c6b12', 
              paddingLeft: '16px', 
              paddingRight: '16px', 
              height: '40px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0 
            }}
          >
            <Text color="white" weight="bold" size="sm">Enviar</Text>
          </IconButton>
        </Flex>
      </form>
    </FrameComponent>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={
      <FrameComponent>
        <Flex justify="center" align="center" minHeight="50vh">
          <Text color="muted" weight="bold">Sincronizando chat...</Text>
        </Flex>
      </FrameComponent>
    }>
      <ConversationContent />
    </Suspense>
  );
}