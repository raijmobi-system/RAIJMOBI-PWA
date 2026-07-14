"use client";

import { Manrope } from "next/font/google";
import "./globals.css";  
import { css } from "@/styled-system/css"; 
import 'leaflet/dist/leaflet.css';
import { usePathname } from 'next/navigation';

import Navigation from "@/components/fixed/Navigation";
import DynamicHeader from "@/components/fixed/DynamicHeader"; 
import { useEffect } from "react";
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
  useEffect(() => {
    initSocialLogin().catch(console.error);
  }, []);
  // 1. VERIFICAÇÕES DE ROTA
  const isChatPage = pathname?.includes('/chat/conversation');
  const isUserPage = pathname?.startsWith('/user'); 

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

        // 2. GRID MOBILE DINÂMICO
        gridTemplateRows: isUserPage ? '1fr' : 'auto 1fr auto',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: isUserPage 
          ? `"main"` 
          : `
            "header"
            "main"
            "bottom"
          `,

        md: {
          // 3. GRID DESKTOP DINÂMICO (Evita o buraco de 80px à esquerda)
          gridTemplateRows: isUserPage ? '1fr' : 'auto 1fr',
          gridTemplateColumns: isUserPage ? '1fr' : '80px 1fr',
          gridTemplateAreas: isUserPage 
            ? `"main"`
            : `
              "aside header"
              "aside main"
            `,
          paddingTop: '0px', 
        },
      })}>

        {/* HEADER OCULTO EM /user */}
        {!isUserPage && <DynamicHeader/>}

        {/* ASIDE OCULTO EM /user */}
        {!isUserPage && (
          <aside
            className={css({
              gridArea: 'aside',
              background: '#363636',
              padding: '6',
              display: 'none',
              md: { display: 'flex', flexDirection: 'column' },
            })}
          >
            <Navigation direction="column" />
          </aside>
        )}

        <main className={css({ flex: '1', minWidth: '0', width: '100%', overflowX: 'hidden', h: '100%', background: '#fbf9f9'})}>
          {children} 
        </main>

        {/* FOOTER OCULTO NO CHAT E EM /user */}
        {!isChatPage && !isUserPage && (
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

      </body>
    </html>
  );
}