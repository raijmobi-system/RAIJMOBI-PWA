"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

import { Text } from "@/components/atoms/typography";
import { Button } from "@/components/atoms/action";
import { FormField } from "@/components/molecules/FormFIeld";

// Sua instância Axios que injeta o Token JWT automaticamente
import { api } from "@/services/InterceptRequisition";
import { toast } from "@/lib/toast";

import { Badge, CheckCircle } from "@material-symbols-svg/react";

export default function CompletarPerfilGoogle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados dos campos de texto
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"Motorista" | "Passageiro">("Passageiro");

  // 🌟 Estados da Foto de Perfil
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Manipulador para selecionar e gerar preview da imagem
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCompleteSubmit = async () => {
    if (!cpf || !telefone) {
      toast.error("Por favor, preencha o CPF e o Telefone.");
      return;
    }

    setLoading(true);

    // 🌟 Criamos o FormData para poder enviar o binário da foto junto com os textos
    const formData = new FormData();
    formData.append("cpf", cpf);
    formData.append("telefone", telefone);
    formData.append("tipo_usuario", tipoUsuario);

    if (photoFile instanceof File) {
      formData.append("foto", photoFile);
    }

    try {
      // Como estamos enviando FormData, o Axios e o Django resolvem o Multipart automaticamente
      await api.post("/api/profile/complete/", formData);
      
      toast.success("Cadastro concluído com sucesso! Bem-vindo!");
      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Erro ao completar perfil:", error.response?.data || error.message);
      toast.error(
        JSON.stringify(error.response?.data?.detail || error.response?.data) ||
        "Erro ao salvar os dados do perfil."
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
            <Badge />
          </div>
          <Text weight="bold" className={css({ fontSize: "xl", color: "gray.900" })}>
            Falta pouco!
          </Text>
          <Text className={css({ fontSize: "sm", color: "gray.500", textAlign: "center" })}>
            Sua conta Google foi vinculada. Preencha os dados e escolha uma foto para finalizar seu cadastro.
          </Text>
        </div>

        <hr className={css({ borderColor: "gray.100", mb: "6" })} />

        {/* 🌟 Seletor Circular de Foto de Perfil */}
        <div className={flex({ direction: "column", alignItems: "center", mb: "6" })}>
          <div className={css({
            width: "96px",
            height: "96px",
            borderRadius: "full",
            backgroundColor: photoPreview ? "transparent" : "#f0f7e5",
            border: "2px dashed",
            borderColor: "#547812",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer"
          })}>
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Foto de Perfil" 
                className={css({ width: "full", height: "full", objectFit: "cover" })} 
              />
            ) : (
              <span className={css({ fontSize: "32px" })}>📷</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className={css({
                position: "absolute",
                top: 0,
                left: 0,
                width: "full",
                height: "full",
                opacity: 0,
                cursor: "pointer"
              })}
            />
          </div>
          <Text className={css({ fontSize: "xs", color: "gray.500", mt: "2" })}>
            {photoPreview ? "Toque na imagem para trocar" : "Toque para escolher uma foto"}
          </Text>
        </div>

        {/* Campos do Formulário */}
        <div className={flex({ direction: "column", gap: "4" })}>
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

          <div className={css({ mt: "4" })}>
            <Button width="full" onClick={handleCompleteSubmit} disabled={loading}>
              <div className={flex({ alignItems: "center", justify: "center", gap: "2" })}>
                <CheckCircle className={css({ color: "white" })} />
                <Text color="white" weight="bold">
                  {loading ? "Salvando..." : "Concluir Cadastro"}
                </Text>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}