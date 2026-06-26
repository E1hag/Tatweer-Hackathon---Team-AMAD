import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import { demoUsers } from './src/constants/demoUsers';
import { colors, radius, spacing, typography } from './src/constants/theme';

export default function App() {
  const [currentUser, setCurrentUser] = useState(demoUsers[0]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <Text selectable style={styles.userLabel}>
              Current demo user
            </Text>
            <Text selectable style={styles.userRole}>
              {currentUser.role.replace('_', ' ')}
            </Text>
          </View>
          <Text selectable style={styles.userName}>
            {currentUser.name}
          </Text>
          <Text selectable style={styles.userArea}>
            {currentUser.area}
          </Text>
          <View style={styles.roleSwitcher}>
            {demoUsers.map((user) => {
              const isActive = user.id === currentUser.id;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  key={user.id}
                  onPress={() => setCurrentUser(user)}
                  style={[styles.roleButton, isActive && styles.roleButtonActive]}
                >
                  <Text style={[styles.roleButtonText, isActive && styles.roleButtonTextActive]}>
                    {user.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <HomeScreen currentUser={currentUser} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  userCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    boxShadow: '0 1px 3px rgba(31, 77, 58, 0.08)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  userLabel: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
  },
  userRole: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
  userName: {
    color: colors.primaryDark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  userArea: {
    color: colors.muted,
    fontSize: typography.sizes.md,
  },
  roleSwitcher: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  roleButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.sand,
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  roleButtonTextActive: {
    color: colors.card,
  },
});
