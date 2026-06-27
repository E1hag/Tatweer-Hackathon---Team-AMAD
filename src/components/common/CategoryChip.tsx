import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: 'filter' | 'label';
}

export default function CategoryChip({
  label,
  selected,
  onPress,
  variant = 'filter',
}: CategoryChipProps) {
  if (variant === 'label') {
    return <Text style={styles.labelText}>{label}</Text>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.selectedChip : styles.unselectedChip]}
    >
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.chipMinHeight,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: sizes.borderWidth,
    borderRadius: radius.full,
  },
  selectedChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  unselectedChip: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  selectedText: {
    color: colors.surface,
  },
  unselectedText: {
    color: colors.textMuted,
  },
  labelText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
