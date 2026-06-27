import { useCallback, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppCard from '@/components/common/AppCard';
import AppTextInput from '@/components/common/AppTextInput';
import BusinessStatusBadge from '@/components/common/BusinessStatusBadge';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import UrgencyBadge from '@/components/common/UrgencyBadge';
import { colors, fonts, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessBoard } from '@/hooks/useBusinessBoard';
import { createBusinessOffer } from '@/services/business';
import type { RootStackParamList } from '@/types/navigation';
import { formatValue, isValidSchedule } from '@/utils/businessDisplay';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'CreateOffer'>['route'];
type Navigation = NativeStackNavigationProp<RootStackParamList>;

const emptyForm = {
  title: '',
  description: '',
  capacity: '',
  scheduledFor: '',
  priceNote: '',
};

export default function CreateOfferScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Navigation>();
  const { userId } = useAuth();
  const { error, loadBoard, loading, requests } = useBusinessBoard();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void loadBoard({ showSpinner: true });
    }, [loadBoard])
  );

  const request = useMemo(
    () => requests.find((item) => item.id === route.params.requestId),
    [requests, route.params.requestId]
  );

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitOffer = async () => {
    if (!request || !userId) return;

    if (!form.title.trim()) {
      Alert.alert('Add a title', 'Give residents a clear name for this offer.');
      return;
    }

    if (!isValidSchedule(form.scheduledFor)) {
      Alert.alert('Check the schedule', 'Use a format like 2026-07-03 18:00, or leave it blank.');
      return;
    }

    setSubmitting(true);
    try {
      await createBusinessOffer({
        requestId: request.id,
        businessId: userId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        scheduledFor: form.scheduledFor.trim() || null,
        priceNote: form.priceNote.trim() || null,
      });

      navigation.navigate('BusinessMain', { screen: 'MyOffers' });
    } catch (errorObject) {
      Alert.alert(
        'Unable to create offer',
        errorObject instanceof Error ? errorObject.message : 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text selectable style={styles.title}>Create offer</Text>
            <Text selectable style={styles.subtitle}>Respond to confirmed neighborhood demand</Text>
          </View>

          {loading ? <LoadingState count={2} /> : null}

          {!loading && error ? (
            <EmptyState subtitle={error} title="Unable to load request" />
          ) : null}

          {!loading && !error && !request ? (
            <EmptyState subtitle="Return to the demand board and choose a request." title="Request not found" />
          ) : null}

          {!loading && !error && request ? (
            <>
              <AppCard style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text selectable style={styles.requestTitle}>{request.title}</Text>
                  <BusinessStatusBadge status={request.status} type="request" />
                </View>
                <Text selectable style={styles.metaText}>
                  For: {request.description ?? request.category}
                </Text>
                <View style={styles.badgeRow}>
                  <UrgencyBadge urgency={request.urgency} />
                  <Text selectable style={styles.metaText}>{request.interest_count} residents interested</Text>
                  <Text selectable style={styles.metaText}>{request.area ?? 'Area TBD'}</Text>
                </View>
              </AppCard>

              <AppCard style={styles.formCard}>
                <AppTextInput
                  onChangeText={(value) => updateField('title', value)}
                  placeholder="Offer title"
                  value={form.title}
                />
                <AppTextInput
                  multiline
                  onChangeText={(value) => updateField('description', value)}
                  placeholder="What can you provide?"
                  style={styles.multiline}
                  value={form.description}
                />
                <View style={styles.formRow}>
                  <AppTextInput
                    keyboardType="number-pad"
                    onChangeText={(value) => updateField('capacity', value)}
                    placeholder="Capacity"
                    style={styles.rowInput}
                    value={form.capacity}
                  />
                  <AppTextInput
                    onChangeText={(value) => updateField('scheduledFor', value)}
                    placeholder="2026-07-03 18:00"
                    style={styles.rowInput}
                    value={form.scheduledFor}
                  />
                </View>
                <Text selectable style={styles.helperText}>
                  Schedule format: YYYY-MM-DD HH:mm. Leave blank if timing is not confirmed.
                </Text>
                <AppTextInput
                  onChangeText={(value) => updateField('priceNote', value)}
                  placeholder="Price note, e.g. AED 45-70 per household"
                  value={form.priceNote}
                />
                <Text selectable style={styles.helperText}>
                  Needed by: {formatValue(request.needed_by, 'No date set')}
                </Text>
                <AppButton disabled={submitting} onPress={submitOffer}>
                  {submitting ? 'Posting offer...' : 'Post fulfillment offer'}
                </AppButton>
              </AppCard>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardAvoiding: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xl },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: { color: colors.textMuted, fontSize: typography.sizes.md, lineHeight: typography.lineHeights.md },
  requestCard: { gap: spacing.sm },
  requestHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  requestTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  formCard: { gap: spacing.sm },
  multiline: { minHeight: 104, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row', gap: spacing.sm },
  rowInput: { flex: 1 },
  helperText: { color: colors.textMuted, fontSize: typography.sizes.xs, lineHeight: typography.lineHeights.sm },
});
