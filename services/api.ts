// services/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'localhost:8000/api/chat';
export const api = {
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Tratamento simples para garantir que o endpoint comece com '/' e não duplique a barra da URL base
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

    const response = await fetch(`${cleanBaseUrl}${formattedEndpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  }
};