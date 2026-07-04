import { api } from '@/services/InterceptRequisition';
import { Reservation } from '@/types/apiType';

export const ReservationService = {
  // GET: Lista todas as reservas
  getAll: () => api.get<Reservation[]>('api/ride/reservations/'),
  
  // GET: Detalhe de uma reserva específica
  getById: (id: string) => api.get<Reservation>(`api/ride/reservations/${id}/`),
  
  // POST: Cria uma nova reserva seguindo as regras de negócio
  create: (data: Reservation) => api.post<Reservation>('api/ride/reservations/', data),
    
  // PATCH: Atualiza o status (utilizado para confirmar ou cancelar)
  updateStatus: (id: string, status: 'confirmada' | 'cancelada') => 
    api.patch<Reservation>(`api/ride/reservations/${id}/`, { status }),

  // DELETE: Remove/Deleta logicamente (Soft Delete se aplicável)
  delete: (id: string) => api.delete<void>(`api/ride/reservations/${id}/`)
};