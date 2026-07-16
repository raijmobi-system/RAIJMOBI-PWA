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
  evaluatorId?: string; 
  onSuccess: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  reservationId,
  driverId,
  driverName,
  evaluatorId: propEvaluatorId,
  onSuccess,
}: RatingModalProps) {
  const [score, setScore] = useState<number>(0);
  const [hoveredScore, setHoveredScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reseta estado ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      //eslint-disable-next-line
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

    if (!driverId || driverId.trim() === "" || driverId === "undefined") {
      setError("Erro interno: não foi possível identificar o motorista.");
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Tenta usar o evaluatorId passado pela prop (prioritário)
    let evaluatorId = propEvaluatorId;

    // 2. Se não veio via prop, tenta extrair do token (fallback para compatibilidade)
    if (!evaluatorId) {
      try {
        const { value: token } = await SecureStoragePlugin.get({ key: 'access_token' });
        if (token) {
          const decoded: any = jwtDecode(token);
          evaluatorId = decoded.user_id;
        }
      } catch (storageError) {
        console.warn("Erro ao ler token no modal de avaliação:", storageError);
      }
    }

    if (!evaluatorId) {
      setError("Sua sessão expirou. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      // ROTA CORRETA: /api/ratings/ (conforme RatingViewset no router)
      await api.post("/api/ride/ratings/", {
        reservation: reservationId,
        evaluator: evaluatorId,
        evaluated: driverId.trim(),
        score: score,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar avaliação:", err);
      // Extrai mensagem de erro amigável
      const msg =
        err.response?.data?.evaluated?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Não foi possível registrar a avaliação no momento.";
      setError(msg);
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

        {/* Estrelas com feedback visual */}
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
                  _active: { transform: "scale(0.9)" },
                })}
                aria-label={`Avaliar com ${starValue} estrelas`}
              >
                <Star
                  className={css({
                    fontSize: "42px",
                    transition: "color 0.2s ease",
                    color: isSelected ? "#FFC107" : "#D1D5DB",
                  })}
                />
              </button>
            );
          })}
        </Flex>

        <Text size="xs" color="muted">
          {score === 0
            ? "Toque em uma estrela para dar sua nota"
            : `Você selecionou ${score} estrela${score > 1 ? "s" : ""}`}
        </Text>

        {error && (
          <Box
            p="3"
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="lg"
            width="full"
          >
            <Text size="xs" color="danger" weight="medium">
              {error}
            </Text>
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
              _hover: { bg: "gray.50" },
            })}
          >
            Agora Não
          </button>

          <div className={css({ flex: 1 })}>
            <Button
              width="full"
              onClick={handleSubmit}
              disabled={loading || score === 0 || !driverId}
            >
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