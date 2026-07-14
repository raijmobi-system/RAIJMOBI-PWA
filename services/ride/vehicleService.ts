import { api } from '@/services/InterceptRequisition';

// Tipagem baseada no seu models.py e serializers.py do Django[cite: 23]
export interface VehiclePayload {
  model: string;
  type_vehicle: 'carro' | 'moto';
  color: 'preto' | 'branco' | 'vermelho' | 'azul';
  plate: string;
  seats: number;
  photo?: File | string | null; // Adicionado suporte opcional para a foto
}

export const VehicleService = {
  // O POST atualizado para aceitar FormData (necessário para envio de imagem)
  create: (data: FormData | VehiclePayload) => {
    return api.post('api/ride/vehicles/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Rotas de listagem mantidas intactas[cite: 23]
  getAll: () => api.get('api/ride/vehicles/'),
  getById: (id: string) => api.get(`api/ride/vehicles/${id}/`),

  // O UPDATE atualizado para suportar envio de nova foto via FormData
  update: (id: string, data: FormData | Partial<VehiclePayload>) => {
    return api.patch(`api/ride/vehicles/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  delete: (id: string) => api.delete(`api/ride/vehicles/${id}/`)
};