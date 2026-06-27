import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EyeIcon } from '@/components/icons';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { signUp } from '@/services/auth';
import type { AuthStackParamList } from '@/types/navigation';
import { authStyles } from '@/screens/auth/AuthStyles';
import { isValidEmail, mapAuthError } from '@/screens/auth/authHelpers';

type Navigation = NativeStackNavigationProp<AuthStackParamList>;
type SignupRole = 'resident' | 'business';

export default function SignupScreen() {
  const navigation = useNavigation<Navigation>();
  const { refreshProfile } = useAuth();
  const [role, setRole] = useState<SignupRole>('resident');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameError = fullName.trim().length === 0 ? 'Your name is required.' : null;
  const emailError = !isValidEmail(email) ? 'Enter a valid email address.' : null;
  const passwordError = password.length < 6 ? 'Password must be at least 6 characters.' : null;
  const areaError = area.trim().length === 0 ? 'Area is required.' : null;
  const businessError =
    role === 'business' && businessName.trim().length === 0 ? 'Business name is required.' : null;
  const valid = !nameError && !emailError && !passwordError && !areaError && !businessError;
  const showErrors = touched || fullName.length > 0 || email.length > 0 || password.length > 0;

  const submit = useCallback(async () => {
    setTouched(true);
    if (!valid) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        area: area.trim(),
        phone: phone.trim() || undefined,
        businessName: role === 'business' ? businessName.trim() : undefined,
      });
      await refreshProfile();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setSuccessMessage('Account created - please log in.');
        navigation.navigate('Login');
      }
    } catch (errorObject) {
      setError(mapAuthError(errorObject instanceof Error ? errorObject.message : 'Unable to create account.'));
    } finally {
      setSubmitting(false);
    }
  }, [area, businessName, email, fullName, navigation, password, phone, refreshProfile, role, valid]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={authStyles.safeArea}
    >
      <ScrollView contentContainerStyle={authStyles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={authStyles.title}>Create your account</Text>
          <Text style={authStyles.subtitle}>Choose how you will use Mawjood.</Text>
        </View>

        <View style={styles.roleRow}>
          <RoleCard
            accent={colors.primary}
            label="I'm a resident"
            onPress={() => setRole('resident')}
            selected={role === 'resident'}
          />
          <RoleCard
            accent={colors.terracotta}
            label="I'm a business"
            onPress={() => setRole('business')}
            selected={role === 'business'}
          />
        </View>

        <Field label="Your name" onBlur={() => setTouched(true)} onChangeText={setFullName} value={fullName} />
        {showErrors && nameError ? <Text style={authStyles.error}>{nameError}</Text> : null}

        <View style={authStyles.field}>
          <Text style={authStyles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={() => setTouched(true)}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            style={authStyles.input}
            value={email}
          />
          {showErrors && emailError ? <Text style={authStyles.error}>{emailError}</Text> : null}
        </View>

        <View style={authStyles.field}>
          <Text style={authStyles.label}>Password</Text>
          <View style={authStyles.passwordRow}>
            <TextInput
              onBlur={() => setTouched(true)}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              style={authStyles.passwordInput}
              value={password}
            />
            <Pressable
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              onPress={() => setShowPassword((current) => !current)}
              style={authStyles.iconButton}
            >
              <EyeIcon color={colors.textMuted} size={typography.sizes.lg} />
            </Pressable>
          </View>
          <Text style={authStyles.helper}>Password must be at least 6 characters.</Text>
          {showErrors && passwordError ? <Text style={authStyles.error}>{passwordError}</Text> : null}
        </View>

        <Field
          label="Area"
          onBlur={() => setTouched(true)}
          onChangeText={setArea}
          placeholder="e.g. Al Qua'a North"
          value={area}
        />
        {showErrors && areaError ? <Text style={authStyles.error}>{areaError}</Text> : null}

        {role === 'business' ? (
          <>
            <Field
              label="Business name"
              onBlur={() => setTouched(true)}
              onChangeText={setBusinessName}
              value={businessName}
            />
            {showErrors && businessError ? <Text style={authStyles.error}>{businessError}</Text> : null}
          </>
        ) : null}

        <Field
          keyboardType="phone-pad"
          label="Phone (optional)"
          onChangeText={setPhone}
          value={phone}
        />

        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting || !valid }}
          disabled={submitting || !valid}
          onPress={submit}
          style={[authStyles.primaryButton, (submitting || !valid) && authStyles.buttonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={authStyles.primaryText}>Create account</Text>
          )}
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')}>
          <Text style={authStyles.footerLink}>Already have an account? Log in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={authStyles.field}>
      <Text style={authStyles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={authStyles.input}
        value={value}
      />
    </View>
  );
}

function RoleCard({
  label,
  selected,
  accent,
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.roleCard, selected && { borderColor: accent, backgroundColor: colors.surfaceMuted }]}
    >
      <Text style={[styles.roleText, selected && { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleCard: {
    flex: 1,
    minHeight: spacing.xxl,
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  roleText: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  success: {
    color: colors.success,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
});
