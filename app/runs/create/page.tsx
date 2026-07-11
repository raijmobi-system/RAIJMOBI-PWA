'use client';

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Grid } from '@/styled-system/jsx';
import { css } from "@/styled-system/css"; 

import { Button } from '@/components/atoms/action/Button'; 
import { FrameComponent } from "@/components/organisms";
import { Text } from '@/components/atoms/typography/Text';
import { FormField, SelectField } from '@/components/molecules'; 
import { CityAutocomplete, CityOption } from '@/components/molecules/CityAutocomplete';

import { RideService } from '@/services/ride/rideService';
import { VehicleService } from '@/services/ride/vehicleService';

import { 
  ArrowBack, CheckCircle, DirectionsCar, LocationOn, Schedule, Payments, Group, Add, Remove, Warning
} from '@material-symbols-svg/react';

const ESTADOS_BR = [
  { uf: 'AC' }, { uf: 'AL' }, { uf: 'AP' }, { uf: 'AM' }, { uf: 'BA' }, { uf: 'CE' },
  { uf: 'DF' }, { uf: 'ES' }, { uf: 'GO' }, { uf: 'MA' }, { uf: 'MT' }, { uf: 'MS' },
  { uf: 'MG' }, { uf: 'PA' }, { uf: 'PB' }, { uf: 'PR' }, { uf: 'PE' }, { uf: 'PI' },
  { uf: 'RJ' }, { uf: 'RN' }, { uf: 'RS' }, { uf: 'RO' }, { uf: 'RR' }, { uf: 'SC' },
  { uf: 'SP' }, { uf: 'SE' }, { uf: 'TO' }
];

function CreateRideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [myVehicles, setMyVehicles] = useState<{value: string, label: string}[]>([]); 

  // Estados de rota
  const [originCity, setOriginCity] = useState('');
  const [originState, setOriginState] = useState('RN');
  const [originAddress, setOriginAddress] = useState('');
  
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('RN');
  const [destAddress, setDestAddress] = useState('');

  // Data e Hora Separadas
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

  // Detalhes numéricos
  const [vehicleId, setVehicleId] = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(40);

  useEffect(() => {
    const initPage = async () => {
      try {
        const resVehicles = await VehicleService.getAll();
        const dataVehicles = resVehicles.data?.results || resVehicles.data || [];
        const options = dataVehicles.map((v: any) => ({
          value: v.id,
          label: `${v.model} (${v.plate})`
        }));
        setMyVehicles([{ value: '', label: 'Selecione o veículo...' }, ...options]);

        if (isEditing && editId) {
          const resRide = await RideService.getById(editId);
          const ride = resRide.data;
          
          // 🌟 CORREÇÃO: Forçamos o cast para 'any' para evitar o conflito com a interface global Location do navegador
          const originData = ride?.origin as any;
          const destData = ride?.destination as any;

          setOriginCity(originData?.city || '');
          setOriginState(originData?.state || 'RN');
          setOriginAddress(originData?.address || '');
          
          setDestCity(destData?.city || '');
          setDestState(destData?.state || 'RN');
          setDestAddress(destData?.address || '');
          
          setSeats(ride?.available_seats || 3);
          setPrice(Number(ride?.price) || 0);
          setVehicleId(ride?.vehicle?.toString() || '');

          if (ride?.start_time && ride.start_time.includes('T')) {
            const [datePart, timePart] = ride.start_time.split('T');
            setStartDate(datePart);
            setStartTime(timePart.slice(0, 5));
          }
          if (ride?.expected_arrival && ride.expected_arrival.includes('T')) {
            const [datePart, timePart] = ride.expected_arrival.split('T');
            setArrivalDate(datePart);
            setArrivalTime(timePart.slice(0, 5));
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar página:", error);
      }
    };
    initPage();
  }, [isEditing, editId]);

  const validarPasso = () => {
    setUiError(null);
    if (step === 1 && (!originCity || !originAddress)) {
      setUiError("Por favor, preencha todos os campos do local de partida.");
      return false;
    }
    if (step === 2 && (!destCity || !destAddress)) {
      setUiError("Por favor, preencha todos os campos do destino final.");
      return false;
    }
    if (step === 3 && (!startDate || !startTime || !arrivalDate || !arrivalTime)) {
      setUiError("Preencha as datas e horários de saída e chegada previstos.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validarPasso()) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    setUiError(null);
    setStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = async () => {
    if (!validarPasso()) return;
    if (!vehicleId) {
      setUiError("Selecione qual veículo você usará nesta viagem.");
      return;
    }

    setLoading(true);
    const start_time = `${startDate}T${startTime}:00`;
    const expected_arrival = `${arrivalDate}T${arrivalTime}:00`;

    const payload = {
      origin: { state: originState, city: originCity, address: originAddress },
      destination: { state: destState, city: destCity, address: destAddress },
      start_time,
      expected_arrival,
      available_seats: seats,
      vehicle: vehicleId,
      ...(!isEditing && { price: Number(price) })
    };

    try {
      if (isEditing && editId) {
        await RideService.update(editId, payload);
      } else {
        await RideService.create(payload);
      }
      router.push('/runs'); 
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setUiError("Falha na comunicação com o servidor. Verifique os dados inseridos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction='column' height='100%' bg="#f9f9f9">
      <FrameComponent
        titleElements={
          <Flex alignItems="center" gap="3">
            <button type="button" onClick={() => router.back()} className={css({ cursor: "pointer", bg: "transparent", color: "gray.500", display: "flex" })}>
              <ArrowBack />
            </button>
            <Text weight="bold" size="lg" color="cupom">{isEditing ? "Editar Carona" : "Nova Carona"}</Text>
          </Flex>
        }
      >
        {/* Indicadores de Etapa */}
        <Flex gap="2" mb="6" mt="2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={css({ flex: 1, h: "4px", bg: step >= i ? "#547812" : "gray.200", opacity: step >= i ? 1 : 0.3, borderRadius: "full", transition: "all 0.3s" })} />
          ))}
        </Flex>

        {uiError && (
          <Flex gap="2" align="center" p="3" mb="4" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl">
            <Warning className={css({ color: "red.500" })} />
            <Text size="sm" color="danger" weight="medium">{uiError}</Text>
          </Flex>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          
          {/* PASSO 1: ORIGEM */}
          {step === 1 && (
            <Flex direction="column" gap="4" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" className={css({ color: '#547812' })}>
                <LocationOn /> <Text weight="bold" color="cupom">Ponto de Partida</Text>
              </Flex>
              <Grid columns={4} gap="3">
                <div className={css({ gridColumn: "span 1" })}>
                  <SelectField id="originState" name="originState" label="UF" value={originState} onChange={(e) => setOriginState(e.target.value)} required options={ESTADOS_BR.map(e => ({ value: e.uf, label: e.uf }))} />
                </div>
                <div className={css({ gridColumn: "span 3" })}>
                  <CityAutocomplete id="originCity" label="Cidade" placeholder="Ex: Mossoró" value={originCity} onChange={(val) => { setOriginCity(val); setUiError(null); }} onSelectCity={(city: CityOption) => { setOriginCity(city.nome); setOriginState(city.estado); }} />
                </div>
              </Grid>
              <FormField id="originAddress" name="originAddress" label="Ponto de Encontro exato" placeholder="Ex: Em frente ao IFRN" value={originAddress} onChange={(e) => { setOriginAddress(e.target.value); setUiError(null); }} required />
            </Flex>
          )}

          {/* PASSO 2: DESTINO */}
          {step === 2 && (
            <Flex direction="column" gap="4" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" className={css({ color: 'red.500' })}>
                <LocationOn /> <Text weight="bold" color="cupom">Destino Final</Text>
              </Flex>
              <Grid columns={4} gap="3">
                <div className={css({ gridColumn: "span 1" })}>
                  <SelectField id="destState" name="destState" label="UF" value={destState} onChange={(e) => setDestState(e.target.value)} required options={ESTADOS_BR.map(e => ({ value: e.uf, label: e.uf }))} />
                </div>
                <div className={css({ gridColumn: "span 3" })}>
                  <CityAutocomplete id="destCity" label="Cidade" placeholder="Ex: Natal" value={destCity} onChange={(val) => { setDestCity(val); setUiError(null); }} onSelectCity={(city: CityOption) => { setDestCity(city.nome); setDestState(city.estado); }} />
                </div>
              </Grid>
              <FormField id="destAddress" name="destAddress" label="Local de Desembarque" placeholder="Ex: Rodoviária Nova" value={destAddress} onChange={(e) => { setDestAddress(e.target.value); setUiError(null); }} required />
            </Flex>
          )}

          {/* PASSO 3: HORÁRIOS */}
          {step === 3 && (
            <Flex direction="column" gap="5" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" className={css({ color: '#1b1c1c' })}>
                <Schedule /> <Text weight="bold" color="cupom">Horários da Viagem</Text>
              </Flex>
              
              <Flex direction="column" gap="2">
                <Text size="sm" weight="bold" color="muted">Saída Prevista</Text>
                <Grid columns={2} gap="3">
                  <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setUiError(null); }} className={css({ px: '3', py: '2', border: '1px solid', borderColor: 'gray.300', borderRadius: 'lg', fontSize: 'sm', color: 'gray.800' })} />
                  <input type="time" value={startTime} onChange={(e) => { setStartTime(e.target.value); setUiError(null); }} className={css({ px: '3', py: '2', border: '1px solid', borderColor: 'gray.300', borderRadius: 'lg', fontSize: 'sm', color: 'gray.800' })} />
                </Grid>
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="sm" weight="bold" color="muted">Chegada Estimada</Text>
                <Grid columns={2} gap="3">
                  <input type="date" value={arrivalDate} onChange={(e) => { setArrivalDate(e.target.value); setUiError(null); }} className={css({ px: '3', py: '2', border: '1px solid', borderColor: 'gray.300', borderRadius: 'lg', fontSize: 'sm', color: 'gray.800' })} />
                  <input type="time" value={arrivalTime} onChange={(e) => { setArrivalTime(e.target.value); setUiError(null); }} className={css({ px: '3', py: '2', border: '1px solid', borderColor: 'gray.300', borderRadius: 'lg', fontSize: 'sm', color: 'gray.800' })} />
                </Grid>
              </Flex>
            </Flex>
          )}

          {/* PASSO 4: DETALHES + CONTADORES */}
          {step === 4 && (
            <Flex direction="column" gap="5" p="4" bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200">
              <Flex gap="2" alignItems="center" className={css({ color: '#1b1c1c' })}>
                <DirectionsCar /> <Text weight="bold" color="cupom">Detalhes da Viagem</Text>
              </Flex>
              
              <SelectField id="vehicleId" name="vehicleId" label="Qual veículo você vai usar?" value={vehicleId} onChange={(e) => { setVehicleId(e.target.value); setUiError(null); }} required options={myVehicles} />
              
              {/* Vagas */}
              <Flex justify="between" align="center" p="2" borderBottom="1px solid" borderColor="gray.100">
                <Flex gap="2" align="center">
                  <Group className={css({ color: "gray.400" })} />
                  <Text size="sm" weight="medium" color="muted">Vagas Disponíveis</Text>
                </Flex>
                <Flex align="center" gap="4">
                  <button type="button" onClick={() => setSeats(p => Math.max(1, p - 1))} className={css({ w: "32px", h: "32px", borderRadius: "full", border: "1px solid", borderColor: "gray.300", display: "flex", justifyContent: "center", alignItems: "center", bg: "gray.50", cursor: "pointer" })}><Remove /></button>
                  <Text weight="bold" color="primary" className={css({ w: "20px", textAlign: "center" })}>{seats}</Text>
                  <button type="button" onClick={() => setSeats(p => Math.min(8, p + 1))} className={css({ w: "32px", h: "32px", borderRadius: "full", border: "1px solid", borderColor: "gray.300", display: "flex", justifyContent: "center", alignItems: "center", bg: "gray.50", cursor: "pointer" })}><Add /></button>
                </Flex>
              </Flex>

              {/* Preço */}
              <Flex justify="between" align="center" p="2">
                <Flex gap="2" align="center">
                  <Payments className={css({ color: "gray.400" })} />
                  <Flex direction="column">
                    <Text size="sm" weight="medium" color="muted">Preço por Passageiro</Text>
                    {isEditing && <Text size="xs" color="muted">Não editável</Text>}
                  </Flex>
                </Flex>
                <Flex align="center" gap="4">
                  <button type="button" disabled={isEditing} onClick={() => setPrice(p => Math.max(0, p - 5))} className={css({ w: "32px", h: "32px", borderRadius: "full", border: "1px solid", borderColor: "gray.300", display: "flex", justifyContent: "center", alignItems: "center", bg: "gray.50", cursor: "pointer", _disabled: { opacity: 0.4 } })}><Remove /></button>
                  <Text weight="bold" color="primary" className={css({ minWidth: "60px", textAlign: "center" })}>R$ {price.toFixed(2)}</Text>
                  <button type="button" disabled={isEditing} onClick={() => setPrice(p => p + 5)} className={css({ w: "32px", h: "32px", borderRadius: "full", border: "1px solid", borderColor: "gray.300", display: "flex", justifyContent: "center", alignItems: "center", bg: "gray.50", cursor: "pointer", _disabled: { opacity: 0.4 } })}><Add /></button>
                </Flex>
              </Flex>
            </Flex>
          )}

          {/* NAVEGAÇÃO DO RODAPÉ */}
          <Flex gap="3" mt="6" width="full">
            {step > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                width="full" 
                onClick={handleBack}
                className={css({ 
                  borderColor: '#547812 !important', 
                  color: '#547812 !important',
                  height: '11 !important'
                })}
              >
                Anterior
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                type="button" 
                variant="solid" 
                width="full" 
                onClick={handleNext}
                className={css({ height: '11 !important' })}
              >
                Avançar
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="solid" 
                width="full" 
                disabled={loading} 
                onClick={handleSubmit}
                className={css({ height: '11 !important' })}
              >
                <Flex gap="2" alignItems="center" justifyContent="center">
                  {loading ? (
                    <Text color="white" weight="bold">Processando...</Text>
                  ) : (
                    <>
                      <CheckCircle color="white" /> 
                      <Text color="white" weight="bold">
                        {isEditing ? "Confirmar Edição" : "Criar Carona"}
                      </Text>
                    </>
                  )}
                </Flex>
              </Button>
            )}
          </Flex>

        </form>
      </FrameComponent>
    </Flex>
  );
}

export default function CreateRidePage() {
  return (
    <Suspense fallback={<Flex p="6" justify="center"><Text color="muted">Carregando formulário...</Text></Flex>}>
      <CreateRideContent />
    </Suspense>
  );
}