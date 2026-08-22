import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Harita' }} />
      <Tabs.Screen name="record" options={{ title: 'Kayıt' }} />
      <Tabs.Screen name="feed" options={{ title: 'Akış' }} />
      <Tabs.Screen name="passport" options={{ title: 'Pasaport' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
