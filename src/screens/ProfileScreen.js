import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppButton from '../components/common/AppButton';
import AppCard from '../components/common/AppCard';
import AppTextInput from '../components/common/AppTextInput';
import EmptyState from '../components/common/EmptyState';
import ScreenHeader from '../components/common/ScreenHeader';
import { colors, radius, spacing, typography } from '../constants/theme';
import { supabase } from '../lib/supabase';

const roles = [
  { label: 'Resident', value: 'resident' },
  { label: 'Business', value: 'business' },
  { label: 'Aspiring business', value: 'aspiring_business' },
];

function profileFromSession(session, authProfile) {
  const metadata = session?.user?.user_metadata || {};

  return {
    full_name: authProfile?.full_name || metadata.full_name || '',
    role: authProfile?.role || metadata.role || 'resident',
    area: authProfile?.area || metadata.area || '',
    phone: authProfile?.phone || metadata.phone || '',
  };
}

export default function ProfileScreen({ authProfile, onAuthChanged, session }) {
  const [form, setForm] = useState(profileFromSession(session, authProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setForm(profileFromSession(session, authProfile));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [authProfile, session]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = async () => {
    if (!session?.user?.id) return;
    if (!form.full_name.trim()) {
      setMessage('Add a name before saving.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    const { error } = await supabase.from('profiles').upsert(
      {
        id: session.user.id,
        full_name: form.full_name.trim(),
        role: form.role,
        area: form.area.trim() || null,
        phone: form.phone.trim() || null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setMessage('Profile saved.');
    await onAuthChanged();
    setIsSaving(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await onAuthChanged();
    setMessage('Signed out.');
  };

  if (!session) {
    return (
      <EmptyState
        title="Login to edit your profile"
        message="Create an account or login from the Auth tab to manage a real Supabase profile."
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Profile"
        subtitle={session.user.email}
      />

      {message ? (
        <AppCard style={styles.messageCard}>
          <Text selectable style={styles.messageText}>
            {message}
          </Text>
        </AppCard>
      ) : null}

      <AppCard>
        <Text selectable style={styles.sectionTitle}>
          Account details
        </Text>
        <AppTextInput
          onChangeText={(value) => updateField('full_name', value)}
          placeholder="Full name"
          value={form.full_name}
        />
        <View style={styles.roleRow}>
          {roles.map((role) => {
            const isActive = form.role === role.value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={role.value}
                onPress={() => updateField('role', role.value)}
                style={[styles.roleChip, isActive && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, isActive && styles.roleTextActive]}>
                  {role.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <AppTextInput
          onChangeText={(value) => updateField('area', value)}
          placeholder="Area"
          value={form.area}
        />
        <AppTextInput
          keyboardType="phone-pad"
          onChangeText={(value) => updateField('phone', value)}
          placeholder="Phone"
          value={form.phone}
        />
        <AppButton disabled={isSaving} onPress={saveProfile}>
          {isSaving ? 'Saving...' : 'Save profile'}
        </AppButton>
        <AppButton onPress={signOut} variant="secondary">
          Sign out
        </AppButton>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
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
