'use client';

import React, { useState } from 'react';
import { Flex } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action';
import { Star } from '@material-symbols-svg/react';
import Modal from '@/components/fixed/Modal';
import { RatingService } from '@/services/ride/ratingService';

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
  onSuccess 
}: RatingModalProps) {
  const [score, setScore] = useState<number>(0);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('usuario_id') || '' : '';

  const handleSubmit = async () => {
    if (score < 1 || score > 5) {
      setError("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await RatingService.create({
        reservation: reservationId,
        evaluator: currentUserId,
        evaluated: driverId,
        score: score
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao enviar avaliação:", err);
      setError("Não foi possível salvar sua avaliação. Você já avaliou esta viagem?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Como foi sua viagem com ${driverName}?`}>
      <Flex direction="column" gap="5" align="center" p="4">
        <Text color="muted" size="sm" textAlign="center">
          Sua avaliação ajuda a manter a comunidade Raijmobi segura e confiável.
        </Text>

        {/* Estrelas Interativas */}
        <Flex gap="2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = hoverScore ? star <= hoverScore : star <= score;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                className={css({
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  _hover: { transform: 'scale(1.15)' }
                })}
              >
                <Star 
                  fill={isActive ? "#FFC107" : "none"} 
                  color={isActive ? "#FFC107" : "#BDBDBD"}
                  style={{ fontSize: '40px' }}
                />
              </button>
            );
          })}
        </Flex>

        {error && <Text color="danger" size="xs" weight="medium">{error}</Text>}

        <Button 
          width="full" 
          disabled={loading || score === 0} 
          onClick={handleSubmit}
          className={css({ height: '11 !important', mt: '2' })}
        >
          <Text color="white" weight="bold">
            {loading ? "Enviando..." : "Confirmar Avaliação"}
          </Text>
        </Button>
      </Flex>
    </Modal>
  );
}