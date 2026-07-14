// services/notificationService.ts
import { api } from '@/services/InterceptRequisition';

export interface NotificationData {
  id: number;
  user_id: string;
  message: string;
  service_origin: string;
  read: boolean;
  created_at: string;
}

export const NotificationService = {
  // Lista todas as notificações do usuário logado
  getAll: async (): Promise<NotificationData[]> => {
    // O Django usa um ListAPIView, que geralmente retorna um array direto (ou um objeto com .results se houver paginação)
    const response = await api.get('/api/notifications/');
    return response.data.results || response.data;
  },

  // Marca uma notificação específica como lida (método PATCH como definido no seu views.py)
  markAsRead: async (id: number): Promise<NotificationData> => {
    const response = await api.patch(`/api/notifications/${id}/read/`);
    return response.data;
  }
};