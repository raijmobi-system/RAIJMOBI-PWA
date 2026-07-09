"use client";

import React, { useState, useEffect } from "react";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { Flex } from '@/styled-system/jsx';
import { useRouter } from "next/navigation";

// Importações dos seus componentes
import FrameComponent from "@/components/organisms/FrameComponent";
import LinkImage from "@/components/molecules/LinkImage";
import CardComponent from "@/components/molecules/CardComponent";
import Modal from "@/components/fixed/Modal";

// Importações dos Átomos e Moléculas necessários
import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action'; 
import { FormField } from '@/components/molecules/FormFIeld'; 

// Importação do Serviço de Veículos e da Instância da API
import { VehicleService, VehiclePayload } from '@/services/ride/vehicleService';

import { api } from '@/services/InterceptRequisition';

// Ícones do Material Symbols
import {
  DirectionsCar,
  Commute,
  Settings,
  Person,
  ChevronRight,
  CheckCircle
} from "@material-symbols-svg/react";

const GATEWAY_URL = 'http://localhost:8000';

/* ========================================================
   COMPONENTE: FORMULÁRIO DE VEÍCULO (MULTI-STEP COM FOTO)
======================================================== */
interface VehicleFormProps {
  onClose: () => void;
  vehicleToEdit?: any;
  refreshList: () => void;
}

import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';


async function Logout(router: any) {
  await SecureStoragePlugin.remove({ key: 'access_token' });
  await SecureStoragePlugin.remove({ key: 'refresh_token' });
  router.push('user/login')
}

const VehicleForm = ({ onClose, vehicleToEdit, refreshList }: VehicleFormProps) => {
  const isEditing = !!vehicleToEdit;

  const [step, setStep] = useState<1 | 2>(1);
  const [modelo, setModelo] = useState(vehicleToEdit?.model || "");
  const [placa, setPlaca] = useState(vehicleToEdit?.plate || "");
  const [cor, setCor] = useState<VehiclePayload['color']>(vehicleToEdit?.color || "branco");
  const [tipo, setTipo] = useState<VehiclePayload['type_vehicle']>(vehicleToEdit?.type_vehicle || "carro");
  const [assentos, setAssentos] = useState<number | string>(vehicleToEdit?.seats || "");
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(vehicleToEdit?.photo || null);
  
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = () => {
    if (!modelo || !placa || !assentos) {
      alert("Preencha o modelo, a placa e a quantidade de assentos antes de prosseguir!");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("model", modelo);
    formData.append("plate", placa);
    formData.append("color", cor);
    formData.append("type_vehicle", tipo);
    formData.append("seats", String(assentos));

    if (photoFile instanceof File) {
      formData.append("photo", photoFile);
    }

    try {
      if (isEditing) {
        await VehicleService.update(vehicleToEdit.id, formData as any);
        alert("Veículo atualizado com sucesso!");
      } else {
        await VehicleService.create(formData as any);
        alert("Veículo salvo com sucesso!");
      }
      refreshList();
      onClose();
    } catch (error: any) {
      console.error("Erro ao processar veículo:", error.response?.data || error.message);
      alert(JSON.stringify(error.response?.data) || "Erro ao salvar o veículo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleToEdit?.id) return;
    if (!window.confirm("Deseja mesmo deletar este veículo?")) return;

    setLoading(true);
    try {
      await VehicleService.delete(vehicleToEdit.id);
      alert("Veículo deletado com sucesso!");
      refreshList();
      onClose();
    } catch (error: any) {
      console.error("Erro ao deletar veículo:", error.response?.data || error.message);
      alert("Erro ao deletar o veículo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={flex({ direction: "column", gap: "4", py: "2" })}>
      <div className={flex({ gap: "2", mb: "2" })}>
        <div className={css({ flex: 1, h: "4px", bg: "#547812", borderRadius: "full" })} />
        <div className={css({ flex: 1, h: "4px", bg: step === 2 ? "#547812" : "gray.200", borderRadius: "full", transition: "all 0.3s" })} />
      </div>

      {step === 1 && (
        <>
          <Text weight="bold" className={css({ fontSize: "md", color: "gray.800" })}>
            Passo 1 de 2: Informações do Veículo
          </Text>

          <FormField 
            id="modelo" 
            label="Modelo do veículo" 
            placeholder="Ex: Honda Civic" 
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

          <div className={flex({ gap: "3" })}>
            <div className={flex({ direction: "column", gap: "1", flex: 1 })}>
              <label className={css({ fontSize: "sm", fontWeight: "semibold", color: "gray.700" })}>
                Tipo
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

            <div className={flex({ direction: "column", gap: "1", flex: 1 })}>
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
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={css({
                  px: "4", py: "3", bg: "red.100", color: "red.700", fontWeight: "bold",
                  borderRadius: "md", cursor: "pointer", _hover: { bg: "red.200" }
                })}
              >
                Deletar
              </button>
            )}
            <div className={css({ flex: isEditing ? 1 : "full" })}>
              <Button width="full" onClick={handleNextStep}>
                <Text color="white" weight="bold">Avançar para a Foto</Text>
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Text weight="bold" className={css({ fontSize: "md", color: "gray.800" })}>
            Passo 2 de 2: Foto do Veículo
          </Text>
          <Text className={css({ fontSize: "xs", color: "gray.500", mt: "-2" })}>
            Adicionar uma foto real do veículo aumenta a confiança dos passageiros na hora de reservar.
          </Text>

          <div className={flex({ 
            direction: "column", alignItems: "center", justify: "center",
            border: "2px dashed", borderColor: photoPreview ? "#547812" : "gray.300",
            borderRadius: "xl", p: "4", bg: photoPreview ? "#f0f7e5" : "gray.50",
            minHeight: "180px", position: "relative", overflow: "hidden"
          })}>
            {photoPreview ? (
              <div className={flex({ direction: "column", alignItems: "center", gap: "2", width: "full" })}>
                <img 
                  src={photoPreview} 
                  alt="Preview do veículo" 
                  className={css({ maxH: "160px", w: "full", objectFit: "cover", borderRadius: "lg" })}
                />
              </div>
            ) : (
              <div className={flex({ direction: "column", alignItems: "center", gap: "2", textAlign: "center" })}>
                <DirectionsCar className={css({ fontSize: "48px", color: "gray.400" })} />
                <Text className={css({ fontSize: "sm", color: "gray.600" })}>
                  Toque aqui para escolher uma foto da galeria
                </Text>
              </div>
            )}

            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange}
              className={css({
                position: "absolute", top: 0, left: 0, w: "full", h: "full",
                opacity: 0, cursor: "pointer"
              })}
            />
          </div>

          {photoPreview && (
            <Text className={css({ fontSize: "xs", color: "#547812", textAlign: "center" })}>
              ✨ Foto selecionada! Se quiser trocar, basta tocar na imagem acima.
            </Text>
          )}

          <div className={flex({ gap: "3", mt: "4" })}>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className={css({
                flex: 1, py: "3", border: "1px solid", borderColor: "gray.300",
                borderRadius: "md", bg: "white", color: "gray.700", fontWeight: "bold",
                cursor: "pointer", _hover: { bg: "gray.50" }
              })}
            >
              Voltar
            </button>

            <div className={css({ flex: 2 })}>
              <Button width="full" onClick={handleSubmit} disabled={loading}>
                <Text color="white" weight="bold">
                  {loading ? "Processando..." : isEditing ? "Salvar Edição" : "Concluir Cadastro"}
                </Text>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ========================================================
   COMPONENTE: INFORMAÇÕES PESSOAIS DINÂMICAS COM FOTO
======================================================== */
const PersonalInfoForm = ({ onClose }: { onClose: () => void }) => {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados dos dados do Perfil
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  
  // Estados para a Foto de Perfil
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Carrega os dados reais vindos da API (/api/profile/)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingInitial(true);
        const response = await api.get('/api/profile/');
        const data = response.data;

        // Extrai dados (compatível com a raiz ou aninhados do seu serializer)
        setNome(data?.usuario?.nome || data?.nome || "");
        setEmail(data?.usuario?.email || data?.email || "");
        setTelefone(data?.telefone || "");
        setCpf(data?.cpf || "");

        // Carrega foto existente e normaliza o caminho
        const fotoSalva = data?.foto || data?.perfil?.foto;
        if (fotoSalva && typeof fotoSalva === 'string') {
          if (fotoSalva.startsWith('/')) {
            setPhotoPreview(`${GATEWAY_URL}${fotoSalva}`);
          } else {
            setPhotoPreview(fotoSalva);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProfile = async () => {
    setSaving(true);
    const formData = new FormData();

    // Envia apenas os campos editáveis
    if (nome) formData.append("nome", nome);
    if (telefone) formData.append("telefone", telefone);

    // Se o usuário escolheu uma nova foto, anexa ao FormData
    if (photoFile instanceof File) {
      formData.append("foto", photoFile);
    }

    try {
      // 🌟 FORÇAMOS O ENVIO COMO MULTIPART/FORM-DATA PARA ENVIAR A FOTO:
      await api.patch('/api/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert("Perfil atualizado com sucesso!");
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error.response?.data || error.message);
      alert(JSON.stringify(error.response?.data) || "Erro ao atualizar suas informações.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <Flex p="6" justify="center" align="center">
        <Text color="muted">Carregando suas informações...</Text>
      </Flex>
    );
  }

  return (
    <div className={flex({ direction: "column", gap: "4", py: "2" })}>
      
      {/* Seletor Circular de Foto de Perfil */}
      <div className={flex({ direction: "column", alignItems: "center", mb: "2" })}>
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
              alt="Sua Foto" 
              className={css({ width: "full", height: "full", objectFit: "cover" })} 
            />
          ) : (
            <span className={css({ fontSize: "32px" })}>👤</span>
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
          Toque na imagem para alterar sua foto
        </Text>
      </div>

      <FormField 
        id="nome" 
        label="Nome completo" 
        value={nome}
        onChange={(e: any) => setNome(e.target.value)} 
      />
      
      <FormField 
        id="email" 
        label="E-mail (Não editável)" 
        value={email} 
        disabled 
      />

      {cpf && (
        <FormField 
          id="cpf" 
          label="CPF (Não editável)" 
          value={cpf} 
          disabled 
        />
      )}

      <FormField 
        id="telefone" 
        label="Telefone com DDD" 
        value={telefone}
        onChange={(e: any) => setTelefone(e.target.value)} 
      />
      
      <div className={css({ mt: "4" })}>
        <Button width="full" onClick={handleSubmitProfile} disabled={saving}>
          <div className={flex({ alignItems: "center", justify: "center", gap: "2" })}>
            <CheckCircle className={css({ color: "white" })} />
            <Text color="white" weight="bold">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Text>
          </div>
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

  const router = useRouter();

  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const [veiculosLista, setVeiculosLista] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await VehicleService.getAll();
      const data = response.data?.results || response.data || [];
      setVeiculosLista(data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                <Text color="muted">Carregando veículos...</Text>
              ) : veiculosLista.length === 0 ? (
                <Text color="muted">Nenhum veículo cadastrado.</Text>
              ) : (
                veiculosLista.slice(0, 2).map((item) => (
                  <CardComponent
                    key={item.id}
                    fullWidth
                    hasPadding
                    direction="row"
                    Image={
                      item.photo ? (
                        <img 
                          src={item.photo} 
                          alt={item.model} 
                          className={css({ w: "48px", h: "48px", objectFit: "cover", borderRadius: "xl" })} 
                        />
                      ) : (
                        <div className={flex({ w: "48px", h: "48px", bg: "#e8f0e4", borderRadius: "xl", alignItems: "center", justifyContent: "center" })}>
                          <Commute className={css({ color: "green.700", fontSize: "24px" })} />
                        </div>
                      )
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

      {/* SEÇÃO 2: CONFIGURAÇÕES DA CONTA */}
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
          <div className={flex({ direction: "column", gap: "6", pt: "2" })}>
            <div 
              onClick={() => Logout(router)} 
              className={css({ cursor: "pointer" })}
            >
              <LinkImage
                href="#"
                Icon={<Person className={css({ color: "red", fontSize: "24px" })} />}
                text="Logout"
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