import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import CategoryChip from '@/components/common/CategoryChip';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import MeTooButton from '@/components/common/MeTooButton';
import MeTooSheet from '@/components/common/MeTooSheet';
import StatusBadge from '@/components/common/StatusBadge';
import UrgencyBadge from '@/components/common/UrgencyBadge';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useRequestDetails } from '@/hooks/useRequestDetails';
import type { ResidentOffer } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';
import { formatRelativeDate } from '@/utils/formatDate';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'RequestDetails'>['route'];

export default function RequestDetailsScreen() {
  const route = useRoute<RouteProps>();
  const { userId } = useAuth();
  const {
    request,
    offers,
    myInterest,
    loading,
    error,
    submitting,
    load,
    submitInterest,
    leaveInterest,
  } = useRequestDetails(route.params.requestId, userId);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  const openSheet = useCallback(() => {
    if (!userId) {
      Alert.alert('Sign in required', 'You need to be signed in to join a request.');
      return;
    }

    setSheetError(null);
    setSheetVisible(true);
  }, [userId]);

  const handleSubmit = useCallback(
    async (quantity: string, neededBy: string, note: string) => {
      try {
        await submitInterest(quantity, neededBy, note);
        setSheetVisible(false);
        setSheetError(null);
      } catch (errorObject) {
        setSheetError(errorObject instanceof Error ? errorObject.message : 'Please try again.');
      }
    },
    [submitInterest]
  );

  const handleLeave = useCallback(async () => {
    try {
      await leaveInterest();
      setSheetVisible(false);
      setSheetError(null);
    } catch (errorObject) {
      setSheetError(errorObject instanceof Error ? errorObject.message : 'Please try again.');
    }
  }, [leaveInterest]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <LoadingState count={3} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={load} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="Request not found" />
      </SafeAreaView>
    );
  }

  const peopleCount = request.interest_count + 1;
  const authorName = request.is_anonymous ? 'Anonymous neighbor' : 'A neighbor';
  const hasJoinedRequest = Boolean(myInterest);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <CategoryChip label={request.category} onPress={() => undefined} selected={false} variant="label" />
            <StatusBadge status={request.status} />
          </View>
          <UrgencyBadge urgency={request.urgency} />

          <Text style={styles.title}>{request.title}</Text>
          <Text style={styles.metaText}>
            Posted by {authorName} - {formatRelativeDate(request.created_at)}
          </Text>
          {request.description ? <Text style={styles.description}>{request.description}</Text> : null}
          <Text style={styles.demandText}>
            {peopleCount === 1 ? '1 needs this' : `${peopleCount} need this`}
          </Text>
        </View>

        <MeTooButton
          count={request.interest_count}
          joined={Boolean(myInterest)}
          loading={submitting}
          onPress={openSheet}
        />

        {myInterest ? (
          <AppCard style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.sectionTitle}>Your order</Text>
              <Pressable accessibilityRole="button" onPress={openSheet}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>
            <View style={styles.privateBlock}>
              <Text style={styles.orderLine}>You need: {myInterest.quantity}</Text>
              <Text style={styles.orderLine}>Needed by: {myInterest.needed_by}</Text>
              {myInterest.note ? <Text style={styles.orderLine}>Note: {myInterest.note}</Text> : null}
            </View>
          </AppCard>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text selectable style={styles.sectionTitle}>Availability</Text>
            {offers.length > 0 ? (
              <Text selectable style={styles.sectionCount}>{offers.length} offers</Text>
            ) : null}
          </View>
          <Text selectable style={styles.availabilityHint}>
            {hasJoinedRequest
              ? 'You are included when businesses respond to this request.'
              : 'Tap Me Too to join this request and be included in matching business offers.'}
          </Text>
          {offers.length > 0 ? (
            <View style={styles.offerList}>
              {offers.map((offer) => (
                <ResidentOfferCard
                  joined={hasJoinedRequest}
                  key={offer.id}
                  offer={offer}
                  onJoin={openSheet}
                  submitting={submitting}
                />
              ))}
            </View>
          ) : (
            <Text selectable style={styles.metaText}>
              No business has responded yet. Join the request so businesses can see demand.
            </Text>
          )}
        </View>
      </ScrollView>

      <MeTooSheet
        initialNeededBy={myInterest?.needed_by ?? undefined}
        initialNote={myInterest?.note ?? undefined}
        initialQuantity={myInterest?.quantity ?? undefined}
        joined={Boolean(myInterest)}
        onClose={() => setSheetVisible(false)}
        onLeave={handleLeave}
        onSubmit={handleSubmit}
        requestTitle={request.title}
        serverError={sheetError}
        submitting={submitting}
        visible={sheetVisible}
      />
    </SafeAreaView>
  );
}

function formatOfferSchedule(value: string | null) {
  if (!value) {
    return 'Schedule TBD';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ResidentOfferCard({
  joined,
  offer,
  onJoin,
  submitting,
}: {
  joined: boolean;
  offer: ResidentOffer;
  onJoin: () => void;
  submitting: boolean;
}) {
  return (
    <AppCard style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.offerTitleGroup}>
          <Text selectable style={styles.offerTitle}>{offer.title}</Text>
          <Text selectable style={styles.businessText}>
            {offer.business_name ?? 'Local business'}
            {offer.business_area ? ` - ${offer.business_area}` : ''}
          </Text>
        </View>
        <BusinessStatusBadge status={offer.status} type="offer" />
      </View>

      {offer.description ? (
        <Text selectable style={styles.offerDescription}>{offer.description}</Text>
      ) : null}

      <View style={styles.offerMetaGrid}>
        <OfferMeta label="Schedule" value={formatOfferSchedule(offer.scheduled_for)} />
        <OfferMeta label="Capacity" value={offer.capacity ? String(offer.capacity) : 'TBD'} />
        <OfferMeta label="Price" value={offer.price_note ?? 'Price TBD'} />
        <OfferMeta label="Joined" value={`${offer.joiner_count} residents`} />
      </View>

      {offer.business_phone ? (
        <Text selectable style={styles.metaText}>Contact: {offer.business_phone}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: submitting, selected: joined }}
        disabled={submitting}
        onPress={onJoin}
        style={[styles.offerCta, joined ? styles.offerCtaJoined : styles.offerCtaOpen]}
      >
        <Text style={[styles.offerCtaText, joined ? styles.offerCtaJoinedText : styles.offerCtaOpenText]}>
          {joined ? 'Included with your request' : 'Join request to access offer'}
        </Text>
      </Pressable>
    </AppCard>
  );
}

function OfferMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.offerMetaItem}>
      <Text selectable style={styles.offerMetaLabel}>{label}</Text>
      <Text selectable style={styles.offerMetaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingWrap: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  primaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  headerBlock: {
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.xl,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  description: {
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  demandText: {
    color: colors.demand,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  orderCard: {
    gap: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  editText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  orderLine: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  privateBlock: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  offerList: {
    gap: spacing.md,
  },
  offerCard: {
    gap: spacing.sm,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  availabilityHint: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  offerTitleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  offerTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  businessText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  offerDescription: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  offerMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  offerMetaItem: {
    width: '47%',
    gap: 2,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  offerMetaLabel: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  offerMetaValue: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.sm,
  },
  offerCta: {
    minHeight: spacing.xl + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  offerCtaOpen: {
    backgroundColor: colors.primary,
  },
  offerCtaJoined: {
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.statusOpenBg,
  },
  offerCtaText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  offerCtaOpenText: {
    color: colors.surface,
  },
  offerCtaJoinedText: {
    color: colors.success,
  },
});
