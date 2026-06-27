import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import type { RequestStatus } from '@/types/database';

interface StatusBadgeProps {
  status: RequestStatus;
}

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; label: string }> = {
  open: { bg: colors.statusOpenBg, text: colors.statusOpenText, label: 'Open' },
  demand_growing: { bg: colors.statusOpenBg, text: colors.statusOpenText, label: 'Open' },
  offered: { bg: colors.statusOfferedBg, text: colors.statusOfferedText, label: 'Offered' },
  scheduled: { bg: colors.statusOfferedBg, text: colors.statusOfferedText, label: 'Scheduled' },
  fulfilled: { bg: colors.statusFulfilledBg, text: colors.statusFulfilledText, label: 'Fulfilled' },
  unfulfilled: { bg: colors.statusClosedBg, text: colors.statusClosedText, label: 'Closed' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const option = STATUS_STYLES[status];

  return (
    <View style={[styles.badge, { backgroundColor: option.bg }]}>
      <Text style={[styles.text, { color: option.text }]}>{option.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
