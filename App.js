import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import BusinessOffersScreen from './src/screens/BusinessOffersScreen';
import { demoUsers } from './src/constants/demoUsers';
import { colors, radius, spacing, typography } from './src/constants/theme';

const screens = [
  { key: 'home', label: 'Home' },
  { key: 'business', label: 'Business' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(demoUsers[0]);
  const [activeScreen, setActiveScreen] = useState('home');

  return (
    <SafeAreaProvider>
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

          <View style={styles.screenSwitcher}>
            {screens.map((screen) => {
              const isActive = activeScreen === screen.key;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  key={screen.key}
                  onPress={() => setActiveScreen(screen.key)}
                  style={[styles.screenButton, isActive && styles.screenButtonActive]}
                >
                  <Text style={[styles.screenButtonText, isActive && styles.screenButtonTextActive]}>
                    {screen.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {activeScreen === 'business' ? (
            <BusinessOffersScreen currentUser={currentUser} />
          ) : (
            <HomeScreen currentUser={currentUser} />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
  screenSwitcher: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.sand,
  },
  screenButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  screenButtonActive: {
    backgroundColor: colors.card,
  },
  screenButtonText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  screenButtonTextActive: {
    color: colors.primaryDark,
  },
});
