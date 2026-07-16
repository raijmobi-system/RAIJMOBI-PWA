// components/DynamicHeader.tsx
"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import StandardHeader from '@/components/fixed/StandardHeader';

export default function DynamicHeader() {
  const pathname = usePathname() || '';
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 🌟 Checagem híbrida e segura para o Capacitor:
      // 1. Pega a rota limpa do Next.js
      const currentPath = pathname.toLowerCase();
      
      // 2. Pega a rota real física da Webview do celular (evita erros com .html ou recarregamentos)
      const windowPath = window.location.pathname.toLowerCase();

      const isChatRoute = 
        currentPath.includes('/chat/conversation') || 
        windowPath.includes('/chat/conversation') ||
        window.location.hash.toLowerCase().includes('/chat/conversation'); // Previne se usar Hash Routing
        //eslint-disable-next-line
      setShouldHide(isChatRoute);
    }
  }, [pathname]);

  // Se for a rota de chat, oculta completamente o Header
  if (shouldHide) {
    return null;
  }

  return <StandardHeader />;
}