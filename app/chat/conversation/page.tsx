'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { chatSocketService, MessageData } from '@/services/chat_socket';
import { chatService, ChatMessageBackend, ChatRoomData } from '@/services/chat_service';
import { FrameComponent } from "@/components/organisms";
import { IconButton } from '@/components/atoms/action';
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import { css } from "@/styled-system/css";

export default function ConversationPage() {
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
    if (!caronaId) {
      //eslint-disable-next-line
      setError('ID da carona não fornecido.');
      setLoading(false);
      return;
    }

    async function inicializarChat() {
      try {
        setLoading(true);
        setError(null);

        // Busca os dados reais e o histórico direto do banco de dados centralizado
        const [detalhesSala, historico] = await Promise.all([
          chatService.getRoomDetail(caronaId),
          chatService.getHistoricalMessages(caronaId),
        ]);

        setRoomInfo(detalhesSala);

        const mensagensFormatadas: MessageData[] = (historico || []).map((msg: ChatMessageBackend) => ({
          message: msg.conteudo,
          usuario_id: msg.usuario.id,
          is_me: msg.usuario.id === currentUserId,
          data_envio: msg.data_envio,
        }));

        setMessages(mensagensFormatadas);
        
        // 🌟 CORREÇÃO: Aguarda a Promise do connect resolver antes de prosseguir
        await chatSocketService.connect(caronaId, (newMessage) => {
          // Evita duplicar na tela a mensagem que você mesmo acabou de enviar pelo handleSend
          if (newMessage.usuario_id !== currentUserId) {
            setMessages((prev) => [...prev, newMessage]);
          }
        });

      } catch (err) {
        console.error('Erro na integração do chat:', err);
        setError('Não foi possível carregar os dados desta carona ou conectar ao chat.');
      } finally {
        setLoading(false);
      }
    }

    inicializarChat();

    return () => {
      chatSocketService.disconnect();
    };
  }, [caronaId, currentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Dispara a mensagem crua para o servidor WebSocket
    chatSocketService.sendMessage(inputMessage);
    
    // Insere localmente de forma instantânea para dar fluidez na UI
    const localMsg: MessageData = {
      message: inputMessage,
      usuario_id: currentUserId,
      is_me: true,
      data_envio: new Date().toISOString()
    };
    setMessages((prev) => [...prev, localMsg]);
    setInputMessage('');
  };

  if (loading) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" height="80vh">
          <Text color="muted">Carregando histórico do chat...</Text>
        </Flex>
      </FrameComponent>
    );
  }

  if (error) {
    return (
      <FrameComponent>
        <Flex direction="column" justify="center" align="center" height="80vh" gap="4">
          <Text color="danger" weight="bold">{error}</Text>
          <IconButton onClick={() => router.push('/chat')}>Voltar para conversas</IconButton>
        </Flex>
      </FrameComponent>
    );
  }

  return (
    <FrameComponent>
      {/* Header Dinâmico com dados reais do Postgres */}
      <Flex direction="row" align="center" gap="4" className={css({ p: '4', borderBottom: '1px solid', borderColor: 'gray.200', bg: 'white' })}>
        <IconButton onClick={() => router.push('/chat')}>⬅</IconButton>
        <Avatar src="/cliente.jpeg" size="fx" />
        <Flex direction="column">
          <Text weight="bold" color="special">
            {roomInfo ? `${roomInfo.origin} ➔ ${roomInfo.destination}` : 'Carona'}
          </Text>
          <Text color="muted" size="sm">
            Preço: R$ {roomInfo?.price} | Vagas disponíveis: {roomInfo?.available_seats}
          </Text>
        </Flex>
      </Flex>

      {/* Box de Mensagens */}
      <Flex direction="column" gap="3" className={css({ flex: '1', p: '4', overflowY: 'auto', minHeight: '60vh' })}>
        {messages.map((msg, index) => (
          <Flex
            key={index}
            direction="column"
            className={css({
              maxWidth: '75%',
              p: '3',
              borderRadius: 'xl',
              alignSelf: msg.is_me ? 'flex-end' : 'flex-start',
              bg: msg.is_me ? 'emerald.500' : 'white',
              color: msg.is_me ? 'white' : 'gray.800',
              border: msg.is_me ? 'none' : '1px solid',
              borderColor: 'gray.100',
            })}
          >
            <Text className={css({ fontSize: 'sm', color: 'inherit' })}>{msg.message}</Text>
          </Flex>
        ))}
        <div ref={chatEndRef} />
      </Flex>

      {/* Formulário de Input de Mensagem */}
      <form onSubmit={handleSend} className={css({ p: '4', bg: 'white', borderTop: '1px solid', borderColor: 'gray.200' })}>
        <Flex direction="row" gap="2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escreva sua mensagem aqui..."
            className={css({ flex: '1', px: '4', py: '2', border: '1px solid', borderColor: 'gray.300', borderRadius: 'lg' })}
          />
          <button type="submit" className={css({ bg: 'emerald.600', color: 'white', px: '5', py: '2', borderRadius: 'lg' })}>
            Enviar
          </button>
        </Flex>
      </form>
    </FrameComponent>
  );
}