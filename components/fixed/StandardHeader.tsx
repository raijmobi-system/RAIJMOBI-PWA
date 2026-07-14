"use client";

import React, { useState, useEffect } from 'react';
import { css } from "@/styled-system/css"; 
import { Heading, Text } from '@/components/atoms/typography';
import { Flex } from '@/styled-system/jsx';
import { Avatar, Icon } from '@/components/atoms/presentation';
import { Link } from '@/components/atoms/action';
import { api } from '@/services/InterceptRequisition';
import { NotificationService } from '@/services/notificationService';
import { Notifications } from '@material-symbols-svg/react'; // 🌟 Ícone importado
import { useRouter } from 'next/navigation';

const GATEWAY_URL = 'http://34.10.220.97:8000';

export default function StandardHeader() {
  const [userName, setUserName] = useState('Motorista');
  const [userPhoto, setUserPhoto] = useState('/cliente.jpeg');
  
  // 🌟 Estado para as notificações não lidas
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/profile/');
        const data = response.data;

        const nomeEncontrado = data?.usuario?.nome || data?.nome || data?.name;
        if (nomeEncontrado) {
          const primeiroNome = nomeEncontrado.split(' ')[0];
          setUserName(primeiroNome);
        }

        const fotoRecebida = data?.foto || data?.perfil?.foto;
        if (fotoRecebida && typeof fotoRecebida === 'string') {
          if (fotoRecebida.startsWith('/')) {
            setUserPhoto(`${GATEWAY_URL}${fotoRecebida}`);
          } else {
            setUserPhoto(fotoRecebida);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };

    // 🌟 Busca as notificações para contar as não lidas
    const fetchNotificationsCount = async () => {
      try {
        const notifs = await NotificationService.getAll();
        const unread = notifs.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchUserProfile();
    fetchNotificationsCount();
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
        alignItems: 'center', // 🌟 Centraliza os itens verticalmente
        px: '6', 
        maxHeight: '88px' 
      })}
    >
      <Flex direction='column' alignItems='start'>
        <Heading 
          as='h1' 
          size='xl' 
          weight="semibold" 
          color='green' 
          className={css({ mb: '1' })}
        >
          Olá, {userName}!
        </Heading>
        <Text color="white">
          Para onde vai hoje?
        </Text>
      </Flex>
      
      {/* 🌟 Container do Sino de Notificação e do Avatar */}
      <Flex direction='row' alignItems='center' gap='5'>

        <Link onClick={() => router.push('/notifications')}>
          <div className={css({ position: 'relative', cursor: 'pointer', display: 'flex' })}>
            <Icon size='lg'>
              <Notifications fill='#547812' />
            </Icon>
            
            {/* Bolinha vermelha com o contador (só aparece se for > 0) */}
            {unreadCount > 0 && (
              <div className={css({
                position: 'absolute', 
                top: '-4px', 
                right: '-6px',
                bg: 'red.500', 
                color: 'white', 
                fontSize: '10px',
                fontWeight: 'bold', 
                borderRadius: 'full', 
                width: '18px', 
                height: '18px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 0 2px #262626' // Borda escura para destacar
              })}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
        </Link>

        <Link href="/perfil">
          <Avatar src={userPhoto} size="fx" />
        </Link>

      </Flex>
    </header>
  );
}