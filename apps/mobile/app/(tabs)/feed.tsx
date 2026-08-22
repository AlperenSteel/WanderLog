import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌍</Text>
      <Text style={styles.title}>Sosyal Akış</Text>
      <Text style={styles.subtitle}>Modül 6'da gelecek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  emoji: { fontSize: 48, marginBottom: spacing[3] },
  title: { fontSize: typography.fontSize['2xl'], color: colors.textPrimary, fontWeight: 'bold' },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing[2] },
});
