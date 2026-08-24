import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👤</Text>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Modül 2'de gelecek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  emoji: { fontSize: 48, marginBottom: spacing[3] },
  title: { fontSize: typography.fontSize['2xl'], color: colors.textPrimary, fontWeight: 'bold' },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing[2] },
});
