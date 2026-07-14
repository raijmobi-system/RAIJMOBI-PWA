"use client";

import { useEffect, useState } from "react";
import { FrameComponent } from "@/components/organisms";
import { Flex } from '@/styled-system/jsx';
import { Text } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/presentation';
import { CardComponent } from '@/components/molecules';
import { Icon } from '@/components/atoms/presentation';
import { useRouter } from "next/navigation";

// Serviços
import { chatService, ChatRoomData } from "@/services/chat_service";
import { RideService } from "@/services/ride/rideService";

// Interface para a sala enriquecida com os dados do Ride Service
interface EnrichedChatRoom extends ChatRoomData {
  rideReal?: any;
}

export default function ChatListPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<EnrichedChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarSalasEDadosDaCarona() {
      try {
        setLoading(true);
        // 1. Busca as salas brutas no Chat Service
        const salasBrutas = await chatService.getRooms();

        // 2. Para cada sala, busca os dados reais da carona no Ride Service usando o carona_id
        const salasEnriquecidas = await Promise.all(
          salasBrutas.map(async (room) => {
            try {
              if (!room.carona_id) return room;
              
              const resRide = await RideService.getById(String(room.carona_id));
              return {
                ...room,
                rideReal: resRide.data // Anexa o objeto Ride inteiro retornado pelo Django
              };
            } catch (err) {
              console.warn(`⚠️ Não foi possível carregar detalhes da carona ${room.carona_id}`, err);
              return room; // Se der erro em uma carona específica, retorna a sala sem quebrar a tela
            }
          })
        );

        setRooms(salasEnriquecidas);
      } catch (error) {
        console.error("❌ Erro geral ao carregar salas de chat:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarSalasEDadosDaCarona();
  }, []);

  // 🌟 FUNÇÃO AUXILIAR: Extrai o nome da cidade do JSONField do Django (ou string)
  const getLocationName = (loc: any) => {
    if (!loc) return "---";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      return loc.city || loc.cidade || loc.state || loc.estado || "---";
    }
    return "---";
  };

  if (loading) {
    return (
      <FrameComponent>
        <Flex justify="center" align="center" height="50vh">
          <Text color="muted" weight="bold">Carregando suas conversas e trajetos...</Text>
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
          const ride = room.rideReal || {};

          // 1. Extrai o motorista a partir dos dados do RideService ou do ChatService
          const vehicle = typeof ride.vehicle === 'object' ? ride.vehicle : (ride.vehicle_detail || {});
          const driver = typeof vehicle.user === 'object' ? vehicle.user : (vehicle.user_detail || room.driver || {});
          
          const driverName = driver.name || (room as any).motorista?.name || "Motorista Parceiro";
          const driverAvatar = driver.photo || driver.avatar || "/driver-placeholder.png";

          // 2. Extrai Origem e Destino do campo JSONField do Ride Service
          const localOrigem = getLocationName(ride.origin || room.origin || (room as any).origem);
          const localDestino = getLocationName(ride.destination || room.destination || (room as any).destino);

          // 3. Formatação do horário real da viagem (start_time do Ride Service)
          const formatTime = (isoString: string) => {
            try {
              if (!isoString) return "--:--";
              const date = new Date(isoString);
              if (isNaN(date.getTime())) return "--:--";
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch {
              return "--:--";
            }
          };

          const rawStartTime = ride.start_time || room.start_time || (room as any).data_partida;

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
                    {formatTime(rawStartTime)}
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