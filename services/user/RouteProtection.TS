import React, { createContext, useContext, useEffect, useState } from 'react';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { api } from './InterceptRequisition'; // Sua instância do Axios configurada

interface AuthContextType {
  autenticado: boolean;
  carregando: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarValidacaoInicial() {
      try {
        const { value: accessToken } = await SecureStoragePlugin.get({ key: 'access_token' });
        
        if (accessToken) {
          // Opcional: Fazer uma requisição rápida para verificar se o token ainda é válido
          // await api.get('/usuarios/me/');
          setAutenticado(true);
        } else {
          setAutenticado(false);
        }
      } catch (error) {
        setAutenticado(false);
      } finally {
        setCarregando(false);
      }
    }

    verificarValidacaoInicial();
  }, []);

  const logout = async () => {
    await SecureStoragePlugin.remove({ key: 'access_token' });
    await SecureStoragePlugin.remove({ key: 'refresh_token' });
    setAutenticado(false);
  };

  return (
    <AuthContext.Provider value={{ autenticado, carregando, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);