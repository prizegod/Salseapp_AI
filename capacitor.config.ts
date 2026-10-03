import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shopsale.app',
  appName: 'ShopSale POS',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['10.247.208.35:5000']
  },
  // 🎯 இந்த பகுதியைச் சேருங்கள் (CORS கட்டுப்பாடுகளை ஆண்ட்ராய்டு OS அளவில் உடைக்கும்)
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
