import axios from 'axios';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const GATEWAY_URL = 'http://34.10.220.97:8000';

interface CredentialData {
  email: string;
  password: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
}


export default async function Login(credenciais: CredentialData): Promise<string | undefined> {
  try {
    console.log("Dados que vão para o Kong:", credenciais,{

    });
    // 1. Repare nas CRASES ( ` ) na URL para permitir a interpolação com ${GATEWAY_URL}
    // 2. Passamos a interface <AuthResponse> para o Axios tipar o 'resposta.data'
const response = await axios.post(`${GATEWAY_URL}/api/login/`, credenciais, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});    const tokens = response.data;

    console.log('✅ A REDE FUNCIONOU! Tokens recebidos:', tokens);

    await SecureStoragePlugin.set({ key: 'access_token', value: tokens.access });
    await SecureStoragePlugin.set({ key: 'refresh_token', value: tokens.refresh });

    console.log('Login efetuado e tokens salvos com segurança!');


    // O Axios já devolve o objeto pronto em .data, totalmente tipado como AuthResponse
    return 'sucesso'; 
  } catch (erro) {
    if (axios.isAxiosError(erro)) {
      console.error('Erro na API:', erro.response?.data || erro.message);
    } else {
      console.error('Erro inesperado:', erro);
    }
  }
}