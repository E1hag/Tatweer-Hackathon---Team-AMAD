import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import CategoryChip from '@/components/common/CategoryChip';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import ScreenHeader from '@/components/common/ScreenHeader';
import StatusBadge from '@/components/common/StatusBadge';
import { CheckIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useMyOrders } from '@/hooks/useMyOrders';
import type { PendingConfirmation } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function MyOrdersScreen() {
  const navigation = useNavigation<Navigation>();
  const { userId } = useAuth();
  const {
    orders,
    pendingConfirmations,
    history,
    loading,
    error,
    actioningId,
    load,
    confirm,
  } = useMyOrders(userId);

  const handleConfirm = useCallback(
    async (joinerId: string, confirmed: boolean) => {
      try {
        await confirm(joinerId, confirmed);
      } catch (errorObject) {
        Alert.alert(
          'Unable to update',
          errorObject instanceof Error ? errorObject.message : 'Please try again.'
        );
      }
    },
    [confirm]
  );

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          subtitle="Sign in to see your orders."
          title="My Orders"
        />
        <EmptyState subtitle="Sign in to see your orders." title="Not signed in" />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader subtitle="Requests you have joined and items to confirm." title="My Orders" />
        <View style={styles.loadingWrap}>
          <LoadingState count={3} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader subtitle="Requests you have joined and items to confirm." title="My Orders" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader subtitle="Requests you've joined and items to confirm." title="My Orders" />

        {pendingConfirmations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awaiting your confirmation</Text>
            {pendingConfirmations.map((confirmation) => (
              <ConfirmationCard
                actioning={actioningId === confirmation.joiner_id}
                confirmation={confirmation}
                key={confirmation.joiner_id}
                onConfirm={handleConfirm}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your requests</Text>
          {orders.length > 0 ? (
            <View style={styles.cardList}>
              {orders.map((order) => (
                <AppCard
                  key={order.request.id}
                  onPress={() =>
                    navigation.navigate('RequestDetails', { requestId: order.request.id })
                  }
                  style={styles.orderCard}
                >
                  <View style={styles.orderTopRow}>
                    <CategoryChip
                      label={order.request.category}
                      onPress={() => undefined}
                      selected={false}
                      variant="label"
                    />
                    <StatusBadge status={order.request.status} />
                  </View>
                  <Text style={styles.orderTitle}>{order.request.title}</Text>
                  <View style={styles.privateBlock}>
                    <Text style={styles.privateLabel}>
                      You need: {order.interest.quantity} - by {order.interest.needed_by}
                    </Text>
                    {order.interest.note ? (
                      <Text style={styles.privateNote}>{order.interest.note}</Text>
                    ) : null}
                  </View>
                </AppCard>
              ))}
            </View>
          ) : (
            <EmptyState
              subtitle="Join a request with Me Too and it will show up here."
              title="No orders yet"
            />
          )}
        </View>

        {history.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            {history.map((confirmation) => (
              <AppCard key={confirmation.joiner_id} style={styles.historyCard}>
                <Text style={styles.orderTitle}>{confirmation.request_title}</Text>
                <Text style={styles.metaText}>{confirmation.offer_title}</Text>
                <View style={styles.historyStatus}>
                  {confirmation.joiner_status === 'fulfilled_confirmed' ? (
                    <CheckIcon color={colors.success} size={typography.sizes.md} />
                  ) : null}
                  <Text
                    style={
                      confirmation.joiner_status === 'fulfilled_confirmed'
                        ? styles.successText
                        : styles.metaText
                    }
                  >
                    {confirmation.joiner_status === 'fulfilled_confirmed'
                      ? 'Confirmed fulfilled'
                      : 'Marked not fulfilled'}
                  </Text>
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ConfirmationCard({
  confirmation,
  actioning,
  onConfirm,
}: {
  confirmation: PendingConfirmation;
  actioning: boolean;
  onConfirm: (joinerId: string, confirmed: boolean) => void;
}) {
  return (
    <AppCard style={styles.confirmationCard}>
      <Text style={styles.orderTitle}>{confirmation.request_title}</Text>
      <Text style={styles.metaText}>
        {confirmation.business_name ? `${confirmation.business_name} - ` : ''}
        {confirmation.offer_title}
      </Text>
      {confirmation.price_note ? <Text style={styles.metaText}>{confirmation.price_note}</Text> : null}
      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          disabled={actioning}
          onPress={() => onConfirm(confirmation.joiner_id, true)}
          style={[styles.primaryAction, actioning && styles.disabled]}
        >
          {actioning ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <View style={styles.actionContent}>
              <CheckIcon color={colors.surface} size={typography.sizes.sm} />
              <Text style={styles.primaryActionText}>Yes, fulfilled</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={actioning}
          onPress={() => onConfirm(confirmation.joiner_id, false)}
          style={[styles.secondaryAction, actioning && styles.disabled]}
        >
          <Text style={styles.secondaryActionText}>Not fulfilled</Text>
        </Pressable>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, paddingBottom: spacing.xxl },
  loadingWrap: { paddingHorizontal: spacing.lg },
  centered: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  section: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  cardList: { gap: spacing.md },
  orderCard: { gap: spacing.sm },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  privateBlock: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  privateLabel: { color: colors.text, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  privateNote: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  confirmationCard: { gap: spacing.sm },
  metaText: { color: colors.textMuted, fontSize: typography.sizes.sm, lineHeight: typography.lineHeights.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  primaryAction: {
    flex: 1,
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  actionContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  primaryActionText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
  secondaryAction: {
    flex: 1,
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizes.borderWidth,
    borderColor: colors.error,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  secondaryActionText: { color: colors.error, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  disabled: { opacity: sizes.disabledOpacity },
  historyCard: { gap: spacing.xs },
  historyStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  successText: { color: colors.success, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  errorText: { color: colors.error, fontSize: typography.sizes.md, textAlign: 'center' },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.surface, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
});
