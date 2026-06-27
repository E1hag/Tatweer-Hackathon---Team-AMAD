import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppCard from '@/components/common/AppCard';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import UrgencyBadge from '@/components/common/UrgencyBadge';
import { BoxIcon, CalendarIcon, HeartIcon, PinIcon, PlusIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useBusinessBoard } from '@/hooks/useBusinessBoard';
import type { RequestStatus, RequestSummary } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';
import { formatValue, formatUrgency, requestStatusFilters } from '@/utils/businessDisplay';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function BusinessDemandBoardScreen() {
  const navigation = useNavigation<Navigation>();
  const { error, loadBoard, loading, offers, refreshing, refresh, requests } = useBusinessBoard();
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const filteredRequests = useMemo(
    () => requests.filter((request) => filter === 'all' || request.status === filter),
    [filter, requests]
  );

  const selectedRequest = useMemo(
    () => filteredRequests.find((request) => request.id === selectedRequestId) ?? filteredRequests[0],
    [filteredRequests, selectedRequestId]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        horizontal={false}
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text selectable style={styles.title}>Business Demand Board</Text>
          <Text selectable style={styles.subtitle}>See what Al Quaa actually needs</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {requestStatusFilters.map((option) => {
            const active = filter === option.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={option.value}
                onPress={() => setFilter(option.value)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? <LoadingState count={3} /> : null}

        {!loading && error ? (
          <EmptyState subtitle={error} title="Unable to load demand" />
        ) : null}

        {!loading && !error && filteredRequests.length === 0 ? (
          <EmptyState
            subtitle="Try another filter, or wait for residents to add more requests."
            title="No requests match"
          />
        ) : null}

        {!loading && !error && selectedRequest ? (
          <>
            <SelectedRequestCard
              offersCount={offers.filter((offer) => offer.request_id === selectedRequest.id).length}
              onCreateOffer={() => navigation.navigate('CreateOffer', { requestId: selectedRequest.id })}
              request={selectedRequest}
            />

            <View style={styles.list}>
              {filteredRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  onPress={() => setSelectedRequestId(request.id)}
                  request={request}
                  selected={request.id === selectedRequest.id}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SelectedRequestCard({
  offersCount,
  onCreateOffer,
  request,
}: {
  offersCount: number;
  onCreateOffer: () => void;
  request: RequestSummary;
}) {
  return (
    <AppCard style={styles.selectedCard}>
      <Text selectable style={styles.selectedLabel}>Selected request</Text>
      <Text selectable style={styles.selectedTitle}>{request.title}</Text>
      <View style={styles.detailGrid}>
        <DetailIcon icon={<HeartIcon color={colors.primary} size={typography.sizes.sm} />} text={`${request.interest_count} residents need this`} />
        <DetailIcon icon={<BoxIcon color={colors.success} size={typography.sizes.sm} />} text={`${offersCount} offers so far`} />
        <DetailIcon icon={<CalendarIcon color={colors.textMuted} size={typography.sizes.sm} />} text={`By ${formatValue(request.needed_by, 'No date set')}`} />
        <DetailIcon icon={<PinIcon color={colors.textMuted} size={typography.sizes.sm} />} text={request.area ?? 'Area TBD'} />
      </View>
      <View style={styles.selectedFooter}>
        <View style={styles.badgeRow}>
          <UrgencyBadge urgency={request.urgency} />
          <BusinessStatusBadge status={request.status} type="request" />
        </View>
        <AppButton onPress={onCreateOffer} style={styles.createButton}>
          <View style={styles.buttonContent}>
            <PlusIcon color={colors.surface} size={typography.sizes.md} />
            <Text style={styles.createButtonText}>Create offer</Text>
          </View>
        </AppButton>
      </View>
    </AppCard>
  );
}

function DetailIcon({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.detailItem}>
      {icon}
      <Text selectable style={styles.detailText}>{text}</Text>
    </View>
  );
}

function RequestRow({
  onPress,
  request,
  selected,
}: {
  onPress: () => void;
  request: RequestSummary;
  selected: boolean;
}) {
  return (
    <AppCard onPress={onPress} style={[styles.rowCard, selected && styles.rowCardSelected]}>
      <View style={styles.rowHeader}>
        <Text selectable style={styles.rowTitle}>{request.title}</Text>
        <BusinessStatusBadge status={request.status} type="request" />
      </View>
      <View style={styles.rowMeta}>
        <Text selectable style={styles.interestText}>{request.interest_count} interested</Text>
        <Text selectable style={styles.metaText}>{request.area ?? 'Area TBD'}</Text>
        <Text selectable style={styles.metaText}>{formatUrgency(request.urgency)}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xl },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: sizes.borderWidth,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: { color: colors.textMuted, fontSize: typography.sizes.md, lineHeight: typography.lineHeights.md },
  filterContent: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: {
    minHeight: sizes.chipMinHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  filterTextActive: { color: colors.surface },
  selectedCard: {
    gap: spacing.sm,
    borderColor: colors.terracottaSoft,
    backgroundColor: '#FFF7F1',
  },
  selectedLabel: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  selectedTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  detailItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailText: { flex: 1, color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  selectedFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  badgeRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  createButton: { minHeight: 42, paddingHorizontal: spacing.md },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  createButtonText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  list: { gap: spacing.sm },
  rowCard: { gap: spacing.sm },
  rowCardSelected: { borderColor: colors.primary, backgroundColor: '#FFF8F3' },
  rowHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  rowTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interestText: { color: colors.primary, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.xs },
});
