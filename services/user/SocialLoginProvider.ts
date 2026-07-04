// src/lib/socialLogin.ts
import { SocialLogin } from '@capgo/capacitor-social-login';

export async function initSocialLogin() {
  await SocialLogin.initialize({
    google: {
      // ATENÇÃO: Use o seu Client ID do tipo WEB aqui, o mesmo do Django!
      webClientId: '280025204211-ajjg1v1gudjr3hospi6116rdvlbllg2p.apps.googleusercontent.com',
    },
  });
}