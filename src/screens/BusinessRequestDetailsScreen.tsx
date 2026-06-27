import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppCard from '@/components/common/AppCard';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import UrgencyBadge from '@/components/common/UrgencyBadge';
import { BoxIcon, CalendarIcon, HeartIcon, PinIcon } from '@/components/icons';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useBusinessBoard } from '@/hooks/useBusinessBoard';
import type { RootStackParamList } from '@/types/navigation';
import { formatSchedule, formatValue } from '@/utils/businessDisplay';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'BusinessRequestDetails'>['route'];
type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function BusinessRequestDetailsScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Navigation>();
  const { error, loadBoard, loading, offers, refreshing, refresh, requests } = useBusinessBoard();

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const request = useMemo(
    () => requests.find((item) => item.id === route.params.requestId),
    [requests, route.params.requestId]
  );

  const requestOffers = useMemo(
    () => offers.filter((offer) => offer.request_id === route.params.requestId),
    [offers, route.params.requestId]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
      >
        {loading ? <LoadingState count={3} /> : null}

        {!loading && error ? <EmptyState subtitle={error} title="Unable to load request" /> : null}

        {!loading && !error && !request ? (
          <EmptyState subtitle="Return to the demand board and choose another request." title="Request not found" />
        ) : null}

        {!loading && !error && request ? (
          <>
            <AppCard style={styles.summaryCard}>
              <View style={styles.headerRow}>
                <Text selectable style={styles.title}>{request.title}</Text>
                <BusinessStatusBadge status={request.status} type="request" />
              </View>
              <Text selectable style={styles.description}>{request.description ?? 'No description yet.'}</Text>
              <View style={styles.metricGrid}>
                <Metric icon={<HeartIcon color={colors.primary} size={typography.sizes.md} />} label="Demand" value={`${request.interest_count}`} />
                <Metric icon={<BoxIcon color={colors.success} size={typography.sizes.md} />} label="Offers" value={`${requestOffers.length}`} />
                <Metric icon={<CalendarIcon color={colors.textMuted} size={typography.sizes.md} />} label="Needed by" value={formatValue(request.needed_by)} />
                <Metric icon={<PinIcon color={colors.textMuted} size={typography.sizes.md} />} label="Area" value={request.area ?? 'Area TBD'} />
              </View>
              <View style={styles.badgeRow}>
                <UrgencyBadge urgency={request.urgency} />
              </View>
              <AppButton onPress={() => navigation.navigate('CreateOffer', { requestId: request.id })}>
                Create offer
              </AppButton>
            </AppCard>

            <View style={styles.sectionHeader}>
              <Text selectable style={styles.sectionTitle}>Existing offers</Text>
              <Text selectable style={styles.sectionCount}>{requestOffers.length}</Text>
            </View>

            {requestOffers.length === 0 ? (
              <EmptyState subtitle="Be the first business to respond to this request." title="No offers yet" />
            ) : (
              <View style={styles.offerList}>
                {requestOffers.map((offer) => (
                  <AppCard
                    key={offer.id}
                    onPress={() => navigation.navigate('BusinessOfferDetails', { offerId: offer.id })}
                    style={styles.offerCard}
                  >
                    <View style={styles.headerRow}>
                      <Text selectable style={styles.offerTitle}>{offer.title}</Text>
                      <BusinessStatusBadge status={offer.status} type="offer" />
                    </View>
                    <Text selectable style={styles.description}>
                      {offer.description ?? 'No offer details yet.'}
                    </Text>
                    <Text selectable style={styles.metaText}>{formatSchedule(offer.scheduled_for)}</Text>
                    <Text selectable style={styles.metaText}>{offer.joiner_count} joined residents</Text>
                  </AppCard>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      {icon}
      <View style={styles.metricText}>
        <Text selectable style={styles.metricLabel}>{label}</Text>
        <Text selectable style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xl },
  summaryCard: { gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.xl,
  },
  description: { color: colors.textMuted, fontSize: typography.sizes.md, lineHeight: typography.lineHeights.md },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metricText: { flex: 1, gap: 2 },
  metricLabel: { color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  metricValue: { color: colors.text, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  sectionCount: { color: colors.textMuted, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  offerList: { gap: spacing.sm },
  offerCard: { gap: spacing.sm },
  offerTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.sm },
});
