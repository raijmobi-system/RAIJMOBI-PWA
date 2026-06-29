'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checarAutenticacao() {
      try {
        const { value: accessToken } = await SecureStoragePlugin.get({ key: 'access_token' });

        if (accessToken) {
          // Usuário tem token? Manda direto para a parte interna
          router.replace('/dashboard');
        } else {
          // Não tem? Manda para o login
          router.replace('user/login');
        }
      } catch (error) {
        // Se der erro ao ler o storage (chave não existe), vai para o login
        router.replace('/user/login');
      }
    }

    checarAutenticacao();
  }, [router]);

  // Enquanto decide, exibe uma tela de Splash neutra (comum em apps mobile)
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <p className="text-gray-500 animate-pulse">Carregando aplicativo...</p>
    </div>
  );
}