import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '@/constants/theme';
import type { OfferStatus, RequestStatus } from '@/types/database';
import { getOfferStatusMeta, getRequestStatusMeta } from '@/utils/businessDisplay';

interface BusinessStatusBadgeProps {
  status: OfferStatus | RequestStatus;
  type: 'offer' | 'request';
}

export default function BusinessStatusBadge({ status, type }: BusinessStatusBadgeProps) {
  const option =
    type === 'offer' ? getOfferStatusMeta(status as OfferStatus) : getRequestStatusMeta(status as RequestStatus);

  return (
    <View style={[styles.badge, { backgroundColor: option.backgroundColor }]}>
      <Text style={[styles.text, { color: option.color }]}>{option.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
