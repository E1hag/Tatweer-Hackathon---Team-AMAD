import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';

interface MeTooSheetProps {
  visible: boolean;
  requestTitle: string;
  initialQuantity?: string;
  initialNeededBy?: string;
  initialNote?: string;
  joined: boolean;
  submitting: boolean;
  serverError?: string | null;
  onSubmit: (quantity: string, neededBy: string, note: string) => void;
  onLeave: () => void;
  onClose: () => void;
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidFutureDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  return value >= getTodayDate();
}

export default function MeTooSheet({
  visible,
  requestTitle,
  initialQuantity,
  initialNeededBy,
  initialNote,
  joined,
  submitting,
  serverError,
  onSubmit,
  onLeave,
  onClose,
}: MeTooSheetProps) {
  const [quantity, setQuantity] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setQuantity(initialQuantity ?? '');
        setNeededBy(initialNeededBy ?? '');
        setNote(initialNote ?? '');
        setTouched(false);
      });

      return () => {
        clearTimeout(timer);
      };
    }

    return undefined;
  }, [initialNeededBy, initialNote, initialQuantity, visible]);

  const quantityError = quantity.trim().length === 0 ? 'Amount needed is required.' : null;
  const dateError = !isValidFutureDate(neededBy)
    ? 'Enter a real date in YYYY-MM-DD format that is not in the past.'
    : null;
  const isValid = !quantityError && !dateError;

  const showErrors = touched || quantity.length > 0 || neededBy.length > 0;

  const buttonLabel = useMemo(() => {
    if (submitting) {
      return '';
    }

    return joined ? 'Update' : 'Confirm';
  }, [joined, submitting]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>How much do you need?</Text>
              <Text numberOfLines={2} style={styles.subtitle}>
                {requestTitle}
              </Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Amount needed</Text>
            <TextInput
              onBlur={() => setTouched(true)}
              onChangeText={setQuantity}
              placeholder="e.g. 100kg, 3 bags, monthly"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={quantity}
            />
            {showErrors && quantityError ? <Text style={styles.error}>{quantityError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Needed by</Text>
            <TextInput
              keyboardType="numbers-and-punctuation"
              onBlur={() => setTouched(true)}
              onChangeText={setNeededBy}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={neededBy}
            />
            <Text style={styles.helper}>Format: YYYY-MM-DD</Text>
            {showErrors && dateError ? <Text style={styles.error}>{dateError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Anything else? (optional)</Text>
            <TextInput
              multiline
              onChangeText={setNote}
              placeholder="Add a private note"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.noteInput]}
              textAlignVertical="top"
              value={note}
            />
          </View>

          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting || !isValid }}
            disabled={submitting || !isValid}
            onPress={() => {
              setTouched(true);
              if (isValid) {
                onSubmit(quantity.trim(), neededBy, note.trim());
              }
            }}
            style={[styles.primaryButton, (submitting || !isValid) && styles.disabled]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryText}>{buttonLabel}</Text>
            )}
          </Pressable>

          {joined ? (
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={onLeave}
              style={styles.leaveButton}
            >
              <Text style={styles.leaveText}>Leave this request</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    gap: spacing.md,
    padding: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  cancelButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
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
  noteInput: {
    minHeight: spacing.xxl + spacing.lg,
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.xs,
  },
  primaryButton: {
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: sizes.disabledOpacity,
  },
  primaryText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  leaveButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  leaveText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
