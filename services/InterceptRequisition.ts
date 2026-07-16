import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const GATEWAY_URL = 'http://localhost:8000';

// FUNÇÃO AUXILIAR BLINDADA: Lê do storage sem explodir se a chave não existir
async function getSafeToken(key: string): Promise<string | null> {
  try {
    const { value } = await SecureStoragePlugin.get({ key });
    return value || null;
  } catch (error) {
    // Se der erro de "Item with given key does not exist", retorna null em paz
    return null;
  }
}

// 1. Cria uma instância personalizada do Axios
export const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR DE REQUISIÇÃO: Anexa o Access Token de forma segura
api.interceptors.request.use(
  async (config) => {
    const accessToken = await getSafeToken('access_token');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 🌟 SE FOR UPLOAD DE ARQUIVO (FormData), REMOVE O JSON GLOBAL:
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 3. INTERCEPTOR DE RESPOSTA: Tenta o Refresh Token sem quebrar a Web
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn(`⚠️ Requisição falhou com 401 na rota: ${originalRequest.url}. Tentando refresh...`);

      try {
        // Busca o refresh token usando nossa função segura
        const refreshToken = await getSafeToken('refresh_token');

        if (!refreshToken) {
          throw new Error('Nenhum refresh token disponível no armazenamento.');
        }

        console.log('🔄 Enviando refresh token para renovação...');
        
        const resposta = await axios.post(`${GATEWAY_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const novoAccessToken = resposta.data.access;

        await SecureStoragePlugin.set({ key: 'access_token', value: novoAccessToken });

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${novoAccessToken}`;
        }

        console.log('✅ Token renovado com sucesso! Refazendo chamada original...');
        return api(originalRequest);

      } catch (refreshError: any) {
        console.error('❌ FALHA NO REFRESH TOKEN:', {
          status: refreshError.response?.status || 'Sem status de rede',
          motivo: refreshError.response?.data || refreshError.message,
        });

        // Limpa de forma segura
        try {
          await SecureStoragePlugin.remove({ key: 'access_token' });
          await SecureStoragePlugin.remove({ key: 'refresh_token' });
        } catch (e) {}

        // Evita loop de redirecionamento se já estivermos na tela de login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/user/login')) {
          window.location.href = '/user/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);