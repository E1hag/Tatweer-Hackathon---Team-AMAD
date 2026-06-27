import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

export default function AppTextInput({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.primaryDark,
    backgroundColor: colors.card,
    fontSize: typography.sizes.md,
  },
});
