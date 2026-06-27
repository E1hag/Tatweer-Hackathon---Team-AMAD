import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, sizes, spacing } from '@/constants/theme';

interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export default function AppCard({ children, style, onPress }: AppCardProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: sizes.shadowOffsetHeight },
    shadowOpacity: sizes.shadowOpacity,
    shadowRadius: sizes.shadowRadius,
    elevation: sizes.elevation,
  },
  pressed: {
    opacity: sizes.pressedOpacity,
  },
});
