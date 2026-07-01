"use client";

import React, { useState, useEffect } from "react";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { Flex } from '@/styled-system/jsx'

// Importações dos seus componentes
import FrameComponent from "@/components/organisms/FrameComponent";
import LinkImage from "@/components/molecules/LinkImage";
import CardComponent from "@/components/molecules/CardComponent";
import Modal from "@/components/fixed/Modal";

// Importações dos Átomos e Moléculas necessários
import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action'; 
import { FormField } from '@/components/molecules/FormFIeld'; 

// Importação do Serviço (Certifique-se de que VehicleService tenha um método getAll ou list)
import { VehicleService, VehiclePayload } from '@/services/ride/vehicleService';

// Ícones do Material Symbols
import {
  DirectionsCar,
  Commute,
  CreditCard,
  Settings,
  Person,
  ChevronRight
} from "@material-symbols-svg/react";

/* =========================================
   COMPONENTE: FORMULÁRIO DE VEÍCULO
========================================= */
interface VehicleFormProps {
  onClose: () => void;
  vehicleToEdit?: any;
  refreshList: () => void; // Função para atualizar a lista após salvar/deletar
}

const VehicleForm = ({ onClose, vehicleToEdit, refreshList }: VehicleFormProps) => {
  const isEditing = !!vehicleToEdit;

  const [modelo, setModelo] = useState(vehicleToEdit?.model || "");
  const [placa, setPlaca] = useState(vehicleToEdit?.plate || "");
  const [cor, setCor] = useState<VehiclePayload['color']>(vehicleToEdit?.color || "branco");
  const [tipo, setTipo] = useState<VehiclePayload['type_vehicle']>(vehicleToEdit?.type_vehicle || "carro");
  const [assentos, setAssentos] = useState<number | string>(vehicleToEdit?.seats || "");
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!modelo || !placa || !assentos) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);

    const payload: VehiclePayload = {
      model: modelo,
      type_vehicle: tipo,
      color: cor,
      plate: placa,
      seats: Number(assentos)
    };

    try {
      if (isEditing) {
        await VehicleService.update(vehicleToEdit.id, payload);
        alert("Veículo atualizado com sucesso!");
      } else {
        await VehicleService.create(payload);
        alert("Veículo salvo com sucesso!");
      }
      refreshList(); // Atualiza a lista da API
      onClose(); // Fecha o modal
    } catch (error: any) {
      console.error("Erro ao processar veículo:", error.response?.data || error.message);
      alert(JSON.stringify(error.response?.data) || "Erro ao salvar as informações do veículo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleToEdit?.id) return;
    
    const confirmDelete = window.confirm("Deseja mesmo deletar este veículo?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      // Método de deletar da sua API (Delete)
      await VehicleService.delete(vehicleToEdit.id);
      alert("Veículo deletado com sucesso!");
      refreshList(); // Atualiza a lista da API
      onClose(); // Fecha o modal
    } catch (error: any) {
      console.error("Erro ao deletar veículo:", error.response?.data || error.message);
      alert("Erro ao deletar o veículo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={flex({ direction: "column", gap: "4", py: "2" })}>
      <FormField 
        id="modelo" 
        label="Modelo do veículo" 
        placeholder="Ex: Ford Ka" 
        value={modelo}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModelo(e.target.value)}
      />
      
      <FormField 
        id="placa" 
        label="Placa" 
        placeholder="Ex: ABC-1234" 
        value={placa}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaca(e.target.value)}
      />

      <div className={flex({ direction: "column", gap: "1" })}>
        <label className={css({ fontSize: "sm", fontWeight: "semibold", color: "gray.700" })}>
          Tipo de Veículo
        </label>
        <select 
          value={tipo} 
          onChange={(e) => setTipo(e.target.value as VehiclePayload['type_vehicle'])}
          className={css({ p: "3", border: "1px solid", borderColor: "gray.300", borderRadius: "md", bg: "white" })}
        >
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>
      </div>

      <div className={flex({ direction: "column", gap: "1" })}>
        <label className={css({ fontSize: "sm", fontWeight: "semibold", color: "gray.700" })}>
          Cor
        </label>
        <select 
          value={cor} 
          onChange={(e) => setCor(e.target.value as VehiclePayload['color'])}
          className={css({ p: "3", border: "1px solid", borderColor: "gray.300", borderRadius: "md", bg: "white" })}
        >
          <option value="preto">Preto</option>
          <option value="branco">Branco</option>
          <option value="vermelho">Vermelho</option>
          <option value="azul">Azul</option>
        </select>
      </div>

      <FormField 
        id="assentos" 
        label="Quantidade de assentos" 
        placeholder="Ex: 5" 
        type="number" 
        value={assentos}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssentos(e.target.value)}
      />
      
      <div className={flex({ gap: "3", mt: "4", justify: isEditing ? "space-between" : "flex-end" })}>
        {isEditing && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className={css({
              px: "4",
              py: "3",
              bg: "red.100",
              color: "red.700",
              fontWeight: "bold",
              borderRadius: "md",
              cursor: "pointer",
              _hover: { bg: "red.200" },
              _disabled: { opacity: 0.5, cursor: "not-allowed" }
            })}
          >
            Deletar
          </button>
        )}
        <div className={css({ flex: isEditing ? 1 : "full" })}>
          <Button width="full" onClick={handleSubmit} disabled={loading}>
            <Text color="white" weight="bold">
              {loading ? "Processando..." : isEditing ? "Confirmar Edição" : "Salvar Veículo"}
            </Text>
          </Button>
        </div>
      </div>
    </div>
  );
};

/* =========================================
   COMPONENTE: INFORMAÇÕES PESSOAIS
========================================= */
const PersonalInfoForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className={flex({ direction: "column", gap: "4", py: "2" })}>
      <FormField id="nome" label="Nome completo" defaultValue="Fernando" />
      <FormField id="email" label="E-mail" defaultValue="fernando@email.com" />
      <FormField id="telefone" label="Telefone" defaultValue="(84) 9 9999-9999" />
      
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
   COMPONENTE PRINCIPAL (PERFIL)
========================================= */
export default function Perfil() {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Estados para gerenciar a lista vinda da API
  const [veiculosLista, setVeiculosLista] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Função para buscar veículos na API
  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      // Nota: Ajuste o nome do método caso no seu VehicleService ele se chame "list" ou "get" ao invés de "getAll"
      const response = await VehicleService.getAll();
      
      // O DRF com paginação retorna um objeto com "count", "next", "previous", "results"
      const data = response.data?.results || response.data || [];
      setVeiculosLista(data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Chama a API logo que o componente é montado na tela
  useEffect(() => {
    fetchVehicles();
  }, []);

  const closeModal = () => {
    setActiveModal('none');
    setSelectedVehicle(null);
  };

  const handleOpenEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setActiveModal('vehicle');
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'vehicle': return selectedVehicle ? 'Editar Veículo' : 'Adicionar Veículo';
      case 'payment': return 'Adicionar Cartão';
      case 'personal_info': return 'Informações Pessoais';
      default: return '';
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'vehicle': 
        return <VehicleForm onClose={closeModal} vehicleToEdit={selectedVehicle} refreshList={fetchVehicles} />;
      case 'personal_info': 
        return <PersonalInfoForm onClose={closeModal} />;
      case 'payment': 
        return <p className={css({ color: "gray.600" })}>Formulário de cartão entrará aqui...</p>; 
      default: 
        return null;
    }
  };

  return (
    <Flex 
      className={flex({ 
        direction: "column", 
        gap: "6", 
        padding: "4",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        "& section": { minHeight: "auto !important" } 
      })}
    >
      
      {/* SEÇÃO 1: VEÍCULOS */}
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
              onClick={() => { setSelectedVehicle(null); setActiveModal('vehicle'); }}
              className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })}
            >
              + Adicionar
            </button>
          }
        >
          <div className={flex({ direction: "column", gap: "4" })}>
            <div className={css({ "& > div": { backgroundColor: "gray.50", border: "none" } })}>
              
              {loadingVehicles ? (
                <Text color="gray.500">Carregando veículos...</Text>
              ) : veiculosLista.length === 0 ? (
                <Text color="gray.500">Nenhum veículo cadastrado.</Text>
              ) : (
                // Renderiza exatamente os 2 primeiros veículos retornados da API
                veiculosLista.slice(0, 2).map((item) => (
                  <CardComponent
                    key={item.id}
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
                        <Text color="danger">{item.model}</Text>
                        <span className={css({ color: "violet", fontSize: "14px", mt: "1", textTransform: "capitalize" })}>
                          {item.color} • Placa: {item.plate}
                        </span>
                      </div>
                    }
                    extraContent={
                      <button 
                        className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent" })} 
                        onClick={() => handleOpenEdit(item)}
                      >
                        Editar
                      </button>
                    }
                  />
                ))
              )}

            </div>
          </div>
        </FrameComponent>
      </div>

      {/* SEÇÃO 2: PAGAMENTOS */}
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
          </div>
        </FrameComponent>
      </div>

      {/* SEÇÃO 3: CONFIGURAÇÕES DA CONTA */}
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
          </div>
        </FrameComponent>
      </div>

      {/* MODAL GLOBAL E DINÂMICO */}
      <Modal 
        isOpen={activeModal !== 'none'} 
        onClose={closeModal} 
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>

    </Flex>
  );
}