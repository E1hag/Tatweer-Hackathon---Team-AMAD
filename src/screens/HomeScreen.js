import { StyleSheet, Text, View } from 'react-native';

import AppCard from '../components/common/AppCard';
import ScreenHeader from '../components/common/ScreenHeader';
import { colors, radius, spacing, typography } from '../constants/theme';
import { demoRequests } from '../data/demoRequests';

export default function HomeScreen({ currentUser }) {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Qua’a Loop"
        subtitle="Real local requests. Real first customers."
      />

      <AppCard style={styles.milestoneCard}>
        <Text selectable style={styles.milestoneText}>
          Dev environment ready. Next: build the request board.
        </Text>
        <Text selectable style={styles.milestoneDetail}>
          Showing fallback data for {currentUser.name} while Supabase tables and flows are shaped.
        </Text>
      </AppCard>

      <View style={styles.sectionHeader}>
        <Text selectable style={styles.sectionTitle}>
          Local demand signals
        </Text>
        <Text selectable style={styles.sectionCount}>
          {demoRequests.length} open
        </Text>
      </View>

      <View style={styles.requestList}>
        {demoRequests.map((request) => (
          <AppCard key={request.id}>
            <View style={styles.cardHeader}>
              <Text selectable style={styles.requestTitle}>
                {request.title}
              </Text>
              <Text selectable style={styles.urgency}>
                {request.urgency}
              </Text>
            </View>
            <Text selectable style={styles.requestDescription}>
              {request.description}
            </Text>
            <View style={styles.metaRow}>
              <Text selectable style={styles.metaText}>
                {request.category}
              </Text>
              <Text selectable style={styles.metaText}>
                {request.area}
              </Text>
              <Text selectable style={styles.metaText}>
                Needed by {request.needed_by}
              </Text>
            </View>
            <View style={styles.signalRow}>
              <Text selectable style={styles.signalText}>
                {request.interestCount} interested
              </Text>
              <Text selectable style={styles.signalText}>
                {request.offerCount} offers
              </Text>
            </View>
          </AppCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  milestoneCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  milestoneText: {
    color: colors.card,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  milestoneDetail: {
    color: colors.sand,
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
  urgency: {
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
});
