import { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppCard from '@/components/common/AppCard';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessBoard } from '@/hooks/useBusinessBoard';
import { updateBusinessOfferStatus } from '@/services/business';
import type { OfferStatus } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';
import { formatSchedule, formatStatus, formatValue, isEditableOfferStatus } from '@/utils/businessDisplay';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'BusinessOfferDetails'>['route'];

export default function BusinessOfferDetailsScreen() {
  const route = useRoute<RouteProps>();
  const { userId } = useAuth();
  const { error, loadBoard, loading, offers, refreshing, refresh, requests } = useBusinessBoard();
  const [updating, setUpdating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const offer = useMemo(
    () => offers.find((item) => item.id === route.params.offerId),
    [offers, route.params.offerId]
  );

  const request = useMemo(
    () => requests.find((item) => item.id === offer?.request_id),
    [offer?.request_id, requests]
  );

  const changeStatus = async (status: OfferStatus) => {
    if (!offer || offer.business_id !== userId || !isEditableOfferStatus(offer.status)) return;

    setUpdating(true);
    try {
      await updateBusinessOfferStatus(offer, status);
      await loadBoard();
    } catch (errorObject) {
      Alert.alert(
        'Unable to update offer',
        errorObject instanceof Error ? errorObject.message : 'Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
      >
        {loading ? <LoadingState count={2} /> : null}

        {!loading && error ? <EmptyState subtitle={error} title="Unable to load offer" /> : null}

        {!loading && !error && !offer ? (
          <EmptyState subtitle="Return to My Offers and choose another offer." title="Offer not found" />
        ) : null}

        {!loading && !error && offer ? (
          <>
            <AppCard style={styles.summaryCard}>
              <View style={styles.headerRow}>
                <Text selectable style={styles.title}>{offer.title}</Text>
                <BusinessStatusBadge status={offer.status} type="offer" />
              </View>
              <Text selectable style={styles.metaText}>For: {request?.title ?? 'Selected request'}</Text>
              <Text selectable style={styles.description}>{offer.description ?? 'No offer details yet.'}</Text>
              <View style={styles.detailBox}>
                <Detail label="Capacity" value={String(offer.capacity ?? 'TBD')} />
                <Detail label="Schedule" value={formatSchedule(offer.scheduled_for)} />
                <Detail label="Price" value={formatValue(offer.price_note, 'Price TBD')} />
                <Detail label="Joined" value={`${offer.joiner_count} residents`} />
              </View>
              {isEditableOfferStatus(offer.status) && offer.business_id === userId ? (
                <View style={styles.actions}>
                  <AppButton disabled={updating} onPress={() => changeStatus('completed')} style={styles.actionButton}>
                    Mark Complete
                  </AppButton>
                  <AppButton disabled={updating} onPress={() => changeStatus('cancelled')} style={styles.actionButton} variant="secondary">
                    Cancel
                  </AppButton>
                </View>
              ) : null}
            </AppCard>

            <View style={styles.sectionHeader}>
              <Text selectable style={styles.sectionTitle}>Joined residents</Text>
              <Text selectable style={styles.sectionCount}>{offer.joiner_count}</Text>
            </View>

            {offer.joiners.length === 0 ? (
              <EmptyState
                subtitle="Residents connected to this request will appear here when they are included in the offer."
                title="No joined residents yet"
              />
            ) : (
              <View style={styles.joinerList}>
                {offer.joiners.map((joiner) => (
                  <AppCard key={`${offer.id}-${joiner.user_id}`} style={styles.joinerCard}>
                    <Text selectable style={styles.joinerName}>
                      {joiner.profile?.full_name ?? 'Unknown resident'}
                    </Text>
                    <Text selectable style={styles.metaText}>{joiner.profile?.area ?? 'Area TBD'}</Text>
                    <Text selectable style={styles.joinerStatus}>{formatStatus(joiner.status)}</Text>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text selectable style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>{value}</Text>
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
  metaText: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  detailBox: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  detailItem: {
    width: '47%',
    gap: 2,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  detailLabel: { color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  detailValue: { color: colors.text, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  sectionCount: { color: colors.textMuted, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  joinerList: { gap: spacing.sm },
  joinerCard: { gap: spacing.xs },
  joinerName: { color: colors.text, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  joinerStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    color: colors.primary,
    backgroundColor: colors.surfaceMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    overflow: 'hidden',
  },
});
