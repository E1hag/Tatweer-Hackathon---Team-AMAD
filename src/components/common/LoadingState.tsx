import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, radius, sizes, spacing } from '@/constants/theme';
import AppCard from '@/components/common/AppCard';

interface LoadingStateProps {
  count?: number;
}

export default function LoadingState({ count = 3 }: LoadingStateProps) {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: sizes.animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: sizes.animationDuration,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <AppCard key={index} style={styles.card}>
          <Animated.View style={[styles.row, { opacity }]}>
            <View style={styles.smallPill} />
            <View style={styles.badge} />
          </Animated.View>
          <Animated.View style={[styles.title, { opacity }]} />
          <Animated.View style={[styles.line, { opacity }]} />
          <Animated.View style={[styles.shortLine, { opacity }]} />
          <Animated.View style={[styles.button, { opacity }]} />
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallPill: {
    width: spacing.xxl + spacing.lg,
    height: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  badge: {
    width: spacing.xl + spacing.md,
    height: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    width: '75%',
    height: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  line: {
    width: '100%',
    height: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  shortLine: {
    width: '55%',
    height: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  button: {
    height: spacing.xl + spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
});
