"use client";

import React, { useState } from 'react';
import { Box, Flex, Grid } from '@/styled-system/jsx';
import { css } from '@/styled-system/css';
import { Text } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/action';
import { FormField } from '@/components/molecules/FormFIeld';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '@/services/InterceptRequisition';

// Inicialize o Stripe com sua Chave Pública de Testes (Sandbox)
const stripePromise = loadStripe('pk_test_SUA_CHAVE_PUBLICA_DO_STRIPE');

interface PaymentStepProps {
  reservationId: string;
  totalPrice: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const PaymentStep = ({ reservationId, totalPrice, onPaymentSuccess, onCancel }: PaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o retorno do PIX
  const [pixCode, setPixCode] = useState<string | null>(null);

  // Estados para o formulário customizado de cartão
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. CHAMA O SEU BACKEND DJANGO PARA CRIAR A INTENÇÃO DE PAGAMENTO
      const response = await api.post('api/ride/rides/create-payment-intent/', {
        reservation_id: reservationId,
        payment_method: paymentMethod,
      });

      const { clientSecret } = response.data;
      const stripe = await stripePromise;

      if (!stripe) throw new Error("Não foi possível carregar o Stripe.");

      // 2. SE FOR PIX: O Stripe gera os dados na hora por trás dos panos
      if (paymentMethod === 'pix') {
        // Confirma o pagamento PIX no Stripe headless
        const { paymentIntent, error: stripeError } = await stripe.confirmPixPayment(clientSecret, {
          payment_method: {
            billing_details: {
              name: 'Cliente Kiwidi Teste',
              email: 'teste@kiwidi.com',
            },
          },
        });

        if (stripeError) {
          setError(stripeError.message || "Erro ao gerar PIX.");
          return;
        }

        // Extrai o código Copia e Cola gerado pelo Stripe Sandbox
        const qrCodeData = paymentIntent?.next_action?.pix_display_qr_code?.data;
        if (qrCodeData) {
          setPixCode(qrCodeData);
        } else {
          // No ambiente de testes/sandbox, se o pagamento simular aprovação imediata:
          onPaymentSuccess();
        }
      } 
      
      // 3. SE FOR CARTÃO: Processa usando os seus inputs customizados
      else if (paymentMethod === 'card') {
        // Nota: Para produção, o Stripe exige o uso do Stripe Elements por regras de conformidade PCI.
        // No modo Sandbox para testes da sua interface, confirmamos passando os parâmetros do formulário:
        const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              // Simulador headless usando o que foi digitado na sua UI
              token: 'tok_visa', // Token universal de teste do Sandbox do Stripe
            },
            billing_details: { name: cardName },
          },
        });

        if (stripeError) {
          setError(stripeError.message || "Falha ao processar cartão.");
        } else if (paymentIntent?.status === 'succeeded') {
          onPaymentSuccess();
        }
      }

    } catch (err: any) {
      console.error("Erro no fluxo de pagamento:", err);
      setError(err.response?.data?.error || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="5">
      <Box textAlign="center" mb="2">
        <Text size="lg" weight="bold">Escolha a Forma de Pagamento</Text>
        <Text size="sm" color="muted">Total a pagar: R$ {totalPrice.toFixed(2)}</Text>
      </Box>

      {/* SELETOR INTERFACE PRÓPRIA (RADIO CARDS) */}
      {!pixCode && (
        <Grid columns={2} gap="4">
          <Box
            onClick={() => setPaymentMethod('card')}
            cursor="pointer"
            padding="4"
            borderRadius="xl"
            borderWidth="2px"
            borderColor={paymentMethod === 'card' ? '#547812' : 'gray.200'}
            bg={paymentMethod === 'card' ? 'green.50' : 'white'}
            transition="all 0.2s"
            textAlign="center"
          >
            <Text size="md" weight="bold" color={paymentMethod === 'card' ? 'special' : 'cupom'}>💳 Cartão</Text>
          </Box>

          <Box
            onClick={() => setPaymentMethod('pix')}
            cursor="pointer"
            padding="4"
            borderRadius="xl"
            borderWidth="2px"
            borderColor={paymentMethod === 'pix' ? '#547812' : 'gray.200'}
            bg={paymentMethod === 'pix' ? 'green.50' : 'white'}
            transition="all 0.2s"
            textAlign="center"
          >
            <Text size="md" weight="bold" color={paymentMethod === 'pix' ? 'special' : 'cupom'}>🔸 PIX</Text>
          </Box>
        </Grid>
      )}

      {error && (
        <Box bg="red.50" p="3" borderRadius="md">
          <Text size="sm" color="danger">{error}</Text>
        </Box>
      )}

      {/* RENDERIZAÇÃO DA SUA INTERFACE DE CARTÃO */}
      {!pixCode && paymentMethod === 'card' && (
        <Flex direction="column" gap="3" mt="2">
          <FormField 
            id="card_name" 
            label="Nome no Cartão" 
            placeholder="Ex: PABLO M CORREIA"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
          <FormField 
            id="card_number" 
            label="Número do Cartão" 
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <Grid columns={2} gap="3">
            <FormField 
              id="card_expiry" 
              label="Validade" 
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
            />
            <FormField 
              id="card_cvc" 
              label="CVC" 
              placeholder="123"
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value)}
            />
          </Grid>
        </Flex>
      )}

      {/* RENDERIZAÇÃO DA SUA INTERFACE PIX (QUANDO GERADO) */}
      {pixCode && (
        <Flex direction="column" alignItems="center" gap="4" bg="gray.50" p="4" borderRadius="xl">
          <Text weight="bold" color="special">PIX Gerado com Sucesso!</Text>
          
          {/* Caixa de Texto do Copia e Cola */}
          <Box 
            width="100%" 
            bg="white" 
            p="3" 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="gray.300"
            maxHeight="60px"
            overflowX="auto"
          >
            <code className={css({ fontSize: 'xs', whiteSpace: 'nowrap' })}>{pixCode}</code>
          </Box>

          <Button 
            size="sm" 
            bg="#547812" 
            color="white"
            onClick={() => {
              navigator.clipboard.writeText(pixCode);
              alert("Código PIX copiado!");
            }}
          >
            Copiar Código PIX
          </Button>

          <Text size="xs" color="muted" textAlign="center">
            Como estamos em modo Sandbox, você pode clicar no botão abaixo para simular que pagou no seu banco.
          </Text>
          
          <Button width="full" bg="#547812" onClick={onPaymentSuccess}>
            <Text color="white">Simular Pagamento Concluído</Text>
          </Button>
        </Flex>
      )}

      {/* BOTÕES DE AÇÃO DO FLUXO PADRÃO */}
      {!pixCode && (
        <Flex gap="3" mt="4">
          <Button flex="1" bg="gray.100" color="gray.800" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button flex="1" bg="#547812" onClick={handleProcessPayment} disabled={loading}>
            <Text color="white" weight="bold">{loading ? 'Processando...' : 'Pagar Agora'}</Text>
          </Button>
        </Flex>
      )}
    </Flex>
  );
};