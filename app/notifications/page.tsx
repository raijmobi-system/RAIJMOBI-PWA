"use client";

import React, { useEffect, useState } from "react";
import { Flex } from '@/styled-system/jsx';
import { css } from "@/styled-system/css";
import { Text } from '@/components/atoms/typography';
import { Icon } from '@/components/atoms/presentation';
import { NotificationService, NotificationData } from "@/services/notificationService";

// Ícones
import { 
  NotificationsActive, 
  DirectionsCar, 
  Chat, 
  Person,
  CheckCircle
} from '@material-symbols-svg/react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //eslint-disable-next-line
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getAll();
      
      // Ordena para exibir as mais recentes no topo
      const sortedData = data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotifications(sortedData);
    } catch (error) {
      console.error("Erro ao carregar notificações do backend:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationData) => {
    if (notif.read) return;

    try {
      // 1. Atualização Otimista (Muda a interface instantaneamente para não travar o usuário)
      setNotifications(prev => prev.map(n => 
        n.id === notif.id ? { ...n, read: true } : n
      ));

      // 2. Confirma no Backend
      await NotificationService.markAsRead(notif.id);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      // Se falhar, você pode reverter o estado aqui se quiser ser criterioso
    }
  };

  // Função para formatar a data de forma amigável
  const formatTime = (isoString: string) => {
    try {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      });
    } catch {
      return "";
    }
  };

  // Define um ícone dinâmico dependendo da origem da notificação
  const getServiceIcon = (service: string, isRead: boolean) => {
    const colorStyle = css({ color: isRead ? 'gray.400' : 'white' });
    switch (service) {
      case 'ride': return <DirectionsCar className={colorStyle} />;
      case 'chat': return <Chat className={colorStyle} />;
      case 'user': return <Person className={colorStyle} />;
      default: return <NotificationsActive className={colorStyle} />;
    }
  };

  return (
    <Flex direction="column" height="100%" width="100%">
      
      {/* CABEÇALHO DA PÁGINA (Fixo ou apenas no topo do scroll) */}
      

      {/* ÁREA PRINCIPAL COM SCROLL */}
      <Flex 
        direction="column" 
        flex="1" 
        padding="6" 
        gap="4" 
        className={css({ overflowY: 'auto' })}
      >
        
        {loading ? (
          <Flex justify="center" align="center" height="50vh">
            <Text color="muted" weight="medium">Buscando novidades...</Text>
          </Flex>
        ) : notifications.length === 0 ? (
          <Flex justify="center" align="center" height="50vh" direction="column" gap="4">
            <NotificationsActive className={css({ color: 'gray.300', fontSize: '64px' })} />
            <Text color="muted" size="lg" weight="medium" className={css({ textAlign: 'center' })}>
              Você está em dia!<br />Nenhuma notificação por aqui.
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="3">
            {notifications.map((notif) => (
              <Flex 
                key={notif.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => handleNotificationClick(notif)}
                className={css({
                  p: '4',
                  borderRadius: 'xl',
                  cursor: notif.read ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  bg: notif.read ? 'white' : '#f0f7e5', // Seu verde clarinho característico
                  border: '1px solid',
                  borderColor: notif.read ? 'gray.100' : '#cce5a3',
                  boxShadow: 'sm'
                })}
              >
                
                {/* ESQUERDA: Ícone + Texto */}
                <Flex direction="row" gap="4" alignItems="center">
                  
                  {/* Círculo do Ícone */}
                  <div className={css({ 
                    p: '3', 
                    borderRadius: 'full', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: notif.read ? 'gray.100' : '#547812', // Verde escuro se não lido
                  })}>
                    <Icon size="md">
                      {getServiceIcon(notif.service_origin, notif.read)}
                    </Icon>
                  </div>

                  {/* Textos */}
                  <Flex direction="column" gap="1">
                    <Text 
                      weight={notif.read ? "medium" : "bold"} 
                      color={notif.read ? "muted" : "special"}
                    >
                      {notif.message}
                    </Text>
                    <Text size="xs" color="muted">
                      {formatTime(notif.created_at)}
                    </Text>
                  </Flex>

                </Flex>

                {/* DIREITA: Indicador Visual */}
                <div className={css({ ml: '3' })}>
                  {notif.read ? (
                    <CheckCircle className={css({ color: 'gray.300' })} />
                  ) : (
                    <div className={css({ 
                      w: '12px', 
                      h: '12px', 
                      bg: '#547812', 
                      borderRadius: 'full',
                      boxShadow: '0 0 8px rgba(84, 120, 18, 0.4)'
                    })} />
                  )}
                </div>

              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}