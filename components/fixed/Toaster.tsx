"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "@/styled-system/css";
import { toast, ToastMessage, ToastVariant } from "@/lib/toast";

const VARIANT_STYLES: Record<ToastVariant, { bg: string; color: string }> = {
  success: { bg: "#547812", color: "white" },
  error: { bg: "#c0392b", color: "white" },
  info: { bg: "#262626", color: "white" },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return toast.subscribe(setToasts);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      className={css({
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 16px)",
        left: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "2",
        alignItems: "center",
        pointerEvents: "none",
        md: {
          left: "auto",
          right: "24px",
          alignItems: "flex-end",
        },
      })}
    >
      {toasts.map((t) => {
        const variant = VARIANT_STYLES[t.variant];
        return (
          <div
            key={t.id}
            onClick={() => toast.dismiss(t.id)}
            role="status"
            className={css({
              pointerEvents: "auto",
              cursor: "pointer",
              maxWidth: "min(90vw, 360px)",
              width: "100%",
              borderRadius: "lg",
              paddingX: "4",
              paddingY: "3",
              fontSize: "sm",
              fontWeight: "medium",
              lineHeight: "snug",
              boxShadow: "lg",
            })}
            style={{ backgroundColor: variant.bg, color: variant.color }}
          >
            {t.message}
          </div>
        );
      })}
    </div>,
    document.body
  );
}
