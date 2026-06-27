import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ScreenHeader from '@/components/common/ScreenHeader';
import { PersonIcon, PinIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/auth';

function formatRole(role: string) {
  return role.replace('_', ' ');
}

export default function ProfileScreen() {
  const { userId, profile, loading, refreshProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (errorObject) {
      Alert.alert(
        'Unable to sign out',
        errorObject instanceof Error ? errorObject.message : 'Please try again.'
      );
    } finally {
      setSigningOut(false);
    }
  }, []);

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Profile" />
        <View style={styles.centered}>
          <EmptyState subtitle="Sign in to manage your account." title="Not signed in" />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Profile" />
        <View style={styles.inset}>
          <LoadingState count={2} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    profile?.role === 'business' && profile.business_name ? profile.business_name : profile?.full_name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Profile" />
      <View style={styles.inset}>
        {profile ? (
          <AppCard style={styles.identityCard}>
            <PersonIcon color={colors.terracotta} size={spacing.xl} />
            <View style={styles.identityText}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.metaText}>{formatRole(profile.role)}</Text>
              {profile.area ? (
                <View style={styles.metaRow}>
                  <PinIcon color={colors.textMuted} size={typography.sizes.sm} />
                  <Text style={styles.metaText}>{profile.area}</Text>
                </View>
              ) : null}
              {profile.phone ? <Text style={styles.metaText}>{profile.phone}</Text> : null}
            </View>
          </AppCard>
        ) : (
          <View style={styles.centeredCard}>
            <EmptyState subtitle="We could not load your profile." title="Profile unavailable" />
            <Pressable accessibilityRole="button" onPress={refreshProfile} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        <AppCard style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Account settings coming soon.</Text>
          <Text style={styles.metaText}>Profile editing and account controls will live here.</Text>
        </AppCard>

        <Pressable
          accessibilityRole="button"
          disabled={signingOut}
          onPress={handleSignOut}
          style={[styles.signOutButton, signingOut && styles.disabled]}
        >
          {signingOut ? (
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
  inset: { gap: spacing.md, paddingHorizontal: spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centeredCard: { gap: spacing.sm },
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  identityText: { flex: 1, gap: spacing.xs },
  profileName: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  placeholderCard: { gap: spacing.xs },
  placeholderTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  retryButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  signOutButton: {
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
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
