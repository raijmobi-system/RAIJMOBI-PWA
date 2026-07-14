// services/chat_service.ts

// 🌟 1. Substituímos o import local pela sua API blindada do Capacitor
import { api } from '@/services/InterceptRequisition';

export interface ChatUser {
  id: string;
  name: string;
}

export interface ChatRoomData {
  carona_id: string;
  driver: ChatUser | null;
  origin: string;
  destination: string;
  start_time: string;
  price: string;
  available_seats: number;
  ativo: boolean;
}

export interface ChatMessageBackend {
  id: number;
  usuario: ChatUser;
  conteudo: string;
  data_envio: string;
}

class ChatService {
  /**
   * GET /api/chat/rooms/
   */
  async getRooms(): Promise<ChatRoomData[]> {
    // 🌟 2. Adicionamos o prefixo /api/chat/ para o Kong rotear corretamente
    const response = await api.get<ChatRoomData[]>('/api/chat/rooms/');
    return response.data;
  }

  /**
   * GET /api/chat/rooms/{carona_id}/
   */
  async getRoomDetail(caronaId: string): Promise<ChatRoomData> {
    const response = await api.get<ChatRoomData>(`/api/chat/rooms/${caronaId}/`);
    return response.data;
  }

  /**
   * GET /api/chat/rooms/{carona_id}/messages/
   */
  async getHistoricalMessages(caronaId: string): Promise<ChatMessageBackend[]> {
    const response = await api.get<ChatMessageBackend[]>(`/api/chat/rooms/${caronaId}/messages/`);
    return response.data;
  }
}

export const chatService = new ChatService();