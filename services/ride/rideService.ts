import { api } from '@/services/InterceptRequisition';
import { Ride, RideFilterParams } from '@/types/apiType';

// 🌟 Criamos uma interface para refletir a paginação do Django
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const RideService = {
  // 1. Atualizamos o tipo de retorno para a Interface Paginada (ou any para fallback)
  // 2. Forçamos o 'params as any' para o Axios não entrar em conflito com a interface customizada
  getAll: (params?: RideFilterParams) => 
    api.get<PaginatedResponse<Ride> | any>('api/ride/rides/', { params: params as any }),
  
  getById: (id: string) => api.get<Ride>(`api/ride/rides/${id}/`),
  
  create: (data: any) => api.post<Ride>('api/ride/rides/', data),
  
  update: (id: string, data: Partial<any>) => api.patch<Ride>(`api/ride/rides/${id}/`, data),
  
  delete: (id: string) => api.delete<void>(`api/ride/rides/${id}/`),

  getRecommendations: (userId: string, topN: number = 5) => 
    api.get<Ride[]>(`api/ride/rides/ai-recommendations/?user_id=${userId}&top_n=${topN}`),

  aiFilter: (text: string) => api.post<{
    filters_applied: Record<string, string | number>;
    count: number;
    results: Ride[];
  }>('api/ride/rides/ai-filter/', { text })
};