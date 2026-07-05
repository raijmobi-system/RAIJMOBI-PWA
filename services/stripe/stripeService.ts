import { api } from '@/services/InterceptRequisition';
import { Stripe, PaymentSheetEventsEnum } from '@capacitor-community/stripe';

interface PaymentSheetResponse {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey?: string;
}

export const StripePaymentServiceFront = {
  // 1. Solicita ao Django os parâmetros seguros de pagamento
  createPaymentSheetParams: (reservationId: number | string) => 
    api.post<PaymentSheetResponse>('/api/ride/payment/create-sheet/', { 
      reservation_id: reservationId 
    }),

  // 2. Fluxo completo para processar o pagamento nativo no Capacitor
  executarPagamento: async (reservationId: number | string): Promise<boolean> => {
    try {
      const { data } = await StripePaymentServiceFront.createPaymentSheetParams(reservationId);

      // Busca a chave pública vinda do backend OU do seu arquivo .env.local
      const chavePublica = data.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!chavePublica) {
        throw new Error('Chave pública do Stripe não configurada no .env.local nem retornada pela API.');
      }

      // Inicializa o plugin nativo
      await Stripe.initialize({
        publishableKey: chavePublica,
      });

      // Prepara o modal com os dados do cliente e intenção de pagamento
      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: data.paymentIntent,
        customerId: data.customer,
        customerEphemeralKeySecret: data.ephemeralKey,
        merchantDisplayName: 'Carona Solidária',
      });

      // Abre a interface nativa
      const result = await Stripe.presentPaymentSheet();

      // Verificação compatível com o TypeScript e com o retorno nativo do iOS/Android
      if (
        result.paymentResult === PaymentSheetEventsEnum.Completed ||
        (result.paymentResult as unknown as string) === 'completed'
      ) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro no fluxo de pagamento:', error);
      throw error;
    }
  }
};