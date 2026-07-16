// services/ride/ratingService.ts
import { api } from '@/services/InterceptRequisition';

export interface RatingPayload {
  reservation: string;
  evaluator: string;
  evaluated: string;
  score: number;
}

export const RatingService = {
  create: async (payload: RatingPayload) => {
    return await api.post('/api/ride/ratings/', payload);
  }
};