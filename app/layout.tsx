"use client";


import { Manrope } from "next/font/google";
import "./globals.css"; 
import { css } from "@/styled-system/css"; 
import 'leaflet/dist/leaflet.css';

import Navigation from "@/components/fixed/Navigation";


const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope', // Cria a variável CSS para usarmos globalmente
});
import DynamicHeader from "@/components/fixed/DynamicHeader"; // Importa o gerenciador que criamos acima



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${css({ width: '100%' })}`} 
    >
      <body className={css({
        display: 'grid',
        backgroundColor: 'gray.50',
        minHeight: '100vh', // Garante que o body ocupe a tela cheia

        // 1. ADICIONAMOS A SAFE AREA NO TOPO DO BODY (Protege o Header no mobile)
        paddingTop: 'env(safe-area-inset-top, 0px)', 

        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: `
          "header"
          "main"
          "bottom"
        `,

        md: {
          gridTemplateRows: 'auto 1fr',
          gridTemplateColumns: '80px 1fr',
          gridTemplateAreas: `
            "aside header"
            "aside main"
          `,
          // No desktop, não precisamos do padding do notch no topo do body
          paddingTop: '0px', 
        },
      })}>

        <DynamicHeader/>

        <aside
          className={css({
            gridArea: 'aside',
            background: 'gray.100',
            padding: '6',
            display: 'none',
            md: { display: 'flex', flexDirection: 'column' },
          })}
        >
          <Navigation direction="column"/>
        </aside>

        <main className={css({ flex: '1', minWidth: '0', width: '100%', overflowX: 'hidden',h: '100%'})}>
          
            {children}
          
        </main>

        {/* 2. ADICIONAMOS A SAFE AREA NO RODAPÉ MOBILE */}
        <footer className={css({
          gridArea: 'bottom',
          background: 'gray.200',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          
          // Padding normal do conteúdo + o espaço extra da barra de navegação do OS
          paddingTop: '4',
          paddingLeft: '4',
          paddingRight: '4',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', 

          md: { display: 'none' },
        })}>
          <Navigation direction="row"/>
        </footer>

      </body>
    </html>
  );
}