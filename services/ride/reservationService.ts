import { api } from '@/services/InterceptRequisition';
import { Reservation } from '@/types/apiType';

export const ReservationService = {
  // GET: Lista todas as reservas (Aceita params para paginação e filtros como ?passenger=UUID)
  getAll: (params?: any) => api.get<any>('api/ride/reservations/', { params }),
  
  // GET: Detalhe de uma reserva específica
  getById: (id: string) => api.get<Reservation>(`api/ride/reservations/${id}/`),
  
  // POST: Cria uma nova reserva seguindo as regras de negócio
  create: (data: Partial<Reservation>) => api.post<Reservation>('api/ride/reservations/', data),
    
  // PATCH: Atualiza especificamente o status (utilizado para confirmar ou cancelar)
  updateStatus: (id: string | number, status: 'confirmada' | 'cancelada') => 
    api.patch<Reservation>(`api/ride/reservations/${id}/`, { status }),

  // PATCH Genérico (Para o caso de precisar editar campos extras no futuro)
  update: (id: string | number, data: any) => api.patch<Reservation>(`api/ride/reservations/${id}/`, data),

  // DELETE: Remove/Deleta logicamente
  delete: (id: string) => api.delete<void>(`api/ride/reservations/${id}/`)
};