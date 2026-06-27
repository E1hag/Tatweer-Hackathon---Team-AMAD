import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon, ClockIcon } from '@/components/icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { RequestUrgency } from '@/types/database';

interface UrgencyBadgeProps {
  urgency: RequestUrgency | null;
}

export default function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  if (!urgency) {
    return null;
  }

  const option =
    urgency === 'today'
      ? { bg: colors.urgencyTodayBg, text: colors.urgencyTodayText, label: 'Today', icon: ClockIcon }
      : urgency === 'this_week'
        ? { bg: colors.urgencyWeekBg, text: colors.urgencyWeekText, label: 'This week', icon: ClockIcon }
        : { bg: colors.urgencyFlexibleBg, text: colors.urgencyFlexibleText, label: 'Flexible', icon: CheckIcon };
  const Icon = option.icon;

  return (
    <View style={[styles.badge, { backgroundColor: option.bg }]}>
      <Icon color={option.text} size={typography.sizes.xs} />
      <Text style={[styles.text, { color: option.text }]}>{option.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
