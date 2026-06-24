"use client";

import React, { useState } from "react";
import { css } from "../../styled-system/css";
import { flex } from "../../styled-system/patterns";

// Importações dos seus componentes
import FrameComponent from "@/components/organisms/FrameComponent";
import LinkImage from "@/components/molecules/LinkImage";
import CardComponent from "@/components/molecules/CardComponent";
import Modal from "@/components/fixed/Modal";

// Importações dos Átomos e Moléculas necessários
import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action'; // Certifique-se deste caminho
import { FormField } from '@/components/molecules/FormFIeld'; // Certifique-se deste caminho

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

/* =========================================
   COMPONENTES INTERNOS DA PÁGINA (CHILDREN)
========================================= */

const VehicleForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className={flex({ direction: "column", gap: "4", py: "2" })}>
      <FormField 
        id="modelo" 
        label="Modelo do veículo" 
        placeholder="Ex: Ford Ka" 
      />
      <FormField 
        id="cor" 
        label="Cor" 
        placeholder="Ex: Branco" 
      />
      <FormField 
        id="placa" 
        label="Placa" 
        placeholder="Ex: ABC-1234" 
      />
      
      <div className={css({ mt: "4" })}>
        <Button width="full" onClick={onClose}>
          <Text color="white" weight="bold">Salvar Veículo</Text>
        </Button>
      </div>
    </div>
  );
};

const PersonalInfoForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className={flex({ direction: "column", gap: "4", py: "2" })}>
      <FormField 
        id="nome" 
        label="Nome completo" 
        defaultValue="Fernando" 
      />
      <FormField 
        id="email" 
        label="E-mail" 
        defaultValue="fernando@email.com" 
      />
      <FormField 
        id="telefone" 
        label="Telefone" 
        defaultValue="(84) 9 9999-9999" 
      />
      
      <div className={css({ mt: "4" })}>
        <Button width="full" onClick={onClose}>
          <Text color="white" weight="bold">Salvar Alterações</Text>
        </Button>
      </div>
    </div>
  );
};

/* =========================================
   TIPAGEM DOS MODAIS DESTA PÁGINA
========================================= */
type ModalType = 'none' | 'vehicle' | 'payment' | 'personal_info';

/* =========================================
   COMPONENTE PRINCIPAL
========================================= */
export default function Perfil() {
  // Estado para controlar qual modal está aberto
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  const closeModal = () => setActiveModal('none');

  // Define o título dinamicamente com base no estado
  const getModalTitle = () => {
    switch (activeModal) {
      case 'vehicle': return 'Adicionar Veículo';
      case 'payment': return 'Adicionar Cartão';
      case 'personal_info': return 'Informações Pessoais';
      default: return '';
    }
  };

  // Define qual formulário será renderizado no body do modal
  const renderModalContent = () => {
    switch (activeModal) {
      case 'vehicle': 
        return <VehicleForm onClose={closeModal} />;
      case 'personal_info': 
        return <PersonalInfoForm onClose={closeModal} />;
      case 'payment': 
        return <p className={css({ color: "gray.600" })}>Formulário de cartão entrará aqui...</p>; 
      default: 
        return null;
    }
  };

  return (
    <main 
      className={flex({ 
        direction: "column", 
        gap: "6", 
        padding: "4",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
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
              onClick={() => setActiveModal('vehicle')}
              className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })}
            >
              + Adicionar
            </button>
          }
        >
          <div className={flex({ direction: "column", gap: "4" })}>
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
                    <Text color="danger">Ford Ka</Text>
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
              onClick={() => setActiveModal('payment')}
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
            <div 
              onClick={() => setActiveModal('personal_info')} 
              className={css({ cursor: "pointer" })}
            >
              <LinkImage
                href="#"
                Icon={<Person className={css({ color: "green.700", fontSize: "24px" })} />}
                text="Informações Pessoais"
                extraElement={<ChevronRight className={css({ color: "gray.400" })} />}
              />
            </div>
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
          MODAL GLOBAL E DINÂMICO
      ========================================= */}
      <Modal 
        isOpen={activeModal !== 'none'} 
        onClose={closeModal} 
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>

    </main>
  );
}