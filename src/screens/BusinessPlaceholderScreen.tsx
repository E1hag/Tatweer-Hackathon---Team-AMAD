import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import { BriefcaseIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { signOut } from '@/services/auth';

export default function BusinessPlaceholderScreen() {
  const [submitting, setSubmitting] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSubmitting(true);
    try {
      await signOut();
    } catch (errorObject) {
      Alert.alert(
        'Unable to sign out',
        errorObject instanceof Error ? errorObject.message : 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centered}>
        <View style={styles.iconCircle}>
          <BriefcaseIcon color={colors.terracotta} size={spacing.xl} />
        </View>
        <Text style={styles.title}>Business account ready</Text>
        <Text style={styles.body}>
          Your business dashboard is coming soon. You can post availability and view community demand once it is live.
        </Text>
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Dashboard placeholder</Text>
          <Text style={styles.body}>This route is ready for the business home screen when the partner work is merged.</Text>
        </AppCard>
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={handleSignOut}
          style={[styles.signOutButton, submitting && styles.disabled]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={styles.signOutText}>Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconCircle: {
    width: spacing.xxl + spacing.lg,
    height: spacing.xxl + spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    textAlign: 'center',
  },
  card: {
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  signOutButton: {
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: sizes.borderWidth,
    borderColor: colors.error,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  signOutText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  disabled: {
    opacity: sizes.disabledOpacity,
  },
});
