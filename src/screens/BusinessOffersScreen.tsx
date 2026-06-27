import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppCard from '@/components/common/AppCard';
import AppTextInput from '@/components/common/AppTextInput';
import EmptyState from '@/components/common/EmptyState';
import { BriefcaseIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  createBusinessOffer,
  fetchBusinessBoard,
  updateBusinessOfferStatus,
  type BusinessOffer,
} from '@/services/business';
import { signOut } from '@/services/auth';
import type { OfferStatus, RequestStatus, RequestSummary } from '@/types/database';

const requestStatusFilters: { label: string; value: RequestStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Demand growing', value: 'demand_growing' },
  { label: 'Offered', value: 'offered' },
  { label: 'Fulfilled', value: 'fulfilled' },
];

const emptyOfferForm = {
  title: '',
  description: '',
  capacity: '',
  scheduledFor: '',
  priceNote: '',
};

function formatValue(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : 'Not set';
}

function formatStatus(value: string) {
  return value.replace('_', ' ');
}

function formatUrgency(value: string | null) {
  return value ? value.replace('_', ' ') : 'flexible';
}

function isEditableOfferStatus(status: OfferStatus) {
  return status === 'accepting' || status === 'proposed';
}

function isValidSchedule(value: string) {
  if (!value.trim()) return true;
  return !Number.isNaN(Date.parse(value.trim().replace(' ', 'T')));
}

function getStatusStyle(status: OfferStatus | RequestStatus) {
  if (status === 'open' || status === 'accepting') return styles.statusSuccess;
  if (status === 'demand_growing' || status === 'proposed' || status === 'offered' || status === 'scheduled') {
    return styles.statusAccent;
  }
  if (status === 'fulfilled' || status === 'completed') return styles.statusComplete;
  if (status === 'unfulfilled' || status === 'cancelled') return styles.statusDanger;
  return styles.statusNeutral;
}

function sortRequestsForBusiness(requests: RequestSummary[]) {
  return [...requests].sort((first, second) => {
    const interestDelta = second.interest_count - first.interest_count;
    if (interestDelta !== 0) return interestDelta;
    return second.offer_count - first.offer_count;
  });
}

export default function BusinessOffersScreen() {
  const { profile, userId } = useAuth();
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isBusinessUser = profile?.role === 'business' || profile?.role === 'aspiring_business';

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (request) => requestStatusFilter === 'all' || request.status === requestStatusFilter
      ),
    [requestStatusFilter, requests]
  );

  const selectedRequest = useMemo(
    () => filteredRequests.find((request) => request.id === selectedRequestId) ?? filteredRequests[0],
    [filteredRequests, selectedRequestId]
  );

  const selectedOffers = useMemo(
    () => offers.filter((offer) => offer.request_id === selectedRequest?.id),
    [offers, selectedRequest?.id]
  );

  const myOffers = useMemo(
    () => offers.filter((offer) => offer.business_id === userId),
    [offers, userId]
  );

  const loadBoard = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) {
      setLoading(true);
    }
    setError('');

    try {
      const board = await fetchBusinessBoard();
      const sortedRequests = sortRequestsForBusiness(board.requests);
      setRequests(sortedRequests);
      setOffers(board.offers);
      setSelectedRequestId((current) => current ?? sortedRequests[0]?.id ?? null);
    } catch (errorObject) {
      setError(
        errorObject instanceof Error
          ? errorObject.message
          : 'Unable to load business dashboard right now.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    void loadBoard();
  }, [loadBoard]);

  const updateOfferField = (field: keyof typeof emptyOfferForm, value: string) => {
    setOfferForm((current) => ({ ...current, [field]: value }));
  };

  const submitOffer = async () => {
    if (!selectedRequest || !userId || !isBusinessUser) return;
    if (!offerForm.title.trim()) {
      setMessage('Add an offer title before submitting.');
      return;
    }
    if (!isValidSchedule(offerForm.scheduledFor)) {
      setMessage('Use a schedule like 2026-07-03 18:00, or leave it blank.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await createBusinessOffer({
        requestId: selectedRequest.id,
        businessId: userId,
        title: offerForm.title.trim(),
        description: offerForm.description.trim() || null,
        capacity: offerForm.capacity ? Number(offerForm.capacity) : null,
        scheduledFor: offerForm.scheduledFor.trim() || null,
        priceNote: offerForm.priceNote.trim() || null,
      });

      setOfferForm(emptyOfferForm);
      setMessage('Offer posted. Residents can now join it.');
      await loadBoard();
    } catch (errorObject) {
      setMessage(
        errorObject instanceof Error ? errorObject.message : 'Unable to post offer right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const changeOfferStatus = async (offer: BusinessOffer, status: OfferStatus) => {
    if (!isBusinessUser || updatingOfferId || offer.business_id !== userId || !isEditableOfferStatus(offer.status)) {
      return;
    }

    setUpdatingOfferId(offer.id);
    setMessage('');

    try {
      await updateBusinessOfferStatus(offer, status);
      setMessage(status === 'completed' ? 'Offer marked completed.' : 'Offer cancelled.');
      await loadBoard();
    } catch (errorObject) {
      setMessage(
        errorObject instanceof Error ? errorObject.message : 'Unable to update offer status.'
      );
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await signOut();
    } catch (errorObject) {
      setMessage(errorObject instanceof Error ? errorObject.message : 'Unable to sign out.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderOffer = (offer: BusinessOffer, showActions = false) => {
    const canManageOffer =
      showActions &&
      isBusinessUser &&
      offer.business_id === userId &&
      isEditableOfferStatus(offer.status);

    return (
      <View key={offer.id} style={styles.offerItem}>
        <View style={styles.cardHeader}>
          <Text selectable style={styles.offerTitle}>
            {offer.title}
          </Text>
          <Text selectable style={[styles.statusPill, getStatusStyle(offer.status)]}>
            {formatStatus(offer.status)}
          </Text>
        </View>
        {offer.description ? (
          <Text selectable style={styles.description}>
            {offer.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text selectable style={styles.metaText}>Capacity {offer.capacity ?? 'TBD'}</Text>
          <Text selectable style={styles.metaText}>{formatValue(offer.scheduled_for)}</Text>
          <Text selectable style={styles.metaText}>{formatValue(offer.price_note)}</Text>
        </View>
        <Text selectable style={styles.signalText}>
          {offer.joiner_count} residents joined
        </Text>
        {offer.joiners.length > 0 ? (
          <View style={styles.joinerList}>
            {offer.joiners.map((joiner) => (
              <View key={`${offer.id}-${joiner.user_id}`} style={styles.joinerRow}>
                <View style={styles.joinerTextGroup}>
                  <Text selectable style={styles.joinerName}>
                    {joiner.profile?.full_name ?? 'Unknown resident'}
                  </Text>
                  <Text selectable style={styles.metaText}>
                    {joiner.profile?.area ?? 'Area TBD'}
                  </Text>
                </View>
                <Text selectable style={styles.joinerStatus}>
                  {formatStatus(joiner.status)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text selectable style={styles.mutedText}>
            No joined residents yet.
          </Text>
        )}
        {canManageOffer ? (
          <View style={styles.offerActions}>
            <AppButton
              disabled={updatingOfferId === offer.id}
              onPress={() => changeOfferStatus(offer, 'completed')}
              style={styles.offerActionButton}
            >
              Complete
            </AppButton>
            <AppButton
              disabled={updatingOfferId === offer.id}
              onPress={() => changeOfferStatus(offer, 'cancelled')}
              style={styles.offerActionButton}
              variant="secondary"
            >
              Cancel
            </AppButton>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingShell}>
          <ActivityIndicator color={colors.primary} />
          <Text selectable style={styles.mutedText}>
            Loading live demand, offers, and joiners...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isBusinessUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          actionLabel="Sign out"
          onAction={handleSignOut}
          subtitle="Use a business or aspiring business profile to manage fulfillment offers."
          title="Business profile required"
        />
      </SafeAreaView>
    );
  }

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
          <View style={styles.iconCircle}>
            <BriefcaseIcon color={colors.primary} size={spacing.xl} />
          </View>
          <View style={styles.headerCopy}>
            <Text selectable style={styles.title}>Business demand board</Text>
            <Text selectable style={styles.subtitle}>
              Find requests with visible demand, then create and manage fulfillment offers.
            </Text>
          </View>
        </View>

        {message ? (
          <AppCard style={styles.messageCard}>
            <Text selectable style={styles.messageText}>{message}</Text>
          </AppCard>
        ) : null}

        {error ? (
          <AppCard style={styles.errorCard}>
            <Text selectable style={styles.errorText}>{error}</Text>
            <AppButton onPress={refresh} variant="secondary">Try again</AppButton>
          </AppCard>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text selectable style={styles.sectionTitle}>Requests ready for offers</Text>
          <Text selectable style={styles.sectionCount}>{filteredRequests.length} shown</Text>
        </View>

        <View style={styles.filterRow}>
          {requestStatusFilters.map((filter) => {
            const isActive = requestStatusFilter === filter.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={filter.value}
                onPress={() => setRequestStatusFilter(filter.value)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredRequests.length === 0 ? (
          <EmptyState
            subtitle="Try another status, or wait for the user side to add more resident requests."
            title="No requests match this filter"
          />
        ) : null}

        {selectedRequest ? (
          <AppCard style={styles.detailCard}>
            <View style={styles.sectionHeader}>
              <Text selectable style={styles.formTitle}>Selected request</Text>
              <Text selectable style={[styles.statusPill, getStatusStyle(selectedRequest.status)]}>
                {formatStatus(selectedRequest.status)}
              </Text>
            </View>
            <Text selectable style={styles.detailTitle}>{selectedRequest.title}</Text>
            <View style={styles.detailGrid}>
              <DetailItem label="Demand" value={String(selectedRequest.interest_count)} />
              <DetailItem label="Offers" value={String(selectedRequest.offer_count)} />
              <DetailItem label="Needed by" value={formatValue(selectedRequest.needed_by)} />
              <DetailItem label="Urgency" value={formatUrgency(selectedRequest.urgency)} />
              <DetailItem label="Area" value={selectedRequest.area ?? 'Area TBD'} />
            </View>
          </AppCard>
        ) : null}

        <View style={styles.requestList}>
          {filteredRequests.map((request) => {
            const isSelected = request.id === selectedRequest?.id;

            return (
              <AppCard
                key={request.id}
                onPress={() => setSelectedRequestId(request.id)}
                style={isSelected ? styles.selectedCard : undefined}
              >
                <View style={styles.cardHeader}>
                  <Text selectable style={styles.requestTitle}>{request.title}</Text>
                  <Text selectable style={[styles.statusPill, getStatusStyle(request.status)]}>
                    {formatStatus(request.status)}
                  </Text>
                </View>
                <Text selectable style={styles.description}>
                  {request.description ?? 'No description yet.'}
                </Text>
                <View style={styles.metaRow}>
                  <Text selectable style={styles.metaText}>{request.category}</Text>
                  <Text selectable style={styles.metaText}>{request.area ?? 'Area TBD'}</Text>
                  <Text selectable style={styles.metaText}>{formatUrgency(request.urgency)}</Text>
                </View>
                <View style={styles.signalRow}>
                  <Text selectable style={styles.signalText}>
                    {request.interest_count} need this too
                  </Text>
                  <Text selectable style={styles.signalText}>{request.offer_count} offers</Text>
                </View>
              </AppCard>
            );
          })}
        </View>

        {selectedRequest ? (
          <AppCard style={styles.stackCard}>
            <View style={styles.sectionHeader}>
              <Text selectable style={styles.formTitle}>Existing offers</Text>
              <Text selectable style={styles.sectionCount}>
                {selectedOffers.length} for selected request
              </Text>
            </View>
            {selectedOffers.length === 0 ? (
              <Text selectable style={styles.mutedText}>
                No offer exists for this selected request yet. Create one below when demand looks promising.
              </Text>
            ) : (
              <View style={styles.offerList}>{selectedOffers.map((offer) => renderOffer(offer))}</View>
            )}
          </AppCard>
        ) : null}

        {selectedRequest ? (
          <AppCard style={styles.stackCard}>
            <Text selectable style={styles.formTitle}>Create offer for {selectedRequest.title}</Text>
            <AppTextInput
              onChangeText={(value) => updateOfferField('title', value)}
              placeholder="Offer title"
              value={offerForm.title}
            />
            <AppTextInput
              multiline
              onChangeText={(value) => updateOfferField('description', value)}
              placeholder="What can you provide?"
              style={styles.multilineInput}
              value={offerForm.description}
            />
            <View style={styles.formRow}>
              <AppTextInput
                keyboardType="number-pad"
                onChangeText={(value) => updateOfferField('capacity', value)}
                placeholder="Capacity"
                style={styles.formRowInput}
                value={offerForm.capacity}
              />
              <AppTextInput
                onChangeText={(value) => updateOfferField('scheduledFor', value)}
                placeholder="2026-07-03 18:00"
                style={styles.formRowInput}
                value={offerForm.scheduledFor}
              />
            </View>
            <Text selectable style={styles.helperText}>
              Schedule format: YYYY-MM-DD HH:mm. Leave blank if timing is not confirmed.
            </Text>
            <AppTextInput
              onChangeText={(value) => updateOfferField('priceNote', value)}
              placeholder="Price note"
              value={offerForm.priceNote}
            />
            <AppButton disabled={submitting} onPress={submitOffer}>
              {submitting ? 'Posting offer...' : 'Post fulfillment offer'}
            </AppButton>
          </AppCard>
        ) : null}

        <AppCard style={styles.stackCard}>
          <View style={styles.sectionHeader}>
            <Text selectable style={styles.formTitle}>My offers</Text>
            <Text selectable style={styles.sectionCount}>{myOffers.length} total</Text>
          </View>
          {myOffers.length === 0 ? (
            <Text selectable style={styles.mutedText}>
              Offers created by {profile?.business_name ?? profile?.full_name ?? 'your business'} will appear here after you post one.
            </Text>
          ) : (
            <View style={styles.offerList}>
              {myOffers.map((offer) => renderOffer(offer, true))}
            </View>
          )}
        </AppCard>

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={handleSignOut}
          style={[styles.signOutButton, submitting && styles.disabled]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text selectable style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>{value}</Text>
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
    paddingBottom: spacing.xl,
  },
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: spacing.xxl,
    height: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  messageCard: {
    borderColor: colors.primary,
    backgroundColor: colors.sand,
  },
  messageText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  errorCard: {
    gap: spacing.sm,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    minHeight: sizes.chipMinHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  requestList: {
    gap: spacing.md,
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  stackCard: {
    gap: spacing.sm,
  },
  detailCard: {
    gap: spacing.sm,
    borderColor: colors.accent,
  },
  detailTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailItem: {
    minWidth: '30%',
    flexGrow: 1,
    gap: 2,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  detailValue: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  requestTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  signalRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  signalText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statusPill: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  statusSuccess: {
    color: colors.surface,
    backgroundColor: colors.success,
  },
  statusAccent: {
    color: colors.text,
    backgroundColor: colors.accent,
  },
  statusComplete: {
    color: colors.success,
    backgroundColor: colors.sand,
  },
  statusDanger: {
    color: colors.surface,
    backgroundColor: colors.error,
  },
  statusNeutral: {
    color: colors.text,
    backgroundColor: colors.sand,
  },
  offerList: {
    gap: spacing.sm,
  },
  offerItem: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  offerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  joinerList: {
    gap: spacing.xs,
  },
  joinerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  joinerTextGroup: {
    flex: 1,
    gap: 2,
  },
  joinerName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  joinerStatus: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  mutedText: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  formTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formRowInput: {
    flex: 1,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.sm,
  },
  offerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  offerActionButton: {
    flex: 1,
    minHeight: 42,
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
