import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppCard from '@/components/common/AppCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';
import RequestCard from '@/components/common/RequestCard';
import { colors, fonts, radius, sizes, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import type { RequestSummary } from '@/types/database';
import type { RootStackParamList } from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function RequestsScreen() {
  const navigation = useNavigation<Navigation>();
  const { userId } = useAuth();
  const {
    userInterests,
    loading,
    refreshing,
    error,
    searchQuery,
    filteredRequests,
    trendingRequests,
    recentRequests,
    noMatches,
    setSearchQuery,
    refresh,
  } = useRequests(userId);

  const searchIsActive = searchQuery.trim().length > 0;
  const listData = searchIsActive ? filteredRequests : recentRequests;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const renderRequestCard = useCallback(
    ({ item }: { item: RequestSummary }) => (
      <View style={styles.itemWrap}>
        <RequestCard
          joined={userInterests.includes(item.id)}
          onMeToo={() => undefined}
          onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
          request={item}
        />
      </View>
    ),
    [navigation, userInterests]
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View>
        <View style={styles.searchWrap}>
          <TextInput
            clearButtonMode="while-editing"
            onChangeText={setSearchQuery}
            placeholder="Search requests..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />
        </View>

        {noMatches ? (
          <View style={styles.promptWrap}>
            <AppCard style={styles.promptCard}>
              <Text style={styles.promptTitle}>
                {'No requests match "'}
                {searchQuery.trim()}
                {'".'}
              </Text>
              <Text style={styles.promptSubtitle}>Be the first to request it.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate('CreateRequest', { prefillTitle: searchQuery.trim() })
                }
                style={styles.promptButton}
              >
                <Text style={styles.promptButtonText}>Request this item</Text>
              </Pressable>
            </AppCard>
          </View>
        ) : null}

        {!searchIsActive && trendingRequests.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending needs</Text>
              <Text style={styles.sectionCount}>{trendingRequests.length} requests</Text>
            </View>
            <View style={styles.trendingList}>
              {trendingRequests.map((request) => (
                <RequestCard
                  joined={userInterests.includes(request.id)}
                  key={request.id}
                  onMeToo={() => undefined}
                  onPress={() => navigation.navigate('RequestDetails', { requestId: request.id })}
                  request={request}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchIsActive ? 'Search results' : 'Recent requests'}
          </Text>
          <Text style={styles.sectionCount}>
            {searchIsActive
              ? `${filteredRequests.length} found`
              : `${recentRequests.length} requests`}
          </Text>
        </View>
      </View>
    ),
    [
      filteredRequests.length,
      navigation,
      noMatches,
      recentRequests.length,
      searchIsActive,
      searchQuery,
      setSearchQuery,
      trendingRequests,
      userInterests,
    ]
  );

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyInset}>
          <LoadingState count={3} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    if (searchIsActive) {
      return <EmptyState subtitle="Try a different search term." title="No results" />;
    }

    return (
      <EmptyState
        subtitle="Be the first to post a local need."
        title="Nothing here yet"
      />
    );
  }, [error, loading, refresh, searchIsActive]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Text style={styles.appName}>Mawjood</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.location}>{"Al Qua'a"}</Text>
        </View>
      </View>

      <FlatList
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.content}
        data={listData}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
        renderItem={renderRequestCard}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  appName: {
    color: colors.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: sizes.dot,
    height: sizes.dot,
    marginRight: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.textMuted,
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  searchInput: {
    minHeight: spacing.xxl,
    color: colors.text,
    fontSize: typography.sizes.md,
  },
  promptWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  promptCard: {
    gap: spacing.sm,
  },
  promptTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  promptSubtitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  promptButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  promptButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  trendingList: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  itemWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyInset: {
    paddingHorizontal: spacing.lg,
  },
  errorWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
