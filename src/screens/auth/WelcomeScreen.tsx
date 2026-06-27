import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, spacing, typography } from '@/constants/theme';
import type { AuthStackParamList } from '@/types/navigation';
import { authStyles } from '@/screens/auth/AuthStyles';

type Navigation = NativeStackNavigationProp<AuthStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <SafeAreaView style={authStyles.safeArea} edges={['left', 'right']}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Mawjood</Text>
        <Text style={styles.tagline}>Real local requests. Real first customers.</Text>
      </View>
      <View style={authStyles.content}>
        <Text style={authStyles.subtitle}>
          Join your local board to request what you need, respond to demand, and build real community supply.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Login')}
          style={authStyles.primaryButton}
        >
          <Text style={authStyles.primaryText}>Log in</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Signup')}
          style={authStyles.secondaryButton}
        >
          <Text style={authStyles.secondaryText}>Create account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.terracotta,
  },
  appName: {
    color: colors.surface,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  tagline: {
    color: colors.heroTextMuted,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontStyle: 'italic',
  },
});
