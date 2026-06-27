import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface AppButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export default function AppButton({
  children,
  disabled = false,
  onPress,
  variant = 'primary',
  style,
}: AppButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, isSecondary && styles.secondaryButton, disabled && styles.disabled, style]}
    >
      <Text style={[styles.text, isSecondary && styles.secondaryText, disabled && styles.disabledText]}>
        {children}
      </Text>
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
  disabled: {
    opacity: sizes.disabledOpacity,
  },
  text: {
    color: colors.card,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondaryText: {
    color: colors.primaryDark,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
