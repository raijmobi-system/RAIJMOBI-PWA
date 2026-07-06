"use client";

import React, { useState, useEffect } from 'react';
import { css } from "@/styled-system/css"; 
import { Heading, Text } from '@/components/atoms/typography';
import { Flex } from '@/styled-system/jsx';
import { Avatar } from '@/components/atoms/presentation';
import { Link } from '@/components/atoms/action';

import { api } from '@/services/InterceptRequisition';

// URL base do seu backend/gateway onde os arquivos de mídia estão hospedados
const GATEWAY_URL = 'http://localhost:8000';

export default function StandardHeader() {
  const [userName, setUserName] = useState('Motorista');
  const [userPhoto, setUserPhoto] = useState('/cliente.jpeg');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/profile/');
        const data = response.data;

        // 🌟 DEBUG: Abra o console do navegador (F12) para checar o formato exato da resposta
        console.log("📦 Dados recebidos no Header:", data);

        // 1. Resolve o Nome do Usuário
        const nomeEncontrado = data?.usuario?.nome || data?.nome || data?.name;
        if (nomeEncontrado) {
          const primeiroNome = nomeEncontrado.split(' ')[0];
          setUserName(primeiroNome);
        }

        // 2. Resolve a Foto de Perfil (Tratando caminhos relativos do Django)
        const fotoRecebida = data?.foto || data?.perfil?.foto;
        
        if (fotoRecebida && typeof fotoRecebida === 'string') {
          // Se o Django devolveu apenas o caminho relativo (ex: "/media/fotos/img.jpg")
          if (fotoRecebida.startsWith('/')) {
            setUserPhoto(`${GATEWAY_URL}${fotoRecebida}`);
          } else {
            // Se já veio a URL completa (ex: "http://localhost:8000/media/...")
            setUserPhoto(fotoRecebida);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil no cabeçalho:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header 
      className={css({ 
        bg: '#262626', 
        color: 'white', 
        py: '4', 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        px: '6', 
        backgroundColor: 'rgb(38, 38, 38)', 
        opacity: '1', 
        maxHeight: '88px' 
      })}
    >
      <Flex direction='column' alignItems='start'>
        <Heading 
          as='h1' 
          size='xl' 
          weight="semibold" 
          color='green' 
          className={css({ textAlign: 'center', mb: '2' })}
        >
          Olá, {userName}!
        </Heading>
        <Text color="white" className={css({ textAlign: 'center' })}>
          Para onde vai hoje?
        </Text>
      </Flex>
      
      <Link href="/perfil">
        <Avatar src={userPhoto} size="fx" />
      </Link>
    </header>
  );
}