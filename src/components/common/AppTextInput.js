import { StyleSheet, TextInput } from 'react-native';

import { colors, radius, spacing, typography } from '../../constants/theme';

export default function AppTextInput({ style, ...props }) {
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
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.primaryDark,
    backgroundColor: colors.card,
    fontSize: typography.sizes.md,
  },
});
