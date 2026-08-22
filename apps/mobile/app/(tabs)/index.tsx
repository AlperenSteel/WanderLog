import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../../api/health';
import { colors, typography, spacing } from '../../theme';

export default function MapScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Dünya Haritası</Text>
      <Text style={styles.subtitle}>MapLibre — Modül 1'de eklenecek</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>API Durumu</Text>
        {isLoading && <ActivityIndicator color={colors.primary} />}
        {isError && <Text style={styles.statusError}>⚠️ API bağlantısı yok</Text>}
        {data && (
          <>
            <Text
              style={[
                styles.statusValue,
                { color: data.status === 'ok' ? colors.success : colors.warning },
              ]}
            >
              {data.status === 'ok' ? '✅ API bağlı' : '⚠️ API degraded'}
            </Text>
            <Text style={styles.statusDetail}>
              DB: {data.services.database === 'ok' ? '✓' : '✗'} · Redis:{' '}
              {data.services.redis === 'ok' ? '✓' : '✗'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[8],
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing[5],
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[2],
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  statusDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statusError: {
    fontSize: typography.fontSize.base,
    color: colors.error,
  },
});
