import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.ucbmackenna.himnario',
  appName: 'Himnario Mackenna',
  webDir: 'dist/himnario-mackenna/browser',
  ios: { contentInset: 'automatic' },
  android: { backgroundColor: '#f5f1ef' }
};

export default config;
