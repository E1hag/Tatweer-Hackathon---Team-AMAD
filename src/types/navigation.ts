import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Auth: undefined;
  CreateRequest: { prefillTitle?: string } | undefined;
  RequestDetails: { requestId: string };
  BusinessPlaceholder: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  MyOrders: undefined;
  Profile: undefined;
};
