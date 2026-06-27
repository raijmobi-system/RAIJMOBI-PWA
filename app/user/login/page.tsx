"use client";

import { useState } from 'react';
import { Flex } from '@/styled-system/jsx';
import { css } from "@/styled-system/css"; 
import { Button,IconButton,Link} from '@/components/atoms/action';
import { FrameComponent } from "@/components/organisms";
import { Text ,Heading,Label} from '@/components/atoms/typography';
import { CardComponent, FormField ,SelectField,CheckboxItem} from '@/components/molecules';

import { api } from '@/services/user/InterceptRequisition'

// Importações de Ícones
import { Star, Edit, Group,} from '@material-symbols-svg/react';



export default function Runs() {
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 1. Interrompe o recarregamento padrão da página
    e.preventDefault(); 

    // 2. Captura todos os dados do formulário
    const formData = new FormData(e.currentTarget);
    
    // 3. Transforma os dados em um objeto JavaScript (constante temporária)
    const data = Object.fromEntries(formData.entries());
    
    console.log("Dados prontos para envio:", data);

    // 4. Envia para o fetch
    try {
      


      if (response.ok) {
        console.log("Sucesso!");
      }
      
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };
 return(
    <Flex width='full' height={'100%'}  justifyContent='center' direction={'column'} padding={'4'} gap='4'>
       

       
         <form action="" onSubmit={handleSubmit}>
            <FormField 
              id="Email" 
              label="Email" 
              placeholder="Digite seu email..." 
            />
            <FormField 
              id="Password" 
              label="Senha" 
              placeholder="Digite sua Senha" 
            />
            <CheckboxItem
            label='Manter-me ativo'
            id='active'
            type='checkbox'
            
            />
            <Button width='full' type='submit'>
               Entrar
            </Button>

         </form>

         <Flex direction='row'>
            <Text> Não tem uma conta? </Text>
            <Link>Cadastre-se aqui</Link>
         </Flex>


         <Button type='button' width='full' variant='special' >
            <img src="/google_logo.png" height={'44px'} width={'44px'} />
            <Text weight='bold'>Logar com o Google</Text>
            
         </Button>






       
    </Flex>
 );
}