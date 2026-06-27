import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/common/AppButton';
import AppCard from '../components/common/AppCard';
import AppTextInput from '../components/common/AppTextInput';
import ScreenHeader from '../components/common/ScreenHeader';
import { colors, radius, spacing, typography } from '../constants/theme';
import { supabase } from '../lib/supabase';

const roles = [
  { label: 'Resident', value: 'resident' },
  { label: 'Business', value: 'business' },
  { label: 'Aspiring business', value: 'aspiring_business' },
];

export default function AuthScreen({ onAuthChanged }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('resident');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isSignup = mode === 'signup';

  const saveProfile = async (userId) => {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        full_name: fullName.trim(),
        role,
        area: area.trim() || null,
        phone: phone.trim() || null,
      },
      { onConflict: 'id' }
    );

    return error;
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      setMessage('Add an email and password.');
      return;
    }
    if (isSignup && !fullName.trim()) {
      setMessage('Add your name before registering.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            area: area.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        const profileError = await saveProfile(data.user.id);
        if (profileError) {
          setMessage(`Account created, but profile save needs a Supabase policy update: ${profileError.message}`);
        } else {
          setMessage(data.session ? 'Account created and signed in.' : 'Account created. Check email confirmation if enabled.');
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setMessage('Signed in.');
    }

    await onAuthChanged();
    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isSignup ? 'Create account' : 'Login'}
        subtitle="Use Supabase auth for real accounts while keeping demo profiles available for hackathon testing."
      />

      <View style={styles.modeSwitcher}>
        {['login', 'signup'].map((nextMode) => {
          const isActive = mode === nextMode;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={nextMode}
              onPress={() => setMode(nextMode)}
              style={[styles.modeButton, isActive && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                {nextMode === 'login' ? 'Login' : 'Register'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {message ? (
        <AppCard style={styles.messageCard}>
          <Text selectable style={styles.messageText}>
            {message}
          </Text>
        </AppCard>
      ) : null}

      <AppCard>
        <AppTextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          value={email}
        />
        <AppTextInput
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          value={password}
        />

        {isSignup ? (
          <>
            <AppTextInput
              onChangeText={setFullName}
              placeholder="Full name"
              value={fullName}
            />
            <View style={styles.roleRow}>
              {roles.map((nextRole) => {
                const isActive = role === nextRole.value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    key={nextRole.value}
                    onPress={() => setRole(nextRole.value)}
                    style={[styles.roleChip, isActive && styles.roleChipActive]}
                  >
                    <Text style={[styles.roleText, isActive && styles.roleTextActive]}>
                      {nextRole.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <AppTextInput
              onChangeText={setArea}
              placeholder="Area"
              value={area}
            />
            <AppTextInput
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="Phone"
              value={phone}
            />
          </>
        ) : null}

        <AppButton disabled={isSubmitting} onPress={submit}>
          {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
        </AppButton>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  modeSwitcher: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.sand,
  },
  modeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  modeButtonActive: {
    backgroundColor: colors.card,
  },
  modeText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  modeTextActive: {
    color: colors.text,
  },
  messageCard: {
    borderColor: colors.primary,
    backgroundColor: colors.sand,
  },
  messageText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  roleChip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  roleTextActive: {
    color: colors.card,
  },
});
