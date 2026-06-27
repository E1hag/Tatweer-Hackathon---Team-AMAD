import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppCard from '@/components/common/AppCard';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import { CalendarIcon, HeartIcon, PersonIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessBoard } from '@/hooks/useBusinessBoard';
import { updateBusinessOfferStatus, type BusinessOffer } from '@/services/business';
import type { OfferStatus } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';
import {
  formatSchedule,
  formatStatus,
  formatValue,
  isEditableOfferStatus,
} from '@/utils/businessDisplay';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function BusinessMyOffersScreen() {
  const navigation = useNavigation<Navigation>();
  const { profile, userId } = useAuth();
  const { error, loadBoard, loading, offers, refreshing, refresh, requests } = useBusinessBoard();
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const myOffers = useMemo(
    () => offers.filter((offer) => offer.business_id === userId),
    [offers, userId]
  );

  const requestById = useMemo(
    () =>
      requests.reduce<Record<string, string>>((map, request) => {
        map[request.id] = request.title;
        return map;
      }, {}),
    [requests]
  );

  const changeOfferStatus = async (offer: BusinessOffer, status: OfferStatus) => {
    if (!userId || offer.business_id !== userId || !isEditableOfferStatus(offer.status)) {
      return;
    }

    setUpdatingOfferId(offer.id);
    try {
      await updateBusinessOfferStatus(offer, status);
      await loadBoard();
    } catch (errorObject) {
      Alert.alert(
        'Unable to update offer',
        errorObject instanceof Error ? errorObject.message : 'Please try again.'
      );
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const businessName = profile?.business_name ?? profile?.full_name ?? 'your business';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text selectable style={styles.title}>Offers</Text>
          <Text selectable style={styles.subtitle}>Fulfillment offers you have posted</Text>
        </View>

        {loading ? <LoadingState count={3} /> : null}

        {!loading && error ? (
          <EmptyState subtitle={error} title="Unable to load offers" />
        ) : null}

        {!loading && !error && myOffers.length === 0 ? (
          <EmptyState
            subtitle={`Pick a resident request from Requests and create the first offer for ${businessName}.`}
            title="No offers yet"
          />
        ) : null}

        {!loading && !error ? (
          <View style={styles.offerList}>
            {myOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                disabled={updatingOfferId === offer.id}
                offer={offer}
                onCancel={() => changeOfferStatus(offer, 'cancelled')}
                onComplete={() => changeOfferStatus(offer, 'completed')}
                onPress={() => navigation.navigate('BusinessOfferDetails', { offerId: offer.id })}
                requestTitle={requestById[offer.request_id] ?? 'Selected request'}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function OfferCard({
  disabled,
  offer,
  onCancel,
  onComplete,
  onPress,
  requestTitle,
}: {
  disabled: boolean;
  offer: BusinessOffer;
  onCancel: () => void;
  onComplete: () => void;
  onPress: () => void;
  requestTitle: string;
}) {
  const canManage = isEditableOfferStatus(offer.status);

  return (
    <AppCard onPress={onPress} style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text selectable style={styles.categoryText}>{requestTitle}</Text>
        <BusinessStatusBadge status={offer.status} type="offer" />
      </View>
      <Text selectable style={styles.offerTitle}>{offer.title}</Text>
      <Text selectable style={styles.metaText}>For: {requestTitle}</Text>
      {offer.description ? (
        <Text selectable style={styles.description}>{offer.description}</Text>
      ) : null}

      <View style={styles.infoGrid}>
        <InfoItem icon={<PersonIcon color={colors.textMuted} size={typography.sizes.sm} />} text={`Capacity: ${offer.capacity ?? 'TBD'}`} />
        <InfoItem icon={<CalendarIcon color={colors.textMuted} size={typography.sizes.sm} />} text={formatSchedule(offer.scheduled_for)} />
        <InfoItem text={formatValue(offer.price_note, 'Price TBD')} />
        <InfoItem icon={<HeartIcon color={colors.textMuted} size={typography.sizes.sm} />} text={`${offer.joiner_count} joined`} />
      </View>

      <View style={styles.joinersBox}>
        <Text selectable style={styles.joinersTitle}>Joined residents</Text>
        {offer.joiners.length === 0 ? (
          <Text selectable style={styles.metaText}>
            Residents who joined the request will appear here when this offer is active.
          </Text>
        ) : (
          offer.joiners.map((joiner) => (
            <View key={`${offer.id}-${joiner.user_id}`} style={styles.joinerRow}>
              <Text selectable style={styles.joinerName}>
                {joiner.profile?.full_name ?? 'Unknown resident'}
              </Text>
              <Text selectable style={styles.joinerMeta}>
                {joiner.profile?.area ?? formatStatus(joiner.status)}
              </Text>
            </View>
          ))
        )}
      </View>

      {canManage ? (
        <View style={styles.actions}>
          <AppButton disabled={disabled} onPress={onComplete} style={styles.actionButton} variant="secondary">
            Mark Complete
          </AppButton>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onCancel}
            style={[styles.cancelButton, disabled && styles.disabled]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}
    </AppCard>
  );
}

function InfoItem({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <View style={styles.infoItem}>
      {icon}
      <Text selectable style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xl },
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
  offerList: { gap: spacing.md },
  offerCard: { gap: spacing.sm },
  offerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  categoryText: { flex: 1, color: colors.textMuted, fontSize: typography.sizes.xs },
  offerTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  description: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.md },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  infoItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  infoText: { flex: 1, color: colors.textMuted, fontSize: typography.sizes.xs, lineHeight: typography.lineHeights.sm },
  joinersBox: { gap: spacing.xs, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  joinersTitle: { color: colors.textMuted, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  joinerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: sizes.borderWidth,
    borderBottomColor: colors.border,
  },
  joinerName: { flex: 1, color: colors.text, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  joinerMeta: { color: colors.textMuted, fontSize: typography.sizes.xs },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: sizes.borderWidth,
    borderTopColor: colors.border,
  },
  actionButton: { flex: 1, minHeight: 42, backgroundColor: colors.statusOpenBg, borderColor: colors.success },
  cancelButton: {
    minHeight: 42,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizes.borderWidth,
    borderColor: colors.error,
    borderRadius: radius.md,
    backgroundColor: colors.urgencyTodayBg,
  },
  cancelText: { color: colors.error, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  disabled: { opacity: sizes.disabledOpacity },
});
