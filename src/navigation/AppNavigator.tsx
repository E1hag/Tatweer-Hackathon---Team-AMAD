import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BoxIcon, ClipboardIcon, HomeIcon, PersonIcon } from '@/components/icons';
import { colors, fonts, sizes, typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import BusinessPlaceholderScreen from '@/screens/BusinessPlaceholderScreen';
import CreateRequestScreen from '@/screens/CreateRequestScreen';
import HomeScreen from '@/screens/HomeScreen';
import MyOrdersScreen from '@/screens/MyOrdersScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import RequestDetailsScreen from '@/screens/RequestDetailsScreen';
import RequestsScreen from '@/screens/RequestsScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import type {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '@/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={WelcomeScreen} name="Welcome" />
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={SignupScreen} name="Signup" />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        component={HomeScreen}
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={sizes.tabIcon} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        component={RequestsScreen}
        name="Requests"
        options={{
          tabBarIcon: ({ color }) => <ClipboardIcon color={color} size={sizes.tabIcon} />,
          tabBarLabel: 'Requests',
        }}
      />
      <Tab.Screen
        component={MyOrdersScreen}
        name="MyOrders"
        options={{
          tabBarIcon: ({ color }) => <BoxIcon color={color} size={sizes.tabIcon} />,
          tabBarLabel: 'My Orders',
        }}
      />
      <Tab.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          tabBarIcon: ({ color }) => <PersonIcon color={color} size={sizes.tabIcon} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function ResidentStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen component={MainTabs} name="Main" options={{ headerShown: false }} />
      <Stack.Screen
        component={CreateRequestScreen}
        name="CreateRequest"
        options={{ title: 'New request' }}
      />
      <Stack.Screen
        component={RequestDetailsScreen}
        name="RequestDetails"
        options={{ title: 'Request' }}
      />
    </Stack.Navigator>
  );
}

function BusinessStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      {/* TODO: replace BusinessPlaceholder with partner's BusinessHome route once merged. */}
      <Stack.Screen
        component={BusinessPlaceholderScreen}
        name="BusinessPlaceholder"
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.terracotta,
  headerTitleStyle: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
} as const;

export default function AppNavigator() {
  const { userId, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingShell}>
        <ActivityIndicator color={colors.terracotta} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!userId ? (
        <AuthNavigator />
      ) : profile?.role === 'business' ? (
        <BusinessStack />
      ) : (
        <ResidentStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tabLabel: {
    fontFamily: fonts.sans,
    fontSize: typography.sizes.xs,
  },
  tabBar: {
    height: sizes.tabBarHeight,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
});
