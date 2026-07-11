// services/chat_socket.ts
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export interface MessageData {
  message: string;
  usuario_id: string;
  is_me: boolean;
  data_envio: string;
}

export type MessageCallback = (data: MessageData) => void;

class ChatSocketService {
  private socket: WebSocket | null = null;
  private wsUrlBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/chat";

  // 🌟 1. Transformamos o connect em async
  // Substitua o método connect dentro de services/chat_socket.ts por este:
  async connect(caronaId: string, onMessageReceived: MessageCallback, onDisconnect?: () => void) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // 1. Corrigindo o endpoint base para apontar exatamente para o ws/chat do Django Channels
   const cleanWsUrl = "ws://localhost:8000/ws/chat";
    
    let token = null;
    try {
      const { value } = await SecureStoragePlugin.get({ key: 'access_token' });
      token = value;
    } catch (e) {
      console.warn("[WebSocket] Token não encontrado no SecureStorage.");
    }
    
    // 2. CORREÇÃO DA BARRA: Adicionamos a barra estrita '/' após o ID da carona exigida pelo re_path
    const url = token 
      ? `${cleanWsUrl}/${caronaId}/?jwt=${token}&token=${token}` 
      : `${cleanWsUrl}/${caronaId}/`;
    
    console.log(`[WebSocket] Tentando conectar na URL: ${url}`);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => console.log(`[WebSocket] Conectado à carona: ${caronaId}`);
    
    this.socket.onmessage = (event) => {
      try {
        const data: MessageData = JSON.parse(event.data);
        onMessageReceived(data);
      } catch (error) {
        console.error("[WebSocket] Erro ao processar mensagem recebida:", error);
      }
    };

    this.socket.onclose = (event) => {
      console.warn(`[WebSocket] Conexão fechada. Código: ${event.code}`);
      if (onDisconnect) onDisconnect();
    };

    this.socket.onerror = (error) => console.error("[WebSocket] Erro na conexão:", error);
  }

  sendMessage(messageText: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ message: messageText }));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const chatSocketService = new ChatSocketService();