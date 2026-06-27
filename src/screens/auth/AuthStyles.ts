import { StyleSheet } from 'react-native';

import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';

export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  input: {
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: typography.sizes.md,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  iconButton: {
    minWidth: spacing.xxl,
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  primaryButton: {
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.terracotta,
  },
  secondaryButton: {
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: sizes.borderWidth,
    borderColor: colors.terracotta,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    opacity: sizes.disabledOpacity,
  },
  primaryText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  secondaryText: {
    color: colors.terracotta,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  footerLink: {
    color: colors.terracotta,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
