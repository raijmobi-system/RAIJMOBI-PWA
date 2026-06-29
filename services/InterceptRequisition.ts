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
  (response) => response, // Se a requisição deu certo, só passa adiante
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Verifica se o erro foi 401 (Não autorizado) e se já não estamos tentando o refresh para evitar loop infinito
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true; // Marca que já estamos tentando recuperar esta requisição

      try {
        // Busca o refresh_token salvo no dispositivo
        const { value: refreshToken } = await SecureStoragePlugin.get({ key: 'refresh_token' });

        if (!refreshToken) {
          throw new Error('Nenhum refresh token disponível.');
        }

        // Tenta buscar um novo access_token no servidor (use a rota correta da sua API)
        // Usamos o axios puro aqui, e não a nossa instância 'api', para não disparar os mesmos interceptors
        const resposta = await axios.post(`${GATEWAY_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const novoAccessToken = resposta.data.access;

        // Salva o novo access token de volta no armazenamento seguro do Capacitor
        await SecureStoragePlugin.set({ key: 'access_token', value: novoAccessToken });

        // Atualiza o cabeçalho da requisição original falhada com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${novoAccessToken}`;
        }

        // Executa novamente a requisição original que tinha falhado e retorna o resultado dela
        return api(originalRequest);

      } catch (refreshError) {
        // SE O REFRESH FALHAR: O token de atualização também expirou ou foi revogado
        console.error('Refresh token expirou ou é inválido. Redirecionando para login...');
        
        // Limpa os tokens do armazenamento seguro
        await SecureStoragePlugin.remove({ key: 'access_token' });
        await SecureStoragePlugin.remove({ key: 'refresh_token' });

        // Redireciona o usuário para a tela de Login
        // Se estiver usando React Navigation (Expo/React Native) ou Ionic/Angular Router:
        // Exemplo para a Web/Capacitor simples:
        window.location.href = '/login'; 
        // Se estiver usando uma biblioteca de rotas específica do seu framework, dispare a navegação dela aqui
        
        return Promise.reject(refreshError);
      }
    }

    // Se for qualquer outro tipo de erro (404, 500, etc), só passa o erro para o componente tratar
    return Promise.reject(error);
  }
);