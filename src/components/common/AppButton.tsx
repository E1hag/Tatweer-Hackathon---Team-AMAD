import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface AppButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export default function AppButton({
  children,
  onPress,
  variant = 'primary',
  style,
}: AppButtonProps) {
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
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: sizes.borderWidth,
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
