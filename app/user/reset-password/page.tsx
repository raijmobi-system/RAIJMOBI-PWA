"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

import { Text } from "@/components/atoms/typography";
import { Button } from "@/components/atoms/action";
import { FormField } from "@/components/molecules/FormFIeld";
import { api } from "@/services/InterceptRequisition";

import { Key, CheckCircle } from "@material-symbols-svg/react";

// 🌟 1. COMPONENTE INTERNO: Contém toda a lógica e lê a URL com segurança
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Captura o ?token= da URL

  const [loading, setLoading] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleResetSubmit = async () => {
    if (!novaSenha || !confirmarSenha) {
      alert("Por favor, preencha os dois campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem. Tente novamente.");
      return;
    }

    if (!token) {
      alert("Token de recuperação inválido ou ausente.");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/api/reset-password?token=${token}`, {
        nova_senha: novaSenha
      });
      
      alert("Senha alterada com sucesso! Faça login com a nova senha.");
      router.replace("/login");
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      alert(
        error.response?.data?.error || 
        "Erro ao salvar a nova senha. O link pode ter expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className={flex({ alignItems: "center", justifyContent: "center", minHeight: "100vh" })}>
        <Text>Link de recuperação inválido.</Text>
      </main>
    );
  }

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
            <Key />
          </div>
          <Text weight="bold" className={css({ fontSize: "xl", color: "gray.900" })}>
            Criar Nova Senha
          </Text>
          <Text className={css({ fontSize: "sm", color: "gray.500", textAlign: "center" })}>
            Quase lá! Escolha uma nova senha forte para acessar sua conta.
          </Text>
        </div>

        <hr className={css({ borderColor: "gray.100", mb: "6" })} />

        <div className={flex({ direction: "column", gap: "4" })}>
          <FormField
            id="novaSenha"
            label="Nova Senha"
            placeholder="Digite a nova senha"
            type="password"
            value={novaSenha}
            onChange={(e: any) => setNovaSenha(e.target.value)}
          />
          <FormField
            id="confirmarSenha"
            label="Confirmar Nova Senha"
            placeholder="Repita a nova senha"
            type="password"
            value={confirmarSenha}
            onChange={(e: any) => setConfirmarSenha(e.target.value)}
          />

          <div className={css({ mt: "4" })}>
            <Button width="full" onClick={handleResetSubmit} disabled={loading}>
              <div className={flex({ alignItems: "center", justify: "center", gap: "2" })}>
                <CheckCircle className={css({ color: "white" })} />
                <Text color="white" weight="bold">
                  {loading ? "Salvando..." : "Salvar Nova Senha"}
                </Text>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

// 🌟 2. EXPORT PRINCIPAL: Protege a página com o Suspense Boundary para autorizar o build estático
export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <main className={flex({ alignItems: "center", justifyContent: "center", minHeight: "100vh" })}>
        <Text color="muted" weight="bold">A carregar formulário de segurança...</Text>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}