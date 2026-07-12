'use client';

import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { chatSocketService, MessageData } from '@/services/chat_socket';
import { chatService, ChatRoomData } from '@/services/chat_service';
import { FrameComponent } from "@/components/organisms";
import { IconButton } from '@/components/atoms/action';
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import { css } from "@/styled-system/css";
import { api } from '@/services/InterceptRequisition';

// 🌟 Importação do Header dinâmico
import MessageHeader from '@/components/fixed/MessageHeader';

function ConversationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caronaId = String(searchParams.get('id') || '');

  const [roomInfo, setRoomInfo] = useState<ChatRoomData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🌟 DICIONÁRIO DE AVATARES: Mapeia { [user_id]: "url_da_foto" }
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('usuario_id') || '' : '';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🌟 BUSCADOR DE FOTOS: Consulta o user_service/ride_service para pegar o avatar
  const fetchUserAvatars = useCallback(async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds)).filter(id => id && !avatarMap[id]);
    if (uniqueIds.length === 0) return;

    const newMap = { ...avatarMap };
    
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          // Consulta o endpoint de usuários (registrado no seu router como /users/)
          const response = await api.get(`/api/users/${id}/`);
          const userData = response.data;
          newMap[id] = userData?.photo || userData?.avatar || '/driver-placeholder.png';
        } catch (err) {
          console.warn(`⚠️ Foto do usuário ${id} não encontrada. Usando fallback.`);
          newMap[id] = '/driver-placeholder.png';
        }
      })
    );

    setAvatarMap(prev => ({ ...prev, ...newMap }));
  }, [avatarMap]);

  useEffect(() => {
    if (!caronaId) {
      //eslint-disable-next-line
      setError('ID da carona não fornecido.');
      setLoading(false);
      return;
    }

    async function inicializarChat() {
      try {
        const roomData = await chatService.getRoomDetail(caronaId);
        setRoomInfo(roomData);

        const historicalData = await chatService.getHistoricalMessages(caronaId);

        // Extrai todos os IDs de usuários que já mandaram mensagem ou estão na sala
        const idsParaBuscar: string[] = [];
        if (roomData?.driver?.id) idsParaBuscar.push(roomData.driver.id);
        
        const formattedHistory: MessageData[] = historicalData.map((msg) => {
          const userIdFromMsg = msg.usuario?.id || '';
          if (userIdFromMsg) idsParaBuscar.push(userIdFromMsg);
          
          return {
            message: msg.conteudo,
            usuario_id: userIdFromMsg,
            is_me: userIdFromMsg !== '' && userIdFromMsg === currentUserId,
            data_envio: msg.data_envio,
          };
        });

        setMessages(formattedHistory);
        
        // Dispara a busca de fotos em segundo plano
        fetchUserAvatars(idsParaBuscar);

        await chatSocketService.connect(
          caronaId,
          (newData: MessageData) => {
            const messageWithAuth: MessageData = {
              ...newData,
              is_me: newData.usuario_id === currentUserId || newData.is_me
            };

            // Se for alguém novo mandando mensagem, busca a foto dele
            if (newData.usuario_id) {
              fetchUserAvatars([newData.usuario_id]);
            }

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
  }, [caronaId, currentUserId]); // Removido fetchUserAvatars da dependência para evitar loops

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

  // Extração inteligente de nomes para o Header
  const getCityName = (loc: any) => {
    if (!loc) return "";
    return typeof loc === 'object' ? (loc.city || loc.cidade || "") : loc;
  };

  const originText = getCityName(roomInfo?.origin);
  const destText = getCityName(roomInfo?.destination);
  const routeString = originText && destText ? `${originText} ➔ ${destText}` : "Chat do Grupo";
  const driverAvatarUrl = roomInfo?.driver?.id ? (avatarMap[roomInfo.driver.id] || "/driver-placeholder.png") : "/driver-placeholder.png";

  if (loading) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" minHeight="70vh">
          <Text color="muted" weight="bold">Carregando mensagens e fotos...</Text>
        </Flex>
      </FrameComponent>
    );
  }

  if (error) {
    return (
      <FrameComponent>
        <Flex direction="column" justify="center" align="center" minHeight="70vh" gap="4" p="4">
          <Text color="danger" weight="bold">{error}</Text>
          <IconButton onClick={() => window.location.reload()}>
            <Text color="white">Tentar Novamente</Text>
          </IconButton>
        </Flex>
      </FrameComponent>
    );
  }

  return (
    <Flex direction="column" height="100vh" width="100%" bg="#f9f9f9" overflow="hidden">
      
      {/* 🌟 HEADER INTEGRADO COM DADOS REAIS DO GRUPO */}
      <MessageHeader 
        driverName={roomInfo?.driver?.name || "Motorista Parceiro"}
        routeInfo={routeString}
        avatarUrl={driverAvatarUrl}
        onBack={() => router.push('/chat')}
      />

      {/* ÁREA DE MENSAGENS COM ROLAGEM */}
      <Flex direction="column" gap="3" className={css({ p: '4', flex: '1', overflowY: 'auto' })}>
        {messages.map((msg, index) => {
          const senderPhoto = avatarMap[msg.usuario_id] || '/driver-placeholder.png';

          return (
            <Flex
              key={index}
              direction="row"
              gap="2"
              align="flex-end"
              className={css({
                alignSelf: msg.is_me ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              })}
            >
              {/* 🌟 EXIBE A FOTO APENAS PARA AS MENSAGENS DOS OUTROS (ESQUERDA) */}
              {!msg.is_me && (
                <Avatar src={senderPhoto} size="sm" />
              )}

              <Flex
                direction="column"
                className={css({
                  p: '3.5',
                  borderRadius: '2xl',
                  borderBottomLeftRadius: !msg.is_me ? '2px' : '2xl',
                  borderBottomRightRadius: msg.is_me ? '2px' : '2xl',
                  bg: msg.is_me ? '#547812' : 'white',
                  color: msg.is_me ? 'white' : 'gray.800',
                  boxShadow: 'sm',
                  border: msg.is_me ? 'none' : '1px solid',
                  borderColor: 'gray.200',
                })}
              >
                <Text className={css({ fontSize: 'sm', color: 'inherit', lineHeight: '1.4' })}>
                  {msg.message}
                </Text>
              </Flex>

              {/* 🌟 EXIBE A FOTO PARA AS SUAS PRÓPRIAS MENSAGENS (DIREITA) */}
              {msg.is_me && (
                <Avatar src={senderPhoto} size="sm" />
              )}
            </Flex>
          );
        })}
        <div ref={chatEndRef} />
      </Flex>

      {/* BARRA DE DIGITAÇÃO FIXA NO RODAPÉ */}
      <form onSubmit={handleSend} className={css({ p: '3', bg: 'white', borderTop: '1px solid', borderColor: 'gray.200', width: '100%' })}>
        <Flex direction="row" gap="2" align="center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escreva sua mensagem no grupo..."
            className={css({ flex: '1', px: '4', py: '2.5', border: '1px solid', borderColor: 'gray.300', borderRadius: 'full', fontSize: 'sm', outline: 'none', _focus: { borderColor: '#547812' } })}
          />
          <IconButton type="submit" variant="detail" className={css({ borderRadius: 'full', w: '42px', h: '42px', bg: '#547812', flexShrink: 0 })}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>➤</span>
          </IconButton>
        </Flex>
      </form>
    </Flex>
  );
}

// Envelopamento obrigatório para o App Router
export default function ConversationPage() {
  return (
    <Suspense fallback={
      <FrameComponent>
        <Flex justify="center" align="center" minHeight="100vh">
          <Text color="muted" weight="bold">Abrindo sala de conversa...</Text>
        </Flex>
      </FrameComponent>
    }>
      <ConversationContent />
    </Suspense>
  );
}