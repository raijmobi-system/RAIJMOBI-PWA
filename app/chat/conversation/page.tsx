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

// 🌟 Importação do ícone de enviar
import { Send } from '@material-symbols-svg/react';

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 🌟 Limpa aspas extras que o Capacitor/JSON possa ter injetado no LocalStorage
      const rawId = localStorage.getItem('usuario_id') || '';
      //eslint-disable-next-line
      setCurrentUserId(rawId.replace(/['"]/g, '').trim().toLowerCase());
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!caronaId || currentUserId === null) {
      if (!caronaId) {
        //eslint-disable-next-line
        setError('ID da carona não fornecido.');
        setLoading(false);
      }
      return;
    }

    const safeUserId = currentUserId;

    // 🌟 FUNÇÃO BLINDADA PARA EXTRAIR O ID DO REMETENTE
    const getUserIdFromMsg = (m: any): string => {
      if (m.usuario_id) return String(m.usuario_id);
      if (m.usuario?.id) return String(m.usuario.id);
      if (typeof m.usuario === 'string') return m.usuario;
      return '';
    };

    async function inicializarChat() {
      try {
        const roomData = await chatService.getRoomDetail(caronaId);
        setRoomInfo(roomData);

        const historicalData = await chatService.getHistoricalMessages(caronaId);

        const formattedHistory: MessageData[] = historicalData.map((msg) => {
          const rawSenderId = getUserIdFromMsg(msg);
          const cleanSenderId = rawSenderId.replace(/['"]/g, '').trim().toLowerCase();
          
          return {
            message: msg.conteudo,
            usuario_id: cleanSenderId,
            is_me: cleanSenderId !== '' && cleanSenderId === safeUserId,
            data_envio: msg.data_envio,
          };
        });

        setMessages(formattedHistory);

        await chatSocketService.connect(
          caronaId,
          (newData: MessageData) => {
            const rawSenderId = getUserIdFromMsg(newData);
            const cleanSenderId = rawSenderId.replace(/['"]/g, '').trim().toLowerCase();

            const messageWithAuth: MessageData = {
              ...newData,
              usuario_id: cleanSenderId,
              is_me: cleanSenderId !== '' && cleanSenderId === safeUserId
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

    return () => {
      chatSocketService.disconnect();
    };
  }, [caronaId, currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      chatSocketService.sendMessage(inputMessage);
      setInputMessage('');
    } catch (err) {
      console.error("❌ Falha ao enviar mensagem pelo socket:", err);
    }
  };

  // Mantemos o FrameComponent apenas para as telas de loading e erro centralizadas
  if (loading || currentUserId === null) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" minHeight="50vh">
          <Text color="muted">Sincronizando mensagens da conversa...</Text>
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
    // 🌟 REMOVIDO O FrameComponent DA TELA PRINCIPAL! Agora o chat ocupa 100% da tela sem bordas.
    <Flex direction="column" height="100vh" width="100%" bg="#fdfdfd" overflow="hidden">
      
      {/* HEADER FIXO DO CHAT */}
      {roomInfo && (
        <Flex
          direction="row"
          align="center"
          gap="3"
          className={css({ 
            p: '4', 
            bg: 'white', 
            borderBottom: '1px solid', 
            borderColor: 'gray.200', 
            flexShrink: 0,
            boxShadow: 'sm',
            zIndex: 10
          })}
        >
          <IconButton 
            onClick={() => router.push('/chat')} 
            className={css({ cursor: 'pointer', p: '2', mr: '1', borderRadius: 'full', _hover: { bg: 'gray.100' } })}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#547812' }}>←</span>
          </IconButton>

          <Avatar src="/driver-placeholder.png" />
          <Flex direction="column">
            <Text weight="bold">{roomInfo.driver?.name || "Motorista"}</Text>
            <Text size="xs" color="muted">Preço da vaga: {roomInfo.price}</Text>
          </Flex>
        </Flex>
      )}

      {/* ÁREA DE MENSAGENS COM ROLAGEM */}
      <Flex 
        direction="column" 
        gap="3" 
        className={css({ p: '4', overflowY: 'auto', flex: '1', bg: '#fdfdfd' })}
      >
        {messages.map((msg, index) => {
          // A validação já foi feita de forma rigorosa lá em cima
          const isMyMessage = msg.is_me;

          return (
            <Flex
              key={index}
              direction="column"
              className={css({
                maxWidth: '75%',
                p: '3',
                borderRadius: 'xl',
                borderBottomRightRadius: isMyMessage ? '2px' : 'xl',
                borderBottomLeftRadius: !isMyMessage ? '2px' : 'xl',
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                bg: isMyMessage ? '#547812' : '#f3f4f6', 
                color: isMyMessage ? 'white' : 'gray.800',
                boxShadow: 'sm'
              })}
            >
              <Text className={css({ fontSize: 'sm', color: 'inherit' })}>{msg.message}</Text>
            </Flex>
          );
        })}
        <div ref={chatEndRef} />
      </Flex>

      {/* BARRA DE INPUT NO RODAPÉ */}
      <form onSubmit={handleSend} className={css({ p: '3', bg: 'white', borderTop: '1px solid', borderColor: 'gray.200', flexShrink: 0 })}>
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
              borderRadius: 'full', // Input mais arredondado
              fontSize: 'sm',
              outline: 'none',
              _focus: { borderColor: '#547812' }
            })}
          />
          
          {/* 🌟 BOTÃO DE ENVIAR COM ÍCONE E FUNDO VERDE */}
          <IconButton 
            type="submit" 
            disabled={!inputMessage.trim()}
            className={css({ 
              bg: inputMessage.trim() ? '#547812' : 'gray.300', 
              w: '42px', 
              h: '42px', 
              borderRadius: 'full',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            })}
          >
            <Send color="white" />
          </IconButton>
        </Flex>
      </form>
    </Flex>
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