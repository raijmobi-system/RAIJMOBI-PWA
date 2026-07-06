// src/services/user/userService.ts
import { api } from '@/services/InterceptRequisition';

export interface ProfilePayload {
  nome?: string;
  telefone?: string;
  foto?: File | null;
}

export const UserService = {
  // ==========================================
  // PERFIL DO USUÁRIO
  // ==========================================
  getProfile: () => api.get('/api/profile/'),

  updateProfile: (data: FormData) => {
    return api.patch('/api/profile/', data);
  },

  completeGoogleProfile: (data: FormData) => {
    return api.post('/api/profile/complete/', data);
  },

  // ==========================================
  // AUTENTICAÇÃO E REGISTRO
  // ==========================================
  register: (data: FormData) => {
    return api.post('/api/register/', data);
  },

  googleLogin: (idToken: string) => {
    return api.post('/api/auth/google/', { token: idToken });
  },

  logout: (refreshToken: string) => {
    return api.post('/api/logout/', { refresh: refreshToken });
  }
};