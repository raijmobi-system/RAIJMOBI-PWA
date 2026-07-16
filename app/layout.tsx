"use client";

import { Manrope } from "next/font/google";
import "./globals.css";  
import { css } from "@/styled-system/css"; 
import 'leaflet/dist/leaflet.css';
import { usePathname } from 'next/navigation';

import Navigation from "@/components/fixed/Navigation";
import Sidebar from "@/components/fixed/Sidebar";
import DynamicHeader from "@/components/fixed/DynamicHeader";
import Toaster from "@/components/fixed/Toaster";
import { useEffect, useState } from "react";
import { initSocialLogin } from "@/services/user/SocialLoginProvider";

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // 🌟 ESTADOS DE CONTROLE DE ROTA SEGUROS PARA CAPACITOR
  const [isChatPage, setIsChatPage] = useState(false);
  const [isUserPage, setIsUserPage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initSocialLogin().catch(console.error);
    //eslint-disable-next-line
    setMounted(true);
  }, []);

  // 🌟 SINCRONIZAÇÃO HÍBRIDA DA ROTA (Trata .html, hash, Capacitor e Web)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = (pathname || '').toLowerCase();
      const windowPath = window.location.pathname.toLowerCase();
      const windowHash = window.location.hash.toLowerCase();

      // Checa se é rota de Chat
      const chatActive = 
        currentPath.includes('/chat/conversation') || 
        windowPath.includes('/chat/conversation') ||
        windowHash.includes('/chat/conversation');

      // Checa se é rota de login/cadastro
      const userActive = 
        currentPath.startsWith('/user') || 
        windowPath.startsWith('/user') ||
        windowHash.includes('/user');
      //eslint-disable-next-line
      setIsChatPage(chatActive);
      setIsUserPage(userActive);
    }
  }, [pathname]);

  // Se for página de login/cadastro (/user) ou chat (/chat/conversation), removemos o espaço do Grid
  const isFullScreen = isUserPage || isChatPage;

  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${css({ width: '100%' })}`} 
    >
      <body className={css({
        display: 'grid',
        backgroundColor: 'gray.50',
        minHeight: '100vh', 

        paddingTop: 'env(safe-area-inset-top, 0px)', 

        // 🌟 GRID MOBILE DINÂMICO: Se for chat ou user, o conteúdo ocupa 100% da tela (1fr) sem reservar espaço para Header/Bottom
        gridTemplateRows: isFullScreen ? '1fr' : 'auto 1fr auto',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: isFullScreen 
          ? `"main"` 
          : `
            "header"
            "main"
            "bottom"
          `,

        md: {
          // 🌟 GRID DESKTOP DINÂMICO
          gridTemplateRows: isFullScreen ? '1fr' : 'auto 1fr',
          gridTemplateColumns: isFullScreen ? '1fr' : '260px 1fr',
          gridTemplateAreas: isFullScreen
            ? `"main"`
            : `
              "aside header"
              "aside main"
            `,
          paddingTop: '0px',
        },
      })}>

        {/* HEADER OCULTO EM /user E NO CHAT */}
        {mounted && !isUserPage && !isChatPage && <DynamicHeader/>}

        {/* MENU LATERAL (DESKTOP) OCULTO EM /user E NO CHAT */}
        {mounted && !isUserPage && !isChatPage && (
          <aside
            className={css({
              gridArea: 'aside',
              background: '#262626',
              padding: '5',
              display: 'none',
              md: { display: 'flex', flexDirection: 'column' },
            })}
          >
            <Sidebar />
          </aside>
        )}

        <main className={css({ flex: '1', minWidth: '0', width: '100%', overflowX: 'hidden', h: '100%', background: '#fbf9f9'})}>
          {children} 
        </main>

        {/* MENU INFERIOR (MOBILE) OCULTO NO CHAT E EM /user */}
        {mounted && !isChatPage && !isUserPage && (
          <footer className={css({
            gridArea: 'bottom',
            background: '#262626',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: '4',
            paddingLeft: '4',
            paddingRight: '4',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', 
            md: { display: 'none' },
          })}>
            <Navigation direction="row"/>
          </footer>
        )}

        <Toaster />

      </body>
    </html>
  );
}