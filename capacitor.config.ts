import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shopsale.app',
  appName: 'ShopSale POS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'shopsale-api.onrender.com',
      'localhost'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;