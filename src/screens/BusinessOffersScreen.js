import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/common/AppButton';
import AppCard from '../components/common/AppCard';
import AppTextInput from '../components/common/AppTextInput';
import EmptyState from '../components/common/EmptyState';
import ScreenHeader from '../components/common/ScreenHeader';
import { colors, radius, spacing, typography } from '../constants/theme';
import { demoRequests } from '../data/demoRequests';
import { supabase } from '../lib/supabase';

const emptyOfferForm = {
  title: '',
  description: '',
  capacity: '',
  scheduled_for: '',
  price_note: '',
};

const requestStatusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Demand growing', value: 'demand_growing' },
  { label: 'Offered', value: 'offered' },
  { label: 'Fulfilled', value: 'fulfilled' },
];

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function mapProfilesById(profiles) {
  return profiles.reduce((profilesById, profile) => {
    profilesById[profile.id] = profile;
    return profilesById;
  }, {});
}

function formatUrgency(urgency) {
  return urgency ? urgency.replace('_', ' ') : 'flexible';
}

function formatDate(value) {
  return value || 'Not set';
}

function getStatusBadgeStyle(status) {
  if (status === 'accepting' || status === 'open') return styles.statusSuccess;
  if (status === 'proposed' || status === 'demand_growing') return styles.statusAccent;
  if (status === 'completed' || status === 'fulfilled') return styles.statusComplete;
  if (status === 'cancelled' || status === 'unfulfilled') return styles.statusDanger;
  return styles.statusNeutral;
}

function isEditableOfferStatus(status) {
  return status === 'accepting' || status === 'proposed';
}

function isValidSchedule(value) {
  if (!value.trim()) return true;
  return !Number.isNaN(Date.parse(value.trim().replace(' ', 'T')));
}

function sortRequestsForBusiness(requests) {
  return [...requests].sort((first, second) => {
    const interestDelta = (second.interestCount || 0) - (first.interestCount || 0);
    if (interestDelta !== 0) return interestDelta;
    return (second.offerCount || 0) - (first.offerCount || 0);
  });
}

export default function BusinessOffersScreen({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingOfferId, setUpdatingOfferId] = useState(null);
  const [message, setMessage] = useState('');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const isBusinessUser = currentUser.role === 'business' || currentUser.role === 'aspiring_business';

  const filteredRequests = useMemo(
    () => requests.filter((request) => requestStatusFilter === 'all' || request.status === requestStatusFilter),
    [requests, requestStatusFilter]
  );

  const selectedRequest = useMemo(
    () => filteredRequests.find((request) => request.id === selectedRequestId) || filteredRequests[0],
    [filteredRequests, selectedRequestId]
  );

  const selectedOffers = useMemo(
    () => offers.filter((offer) => offer.request_id === selectedRequest?.id),
    [offers, selectedRequest?.id]
  );

  const myOffers = useMemo(
    () => offers.filter((offer) => offer.business_id === currentUser.id),
    [offers, currentUser.id]
  );

  const loadBusinessBoard = useCallback(async () => {
    setIsLoading(true);
    setMessage('');
    setIsUsingFallback(false);

    const [requestResult, interestResult, offerResult, joinerResult, profileResult] = await Promise.all([
      supabase
        .from('requests')
        .select('id,title,description,category,area,needed_by,urgency,status,created_at')
        .order('created_at', { ascending: false }),
      supabase.from('request_interests').select('request_id'),
      supabase
        .from('fulfillment_offers')
        .select('id,request_id,business_id,title,description,capacity,scheduled_for,price_note,status,created_at')
        .order('created_at', { ascending: false }),
      supabase.from('offer_joiners').select('offer_id,user_id,status,created_at'),
      supabase.from('profiles').select('id,full_name,role,area'),
    ]);

    const error = requestResult.error || interestResult.error || offerResult.error || joinerResult.error || profileResult.error;

    if (error) {
      setRequests(sortRequestsForBusiness(demoRequests));
      setOffers([]);
      setSelectedRequestId((current) => current || demoRequests[0]?.id || null);
      setIsUsingFallback(true);
      setMessage(`Supabase could not load live business data: ${error.message}`);
      setIsLoading(false);
      return;
    }

    const interestCounts = countBy(interestResult.data || [], 'request_id');
    const offerCounts = countBy(offerResult.data || [], 'request_id');
    const joinerCounts = countBy(joinerResult.data || [], 'offer_id');
    const profilesById = mapProfilesById(profileResult.data || []);
    const hydratedOffers = (offerResult.data || []).map((offer) => ({
      ...offer,
      joinerCount: joinerCounts[offer.id] || 0,
      joiners: (joinerResult.data || [])
        .filter((joiner) => joiner.offer_id === offer.id)
        .map((joiner) => ({
          ...joiner,
          profile: profilesById[joiner.user_id],
        })),
    }));
    const hydratedRequests = (requestResult.data || []).map((request) => ({
      ...request,
      interestCount: interestCounts[request.id] || 0,
      offerCount: offerCounts[request.id] || 0,
    }));
    const sortedRequests = sortRequestsForBusiness(hydratedRequests);

    setRequests(sortedRequests);
    setOffers(hydratedOffers);
    setSelectedRequestId((current) => current || sortedRequests[0]?.id || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(loadBusinessBoard, 0);

    return () => clearTimeout(timeoutId);
  }, [loadBusinessBoard]);

  const updateOfferField = (field, value) => {
    setOfferForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitOffer = async () => {
    if (!selectedRequest || !isBusinessUser) return;
    if (!offerForm.title.trim()) {
      setMessage('Add an offer title before submitting.');
      return;
    }
    if (!isValidSchedule(offerForm.scheduled_for)) {
      setMessage('Use a schedule like 2026-07-03 18:00, or leave it blank.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const payload = {
      request_id: selectedRequest.id,
      business_id: currentUser.id,
      title: offerForm.title.trim(),
      description: offerForm.description.trim() || null,
      capacity: offerForm.capacity ? Number(offerForm.capacity) : null,
      scheduled_for: offerForm.scheduled_for.trim() || null,
      price_note: offerForm.price_note.trim() || null,
      status: 'accepting',
    };

    const { error } = await supabase.from('fulfillment_offers').insert(payload);

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    await supabase
      .from('requests')
      .update({ status: 'offered' })
      .eq('id', selectedRequest.id);

    setOfferForm(emptyOfferForm);
    setMessage('Offer posted. Residents can now join it.');
    setIsSubmitting(false);
    loadBusinessBoard();
  };

  const updateOfferStatus = async (offer, status) => {
    if (!isBusinessUser || updatingOfferId || offer.business_id !== currentUser.id || !isEditableOfferStatus(offer.status)) return;

    setUpdatingOfferId(offer.id);
    setMessage('');

    const { error } = await supabase
      .from('fulfillment_offers')
      .update({ status })
      .eq('id', offer.id);

    if (error) {
      setMessage(error.message);
      setUpdatingOfferId(null);
      return;
    }

    if (status === 'completed') {
      await supabase
        .from('requests')
        .update({ status: 'fulfilled' })
        .eq('id', offer.request_id);
    }

    setMessage(status === 'completed' ? 'Offer marked completed.' : 'Offer cancelled.');
    setUpdatingOfferId(null);
    loadBusinessBoard();
  };

  const renderOfferCard = (offer, { showActions = false } = {}) => {
    const canManageOffer = isBusinessUser && offer.business_id === currentUser.id && isEditableOfferStatus(offer.status);

    return (
      <View key={offer.id} style={styles.offerItem}>
        <View style={styles.cardHeader}>
          <Text selectable style={styles.offerTitle}>
            {offer.title}
          </Text>
          <Text selectable style={[styles.statusPill, getStatusBadgeStyle(offer.status)]}>
            {offer.status}
          </Text>
        </View>
        {offer.description ? (
          <Text selectable style={styles.requestDescription}>
            {offer.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text selectable style={styles.metaText}>
            Capacity {offer.capacity || 'TBD'}
          </Text>
          <Text selectable style={styles.metaText}>
            {offer.scheduled_for || 'Schedule TBD'}
          </Text>
          <Text selectable style={styles.metaText}>
            {offer.price_note || 'Price TBD'}
          </Text>
        </View>
        <Text selectable style={styles.signalText}>
          {offer.joinerCount || 0} residents joined
        </Text>
        {offer.joiners.length > 0 ? (
          <View style={styles.joinerList}>
            {offer.joiners.map((joiner) => (
              <View key={`${offer.id}-${joiner.user_id}`} style={styles.joinerRow}>
                <View style={styles.joinerTextGroup}>
                  <Text selectable style={styles.joinerName}>
                    {joiner.profile?.full_name || 'Unknown resident'}
                  </Text>
                  <Text selectable style={styles.metaText}>
                    {joiner.profile?.area || 'Area TBD'}
                  </Text>
                </View>
                <Text selectable style={styles.joinerStatus}>
                  {joiner.status.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text selectable style={styles.mutedText}>
            No joined residents yet.
          </Text>
        )}
        {showActions && canManageOffer ? (
          <View style={styles.offerActions}>
            <AppButton
              disabled={updatingOfferId === offer.id}
              onPress={() => updateOfferStatus(offer, 'completed')}
              style={styles.offerActionButton}
            >
              Complete
            </AppButton>
            <AppButton
              disabled={updatingOfferId === offer.id}
              onPress={() => updateOfferStatus(offer, 'cancelled')}
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

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Business demand board"
        subtitle="Find requests with visible demand, then create a fulfillment offer."
      />

      {!isBusinessUser ? (
        <EmptyState
          title="Switch to a business profile"
          message="Use Al Ain Pickup Helper or Aspiring Farm Services to create fulfillment offers."
        />
      ) : null}

      {message ? (
        <AppCard style={styles.messageCard}>
          <Text selectable style={styles.messageText}>
            {message}
          </Text>
        </AppCard>
      ) : null}

      {isLoading ? (
        <AppCard style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
          <Text selectable style={styles.mutedText}>
            Loading live demand, offers, and joiners...
          </Text>
        </AppCard>
      ) : null}

      {!isLoading && requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          message="Seed demo requests or ask the user-side teammate to create the first request."
        />
      ) : null}

      {!isLoading && requests.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text selectable style={styles.sectionTitle}>
              {isUsingFallback ? 'Fallback request examples' : 'Requests ready for offers'}
            </Text>
            <Text selectable style={styles.sectionCount}>
              {filteredRequests.length} shown
            </Text>
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
              title="No requests match this filter"
              message="Try another status, or wait for the user side to add more resident requests."
            />
          ) : null}

          {selectedRequest ? (
            <AppCard style={styles.detailCard}>
              <View style={styles.sectionHeader}>
                <Text selectable style={styles.formTitle}>
                  Selected request
                </Text>
                <Text selectable style={[styles.statusPill, getStatusBadgeStyle(selectedRequest.status)]}>
                  {selectedRequest.status.replace('_', ' ')}
                </Text>
              </View>
              <Text selectable style={styles.detailTitle}>
                {selectedRequest.title}
              </Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text selectable style={styles.detailLabel}>
                    Demand
                  </Text>
                  <Text selectable style={styles.detailValue}>
                    {selectedRequest.interestCount || 0}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text selectable style={styles.detailLabel}>
                    Offers
                  </Text>
                  <Text selectable style={styles.detailValue}>
                    {selectedRequest.offerCount || 0}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text selectable style={styles.detailLabel}>
                    Needed by
                  </Text>
                  <Text selectable style={styles.detailValue}>
                    {formatDate(selectedRequest.needed_by)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text selectable style={styles.detailLabel}>
                    Urgency
                  </Text>
                  <Text selectable style={styles.detailValue}>
                    {formatUrgency(selectedRequest.urgency)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text selectable style={styles.detailLabel}>
                    Area
                  </Text>
                  <Text selectable style={styles.detailValue}>
                    {selectedRequest.area || 'Area TBD'}
                  </Text>
                </View>
              </View>
            </AppCard>
          ) : null}

          <View style={styles.requestList}>
            {filteredRequests.map((request) => {
              const isSelected = request.id === selectedRequest?.id;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={request.id}
                  onPress={() => setSelectedRequestId(request.id)}
                >
                  <AppCard style={isSelected && styles.selectedCard}>
                    <View style={styles.cardHeader}>
                      <Text selectable style={styles.requestTitle}>
                        {request.title}
                      </Text>
                      <Text selectable style={[styles.statusPill, getStatusBadgeStyle(request.status)]}>
                        {request.status.replace('_', ' ')}
                      </Text>
                    </View>
                    <Text selectable style={styles.requestDescription}>
                      {request.description || 'No description yet.'}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text selectable style={styles.metaText}>
                        {request.category}
                      </Text>
                      <Text selectable style={styles.metaText}>
                        {request.area || 'Area TBD'}
                      </Text>
                      <Text selectable style={styles.metaText}>
                        {formatUrgency(request.urgency)}
                      </Text>
                    </View>
                    <View style={styles.signalRow}>
                      <Text selectable style={styles.signalText}>
                        {request.interestCount || 0} need this too
                      </Text>
                      <Text selectable style={styles.signalText}>
                        {request.offerCount || 0} offers
                      </Text>
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}
          </View>

          {filteredRequests.length > 0 ? (
            <AppCard>
              <View style={styles.sectionHeader}>
                <Text selectable style={styles.formTitle}>
                  Existing offers
                </Text>
                <Text selectable style={styles.sectionCount}>
                  {selectedOffers.length} for selected request
                </Text>
              </View>

              {selectedOffers.length === 0 ? (
                <Text selectable style={styles.mutedText}>
                  No offer exists for this selected request yet. Create one below when demand looks promising.
                </Text>
              ) : (
                <View style={styles.offerList}>
                  {selectedOffers.map((offer) => renderOfferCard(offer))}
                </View>
              )}
            </AppCard>
          ) : null}

          {filteredRequests.length > 0 ? (
            <AppCard>
              <Text selectable style={styles.formTitle}>
                Create offer for {selectedRequest?.title}
              </Text>
              <AppTextInput
                editable={isBusinessUser && !isSubmitting}
                onChangeText={(value) => updateOfferField('title', value)}
                placeholder="Offer title"
                value={offerForm.title}
              />
              <AppTextInput
                editable={isBusinessUser && !isSubmitting}
                multiline
                onChangeText={(value) => updateOfferField('description', value)}
                placeholder="What can you provide?"
                style={styles.multilineInput}
                value={offerForm.description}
              />
              <View style={styles.formRow}>
                <AppTextInput
                  editable={isBusinessUser && !isSubmitting}
                  keyboardType="number-pad"
                  onChangeText={(value) => updateOfferField('capacity', value)}
                  placeholder="Capacity"
                  style={styles.formRowInput}
                  value={offerForm.capacity}
                />
                <AppTextInput
                  editable={isBusinessUser && !isSubmitting}
                  onChangeText={(value) => updateOfferField('scheduled_for', value)}
                  placeholder="2026-07-03 18:00"
                  style={styles.formRowInput}
                  value={offerForm.scheduled_for}
                />
              </View>
              <Text selectable style={styles.helperText}>
                Schedule format: YYYY-MM-DD HH:mm. Leave blank if timing is not confirmed.
              </Text>
              <AppTextInput
                editable={isBusinessUser && !isSubmitting}
                onChangeText={(value) => updateOfferField('price_note', value)}
                placeholder="Price note"
                value={offerForm.price_note}
              />
              <AppButton disabled={!isBusinessUser || isSubmitting} onPress={submitOffer}>
                {isSubmitting ? 'Posting offer...' : 'Post fulfillment offer'}
              </AppButton>
            </AppCard>
          ) : null}

          <AppCard>
            <View style={styles.sectionHeader}>
              <Text selectable style={styles.formTitle}>
                My offers
              </Text>
              <Text selectable style={styles.sectionCount}>
                {myOffers.length} total
              </Text>
            </View>
            {myOffers.length === 0 ? (
              <Text selectable style={styles.mutedText}>
                Offers created by {currentUser.name} will appear here after you post one.
              </Text>
            ) : (
              <View style={styles.offerList}>
                {myOffers.map((offer) => renderOfferCard(offer, { showActions: true }))}
              </View>
            )}
          </AppCard>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
  loadingCard: {
    alignItems: 'center',
  },
  mutedText: {
    color: colors.muted,
    fontSize: typography.sizes.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  sectionCount: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  requestList: {
    gap: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  filterChipTextActive: {
    color: colors.card,
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  detailCard: {
    borderColor: colors.accent,
    backgroundColor: colors.card,
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
    color: colors.muted,
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
  statusPill: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    color: colors.text,
    backgroundColor: colors.sand,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  statusSuccess: {
    color: colors.card,
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
    color: colors.card,
    backgroundColor: colors.danger,
  },
  statusNeutral: {
    color: colors.text,
    backgroundColor: colors.sand,
  },
  requestDescription: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.muted,
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
  helperText: {
    color: colors.muted,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.sm,
  },
  formTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  offerList: {
    gap: spacing.sm,
  },
  offerItem: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
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
    backgroundColor: colors.card,
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
  offerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  offerActionButton: {
    flex: 1,
    minHeight: 42,
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
});
