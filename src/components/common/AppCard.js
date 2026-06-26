import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../constants/theme';

export default function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    boxShadow: '0 1px 3px rgba(31, 77, 58, 0.07)',
  },
});
