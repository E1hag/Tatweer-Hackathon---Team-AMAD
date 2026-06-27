import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EyeIcon } from '@/components/icons';
import { colors, typography } from '@/constants/theme';
import { signIn } from '@/services/auth';
import type { AuthStackParamList } from '@/types/navigation';
import { authStyles } from '@/screens/auth/AuthStyles';
import { isValidEmail, mapAuthError } from '@/screens/auth/authHelpers';

type Navigation = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Navigation>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = !isValidEmail(email) ? 'Enter a valid email address.' : null;
  const passwordError = password.length === 0 ? 'Password is required.' : null;
  const valid = !emailError && !passwordError;
  const showErrors = touched || email.length > 0 || password.length > 0;

  const submit = useCallback(async () => {
    setTouched(true);
    if (!valid) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (errorObject) {
      setError(mapAuthError(errorObject instanceof Error ? errorObject.message : 'Unable to log in.'));
    } finally {
      setSubmitting(false);
    }
  }, [email, password, valid]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={authStyles.safeArea}
    >
      <ScrollView contentContainerStyle={authStyles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={authStyles.title}>Welcome back</Text>
          <Text style={authStyles.subtitle}>Log in to continue to Mawjood.</Text>
        </View>

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
          {showErrors && passwordError ? <Text style={authStyles.error}>{passwordError}</Text> : null}
        </View>

        {error ? <Text style={authStyles.error}>{error}</Text> : null}

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
            <Text style={authStyles.primaryText}>Log in</Text>
          )}
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Signup')}>
          <Text style={authStyles.footerLink}>No account? Create one</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
