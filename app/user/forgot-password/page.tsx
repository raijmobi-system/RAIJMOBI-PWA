"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

import { Text } from "@/components/atoms/typography";
import { Button } from "@/components/atoms/action";
import { FormField } from "@/components/molecules/FormFIeld";
import { api } from "@/services/InterceptRequisition";

import { Lock, Send } from "@material-symbols-svg/react";

export default function EsqueciSenha() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      alert("Por favor, preencha o seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      // Ajuste a rota para bater com a do seu urls.py do Django
      await api.post("/api/password-reset-request/", { email });
      setSucesso(true);
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição:", error);
      alert(
        error.response?.data?.detail || 
        "Erro ao solicitar a recuperação. Verifique o e-mail."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={flex({
        direction: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh"
      })}
    >
      <div
        className={css({
          backgroundColor: "white",
          borderRadius: "2xl",
          boxShadow: "md",
          padding: "8",
          width: "full",
          maxWidth: "md"
        })}
      >
        <div className={flex({ direction: "column", alignItems: "center", gap: "2", mb: "6" })}>
          <div className={css({ p: "3", borderRadius: "full", bg: "#f0f7e5", color: "#547812" })}>
            <Lock />
          </div>
          <Text weight="bold" className={css({ fontSize: "xl", color: "gray.900" })}>
            Recuperar Senha
          </Text>
          <Text className={css({ fontSize: "sm", color: "gray.500", textAlign: "center" })}>
            Digite o e-mail associado à sua conta. Enviaremos um link seguro para você criar uma nova senha.
          </Text>
        </div>

        <hr className={css({ borderColor: "gray.100", mb: "6" })} />

        {sucesso ? (
          <div className={flex({ direction: "column", alignItems: "center", gap: "4", textAlign: "center" })}>
            <Text weight="bold" className={css({ color: "#547812" })}>
              E-mail enviado com sucesso!
            </Text>
            <Text className={css({ fontSize: "sm", color: "gray.600" })}>
              Verifique sua caixa de entrada e a pasta de spam.
            </Text>
            <Button width="full" onClick={() => router.push("/user/reset-password")}>
              <Text color="white" weight="bold">Voltar para o Login</Text>
            </Button>
          </div>
        ) : (
          <div className={flex({ direction: "column", gap: "4" })}>
            <FormField
              id="email"
              label="E-mail"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />

            <div className={css({ mt: "4" })}>
              <Button width="full" onClick={handleRequestReset} disabled={loading}>
                <div className={flex({ alignItems: "center", justify: "center", gap: "2" })}>
                  <Send className={css({ color: "white", fontSize: "20px" })} />
                  <Text color="white" weight="bold">
                    {loading ? "Enviando..." : "Enviar Link"}
                  </Text>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}