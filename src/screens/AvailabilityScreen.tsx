import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import EmptyState from '@/components/common/EmptyState';
import ScreenHeader from '@/components/common/ScreenHeader';
import { colors } from '@/constants/theme';

export default function AvailabilityScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScreenHeader
        subtitle="Local businesses responding to community demand"
        title="Available Now"
      />
      <View style={styles.content}>
        <EmptyState
          subtitle="Businesses are responding to community demand. Check back soon."
          title="Coming Soon"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
