import { api } from '@/services/InterceptRequisition';

// Tipagem baseada no seu models.py e serializers.py do Django
export interface VehiclePayload {
  model: string;
  type_vehicle: 'carro' | 'moto';
  color: 'preto' | 'branco' | 'vermelho' | 'azul';
  plate: string;
  seats: number;
}

export const VehicleService = {
  // O POST que vamos usar
  create: (data: VehiclePayload) => api.post('api/ride/vehicles/', data),
  
  // Deixando os outros preparados para o futuro
  getAll: () => api.get('api/ride/vehicles/'),
  getById: (id: string) => api.get(`api/ride/vehicles/${id}/`),
  update: (id: string, data: Partial<VehiclePayload>) => api.patch(`api/ride/vehicles/${id}/`, data),
  delete: (id: string) => api.delete(`api/ride/vehicles/${id}/`)
};