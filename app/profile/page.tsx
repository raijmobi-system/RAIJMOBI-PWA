"use client";

import React, { useState } from "react";
import { css } from "../../styled-system/css";
import { flex } from "../../styled-system/patterns";

// Importações dos seus componentes (Ajuste os caminhos conforme sua pasta)
import FrameComponent from "@/components/organisms/FrameComponent";
import LinkImage from "@/components/molecules/LinkImage";
import CardComponent from "@/components/molecules/CardComponent";
import Modal from "@/components/fixed/Modal";

import { Text } from '@/components/atoms/typography'

// Ícones do Material Symbols
import {
  DirectionsCar,
  Commute,
  CreditCard,
  AccountBalanceWallet,
  Settings,
  Person,
  Security,
  ChevronRight
} from "@material-symbols-svg/react";

export default function Perfil() {
  // Estado para controlar a abertura do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>("");

  const handleOpenModal = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    // Container Principal: usa o flex em coluna solicitado para ajustar tudo
    <main 
      className={flex({ 
        direction: "column", 
        gap: "6", 
        padding: "4",
        backgroundColor: "#f9f9f9", // Fundo cinza bem claro para destacar os cards brancos
        minHeight: "100vh",
        // Hackzinho via PandaCSS para sobrescrever o minHeight: 400px padrão do seu FrameComponent 
        // e deixá-lo abraçar o conteúdo perfeitamente como na imagem.
        "& section": { minHeight: "auto !important" } 
      })}
    >
      
      {/* =========================================
          SEÇÃO 1: VEÍCULOS
      ========================================= */}
      <div className={css({ backgroundColor: "white", borderRadius: "2xl", boxShadow: "sm" })}>
        <FrameComponent
          titleElements={
            <div className={flex({ alignItems: "center", gap: "2" })}>
              <DirectionsCar className={css({ color: "red.600", fontSize: "28px" })} />
              <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>
                Veículos
              </h2>
            </div>
          }
          actions={
            <button 
              onClick={() => handleOpenModal("Veículo")}
              className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })}
            >
              + Adicionar
            </button>
          }
        >
          <div className={flex({ direction: "column", gap: "4" })}>
            {/* Card Ford Ka */}
            <div className={css({ "& > div": { backgroundColor: "gray.50", border: "none" } })}>
              <CardComponent
                fullWidth
                hasPadding
                direction="row"
                Image={
                  <div className={flex({ w: "48px", h: "48px", bg: "#e8f0e4", borderRadius: "xl", alignItems: "center", justifyContent: "center" })}>
                    <Commute className={css({ color: "green.700", fontSize: "24px" })} />
                  </div>
                }
                content={
                  <div className={flex({ direction: "column", flex: 1, ml: "4" })}>
                    <Text color="danger"> Ford k</Text>
                    <span className={css({ color: "violet", fontSize: "14px", mt: "1" })}>Branco • Placa: ABC-1234</span>
                  </div>
                }
                extraContent={
                  <button className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })}>
                    Editar
                  </button>
                }
              />
            </div>

            {/* Card Honda Civic */}
            <div className={css({ "& > div": { backgroundColor: "gray.50", border: "none" } })}>
              <CardComponent
                fullWidth
                hasPadding
                direction="row"
                Image={
                  <div className={flex({ w: "48px", h: "48px", bg: "#e8f0e4", borderRadius: "xl", alignItems: "center", justifyContent: "center" })}>
                    <Commute className={css({ color: "green.700", fontSize: "24px" })} />
                  </div>
                }
                content={
                  <div className={flex({ direction: "column", flex: 1, ml: "4" })}>
                    <span className={css({ fontWeight: "semibold", color: "gray.900", fontSize: "16px" })}>Honda Civic</span>
                    <span className={css({ color: "gray.500", fontSize: "14px", mt: "1" })}>Preto • Placa: XYZ-5678</span>
                  </div>
                }
                extraContent={
                  <button className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })}>
                    Editar
                  </button>
                }
              />
            </div>
          </div>
        </FrameComponent>
      </div>


      {/* =========================================
          SEÇÃO 2: PAGAMENTOS
      ========================================= */}
      <div className={css({ backgroundColor: "white", borderRadius: "2xl", boxShadow: "sm" })}>
        <FrameComponent
          titleElements={
            <div className={flex({ alignItems: "center", gap: "2" })}>
              <CreditCard className={css({ color: "#f5a623", fontSize: "28px" })} />
              <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>
                Pagamentos
              </h2>
            </div>
          }
          actions={
            <button 
              onClick={() => handleOpenModal("Pagamento")}
              className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })}
            >
              + Adicionar
            </button>
          }
        >
          <div className={flex({ direction: "column", gap: "3" })}>
            <div className={css({ backgroundColor: "gray.50", borderRadius: "xl", p: "2" })}>
              <LinkImage
                href="#"
                Icon={<CreditCard className={css({ color: "green.700", fontSize: "24px" })} />}
                text="Visa terminando em 8890"
                extraElement={<ChevronRight className={css({ color: "gray.400" })} />}
              />
            </div>
            
            <div className={css({ backgroundColor: "gray.50", borderRadius: "xl", p: "2" })}>
              <LinkImage
                href="#"
                Icon={<AccountBalanceWallet className={css({ color: "green.700", fontSize: "24px" })} />}
                text="Carteira Kiwidi (R$ 45,00)"
                extraElement={<ChevronRight className={css({ color: "gray.400" })} />}
              />
            </div>
          </div>
        </FrameComponent>
      </div>


      {/* =========================================
          SEÇÃO 3: CONFIGURAÇÕES DA CONTA
      ========================================= */}
      <div className={css({ backgroundColor: "white", borderRadius: "2xl", boxShadow: "sm" })}>
        <FrameComponent
          titleElements={
            <div className={flex({ alignItems: "center", gap: "2" })}>
              <Settings className={css({ color: "#63b3ed", fontSize: "28px" })} />
              <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>
                Configurações da Conta
              </h2>
            </div>
          }
        >
          <div className={flex({ direction: "column", gap: "6", pt: "2" })}>
            <LinkImage
              href="#"
              Icon={<Person className={css({ color: "green.700", fontSize: "24px" })} />}
              text="Informações Pessoais"
              extraElement={<ChevronRight className={css({ color: "gray.400" })} />}
            />
            <LinkImage
              href="#"
              Icon={<Security className={css({ color: "green.700", fontSize: "24px" })} />}
              text="Privacidade & Segurança"
              extraElement={<ChevronRight className={css({ color: "gray.400" })} />}
            />
          </div>
        </FrameComponent>
      </div>

      {/* =========================================
          MODAL GLOBAL DA PÁGINA
      ========================================= */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Adicionar novo ${modalType}`}
      >
        <div className={flex({ direction: "column", gap: "4", py: "4" })}>
          <p className={css({ color: "gray.600" })}>
            Formulário para adicionar {modalType.toLowerCase()} entraria aqui...
          </p>
          {/* Aqui você pode injetar moléculas de Inputs futuramente */}
        </div>
      </Modal>

    </main>
  );
}