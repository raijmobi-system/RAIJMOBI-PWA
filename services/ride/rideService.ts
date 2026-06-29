import { api } from '@/services/InterceptRequisition';
import { Ride, RideFilterParams } from '@/types/apiType';

export const RideService = {
  // Passamos o tipo do filtro nos parâmetros
  getAll: (params?: RideFilterParams) => api.get<Ride[]>('/ride/rides/', { params }),
  
  getById: (id: string) => api.get<Ride>(`/ride/rides/${id}/`),
  
  create: (data: Ride) => api.post<Ride>('/ride/rides/', data),
  
  update: (id: string, data: Partial<Ride>) => api.patch<Ride>(`/ride/rides/${id}/`, data),
  
  delete: (id: string) => api.delete<void>(`/ride/rides/${id}/`),

  getRecommendations: (userId: string, topN: number = 5) => 
    api.get<Ride[]>(`/ride/rides/ai-recommendations/?user_id=${userId}&top_n=${topN}`),

  aiFilter: (text: string) => api.post<{
    filters_applied: Record<string, string | number>;
    count: number;
    results: Ride[];
  }>('/ride/rides/ai-filter/', { text })
};