"use client";

import { useState } from 'react';
import axios from 'axios';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
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
  // LOGIN NATIVO COM GOOGLE
  // ==========================================
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      // 1. Limpa tokens velhos do storage nativo para evitar conflitos de sessão anterior
      try {
        await SecureStoragePlugin.remove({ key: 'access_token' });
        await SecureStoragePlugin.remove({ key: 'refresh_token' });
      } catch (e) {
        // Ignora caso as chaves não existam ainda
      }

      // 2. Abre a janela nativa de autenticação do Android / iOS
      const respostaGoogle = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      if (respostaGoogle.result.responseType !== 'online') {
        throw new Error('Google Login retornou modo offline.');
      }

      const idToken = respostaGoogle.result.idToken;

      if (!idToken) {
        throw new Error('Não foi possível obter o token do Google.');
      }

      // 3. USA AXIOS PURO para evitar o interceptor injetando headers antigos
      const response = await axios.post(
        `${GATEWAY_URL}/api/auth/google/`, 
        { token: idToken }, 
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': undefined // 🌟 Garante que NENHUM token sujo/antigo será enviado!
          }
        }
      );
      
      const data = response.data;

      // 4. Salva no SecureStoragePlugin
      await SecureStoragePlugin.set({ key: 'access_token', value: data.access });
      await SecureStoragePlugin.set({ key: 'refresh_token', value: data.refresh });

      console.log('✅ Login via Google efetuado e tokens salvos com segurança!');

      // 🌟 5. O "PASSO 1": A DECISÃO DE REDIRECIONAMENTO
      if (data.is_new_user) {
        // Usuário novo! O Django criou a conta base na tabela Usuario mas ainda falta o Perfil (CPF/Tel).
        router.replace('/user/complete-profile');
      } else {
        // Usuário antigo com perfil já cadastrado! Vai direto pro app.
        router.replace('/dashboard');
      }

    } catch (error: any) {
      console.error('Erro no login nativo com Google:', error);
      if (axios.isAxiosError(error)) {
        alert(`Erro na API: ${JSON.stringify(error.response?.data?.detail || error.response?.data || error.message)}`);
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
        
        {/* 🌟 ADICIONADO: Link Esqueci minha senha alinhado à direita */}
        <Flex justifyContent="flex-end" width="full" marginBottom="4" marginTop="-2">
          <Link onClick={() => router.push('/user/forgot-password')} color='primary'>
            Esqueci minha senha
          </Link>
        </Flex>
        
        <Button width='full' type='submit'>
          Entrar
        </Button>
      </form>

      <Flex direction='row' gap='1' justifyContent='center'>
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