// services/chat_socket.ts

export interface MessageData {
  message: string;
  usuario_id: string;
  is_me: boolean;
  data_envio: string;
}

export type MessageCallback = (data: MessageData) => void;

class ChatSocketService {
  private socket: WebSocket | null = null;
  // Acessa o container exposto pelo Docker na porta 8002
  private wsUrlBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8002/ws/chat";

  /**
   * Conecta ao WebSocket do backend baseado na carona correspondente
   */
  connect(caronaId: string, onMessageReceived: MessageCallback, onDisconnect?: () => void) {
    // Evita duplicar conexões se já houver uma ativa
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // Garante a formatação correta da URL base
    const cleanWsUrl = this.wsUrlBase.endsWith('/') ? this.wsUrlBase.slice(0, -1) : this.wsUrlBase;
    
    // CORRIGIDO: Coleta o token de autenticação do localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Injeta o token na query string para que o TokenAuthMiddleware do Django possa validar
    const url = token 
      ? `${cleanWsUrl}/${caronaId}/?token=${token}` 
      : `${cleanWsUrl}/${caronaId}/`;
    
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log(`[WebSocket] Conectado com sucesso à carona: ${caronaId}`);
    };

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

    this.socket.onerror = (error) => {
      console.error("[WebSocket] Erro na conexão:", error);
    };
  }

  /**
   * Envia uma mensagem no formato esperado pelo `receive` do seu consumer.py
   */
  sendMessage(messageText: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("[WebSocket] Não foi possível enviar. Chat desconectado.");
      return;
    }

    // O backend espera um JSON contendo {"message": "texto"}
    const payload = {
      message: messageText,
    };

    this.socket.send(JSON.stringify(payload));
  }

  /**
   * Fecha a conexão ao sair da tela de chat
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log("[WebSocket] Desconectado manualmente.");
    }
  }
}

export const chatSocketService = new ChatSocketService();