import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import {useRouter} from 'next/navigation'
const GATEWAY_URL = 'http://localhost:8000';



// 1. Cria uma instância personalizada do Axios
export const api = axios.create({
  
  baseURL: GATEWAY_URL,
  headers: {
    'Accept': 'application/json', // <--- Isso força o Django a sempre responder JSON
    'Content-Type': 'application/json',
  },
});

// 2. INTERCEPTOR DE REQUISIÇÃO: Garante que toda requisição vai com o Access Token atualizado
api.interceptors.request.use(
  async (config) => {
    try {
      const { value: accessToken } = await SecureStoragePlugin.get({ key: 'access_token' });
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      // Se não achar o token, segue a requisição sem ele (ex: página de login)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Verifica se o erro foi 401 e se não é uma repetição
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn(`⚠️ Requisição falhou com 401 na rota: ${originalRequest.url}. Tentando refresh...`);

      try {
        const { value: refreshToken } = await SecureStoragePlugin.get({ key: 'refresh_token' });

        if (!refreshToken) {
          throw new Error('Nenhum refresh token encontrado no storage.');
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
        // LOG DIAGNÓSTICO DO MOTIVO REAL DA FALHA
        console.error('❌ FALHA NO REFRESH TOKEN:', {
          status: refreshError.response?.status,
          dados: refreshError.response?.data || refreshError.message,
        });
        
        // Só apaga se realmente falhou na API (evita apagar à toa em testes)
        await SecureStoragePlugin.remove({ key: 'access_token' });
        await SecureStoragePlugin.remove({ key: 'refresh_token' });

        window.location.href = '/user/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);