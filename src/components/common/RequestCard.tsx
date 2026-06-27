import { StyleSheet, Text, View } from 'react-native';

import AppCard from '@/components/common/AppCard';
import CategoryChip from '@/components/common/CategoryChip';
import StatusBadge from '@/components/common/StatusBadge';
import UrgencyBadge from '@/components/common/UrgencyBadge';
import { BoxIcon, CalendarIcon, HeartIcon, PinIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import type { RequestSummary } from '@/types/database';

interface RequestCardProps {
  request: RequestSummary;
  joined: boolean;
  onMeToo: () => void;
  onPress: () => void;
}

function formatNeededBy(date: string | null) {
  return date ? date.slice(0, 10) : null;
}

export default function RequestCard({ request, onPress }: RequestCardProps) {
  const peopleCount = request.interest_count + 1;
  const neededBy = formatNeededBy(request.needed_by);

  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <CategoryChip label={request.category} onPress={() => undefined} selected={false} variant="label" />
        <StatusBadge status={request.status} />
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {request.title}
      </Text>

      {request.description ? (
        <Text numberOfLines={2} style={styles.description}>
          {request.description}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        {request.area ? (
          <View style={styles.metaItem}>
            <PinIcon color={colors.textMuted} size={typography.sizes.sm} />
            <Text style={styles.metaText}>{request.area}</Text>
          </View>
        ) : null}
        {request.area ? <View style={styles.metaDot} /> : null}
        <UrgencyBadge urgency={request.urgency} />
        {neededBy ? <View style={styles.metaDot} /> : null}
        {neededBy ? (
          <View style={styles.metaItem}>
            <CalendarIcon color={colors.textMuted} size={typography.sizes.sm} />
            <Text style={styles.metaText}>{neededBy}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.signalsRow}>
        <View style={styles.signalItem}>
          <HeartIcon color={colors.demand} filled size={typography.sizes.md} />
          <Text style={styles.demandText}>
            {peopleCount === 1 ? '1 needs this' : `${peopleCount} need this`}
          </Text>
        </View>
        <View style={styles.signalItem}>
          <BoxIcon color={colors.primary} size={typography.sizes.md} />
          <Text style={styles.offerText}>
            {request.offer_count === 1 ? '1 offer' : `${request.offer_count} offers`}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  description: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  divider: {
    height: sizes.borderWidth,
    backgroundColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaDot: {
    width: sizes.metaDot,
    height: sizes.metaDot,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  signalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  demandText: {
    color: colors.demand,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  offerText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
