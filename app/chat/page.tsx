"use client"

import { useEffect, useState } from "react";
import { FrameComponent } from "@/components/organisms";
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import { CardComponent } from '@/components/molecules';
import { Icon } from '@/components/atoms/presentation';
import { useRouter } from "next/navigation";
import { chatService, ChatRoomData } from "@/services/chat_service";

export default function ChatListPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoomData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarSalas() {
      try {
        setLoading(true);
        const salasReais = await chatService.getRooms();
        setRooms(salasReais);
      } catch (error) {
        console.error("Erro ao buscar salas de chat do backend:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarSalas();
  }, []);

  if (loading) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" height="50vh">
          <Text color="muted">Carregando suas conversas...</Text>
        </Flex>
      </FrameComponent>
    );
  }

  if (rooms.length === 0) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" height="50vh" direction="column" gap="2">
          <Text weight="bold" color="special">Nenhuma conversa por aqui</Text>
          <Text color="muted" size="sm">As conversas aparecem assim que você entrar em uma carona.</Text>
        </Flex>
      </FrameComponent>
    );
  }

  return (
    <FrameComponent>
      <Flex direction="column" gap="3">
        {rooms.map((room) => {
          const driverName = room.driver?.name || "Motorista";
          
          // Mantido fixo a foto do Pablo por enquanto
          const driverAvatar = "/cliente.jpeg";
          
          // Mapeia dinamicamente tanto chaves em inglês quanto em português do Django
          const localOrigem = room.origin || (room as any).origem || (room as any).carona?.origem || "Encanto";
          const localDestino = room.destination || (room as any).destino || (room as any).carona?.destino || "São Paulo";

          const formatTime = (isoString: string) => {
            try {
              if (!isoString) {
                return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
              const date = new Date(isoString);
              if (isNaN(date.getTime())) {
                return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch {
              return "--:--";
            }
          };

          return (
            <CardComponent 
              key={room.carona_id}
              fullWidth={true} 
              direction="row" 
              onClick={() => router.push(`/chat/conversation?id=${room.carona_id}`)}
              content={
                <Flex direction="row" gap='4' align="center">
                  <Avatar src={driverAvatar} size="fx" />
                  <Flex direction="column">
                    <Text color='special' weight="bold">
                      {driverName}
                    </Text>
                    <Text color='muted' size="sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                      {localOrigem} ➔ {localDestino}
                    </Text>
                  </Flex>
                </Flex>
              }
              extraContent={
                <Flex direction='column' align='flex-end' justify="center">
                  <Text color='muted' size="xs">
                    {formatTime(room.start_time || (room as any).data_partida)}
                  </Text>
                  <Icon></Icon>
                </Flex>
              }
            />
          );
        })}
      </Flex>
    </FrameComponent>
  );
}