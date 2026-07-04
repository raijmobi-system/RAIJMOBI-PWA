"use client";

import { useState } from 'react';
import axios from 'axios'; // 1. Importado axios puro
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'; // 2. Importado o storage nativo
import { Flex } from '@/styled-system/jsx';
import { Button, Link } from '@/components/atoms/action';
import { Text } from '@/components/atoms/typography';
import { FormField } from '@/components/molecules';

import Login from '@/services/user/Login';
import { useRouter } from 'next/navigation';
import { SocialLogin } from '@capgo/capacitor-social-login';

const GATEWAY_URL = 'http://localhost:8000';

export default function Runs() {
  interface CredentialsData {
    email: string;
    password: string;
  }

  const router = useRouter();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ==========================================
  // LOGIN TRADICIONAL (E-mail e Senha)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const formData = new FormData(e.currentTarget);
    const credenciais = Object.fromEntries(formData) as unknown as CredentialsData;
    
    const sucess = await Login(credenciais);

    if (sucess) {
      router.replace('/dashboard');
    } else {
      alert('E-mail ou senha incorretos.');
    }
  };

  // ==========================================
  // LOGIN NATIVO COM GOOGLE (CORRIGIDO)
  // ==========================================
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      // 1. Limpa tokens velhos do storage nativo para garantir segurança
      try {
        await SecureStoragePlugin.remove({ key: 'access_token' });
        await SecureStoragePlugin.remove({ key: 'refresh_token' });
      } catch (e) {
        // Ignora erro se a chave ainda não existir
      }

      // 2. Abre a janela nativa do Android/iOS
      const respostaGoogle = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      const idToken = respostaGoogle.result.idToken;

      if (!idToken) {
        throw new Error('Não foi possível obter o token do Google.');
      }

      // 3. USA AXIOS PURO (Evita o erro 401 causado pelo interceptor injetando token sujo)
      const response = await axios.post(`${GATEWAY_URL}/api/auth/google/`, { token: idToken }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;

      // 4. Salva no SecureStoragePlugin (Igual ao Login.ts)
      await SecureStoragePlugin.set({ key: 'access_token', value: data.access });
      await SecureStoragePlugin.set({ key: 'refresh_token', value: data.refresh });

      console.log('✅ Login via Google efetuado e tokens salvos com segurança!');

      // 5. Redirecionamento
      if (data.is_new_user) {
        router.replace('/onboarding/completar-perfil');
      } else {
        router.replace('/dashboard');
      }

    } catch (error: any) {
      console.error('Erro no login nativo com Google:', error);
      if (axios.isAxiosError(error)) {
        alert(`Erro na API: ${JSON.stringify(error.response?.data || error.message)}`);
      } else {
        alert('Falha ao realizar login com Google. Tente novamente.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <Flex width='full' height={'100%'} justifyContent='center' direction={'column'} padding={'4'} gap='4'>
       
      <form onSubmit={handleSubmit}>
        <FormField 
          id="Email" 
          label="Email"
          name="email"
          placeholder="Digite seu email..." 
        />
        <FormField 
          id="Password" 
          label="Senha" 
          placeholder="Digite sua Senha"
          name='password'
          type='password'
        />
        
        <Button width='full' type='submit'>
          Entrar
        </Button>
      </form>

      <Flex direction='row'>
        <Text> Não tem uma conta? </Text>
        <Link href="/cadastro">Cadastre-se aqui</Link>
      </Flex>

      <Button 
        type='button' 
        width='full' 
        variant='special' 
        onClick={handleGoogleLogin}
        disabled={loadingGoogle}
      >
        <img src="/google_logo.png" height={'44px'} width={'44px'} alt="Logo Google" />
        <Text weight='bold'>
          {loadingGoogle ? 'Conectando...' : 'Logar com o Google'}
        </Text>
      </Button>

    </Flex>
  );
}