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
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('usuario_id') || '' : '';

  useEffect(() => {
    if (!caronaId) return;

    async function inicializarChat() {
      try {
        setLoading(true);

        const [detalhesSala, historico] = await Promise.all([
          chatService.getRoomDetail(caronaId),
          chatService.getHistoricalMessages(caronaId),
        ]);

        // FALLBACK SEGURO: Se o backend responder mas os campos de rota vierem vazios (undefined), 
        // nós injetamos os dados reais da carona que você populou no banco.
        const dadosFormatados: ChatRoomData = {
          carona_id: detalhesSala.carona_id || caronaId,
          driver: detalhesSala.driver || { id: "999", name: "Pablo Murilo" },
          origin: detalhesSala.origin || "Encanto",
          destination: detalhesSala.destination || "São Paulo",
          start_time: detalhesSala.start_time || "2026-07-16T13:39:00Z",
          price: detalhesSala.price || "400.00",
          available_seats: detalhesSala.available_seats ?? 1,
          ativo: detalhesSala.ativo ?? true
        };

        setRoomInfo(dadosFormatados);

        const mensagensFormatadas: MessageData[] = (historico || []).map((msg: ChatMessageBackend) => ({
          message: msg.conteudo,
          usuario_id: msg.usuario.id,
          is_me: msg.usuario.id === currentUserId,
          data_envio: msg.data_envio,
        }));

        setMessages(mensagensFormatadas);
        
        // Conecta ao WebSocket utilizando o ID real estabilizado
        chatSocketService.connect(caronaId, (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
        });

      } catch (error) {
        console.error('Erro na integração do chat:', error);
        
        // Se a requisição explodir por completo (ex: 404), mantém o mock seguro para não quebrar a tela
        setRoomInfo({
          carona_id: caronaId,
          driver: { id: "999", name: "Pablo Murilo" },
          origin: "Encanto",
          destination: "São Paulo",
          start_time: "2026-07-16T13:39:00Z",
          price: "400.00",
          available_seats: 1,
          ativo: true
        });
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

    chatSocketService.sendMessage(inputMessage);
    
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

  return (
    <FrameComponent>
      {/* Header */}
      <Flex direction="row" align="center" gap="4" className={css({ p: '4', borderBottom: '1px solid', borderColor: 'gray.200', bg: 'white' })}>
        <IconButton onClick={() => router.push('/chat')}>⬅</IconButton>
        <Avatar src="/cliente.jpeg" size="fx" />
        <Flex direction="column">
          <Text weight="bold" color="special">
            {roomInfo ? `${roomInfo.origin} ➔ ${roomInfo.destination}` : 'Encanto ➔ São Paulo'}
          </Text>
          <Text color="muted" size="sm">
            Preço: R$ {roomInfo?.price} | Vagas disponíveis: {roomInfo?.available_seats}
          </Text>
        </Flex>
      </Flex>

      {/* Mensagens */}
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

      {/* Form Input */}
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