import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.raijmobi.app',
  appName: 'raijmobi',
  webDir: 'out',
  server: {
    cleartext: true ,
    androidScheme: 'http' // <--- ADICIONE ESTA LINHA
  },
  plugins: {
    // Exemplo: Configurando o plugin nativo de Splash Screen (Tela de Abertura)
    SplashScreen: {
      launchShowDuration: 3000, // Tempo que a tela fica aberta (ms)
      backgroundColor: "#1D1D1D", // Cor de fundo
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    // Exemplo: Configurando o teclado para não "empurrar" sua interface no Android
    Keyboard: {
      resize: 'none',
    }
  }
  
};

export default config;
