"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";
import { Flex, Box } from '@/styled-system/jsx';

import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import FrameComponent from "@/components/organisms/FrameComponent";
import LinkImage from "@/components/molecules/LinkImage";
import CardComponent from "@/components/molecules/CardComponent";
import Modal from "@/components/fixed/Modal";

import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action'; 
import { FormField } from '@/components/molecules/FormFIeld'; 

import { VehicleService, VehiclePayload } from '@/services/ride/vehicleService';
import { api } from '@/services/InterceptRequisition';

import {
  DirectionsCar,
  Commute,
  Settings,
  Person,
  ChevronRight,
  CheckCircle
} from "@material-symbols-svg/react";

const GATEWAY_URL = 'http://localhost:8000'; // Centraliza a porta do Kong Gateway para entrega de mídias públicas

/* ========================================================
   🌟 FUNÇÃO INTELIGENTE DE RESOLUÇÃO DE URL DE IMAGENS
======================================================== */
/* ========================================================
   🌟 FUNÇÃO INTELIGENTE DE RESOLUÇÃO DE URL DE IMAGENS (CORRIGIDA)
======================================================== */
const getImageUrl = (rawPhoto: string | null) => {
  if (!rawPhoto) return null;
  
  // 1. Se o Django mandou a URL interna do Docker (ex: http://ride-service:8000/media/...)
  if (rawPhoto.includes('ride-service:8000')) {
    return rawPhoto.replace('http://ride-service:8000', GATEWAY_URL);
  }
  
  // 2. Se já for uma URL externa válida (ex: login social do Google ou produção)
  if (rawPhoto.startsWith('http')) return rawPhoto;
  
  // 3. Se for o caminho relativo padrão (ex: /media/vehicles/foto.jpg)
  const relativePath = rawPhoto.startsWith('/') ? rawPhoto : `/${rawPhoto}`;
  return `${GATEWAY_URL}${relativePath}`;
};

async function Logout(router: any) {
  await SecureStoragePlugin.remove({ key: 'access_token' });
  await SecureStoragePlugin.remove({ key: 'refresh_token' });
  router.push('/user/login');
}

/* ========================================================
   COMPONENTE: FORMULÁRIO DE VEÍCULO
======================================================== */
interface VehicleFormProps {
  onClose: () => void;
  vehicleToEdit?: any;
  refreshList: () => void;
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
  
  // 🌟 Normalização da foto do veículo recebida para edição
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    vehicleToEdit?.photo ? getImageUrl(vehicleToEdit.photo) : null
  );
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validarPlacaBrasileira = (textoPlaca: string): boolean => {
    const limpo = textoPlaca.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const regexAntigo = /^[A-Z]{3}[0-9]{4}$/;
    const regexMercosul = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
    return regexAntigo.test(limpo) || regexMercosul.test(limpo);
  };

  const handleNextStep = () => {
    setFormError(null);
    if (!modelo || !placa || !assentos) {
      setFormError("Preencha o modelo, a placa e a quantidade de assentos antes de prosseguir!");
      return;
    }

    if (!validarPlacaBrasileira(placa)) {
      setFormError("Informe uma placa brasileira válida: formato tradicional (ABC-1234) ou Mercosul (ABC1D23).");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData();
    formData.append("model", modelo);
    formData.append("plate", placa.toUpperCase().trim());
    formData.append("color", cor);
    formData.append("type_vehicle", tipo);
    formData.append("seats", String(assentos));

    if (photoFile instanceof File) {
      formData.append("photo", photoFile);
    }

    try {
      if (isEditing) {
        await VehicleService.update(vehicleToEdit.id, formData as any);
        setFormSuccess("Veículo atualizado com sucesso!");
      } else {
        await VehicleService.create(formData as any);
        setFormSuccess("Veículo cadastrado com sucesso!");
      }
      refreshList();
      setTimeout(onClose, 1500); 
    } catch (error: any) {
      console.error("Erro ao processar veículo:", error.response?.data || error.message);
      setFormError("Não foi possível salvar o veículo. Verifique as informações fornecidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicleToEdit?.id) return;
    if (!window.confirm("Deseja mesmo deletar este veículo?")) return;

    setLoading(true);
    setFormError(null);
    try {
      await VehicleService.delete(vehicleToEdit.id);
      setFormSuccess("Veículo removido com sucesso!");
      refreshList();
      setTimeout(onClose, 1500);
    } catch (error: any) {
      console.error("Erro ao deletar veículo:", error.response?.data || error.message);
      setFormError("Erro ao processar a exclusão do veículo no servidor.");
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

      {formError && (
        <Box p="3" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg">
          <Text size="xs" color="danger" weight="medium">{formError}</Text>
        </Box>
      )}
      {formSuccess && (
        <Box p="3" bg="#f0f7e5" border="1px solid" borderColor="#cce5a3" borderRadius="lg">
          <Text size="xs" color="success" weight="medium">✓ {formSuccess}</Text>
        </Box>
      )}

      {step === 1 && (
        <>
          <Text weight="bold" className={css({ fontSize: "md", color: "gray.800" })}>
            Passo 1 de 2: Informações do Veículo
          </Text>

          <FormField id="modelo" label="Modelo do veículo" placeholder="Ex: Honda Civic" value={modelo} onChange={(e: any) => setModelo(e.target.value)} />
          <FormField id="placa" label="Placa" placeholder="Ex: ABC-1234 ou ABC1D23" value={placa} onChange={(e: any) => setPlaca(e.target.value)} />

          <div className={flex({ gap: "3" })}>
            <div className={flex({ direction: "column", gap: "1", flex: 1 })}>
              <label className={css({ fontSize: "sm", fontWeight: "semibold", color: "gray.700" })}>Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as VehiclePayload['type_vehicle'])} className={css({ p: "3", border: "1px solid", borderColor: "gray.300", borderRadius: "md", bg: "white", fontSize: "sm" })}>
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
              </select>
            </div>

            <div className={flex({ direction: "column", gap: "1", flex: 1 })}>
              <label className={css({ fontSize: "sm", fontWeight: "semibold", color: "gray.700" })}>Cor</label>
              <select value={cor} onChange={(e) => setCor(e.target.value as VehiclePayload['color'])} className={css({ p: "3", border: "1px solid", borderColor: "gray.300", borderRadius: "md", bg: "white", fontSize: "sm" })}>
                <option value="preto">Preto</option>
                <option value="branco">Branco</option>
                <option value="vermelho">Vermelho</option>
                <option value="azul">Azul</option>
              </select>
            </div>
          </div>

          <FormField id="assentos" label="Quantidade de assentos" placeholder="Ex: 5" type="number" value={assentos} onChange={(e: any) => setAssentos(e.target.value)} />

          <div className={flex({ gap: "3", mt: "4", justify: isEditing ? "space-between" : "flex-end" })}>
            {isEditing && (
              <button type="button" onClick={handleDelete} disabled={loading} className={css({ px: "4", py: "3", bg: "red.100", color: "red.700", fontWeight: "bold", borderRadius: "md", cursor: "pointer", border: "none", _hover: { bg: "red.200" } })}>
                Deletar
              </button>
            )}
            <div className={css({ flex: 1, width: "full" })}>
              <Button width="full" onClick={handleNextStep}>
                <Text color="white" weight="bold">Avançar para a Foto</Text>
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Text weight="bold" className={css({ fontSize: "md", color: "gray.800" })}>Passo 2 de 2: Foto do Veículo</Text>
          <Text className={css({ fontSize: "xs", color: "gray.500", mt: "-2" })}>Adicionar uma foto real do veículo aumenta a confiança dos passageiros.</Text>

          <div className={flex({ direction: "column", alignItems: "center", justify: "center", border: "2px dashed", borderColor: photoPreview ? "#547812" : "gray.300", borderRadius: "xl", p: "4", bg: photoPreview ? "#f0f7e5" : "gray.50", minHeight: "180px", position: "relative", overflow: "hidden" })}>
            {photoPreview ? (
              <div className={flex({ direction: "column", alignItems: "center", gap: "2", width: "full" })}>
                <img src={photoPreview} alt="Preview do veículo" className={css({ maxH: "160px", w: "full", objectFit: "cover", borderRadius: "lg" })}/>
              </div>
            ) : (
              <div className={flex({ direction: "column", alignItems: "center", gap: "2", textAlign: "center" })}>
                <DirectionsCar className={css({ fontSize: "48px", color: "gray.400" })} />
                <Text className={css({ fontSize: "sm", color: "gray.600" })}>Toque aqui para escolher uma foto</Text>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className={css({ position: "absolute", top: 0, left: 0, w: "full", h: "full", opacity: 0, cursor: "pointer" })}/>
          </div>

          <div className={flex({ gap: "3", mt: "4" })}>
            <button type="button" onClick={() => setStep(1)} disabled={loading} className={css({ flex: 1, py: "3", border: "1px solid", borderColor: "gray.300", borderRadius: "md", bg: "white", color: "gray.700", fontWeight: "bold", cursor: "pointer", _hover: { bg: "gray.50" } })}>
              Voltar
            </button>
            <div className={css({ flex: 2 })}>
              <Button width="full" onClick={handleSubmit} disabled={loading}>
                <Text color="white" weight="bold">{loading ? "Processando..." : isEditing ? "Salvar Edição" : "Concluir Cadastro"}</Text>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ========================================================
   COMPONENTE: INFORMAÇÕES PESSOAIS
======================================================== */
const PersonalInfoForm = ({ onClose }: { onClose: () => void }) => {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingInitial(true);
        const response = await api.get('/api/profile/');
        const data = response.data;

        setNome(data?.usuario?.nome || data?.nome || "");
        setEmail(data?.usuario?.email || data?.email || "");
        setTelefone(data?.telefone || "");
        setCpf(data?.cpf || "");

        // 🌟 Normalização da foto do perfil do usuário logado
        const fotoSalva = data?.foto || data?.perfil?.foto;
        setPhotoPreview(getImageUrl(fotoSalva)); 

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
    setProfileError(null);
    setProfileSuccess(null);

    const formData = new FormData();
    if (nome) formData.append("nome", nome);
    if (telefone) formData.append("telefone", telefone);

    if (photoFile instanceof File) {
      formData.append("foto", photoFile);
    }

    try {
      await api.patch('/api/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileSuccess("Suas informações foram updated com sucesso!");
      setTimeout(onClose, 1500);
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error.response?.data || error.message);
      setProfileError("Não foi possível salvar o perfil. Verifique as informações.");
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
      {profileError && (
        <Box p="3" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg">
          <Text size="xs" color="danger" weight="medium">{profileError}</Text>
        </Box>
      )}
      {profileSuccess && (
        <Box p="3" bg="#f0f7e5" border="1px solid" borderColor="#cce5a3" borderRadius="lg">
          <Text size="xs" color="success" weight="medium">✓ {profileSuccess}</Text>
        </Box>
      )}

      <div className={flex({ direction: "column", alignItems: "center", mb: "2" })}>
        <div className={css({ width: "96px", height: "96px", borderRadius: "full", backgroundColor: photoPreview ? "transparent" : "#f0f7e5", border: "2px dashed", borderColor: "#547812", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: "pointer" })}>
          {photoPreview ? (
            <img src={photoPreview} alt="Sua Foto" className={css({ width: "full", height: "full", objectFit: "cover" })} />
          ) : (
            <span className={css({ fontSize: "32px" })}>👤</span>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} className={css({ position: "absolute", top: 0, left: 0, width: "full", height: "full", opacity: 0, cursor: "pointer" })} />
        </div>
        <Text className={css({ fontSize: "xs", color: "gray.500", mt: "2" })}>Toque na imagem para alterar sua foto</Text>
      </div>

      <FormField id="nome" label="Nome completo" value={nome} onChange={(e: any) => setNome(e.target.value)} />
      <FormField id="email" label="E-mail (Não editável)" value={email} disabled />
      {cpf && <FormField id="cpf" label="CPF (Não editável)" value={cpf} disabled />}
      <FormField id="telefone" label="Telefone com DDD" value={telefone} onChange={(e: any) => setTelefone(e.target.value)} />
      
      <div className={css({ mt: "4" })}>
        <Button width="full" onClick={handleSubmitProfile} disabled={saving}>
          <div className={flex({ alignItems: "center", justify: "center", gap: "2" })}>
            <CheckCircle className={css({ color: "white" })} />
            <Text color="white" weight="bold">{saving ? "Salvando..." : "Salvar Alterações"}</Text>
          </div>
        </Button>
      </div>
    </div>
  );
};

type ModalType = 'none' | 'vehicle' | 'payment' | 'personal_info' | 'all_vehicles';

/* =========================================
   COMPONENTE PRINCIPAL (PERFIL)
========================================= */
export default function Perfil() {
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
    //eslint-disable-next-line
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
      case 'all_vehicles': return 'Meus Veículos Cadastrados';
      default: return '';
    }
  };

  const renderVehicleItem = (item: any) => (
    <Box key={item.id} className={css({ mb: "3.5", "&:last-child": { mb: "0" } })}>
      <CardComponent
        fullWidth
        hasPadding
        direction="row"
        Image={
          item.photo ? (
            // 🌟 Renderiza o link montado de forma segura e sem caminhos duplicados
            <img src={getImageUrl(item.photo) || ''} alt={item.model} className={css({ w: "48px", h: "48px", objectFit: "cover", borderRadius: "xl" })} />
          ) : (
            <div className={flex({ w: "48px", h: "48px", bg: "#e8f0e4", borderRadius: "xl", alignItems: "center", justifyContent: "center" })}>
              <Commute className={css({ color: "green.700", fontSize: "24px" })} />
            </div>
          )
        }
        content={
          <div className={flex({ direction: "column", flex: 1, ml: "4" })}>
            <Text color="success" weight="bold">{item.model}</Text>
            <span className={css({ color: "gray.600", fontSize: "14px", mt: "0.5", textTransform: "capitalize" })}>
              {item.color} • Placa: {item.plate}
            </span>
          </div>
        }
        extraContent={
          <button 
            className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent", border: "none" })} 
            onClick={() => handleOpenEdit(item)}
          >
            Editar
          </button>
        }
      />
    </Box>
  );

  const renderModalContent = () => {
    switch (activeModal) {
      case 'vehicle': 
        return <VehicleForm onClose={closeModal} vehicleToEdit={selectedVehicle} refreshList={fetchVehicles} />;
      case 'personal_info': 
        return <PersonalInfoForm onClose={closeModal} />;
      case 'all_vehicles':
        return (
          <Flex direction="column" gap="1" py="2" maxHeight="65vh" overflowY="auto">
            {veiculosLista.map((item) => renderVehicleItem(item))}
          </Flex>
        );
      case 'payment': 
        return <p className={css({ color: "gray.600" })}>Formulário de cartão entrará aqui...</p>; 
      default: 
        return null;
    }
  };

  return (
    <Flex 
      className={flex({ 
        direction: "column", gap: "6", padding: "4", backgroundColor: "#f9f9f9", minHeight: "100vh",
        "& section": { minHeight: "auto !important" } 
      })}
    >
      {/* SEÇÃO 1: VEÍCULOS */}
      <div className={css({ backgroundColor: "white", borderRadius: "2xl", boxShadow: "sm" })}>
        <FrameComponent
          titleElements={
            <div className={flex({ alignItems: "center", gap: "2" })}>
              <DirectionsCar className={css({ color: "red.600", fontSize: "28px" })} />
              <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>Veículos</h2>
            </div>
          }
          actions={
            <button 
              onClick={() => { setSelectedVehicle(null); setActiveModal('vehicle'); }}
              className={css({ color: "green.700", fontWeight: "semibold", cursor: "pointer", bg: "transparent", border: "none" })}
            >
              + Adicionar
            </button>
          }
        >
          <div className={flex({ direction: "column", gap: "2" })}>
            <div className={css({ "& > div": { backgroundColor: "gray.50", border: "none" } })}>
              
              {loadingVehicles ? (
                <Text color="muted">Carregando veículos...</Text>
              ) : veiculosLista.length === 0 ? (
                <Text color="muted">Nenhum veículo cadastrado.</Text>
              ) : (
                <>
                  <div className={flex({ direction: "column" })}>
                    {veiculosLista.slice(0, 2).map((item) => renderVehicleItem(item))}
                  </div>

                  {veiculosLista.length > 2 && (
                    <button
                      onClick={() => setActiveModal('all_vehicles')}
                      className={css({
                        width: "full", textAlign: "center", py: "3", mt: "2",
                        color: "green.700", fontWeight: "bold", fontSize: "sm",
                        bg: "gray.100", borderRadius: "xl", cursor: "pointer", border: "none"
                      })}
                    >
                      Mostrar todos os {veiculosLista.length} veículos
                    </button>
                  )}
                </>
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
              <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "gray.900" })}>Configurações da Conta</h2>
            </div>
          }
        >
          <div className={flex({ direction: "column", gap: "6", pt: "2" })}>
            <div onClick={() => setActiveModal('personal_info')} className={css({ cursor: "pointer" })}>
              <LinkImage
                href="#"
                Icon={<Person className={css({ color: "green.700", fontSize: "24px" })} />}
                text="Informações Pessoais"
                extraElement={<ChevronRight className={css({ color: "gray.400" })} />}
              />
            </div>
          </div>
          <div className={flex({ direction: "column", gap: "6", pt: "2" })}>
            <div onClick={() => Logout(api)} className={css({ cursor: "pointer" })}>
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

      <Modal isOpen={activeModal !== 'none'} onClose={closeModal} title={getModalTitle()}>
        {renderModalContent()}
      </Modal>

    </Flex>
  );
}