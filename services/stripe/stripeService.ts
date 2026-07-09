// src/services/stripe/stripeService.ts
import { Stripe as CapacitorStripe } from '@capacitor-community/stripe';
import { api } from '@/services/InterceptRequisition';
import { Capacitor } from '@capacitor/core'; 

export const StripePaymentServiceFront = {
  executarPagamento: async (reservationId: string): Promise<boolean> => {
    try {
      const isNative = Capacitor.isNativePlatform(); 

      // 1. Faz a chamada passando o parâmetro 'platform' que seu backend espera
      const { data } = await api.post('api/ride/payment/create-sheet/', { 
        reservation_id: reservationId,
        platform: isNative ? 'mobile' : 'web' 
      });

      // === 🌟 FLUXO EXCLUSIVO PARA WEB (Navegador) ===
      if (!isNative) {
        if (data.checkout_url) {
          // Redireciona o navegador para a página segura de pagamento do Stripe
          window.location.href = data.checkout_url;
          return false; 
        }
        throw new Error("URL de checkout não retornada pelo servidor.");
      }

      // === 📱 FLUXO PARA MOBILE NATIVO (Celular) ===
      await CapacitorStripe.createPaymentSheet({
        paymentIntentClientSecret: data.paymentIntent,
        customerId: data.customer,
        customerEphemeralKeySecret: data.ephemeralKey,
        merchantDisplayName: 'Carona Solidária'
      });

      // Captura o resultado retornado pelo SDK nativo
      const { paymentResult } = await CapacitorStripe.presentPaymentSheet();

      // 🌟 SOLUÇÃO: Usamos 'as any' para burlar a limitação de tipo da biblioteca.
      // Isso elimina o erro "only refers to a type" e o "no overlap" de uma vez só!
      if ((paymentResult as any) === 'completed') {
        await api.patch(`api/ride/reservations/${reservationId}/`, { status: 'confirmada' });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Falha no processo universal do Stripe:", error);
      throw error;
    }
  }
};