// src/hooks/useGoogleAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { toast } from '@/lib/toast';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginComGoogle = async () => {
    setLoading(true);
    try {
      // 1. Chama o prompt nativo (iOS/Android) ou popup no Web
      const respostaGoogle = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      // 2. Extrai o idToken retornado de forma nativa
      // No Google, o token JWT que precisamos mandar pro Django fica em idToken
      if (respostaGoogle.result.responseType !== 'online') {
        throw new Error('Login do Google retornou modo offline.');
      }

      const idToken = respostaGoogle.result.idToken;

      if (!idToken) {
        throw new Error('Não foi possível obter o token de autenticação do Google.');
      }

      // 3. Envia o token para o seu back-end Django
      const responseApi = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await responseApi.json();

      if (!responseApi.ok) {
        throw new Error(data.detail || 'Erro na autenticação com o servidor.');
      }

      // 4. Salva os tokens JWT gerados pelo SimpleJWT
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // 5. O SEGREDO DO FLUXO: Redirecionamento Inteligente
      if (data.is_new_user) {
        // Usuário acabou de se cadastrar via Google mas não tem perfil!
        // Redireciona para a tela onde ele escolhe Motorista/Passageiro, CPF e Telefone.
        router.push('/onboarding/completar-perfil');
      } else {
        // Usuário veterano, já tem tudo cadastrado
        router.push('/home');
      }

    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast.error('Falha ao realizar login: ' + (error.message || 'Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return { loginComGoogle, loading };
}