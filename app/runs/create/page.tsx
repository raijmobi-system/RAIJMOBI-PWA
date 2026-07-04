"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex } from '@/styled-system/jsx';
import { css } from "@/styled-system/css"; 

// Átomos e Moléculas reais
import { Button } from '@/components/atoms/action';
import { FrameComponent } from "@/components/organisms";
import { Text } from '@/components/atoms/typography';
import { FormField, SelectField } from '@/components/molecules'; 

// Seus Serviços de API Reais
import { RideService } from '@/services/ride/rideService';
import { VehicleService } from '@/services/ride/vehicleService';

// Ícones do Material Symbols
import { 
  ArrowBack, 
  CheckCircle, 
  DirectionsCar, 
  LocationOn, 
  Schedule,
  Payments,
  Group
} from '@material-symbols-svg/react';

const ESTADOS_BR = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' }
];

export default function CreateRidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Se houver "?edit=ID" na URL, entra no modo edição!
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [myVehicles, setMyVehicles] = useState<{value: string, label: string}[]>([]); 
  
  // Estado para armazenar os dados da carona antiga se for edição
  const [rideData, setRideData] = useState<any>(null);

  // ==========================================
  // CARREGAR VEÍCULOS E DADOS DE EDIÇÃO
  // ==========================================
  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Carrega os veículos reais
        const resVehicles = await VehicleService.getAll();
        const dataVehicles = resVehicles.data?.results || resVehicles.data || [];
        
        const options = dataVehicles.map((v: any) => ({
          value: v.uuid, // 🌟 AQUI USAMOS O UUID DO VEÍCULO (Segurança Máxima)
          label: `${v.model} (${v.plate})`
        }));
        
        setMyVehicles([{ value: '', label: 'Selecione o veículo...' }, ...options]);

        // 2. Se for edição, carrega os dados atuais da carona
        if (isEditing && editId) {
          const resRide = await RideService.getById(editId);
          setRideData(resRide.data);
        }
      } catch (error) {
        console.error("Erro ao inicializar página:", error);
      }
    };

    initPage();
  }, [isEditing, editId]);

  const handleNextStep = () => {
    const form = document.getElementById("ride-form") as HTMLFormElement;
    if (!form) return;

    const requiredStep1 = ['originState', 'originCity', 'originAddress', 'destState', 'destCity', 'destAddress', 'start_time', 'expected_arrival'];
    
    let isValid = true;
    for (const fieldName of requiredStep1) {
      const input = form.elements.namedItem(fieldName) as HTMLInputElement | HTMLSelectElement;
      if (input && !input.value) {
        input.reportValidity(); 
        isValid = false;
        break;
      }
    }

    if (isValid) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const vehicleId = formData.get("vehicleId") as string;
    const seats = formData.get("seats") as string;
    
    // O preço vem nulo no modo de edição porque o input está desabilitado
    const price = formData.get("price") as string; 

    // 🌟 CORREÇÃO AQUI: Só validamos se o preço não for nulo se NÃO estivermos editando!
    if (!vehicleId || !seats || (!isEditing && !price)) {
      alert("Preencha todos os detalhes necessários do veículo.");
      setLoading(false);
      return;
    }

    const payload: any = {
      origin: {
        state: formData.get("originState"),
        city: formData.get("originCity"),
        address: formData.get("originAddress")
      },
      destination: {
        state: formData.get("destState"),
        city: formData.get("destCity"),
        address: formData.get("destAddress")
      },
      start_time: formData.get("start_time"),
      expected_arrival: formData.get("expected_arrival"),
      available_seats: Number(seats),
      vehicle: vehicleId // 🌟 AQUI ENVIAMOS A STRING DO UUID PURA
    };

    // Apenas envia o preço se NÃO for edição (não deixamos mudar preço de carona já criada)
    if (!isEditing) {
      payload.price = Number(price);
    }

    try {
      if (isEditing && editId) {
        // Modo Edição: chama o update (PATCH)
        await RideService.update(editId, payload);
        alert("Carona atualizada com sucesso!");
      } else {
        // Modo Criação
        await RideService.create(payload);
        alert("Carona criada com sucesso!");
      }
      router.push('/runs'); 
    } catch (error: any) {
      console.error("Erro ao processar requisição:", error);
      alert(error.response?.data?.price || error.response?.data?.available_seats || "Falha ao salvar carona.");
    } finally {
      setLoading(false);
    }
  };

  // Enquanto estiver carregando os dados de edição, mostra um loading simples para não renderizar inputs vazios
  if (isEditing && !rideData) {
    return <Flex p="6" justify="center"><Text color="muted">Carregando dados da carona...</Text></Flex>;
  }

  return (
    <Flex direction='column' height='100%' bg="#f9f9f9">
      <FrameComponent
        titleElements={
          <Flex alignItems="center" gap="3">
            <button 
              type="button"
              onClick={() => step === 1 ? router.back() : setStep(1)} 
              className={css({ cursor: "pointer", bg: "transparent", color: "muted", display: "flex" })}
            >
              <ArrowBack />
            </button>
            <Text weight="bold" size="lg" color="cupom">
              {isEditing ? "Editar Carona" : "Nova Carona"}
            </Text>
          </Flex>
        }
      >
        <Flex gap="2" mb="6" mt="2">
          <div className={css({ flex: 1, h: "4px", bg: "primary", borderRadius: "full" })} />
          <div className={css({ flex: 1, h: "4px", bg: step === 2 ? "primary" : "muted", opacity: step === 2 ? 1 : 0.3, borderRadius: "full", transition: "background 0.3s" })} />
        </Flex>

        <form id="ride-form" onSubmit={handleSubmit}>

          {/* PASSO 1: LOCAL E HORÁRIO */}
          <div style={{ display: step === 1 ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>
            
            <Flex direction="column" gap="4" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" color="primary">
                <LocationOn /> <Text weight="bold" color="cupom">Ponto de Partida</Text>
              </Flex>
              
              <Flex gap="3" alignItems="flex-end">
                <div className={css({ width: "100px" })}>
                  <SelectField 
                    id="originState"
                    name="originState"
                    label="UF" 
                    defaultValue={rideData?.origin?.state || "RN"}
                    required
                    options={ESTADOS_BR.map(e => ({ value: e.uf, label: e.uf }))} 
                  />
                </div>
                <div className={css({ flex: 1 })}>
                  <FormField 
                    id="originCity" 
                    name="originCity"
                    label="Cidade" 
                    placeholder="Ex: Mossoró" 
                    defaultValue={rideData?.origin?.city || ""}
                    required
                  />
                </div>
              </Flex>
              <FormField 
                id="originAddress" 
                name="originAddress"
                label="Ponto de Encontro exato" 
                placeholder="Ex: Em frente ao Shopping" 
                defaultValue={rideData?.origin?.address || ""}
                required
              />
            </Flex>

            <Flex direction="column" gap="4" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" color="danger">
                <LocationOn /> <Text weight="bold" color="cupom">Destino Final</Text>
              </Flex>
              
              <Flex gap="3" alignItems="flex-end">
                <div className={css({ width: "100px" })}>
                  <SelectField 
                    id="destState"
                    name="destState"
                    label="UF" 
                    defaultValue={rideData?.destination?.state || "RN"}
                    required
                    options={ESTADOS_BR.map(e => ({ value: e.uf, label: e.uf }))} 
                  />
                </div>
                <div className={css({ flex: 1 })}>
                  <FormField 
                    id="destCity" 
                    name="destCity"
                    label="Cidade" 
                    placeholder="Ex: Pau dos Ferros" 
                    defaultValue={rideData?.destination?.city || ""}
                    required
                  />
                </div>
              </Flex>
              <FormField 
                id="destAddress" 
                name="destAddress"
                label="Local de Desembarque" 
                placeholder="Ex: Praça Matriz" 
                defaultValue={rideData?.destination?.address || ""}
                required
              />
            </Flex>

            <Flex direction="column" gap="4" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" color="cupom">
                <Schedule /> <Text weight="bold" color="cupom">Horários</Text>
              </Flex>
              <FormField 
                id="start_time" 
                name="start_time"
                label="Saída Prevista" 
                type="datetime-local" 
                defaultValue={rideData?.start_time ? rideData.start_time.slice(0, 16) : ""}
                required
              />
              <FormField 
                id="expected_arrival" 
                name="expected_arrival"
                label="Chegada Prevista" 
                type="datetime-local" 
                defaultValue={rideData?.expected_arrival ? rideData.expected_arrival.slice(0, 16) : ""}
                required
              />
            </Flex>

            <Button width="full" type="button" onClick={handleNextStep}>
              <Text color="white" weight="bold">Avançar para Detalhes</Text>
            </Button>
          </div>

          {/* PASSO 2: VEÍCULO E PREÇO */}
          <div style={{ display: step === 2 ? 'flex' : 'none', flexDirection: 'column', gap: '24px' }}>
            
            <Flex direction="column" gap="4" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" color="cupom">
                <DirectionsCar /> <Text weight="bold" color="cupom">Detalhes da Viagem</Text>
              </Flex>
              
              <SelectField 
                id="vehicleId"
                name="vehicleId"
                label="Qual veículo você vai usar?" 
                defaultValue={rideData?.vehicle?.toString() || ""}
                required
                options={myVehicles} 
              />

              <FormField 
                id="seats" 
                name="seats"
                label="Vagas Disponíveis" 
                type="number" 
                placeholder="Ex: 3" 
                defaultValue={rideData?.available_seats || ""}
                required
                icon={<Group className={css({ color: "muted", mr: "2" })} />} 
              />

              <FormField 
                id="price" 
                name="price"
                label="Preço por Passageiro (R$)" 
                type="number" 
                step="0.01"
                placeholder="Ex: 45.00" 
                defaultValue={rideData?.price || ""}
                required={!isEditing}
                disabled={isEditing} // 🔒 BLOQUEIO NO FRONTEND (causava o bug resolvido acima)
                icon={<Payments className={css({ color: "muted", mr: "2" })} />} 
              />
            </Flex>

            <Button 
              type="submit"
              width="full" 
              disabled={loading} 
              className={css({ bg: "primary" })}
            >
              <Flex gap="2" alignItems="center" justifyContent="center">
                {loading ? (
                  <Text color="white" weight="bold">Salvando...</Text>
                ) : (
                  <>
                    <CheckCircle color="white" /> 
                    <Text color="white" weight="bold">
                      {isEditing ? "Confirmar Edição" : "Confirmar e Criar"}
                    </Text>
                  </>
                )}
              </Flex>
            </Button>
          </div>

        </form>
      </FrameComponent>
    </Flex>
  );
}