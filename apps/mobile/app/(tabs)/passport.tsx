import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../src/theme';

export default function PassportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🛂</Text>
      <Text style={styles.title}>Seyahat Pasaportu</Text>
      <Text style={styles.subtitle}>Modül 5'te gelecek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  emoji: { fontSize: 48, marginBottom: spacing[3] },
  title: { fontSize: typography.fontSize['2xl'], color: colors.textPrimary, fontWeight: 'bold' },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing[2] },
});
