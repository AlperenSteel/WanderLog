import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Wanderprint',
  slug: 'wanderprint',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0F1E',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.wanderprint',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Wanderprint, rotanı kaydetmek için konumuna ihtiyaç duyar.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Arka planda yürürken rotanı kaydetmek için konumuna ihtiyaç duyar.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A0F1E',
    },
    package: 'app.wanderprint',
    permissions: [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.FOREGROUND_SERVICE',
    ],
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Wanderprint, arka planda yürürken rotanı kaydetmek için konumuna ihtiyaç duyar.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  scheme: 'wanderprint',
});
