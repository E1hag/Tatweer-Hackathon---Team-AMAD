import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import AppCard from '@/components/common/AppCard';
import CategoryChip from '@/components/common/CategoryChip';
import { CATEGORIES } from '@/constants/categories';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { createRequest, searchSimilarRequests } from '@/services/requests';
import type { RequestSummary, RequestUrgency } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';

type RouteProps = NativeStackScreenProps<RootStackParamList, 'CreateRequest'>['route'];
type Navigation = NativeStackNavigationProp<RootStackParamList>;

const URGENCY_OPTIONS: { label: string; value: RequestUrgency }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this_week' },
  { label: 'Flexible', value: 'flexible' },
];

export default function CreateRequestScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Navigation>();
  const { userId } = useAuth();
  const [title, setTitle] = useState(route.params?.prefillTitle ?? '');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<RequestUrgency>('flexible');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [similarRequests, setSimilarRequests] = useState<RequestSummary[]>([]);
  const [checkingSimilar, setCheckingSimilar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = title.trim().length > 0 && category.length > 0 && area.trim().length > 0;

  const visibleSimilarRequests = useMemo(() => similarRequests.slice(0, 3), [similarRequests]);

  const checkSimilar = useCallback(async () => {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3) {
      setSimilarRequests([]);
      return;
    }

    setCheckingSimilar(true);
    try {
      const matches = await searchSimilarRequests(trimmedTitle, category || undefined);
      setSimilarRequests(matches);
    } finally {
      setCheckingSimilar(false);
    }
  }, [category, title]);

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      Alert.alert('Sign in required', 'You need to be signed in to post a request.');
      return;
    }

    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      await createRequest(
        {
          title: title.trim(),
          category,
          area: area.trim(),
          description: description.trim() || undefined,
          urgency,
          is_anonymous: isAnonymous,
        },
        userId
      );
      Alert.alert('Request posted');
      navigation.navigate('Main');
    } catch (errorObject) {
      Alert.alert(
        'Unable to post request',
        errorObject instanceof Error ? errorObject.message : 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }, [area, category, description, isAnonymous, isValid, navigation, title, urgency, userId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.safeArea}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>What do you need?</Text>
          <TextInput
            onBlur={checkSimilar}
            onChangeText={setTitle}
            placeholder="e.g. Camel feed bags"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={title}
          />
          <Text style={styles.helper}>Just the item or service - you will set your own amount next.</Text>
        </View>

        {checkingSimilar ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {visibleSimilarRequests.length > 0 ? (
          <AppCard style={styles.similarBlock}>
            <Text style={styles.similarTitle}>Similar requests already exist:</Text>
            {visibleSimilarRequests.map((request) => (
              <Pressable
                accessibilityRole="button"
                key={request.id}
                onPress={() => navigation.navigate('RequestDetails', { requestId: request.id })}
                style={styles.similarRow}
              >
                <Text numberOfLines={1} style={styles.similarRequestTitle}>
                  {request.title}
                </Text>
                <Text style={styles.similarCount}>{request.interest_count} joined</Text>
              </Pressable>
            ))}
            <Text style={styles.helper}>Still different? Continue below.</Text>
          </AppCard>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillRow}>
              {CATEGORIES.map((item) => (
                <CategoryChip
                  key={item}
                  label={item}
                  onPress={() => setCategory(item)}
                  selected={category === item}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Where?</Text>
          <TextInput
            onChangeText={setArea}
            placeholder="e.g. Al Qua'a North"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={area}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Add details (optional)</Text>
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Add context that helps neighbors understand the need"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={description}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Urgency</Text>
          <View style={styles.pillRow}>
            {URGENCY_OPTIONS.map((option) => (
              <CategoryChip
                key={option.value}
                label={option.label}
                onPress={() => setUrgency(option.value)}
                selected={urgency === option.value}
              />
            ))}
          </View>
        </View>

        <AppCard style={styles.anonymousCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.label}>Post anonymously</Text>
              <Text style={styles.helper}>Your name is hidden from other residents.</Text>
            </View>
            <Switch
              onValueChange={setIsAnonymous}
              thumbColor={colors.surface}
              trackColor={{ false: colors.border, true: colors.primary }}
              value={isAnonymous}
            />
          </View>
        </AppCard>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting || !isValid }}
          disabled={submitting || !isValid}
          onPress={handleSubmit}
          style={[styles.submitButton, (submitting || !isValid) && styles.disabled]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitText}>Post request</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  textArea: {
    minHeight: spacing.xxl + spacing.xl,
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.sm,
  },
  inlineLoading: {
    alignItems: 'flex-start',
  },
  similarBlock: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  similarTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  similarRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: sizes.borderWidth,
    borderBottomColor: colors.border,
  },
  similarRequestTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  similarCount: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  anonymousCard: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchText: {
    flex: 1,
    gap: spacing.xs,
  },
  submitButton: {
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: sizes.disabledOpacity,
  },
  submitText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
