import { api } from '@/services/InterceptRequisition';
import { Vehicle } from '@/types/apiType';

export const VehicleService = {
  create: (data: Vehicle) => api.post<Vehicle>('/ride/vehicles/', data),
  getByUser: () => api.get<Vehicle[]>('/ride/vehicles/'),
  update: (id: string, data: Partial<Vehicle>) => api.patch<Vehicle>(`/ride/vehicles/${id}/`, data),
  delete: (id: string) => api.delete<void>(`/ride/vehicles/${id}/`)
};