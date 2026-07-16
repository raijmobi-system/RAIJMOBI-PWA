"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

// Importações dos seus átomos e moléculas existentes
import { Text } from "@/components/atoms/typography";
import { Button } from "@/components/atoms/action";
import { FormField } from "@/components/molecules/FormFIeld";

// Sua instância Axios com interceptor e headers corretos
import { api } from "@/services/InterceptRequisition";
import { toast } from "@/lib/toast";

// Ícones do Material Symbols para dar identidade visual aos passos
import { Person, Security, Badge, ChevronRight, ArrowBack } from "@material-symbols-svg/react";

export default function CadastroPorPassos() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 1. Estados unificados do formulário (Usuario + Perfil)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"Motorista" | "Passageiro">("Passageiro");

  // Navegação entre os passos com validação básica preventiva
  const nextStep = () => {
    if (step === 1 && (!nome || !email)) {
      toast.error("Por favor, preencha seu nome e email.");
      return;
    }
    if (step === 2 && (!senha || senha !== confirmarSenha)) {
      toast.error("As senhas não coincidem ou estão em branco.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  // 2. Envio definitivo dos dados para o backend
  const handleFinalSubmit = async () => {
    if (!cpf || !telefone) {
      toast.error("Por favor, preencha o CPF e o Telefone.");
      return;
    }

    setLoading(true);

    // Montagem do payload unificado respeitando o models.py do Django
    const payload = {
      nome: nome,
      email: email,
      password: senha,
      perfil: {
        cpf: cpf,
        telefone: telefone,
        tipo_usuario: tipoUsuario,
        is_motorista: tipoUsuario === "Motorista"
      }
    };

    try {
      // Faz o POST direto no endpoint de registro mapeado nas suas urls.py
      await api.post("/api/register/", payload);
      
      toast.success("Cadastro realizado com sucesso! Redirecionando para o login...");
      router.push("/login");
    } catch (error: any) {
      console.error("Erro no cadastro:", error.response?.data || error.message);
      // Exibe detalhes específicos de validação vindos do Django (ex: CPF inválido)
      toast.error(JSON.stringify(error.response?.data) || "Erro ao realizar o cadastro.");
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
        {/* Indicador visual de progresso dos passos */}
        <div className={flex({ justifyContent: "space-between", mb: "6", position: "relative" })}>
          <div className={flex({ direction: "column", alignItems: "center", gap: "1" })}>
            <div className={css({ p: "2", borderRadius: "full", bg: step >= 1 ? "green.100" : "gray.100", color: step >= 1 ? "green.700" : "gray.400" })}>
              <Person />
            </div>
            <Text weight="bold" className={css({ fontSize: "xs" })}>Básico</Text>
          </div>
          <div className={flex({ direction: "column", alignItems: "center", gap: "1" })}>
            <div className={css({ p: "2", borderRadius: "full", bg: step >= 2 ? "green.100" : "gray.100", color: step >= 2 ? "green.700" : "gray.400" })}>
              <Security />
            </div>
            <Text weight="bold" className={css({ fontSize: "xs" })}>Segurança</Text>
          </div>
          <div className={flex({ direction: "column", alignItems: "center", gap: "1" })}>
            <div className={css({ p: "2", borderRadius: "full", bg: step >= 3 ? "green.100" : "gray.100", color: step >= 3 ? "green.700" : "gray.400" })}>
              <Badge />
            </div>
            <Text weight="bold" className={css({ fontSize: "xs" })}>Perfil</Text>
          </div>
        </div>

        <hr className={css({ borderColor: "gray.100", mb: "6" })} />

        {/* =========================================
            PASSO 1: INFORMAÇÕES BÁSICAS DO USUÁRIO
        ========================================= */}
        {step === 1 && (
          <div className={flex({ direction: "column", gap: "4" })}>
            <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>
              Conte-nos sobre você
            </h2>
            <FormField
              id="nome"
              label="Nome Completo"
              placeholder="Ex: Fernando Silva"
              value={nome}
              onChange={(e: any) => setNome(e.target.value)}
            />
            <FormField
              id="email"
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            
            <div className={css({ mt: "4" })}>
              <Button width="full" onClick={nextStep}>
                <div className={flex({ alignItems: "center", gap: "2" })}>
                  <Text color="white" weight="bold">Avançar</Text>
                  <ChevronRight className={css({ color: "white" })} />
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* =========================================
            PASSO 2: CONFIGURAÇÃO DE CREDENCIAIS
        ========================================= */}
        {step === 2 && (
          <div className={flex({ direction: "column", gap: "4" })}>
            <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>
              Crie uma senha segura
            </h2>
            <FormField
              id="senha"
              label="Senha"
              placeholder="••••••••"
              type="password"
              value={senha}
              onChange={(e: any) => setSenha(e.target.value)}
            />
            <FormField
              id="confirmarSenha"
              label="Confirmar Senha"
              placeholder="••••••••"
              type="password"
              value={confirmarSenha}
              onChange={(e: any) => setConfirmarSenha(e.target.value)}
            />

            <div className={flex({ gap: "3", mt: "4" })}>
              <Button width="full" onClick={prevStep} className={css({ bg: "gray.200!" })}>
                <div className={flex({ alignItems: "center", gap: "2" })}>
                  <ArrowBack className={css({ color: "gray.700!" })} />
                  <Text color="cupom" weight="bold">Voltar</Text>
                </div>
              </Button>
              <Button width="full" onClick={nextStep}>
                <div className={flex({ alignItems: "center", gap: "2" })}>
                  <Text color="white" weight="bold">Avançar</Text>
                  <ChevronRight className={css({ color: "white" })} />
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* =========================================
            PASSO 3: INFORMAÇÕES DO PERFIL (MOTO/CARRO/CPF)
        ========================================= */}
        {step === 3 && (
          <div className={flex({ direction: "column", gap: "4" })}>
            <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>
              Detalhes do Perfil
            </h2>
            <FormField
              id="cpf"
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e: any) => setCpf(e.target.value)}
            />
            <FormField
              id="telefone"
              label="Telefone com DDD"
              placeholder="(84) 99999-9999"
              value={telefone}
              onChange={(e: any) => setTelefone(e.target.value)}
            />

            {/* Select baseado nas escolhas TIPO_CHOICES do Django */}
            <div className={flex({ direction: "column", gap: "1" })}>
              <label className={css({ fontSize: "sm", fontWeight: "bold", color: "gray.700" })}>
                Como você pretende usar a plataforma?
              </label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value as "Motorista" | "Passageiro")}
                className={css({ p: "3", border: "1px solid", borderColor: "gray.300", borderRadius: "md", bg: "white", fontSize: "sm" })}
              >
                <option value="Passageiro">Quero apenas pegar Caronas (Passageiro)</option>
                <option value="Motorista">Quero oferecer Caronas (Motorista)</option>
              </select>
            </div>

            <div className={flex({ gap: "3", mt: "4" })}>
              <Button width="full" onClick={prevStep} className={css({ bg: "gray.200!" })} disabled={loading}>
                <div className={flex({ alignItems: "center", gap: "2" })}>
                  <ArrowBack className={css({ color: "gray.700!" })} />
                  <Text color="cupom" weight="bold">Voltar</Text>
                </div>
              </Button>
              <Button width="full" onClick={handleFinalSubmit} disabled={loading}>
                <Text color="white" weight="bold">
                  {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                </Text>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}