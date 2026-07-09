import { api } from '@/services/InterceptRequisition';
import { Ride, RideFilterParams } from '@/types/apiType';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const RideService = {
  getAll: (params?: RideFilterParams) => 
    api.get<PaginatedResponse<Ride>>('api/ride/rides/', { params: params as any }),
  
  getById: (id: string) => api.get<Ride>(`api/ride/rides/${id}/`),
  
  create: (data: any) => api.post<Ride>('api/ride/rides/', data),
  
  update: (id: string, data: Partial<any>) => api.patch<Ride>(`api/ride/rides/${id}/`, data),
  
  delete: (id: string) => api.delete<void>(`api/ride/rides/${id}/`),

  // Atualizado para não precisar concatenar obrigatoriamente o user_id na query string se o backend usar o request.user
  getRecommendations: (topN: number = 5) => 
    api.get<Ride[]>(`api/ride/rides/ai-recommendations/?top_n=${topN}`),

  aiFilter: (text: string) => api.post<{
    filters_applied: Record<string, string | number>;
    count: number;
    results: Ride[];
  }>('api/ride/rides/ai-filter/', { text })
};