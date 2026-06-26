import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../constants/theme';
import AppCard from './AppCard';

export default function EmptyState({ title, message }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.dot} />
      <Text selectable style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text selectable style={styles.message}>
          {message}
        </Text>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  message: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
});
