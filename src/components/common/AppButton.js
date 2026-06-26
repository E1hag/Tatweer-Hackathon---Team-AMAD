import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

export default function AppButton({ children, onPress, variant = 'primary', style }) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, isSecondary && styles.secondaryButton, style]}
    >
      <Text style={[styles.text, isSecondary && styles.secondaryText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sand,
  },
  text: {
    color: colors.card,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondaryText: {
    color: colors.primaryDark,
  },
});
