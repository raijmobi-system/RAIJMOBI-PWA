"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/fixed/Modal";
import { Flex, Box } from "@/styled-system/jsx";
import { css } from "@/styled-system/css";
import { Text } from "@/components/atoms/typography";
import { Button } from "@/components/atoms/action";
import { api } from "@/services/InterceptRequisition";
import { Star } from '@material-symbols-svg/react';

import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { jwtDecode } from "jwt-decode";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  driverId: string;
  driverName: string;
  onSuccess: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  reservationId,
  driverId,
  driverName,
  onSuccess,
}: RatingModalProps) {
  const [score, setScore] = useState<number>(0);
  const [hoveredScore, setHoveredScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScore(0);
      setHoveredScore(0);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (score === 0) {
      setError("Por favor, selecione pelo menos uma estrela para avaliar!");
      return;
    }

    if (!driverId || driverId.trim() === "" || driverId === "undefined" || driverId === "null") {
      setError("Não foi possível identificar o motorista desta carona.");
      return;
    }

    setLoading(true);
    setError(null);

    let evaluatorId = "";
    
    // 🌟 1. Tenta pegar pelo Capacitor (Mobile)
    try {
      const { value: token } = await SecureStoragePlugin.get({ key: 'access_token' });
      if (token) {
        const decoded: any = jwtDecode(token);
        evaluatorId = decoded.user_id;
      }
    } catch (storageError) {
      console.warn("SecureStorage falhou, tentando fallback Web...");
    }

    // 🌟 2. PLANO B (WEB): Busca direto do localStorage se o Capacitor falhar
    if (!evaluatorId && typeof window !== 'undefined') {
      const rawId = localStorage.getItem('usuario_id') || '';
      evaluatorId = rawId.replace(/['"]/g, '').trim();
    }

    if (!evaluatorId) {
      setError("Sua sessão expirou ou não foi possível identificar o usuário. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      // 🌟 Rota correta enviando os dados precisos
      await api.post("/api/ride/ratings/", {
        reservation: reservationId,
        evaluator: evaluatorId,
        evaluated: driverId.trim(),
        score: score,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro completo da API de notas:", err.response?.data);
      
      // 🌟 Exibe o erro exato retornado pelo Django DRF na tela
      if (err.response?.data) {
        const data = err.response.data;
        if (data.non_field_errors) {
          setError(data.non_field_errors[0]); // Ex: "The fields reservation, evaluator must make a unique set."
        } else if (data.evaluated) {
          setError("Motorista inválido: " + data.evaluated[0]);
        } else if (data.reservation) {
          setError("Reserva inválida: " + data.reservation[0]);
        } else {
          setError(JSON.stringify(data));
        }
      } else {
        setError("Não foi possível registrar a avaliação no momento.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avaliar Motorista">
      <Flex direction="column" align="center" gap="4" py="3">
        <Text size="md" color="muted" weight="medium" className={css({ textAlign: "center" })}>
          Como foi a sua carona com <strong>{driverName}</strong>?
        </Text>

        <Flex gap="1" justify="center" my="2">
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isSelected = starValue <= (hoveredScore || score);
            
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => setScore(starValue)}
                onMouseEnter={() => setHoveredScore(starValue)}
                onMouseLeave={() => setHoveredScore(0)}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  transition: "transform 0.15s ease",
                  _hover: { transform: "scale(1.15)" },
                  _active: { transform: "scale(0.9)" }
                })}
                aria-label={`Avaliar com ${starValue} estrelas`}
              >
                <Star 
                  className={css({ 
                    fontSize: "42px", 
                    transition: "color 0.2s ease",
                    color: isSelected ? "#FFC107" : "#CBD5E1" 
                  })} 
                />
              </button>
            );
          })}
        </Flex>

        <Text size="xs" color="muted">
          {score === 0 ? "Toque em uma estrela para dar sua nota" : `Você selecionou ${score} estrela${score > 1 ? "s" : ""}`}
        </Text>

        {error && (
          <Box p="3" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" width="full">
            <Text size="xs" color="danger" weight="medium">{error}</Text>
          </Box>
        )}

        <Flex gap="3" width="full" mt="3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={css({
              flex: 1,
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              borderRadius: "xl",
              bg: "white",
              color: "gray.700",
              fontWeight: "bold",
              cursor: "pointer",
            })}
          >
            Agora Não
          </button>
          
          <div className={css({ flex: 1 })}>
            <Button width="full" onClick={handleSubmit} disabled={loading || score === 0 || !driverId}>
              <Text color="white" weight="bold">
                {loading ? "Enviando..." : "Confirmar Nota"}
              </Text>
            </Button>
          </div>
        </Flex>
      </Flex>
    </Modal>
  );
}