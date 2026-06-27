import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, HeartIcon, PlusIcon } from '@/components/icons';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface MeTooButtonProps {
  joined: boolean;
  count: number;
  loading: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export default function MeTooButton({
  joined,
  count,
  loading,
  onPress,
  disabled,
}: MeTooButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, selected: joined }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        joined ? styles.joined : styles.notJoined,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={joined ? colors.surface : colors.primary} />
      ) : (
        <View style={styles.content}>
          {joined ? (
            <CheckIcon color={colors.surface} size={typography.sizes.sm} />
          ) : (
            <PlusIcon color={colors.primary} size={typography.sizes.sm} />
          )}
          <HeartIcon
            color={joined ? colors.surface : colors.primary}
            filled={joined}
            size={typography.sizes.md}
          />
          <Text style={[styles.text, joined ? styles.joinedText : styles.notJoinedText]}>
            {joined ? 'Joined' : 'Me Too'}
          </Text>
          <Text style={[styles.text, joined ? styles.joinedText : styles.notJoinedText]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.buttonMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: sizes.thickBorderWidth,
    borderRadius: radius.full,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  joined: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  notJoined: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: sizes.mutedOpacity,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  joinedText: {
    color: colors.surface,
  },
  notJoinedText: {
    color: colors.primary,
  },
});
