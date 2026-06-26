"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageAnimatePresenter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        // Removemos o 'y'. Agora foca apenas na Opacidade.
        
        // 1. Estado inicial: Totalmente esbranquiçado/invisível
        initial={{ opacity: 0 }}
        
        // 2. Estado de animação: Volta ao normal (totalmente visível)
        animate={{ opacity: 1 }}
        
        // 3. Estado de saída: Esmaece ao sair
        exit={{ opacity: 0 }}
        
        transition={{ 
          duration: 0.1, // 300ms: Rápido, mas perceptível e suave.
          ease: "easeInOut" // Começa e termina suavemente
        }}
        
        // Mantemos o opacity 0 no estilo inicial para evitar o 'flash'
        style={{ width: "100%", height: "100%", opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}