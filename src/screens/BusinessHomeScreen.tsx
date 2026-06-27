import { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import {
  ArrowRightIcon,
  BoxIcon,
  BriefcaseIcon,
  ClipboardIcon,
  HeartIcon,
  PlusIcon,
} from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessBoard } from '@/hooks/useBusinessBoard';
import type { RequestSummary } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';
import { formatUrgency } from '@/utils/businessDisplay';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function BusinessHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { profile, userId } = useAuth();
  const { error, loadBoard, loading, offers, refreshing, refresh, requests } = useBusinessBoard();

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const myOffers = useMemo(
    () => offers.filter((offer) => offer.business_id === userId),
    [offers, userId]
  );

  const activeOffers = useMemo(
    () => myOffers.filter((offer) => offer.status === 'accepting' || offer.status === 'proposed'),
    [myOffers]
  );

  const topRequests = useMemo(() => requests.slice(0, 3), [requests]);
  const joinedResidents = useMemo(
    () => myOffers.reduce((total, offer) => total + offer.joiner_count, 0),
    [myOffers]
  );

  const displayName = profile?.business_name ?? profile?.full_name ?? 'Your business';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <BriefcaseIcon color={colors.surface} size={spacing.xl} />
          </View>
          <View style={styles.heroCopy}>
            <Text selectable style={styles.eyebrow}>Business dashboard</Text>
            <Text selectable style={styles.title}>{displayName}</Text>
            <Text selectable style={styles.subtitle}>
              Track neighborhood demand, post offers, and follow joined residents.
            </Text>
          </View>
        </View>

        {loading ? <LoadingState count={2} /> : null}

        {!loading && error ? (
          <EmptyState subtitle={error} title="Business data unavailable" />
        ) : null}

        {!loading && !error ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard icon={<HeartIcon color={colors.primary} size={sizes.tabIcon} />} label="Demand signals" value={String(requests.length)} />
              <StatCard icon={<BoxIcon color={colors.primary} size={sizes.tabIcon} />} label="Active offers" value={String(activeOffers.length)} />
              <StatCard icon={<ClipboardIcon color={colors.primary} size={sizes.tabIcon} />} label="Joined residents" value={String(joinedResidents)} />
            </View>

            <View style={styles.shortcutGrid}>
              <ShortcutButton
                icon={<ClipboardIcon color={colors.primary} size={sizes.shortcutIcon} />}
                label="Demand board"
                onPress={() => navigation.navigate('BusinessMain', { screen: 'DemandBoard' })}
              />
              <ShortcutButton
                icon={<BoxIcon color={colors.accent} size={sizes.shortcutIcon} />}
                label="My offers"
                onPress={() => navigation.navigate('BusinessMain', { screen: 'MyOffers' })}
              />
              <ShortcutButton
                icon={<PlusIcon color={colors.success} size={sizes.shortcutIcon} />}
                label="Create offer"
                onPress={() => {
                  const requestId = topRequests[0]?.id;
                  if (requestId) {
                    navigation.navigate('CreateOffer', { requestId });
                  } else {
                    navigation.navigate('BusinessMain', { screen: 'DemandBoard' });
                  }
                }}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text selectable style={styles.sectionTitle}>Top demand</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('BusinessMain', { screen: 'DemandBoard' })}
                style={styles.inlineAction}
              >
                <Text style={styles.inlineActionText}>View all</Text>
                <ArrowRightIcon color={colors.primary} size={typography.sizes.sm} />
              </Pressable>
            </View>

            {topRequests.length === 0 ? (
              <EmptyState subtitle="Resident requests will appear here as soon as they are posted." title="No demand yet" />
            ) : (
              <View style={styles.requestList}>
                {topRequests.map((request) => (
                  <DemandPreview
                    key={request.id}
                    onPress={() => navigation.navigate('BusinessRequestDetails', { requestId: request.id })}
                    request={request}
                  />
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <AppCard style={styles.statCard}>
      {icon}
      <Text selectable style={styles.statValue}>{value}</Text>
      <Text selectable style={styles.statLabel}>{label}</Text>
    </AppCard>
  );
}

function ShortcutButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.shortcut}>
      <View style={styles.shortcutIcon}>{icon}</View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

function DemandPreview({ onPress, request }: { onPress: () => void; request: RequestSummary }) {
  return (
    <AppCard onPress={onPress} style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <Text selectable style={styles.previewTitle}>{request.title}</Text>
        <BusinessStatusBadge status={request.status} type="request" />
      </View>
      <View style={styles.previewMeta}>
        <Text selectable style={styles.demandText}>{request.interest_count} interested</Text>
        <Text selectable style={styles.metaText}>{request.area ?? 'Area TBD'}</Text>
        <Text selectable style={styles.metaText}>{formatUrgency(request.urgency)}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xl },
  hero: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  heroIcon: {
    width: spacing.xxl,
    height: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.heroGlass,
  },
  heroCopy: { flex: 1, gap: spacing.xs },
  eyebrow: {
    color: colors.urgencyBackground,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.surface,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: { color: colors.heroTextMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, gap: spacing.xs },
  statValue: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { color: colors.textMuted, fontSize: typography.sizes.xs, lineHeight: typography.lineHeights.sm },
  shortcutGrid: { flexDirection: 'row', gap: spacing.sm },
  shortcut: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  shortcutIcon: {
    width: spacing.xl + spacing.sm,
    height: spacing.xl + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  shortcutLabel: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  inlineActionText: { color: colors.primary, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  requestList: { gap: spacing.sm },
  previewCard: { gap: spacing.sm },
  previewHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  previewTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  previewMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  demandText: { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.xs },
});
