// services/chat_service.ts
import { api } from './api';

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
   * GET /rooms/
   */
  async getRooms(): Promise<ChatRoomData[]> {
    const response = await api.get<ChatRoomData[]>('/rooms/');
    return response.data;
  }

  /**
   * GET /rooms/{carona_id}/
   */
  async getRoomDetail(caronaId: string): Promise<ChatRoomData> {
    const response = await api.get<ChatRoomData>(`/rooms/${caronaId}/`);
    return response.data;
  }

  /**
   * GET /rooms/{carona_id}/messages/
   */
  async getHistoricalMessages(caronaId: string): Promise<ChatMessageBackend[]> {
    const response = await api.get<ChatMessageBackend[]>(`/rooms/${caronaId}/messages/`);
    return response.data;
  }
}

export const chatService = new ChatService();