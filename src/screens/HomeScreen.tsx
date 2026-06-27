import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import RequestCard from '@/components/common/RequestCard';
import {
  ArrowRightIcon,
  BoxIcon,
  BriefcaseIcon,
  ClipboardIcon,
  PersonIcon,
  PinIcon,
  PlusIcon,
} from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRequests } from '@/hooks/useRequests';
import type { RequestSummary } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function formatRole(role?: string) {
  return role ? role.replace('_', ' ') : '';
}

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { userId } = useAuth();
  const { profile } = useProfile(userId);
  const { recentRequests, loading, error, refresh } = useRequests(userId);

  const recent = useMemo(() => recentRequests.slice(0, 3), [recentRequests]);
  const firstName = profile?.full_name.split(' ')[0] ?? 'Guest';

  const goToTab = useCallback(
    (screen: 'Requests' | 'MyOrders' | 'Profile') => {
      navigation.navigate('Main', { screen });
    },
    [navigation]
  );

  const Header = useCallback(
    () => (
      <View>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
            <Pressable
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              onPress={() => goToTab('Profile')}
              style={styles.profileButton}
            >
              <PersonIcon color={colors.surface} size={sizes.tabIcon} />
            </Pressable>
          </View>

          <AppCard style={styles.identityCard}>
            <View style={styles.identityText}>
              <Text style={styles.identityLabel}>Signed in as</Text>
              <Text style={styles.identityName}>{profile?.full_name ?? 'Not signed in'}</Text>
              <View style={styles.identityMeta}>
                <PinIcon color={colors.heroTextMuted} size={typography.sizes.sm} />
                <Text style={styles.identityMetaText}>
                  {profile ? `${profile.area ?? 'Area not set'} - ${formatRole(profile.role)}` : 'Tap to sign in'}
                </Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={() => goToTab('Profile')}>
              <Text style={styles.switchText}>Switch</Text>
            </Pressable>
          </AppCard>
        </View>

        <Text style={styles.tagline}>Real local requests. Real first customers.</Text>

        <View style={styles.shortcutGrid}>
          <ShortcutCard
            color={colors.terracotta}
            icon={<ClipboardIcon color={colors.terracotta} size={sizes.shortcutIcon} />}
            label="Request Board"
            onPress={() => goToTab('Requests')}
          />
          <ShortcutCard
            color={colors.accent}
            icon={<PlusIcon color={colors.accent} size={sizes.shortcutIcon} />}
            label="New Request"
            onPress={() => navigation.navigate('CreateRequest')}
          />
          {/* Business board is partner scope for now; route to the resident board placeholder. */}
          <ShortcutCard
            color={colors.primary}
            icon={<BriefcaseIcon color={colors.primary} size={sizes.shortcutIcon} />}
            label="Business Board"
            onPress={() => goToTab('Requests')}
          />
          <ShortcutCard
            color={colors.offers}
            icon={<BoxIcon color={colors.offers} size={sizes.shortcutIcon} />}
            label="My Offers"
            onPress={() => goToTab('MyOrders')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent requests</Text>
          <Pressable accessibilityRole="button" onPress={() => goToTab('Requests')} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <ArrowRightIcon color={colors.terracotta} size={typography.sizes.md} />
          </Pressable>
        </View>
      </View>
    ),
    [firstName, goToTab, navigation, profile]
  );

  const Empty = useCallback(() => {
    if (loading) {
      return <LoadingState count={3} />;
    }
    if (error) {
      return (
        <View style={styles.inlineError}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return <EmptyState subtitle="Local needs will appear here as neighbors post them." title="No requests yet" />;
  }, [error, loading, refresh]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <FlatList
        ListEmptyComponent={Empty}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.content}
        data={recent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: RequestSummary }) => (
          <View style={styles.itemWrap}>
            <RequestCard
              joined={false}
              onMeToo={() => undefined}
              onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
              request={item}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function ShortcutCard({
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <AppCard onPress={onPress} style={styles.shortcutCard}>
      {icon}
      <Text style={styles.shortcutLabel}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.terracotta,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: colors.heroTextMuted, fontSize: typography.sizes.md },
  name: {
    color: colors.surface,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  profileButton: {
    width: sizes.heroProfileButton,
    height: sizes.heroProfileButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.heroGlass,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.heroGlass,
    borderColor: colors.heroGlass,
  },
  identityText: { flex: 1, gap: spacing.xs },
  identityLabel: { color: colors.heroTextMuted, fontSize: typography.sizes.xs },
  identityName: { color: colors.surface, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  identityMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  identityMetaText: { color: colors.heroTextMuted, fontSize: typography.sizes.sm },
  switchText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  tagline: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    color: colors.textMuted,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontStyle: 'italic',
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
  },
  shortcutCard: { width: '47%', gap: spacing.md },
  shortcutLabel: { color: colors.text, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  seeAllText: { color: colors.terracotta, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  itemWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  inlineError: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  errorText: { color: colors.error, fontSize: typography.sizes.md, textAlign: 'center' },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
});
