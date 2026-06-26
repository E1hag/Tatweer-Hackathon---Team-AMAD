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

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key];
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function formatUrgency(urgency) {
  return urgency ? urgency.replace('_', ' ') : 'flexible';
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
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingOfferId, setUpdatingOfferId] = useState(null);
  const [message, setMessage] = useState('');

  const isBusinessUser = currentUser.role === 'business' || currentUser.role === 'aspiring_business';

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || requests[0],
    [requests, selectedRequestId]
  );

  const selectedOffers = useMemo(
    () => offers.filter((offer) => offer.request_id === selectedRequest?.id),
    [offers, selectedRequest?.id]
  );

  const loadBusinessBoard = useCallback(async () => {
    setIsLoading(true);
    setMessage('');

    const [requestResult, interestResult, offerResult, joinerResult] = await Promise.all([
      supabase
        .from('requests')
        .select('id,title,description,category,area,needed_by,urgency,status,created_at')
        .order('created_at', { ascending: false }),
      supabase.from('request_interests').select('request_id'),
      supabase
        .from('fulfillment_offers')
        .select('id,request_id,business_id,title,description,capacity,scheduled_for,price_note,status,created_at')
        .order('created_at', { ascending: false }),
      supabase.from('offer_joiners').select('offer_id'),
    ]);

    const error = requestResult.error || interestResult.error || offerResult.error || joinerResult.error;

    if (error) {
      setRequests(sortRequestsForBusiness(demoRequests));
      setOffers([]);
      setSelectedRequestId((current) => current || demoRequests[0]?.id || null);
      setMessage(`Using fallback demo data. Supabase said: ${error.message}`);
      setIsLoading(false);
      return;
    }

    const interestCounts = countBy(interestResult.data || [], 'request_id');
    const offerCounts = countBy(offerResult.data || [], 'request_id');
    const joinerCounts = countBy(joinerResult.data || [], 'offer_id');
    const hydratedOffers = (offerResult.data || []).map((offer) => ({
      ...offer,
      joinerCount: joinerCounts[offer.id] || 0,
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
    if (!isBusinessUser || updatingOfferId) return;

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
            Loading demand signals...
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
              Requests ready for offers
            </Text>
            <Text selectable style={styles.sectionCount}>
              {requests.length} total
            </Text>
          </View>

          <View style={styles.requestList}>
            {requests.map((request) => {
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
                      <Text selectable style={styles.statusPill}>
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
                No business has posted an offer for this request yet.
              </Text>
            ) : (
              <View style={styles.offerList}>
                {selectedOffers.map((offer) => (
                  <View key={offer.id} style={styles.offerItem}>
                    <View style={styles.cardHeader}>
                      <Text selectable style={styles.offerTitle}>
                        {offer.title}
                      </Text>
                      <Text selectable style={styles.statusPill}>
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
                    <View style={styles.offerActions}>
                      <AppButton
                        disabled={!isBusinessUser || updatingOfferId === offer.id || offer.status === 'completed'}
                        onPress={() => updateOfferStatus(offer, 'completed')}
                        style={styles.offerActionButton}
                      >
                        Complete
                      </AppButton>
                      <AppButton
                        disabled={!isBusinessUser || updatingOfferId === offer.id || offer.status === 'cancelled'}
                        onPress={() => updateOfferStatus(offer, 'cancelled')}
                        style={styles.offerActionButton}
                        variant="secondary"
                      >
                        Cancel
                      </AppButton>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </AppCard>

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
    color: colors.primaryDark,
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
    color: colors.primaryDark,
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
  selectedCard: {
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  requestTitle: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  statusPill: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    color: colors.primaryDark,
    backgroundColor: colors.sand,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
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
  formTitle: {
    color: colors.primaryDark,
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
    color: colors.primaryDark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
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
