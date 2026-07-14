// components/DynamicHeader.tsx
"use client";

import { usePathname } from 'next/navigation';
import StandardHeader from '@/components/fixed/StandardHeader';

export default function DynamicHeader() {
  const pathname = usePathname() || '';

  // 🌟 CORREÇÃO: Se a rota começar com a conversa do chat, oculta o Header padrão do sistema
  if (pathname.startsWith('/chat/conversation')) {
    return null;
  }

  return <StandardHeader />;
}