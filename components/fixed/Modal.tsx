"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
// Importe a função css do diretório gerado pelo Panda CSS
import { css } from "../../styled-system/css"; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bg: "rgba(0, 0, 0, 0.4)", // Fundo escurecido
        backdropFilter: "blur(4px)", // Efeito de desfoque
        
      })}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={css({
          position: "relative",
          bg: "white",
          _dark: { bg: "gray.800" }, 
          rounded: "lg",
          shadow: "xl",
          maxH: "100vh",
          maxW: "100vw",
          w: "100%",
          overflow: "auto",
        })}
      >
        
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 4,
            borderBottom: "1px solid",
            borderColor: "gray.200",
            _dark: { borderColor: "gray.700" },
          })}
        >
          {title && (
            <h2
              className={css({
                fontSize: "lg",
                fontWeight: "500",
                color: "gray.900",
                _dark: { color: "white" },
              })}
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className={css({
              ml: "auto",
              color: "gray.500",
              cursor: "pointer",
              transition: "colors",
              _hover: { color: "gray.700", _dark: { color: "gray.300" } },
              bg: "transparent",
            })}
          >
            <svg
              className={css({ w: 6, h: 6 })}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className={css({ p: 4 ,minW: '200px',width: 'auto'})}>{children}</div>
      </div>
    </div>,
    document.body
  );
}