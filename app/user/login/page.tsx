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
import { toast } from '@/lib/toast';

const GATEWAY_URL = 'http://localhost:8000';

export default function Runs() {
  interface CredentialsData {
    email: string;
    password: string;
  }

  const router = useRouter();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const formData = new FormData(e.currentTarget);
    const credenciais = Object.fromEntries(formData) as unknown as CredentialsData;
    
    const sucess = await Login(credenciais);

    if (sucess) {
      router.replace('/dashboard');
    } else {
      toast.error('E-mail ou senha incorretos.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      try {
        await SecureStoragePlugin.remove({ key: 'access_token' });
        await SecureStoragePlugin.remove({ key: 'refresh_token' });
      } catch (e) {}

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

      const response = await axios.post(
        `${GATEWAY_URL}/api/auth/google/`, 
        { token: idToken }, 
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': undefined 
          }
        }
      );
      
      const data = response.data;

      await SecureStoragePlugin.set({ key: 'access_token', value: data.access });
      await SecureStoragePlugin.set({ key: 'refresh_token', value: data.refresh });

      console.log('✅ Login via Google efetuado e tokens salvos com segurança!');

      if (data.is_new_user) {
        router.replace('/user/complete-profile');
      } else {
        router.replace('/dashboard');
      }

    } catch (error: any) {
      console.error('Erro no login nativo com Google:', error);
      if (axios.isAxiosError(error)) {
        toast.error(`Erro na API: ${JSON.stringify(error.response?.data?.detail || error.response?.data || error.message)}`);
      } else {
        toast.error('Falha ao realizar login com Google. Tente novamente.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <Flex 
      width='full' 
      minHeight='100vh' 
      justifyContent='center' 
      alignItems='center' 
      padding={'4'} 
      style={{
        backgroundColor: '#4c6b12',
        // 🗺️ NOVO PADRÃO: Contém pins de mapas (localização), rotas pontilhadas e vias curvas conectadas em padrão geométrico
        backgroundImage: 'linear-gradient(135deg, rgba(76, 107, 18, 0.88) 0%, rgba(26, 36, 10, 0.96) 100%), url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik0wLDMwIFEzMCwzMCA2MCw2MCBUMTIwLDYwIi8+PHBhdGggZD0iTTAsMzAgUTMwLDMwIDYwLDYwIFQxMjAsNjAiIHN0cm9rZS1kYXNoYXJyYXk9IjQsNCIgc3Ryb2tlLW9wYWNpdHk9IjAuMTUiLz48cGF0aCBkPSJNMzAsMCBRMzAsNDAgOTAsODAgVDkwLDEyMCIvPjxwYXRoIGQ9Ik0zMCwwIFFzMCw0MCA5MCw4MCBUOTAsMTIwIiBzdHJva2UtZGFzaGFycmF5PSI0LDQiIHN0cm9rZS1vcGFjaXR5PSIwLjE1Ii8+PC9nPCharacterWcgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjA2Ij48cGF0aCBkPSJNNjAsNDggQzU2LDQ4IDUzLDUxIDUzLDU1IEM1Myw2MCA2MCw2NyA2MCw2NyBDNjAsNjcgNjcsNjAgNjcsNTUgQzY3LDUxIDY0LDQ4IDYwLDQ4IFogTTYwLDU3IEM1OC45LDU3IDU4LDU2LjEgNTgsNTUgQzU4LDUzLjkgNTguOSw1MyA2MCw1MyBDNjEuMSw1MyA2Miw1My45IDYyLDU1IEM2Miw1Ni4xIDYxLjEsNTcgNjAsNTcgWiIvPjxwYXRoIGQ9Ik0xMCwxOCBDNiwxOCAzLDIxIDMsMjUgQzMsMzAgMTAsMzcgMTAsMzcgQzEwLDM3IDE3LDMwIDE3LDI1IEMxNywyMSAxNCwxOCAxMCwxOCBaIE0xMCwyNyBDOC45LDI3IDgsMjYuMSA4LDI1IEM4LDIzLjkgOC45LDIzIDEwLDIzIEMxMS4xLDIzIDEyLDIzLjkgMTIsMjUgQzEyLDI2LjEgMTEuMSwyNyAxMCwyNyBaIi8+PC9nPjwvc3ZnPg==")',
        backgroundRepeat: 'repeat',
        backgroundSize: '120px 120px',
        backgroundPosition: 'center'
      }}
    >
      <Flex 
        direction={'column'} 
        width='full' 
        maxWidth='440px' 
        gap='5'
        backgroundColor="#ffffff" 
        padding={'8'} 
        borderRadius={'2xl'} 
        borderWidth="1px" 
        borderColor="rgba(0, 0, 0, 0.05)" 
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
      >
        
        <Flex justifyContent="center" width="full" marginBottom="2">
          <img 
            src="/Logo.jpg" 
            alt="RaijMobi Logo" 
            style={{ height: '200px', width: 'auto', objectFit: 'contain' }} 
          />
        </Flex>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Flex direction="column" gap="4" width="full">
            <FormField 
              id="Email" 
              label="Email"
              name="email"
              placeholder="Digite seu email..." 
              style={{ border: '1px solid #c3c3c3', borderRadius: '6px' }}
            />
            
            <Flex direction="column" gap="1" width="full">
              <FormField 
                id="Password" 
                label="Senha" 
                placeholder="Digite sua Senha"
                name='password'
                type='password'
                style={{ border: '1px solid #c3c3c3', borderRadius: '6px' }}
              />
              <Flex justifyContent="flex-end" width="full" marginTop="1">
                <Link onClick={() => router.push('/user/forgot-password')} style={{ color: '#4c6b12', fontSize: '14px', fontWeight: '500' }}>
                  Esqueci minha senha
                </Link>
              </Flex>
            </Flex>
            
            <Button width='full' type='submit'>
              Entrar
            </Button>
          </Flex>
        </form>

        <Flex direction='row' gap='1' justifyContent='center' marginTop="1" style={{ fontSize: '14px' }}>
          <Text>Não tem uma conta?</Text>
          <Link href="/user/signup" style={{ color: '#4c6b12', fontWeight: '600' }}>
            Cadastre-se aqui
          </Link>
        </Flex>

        <Button 
          type='button' 
          width='full' 
          variant='special' 
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            height: '48px' 
          }}
        >
          <img 
            src="/google_logo.png" 
            height={'20px'} 
            width={'20px'} 
            alt="Logo Google" 
          />
          <Text weight='bold'>
            {loadingGoogle ? 'Conectando...' : 'Entrar com o Google'}
          </Text>
        </Button>

      </Flex>
    </Flex>
  );
}