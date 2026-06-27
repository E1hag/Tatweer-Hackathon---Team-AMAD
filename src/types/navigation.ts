import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  BusinessMain: NavigatorScreenParams<BusinessTabParamList> | undefined;
  Auth: undefined;
  CreateRequest: { prefillTitle?: string } | undefined;
  RequestDetails: { requestId: string };
  BusinessRequestDetails: { requestId: string };
  BusinessOfferDetails: { offerId: string };
  CreateOffer: { requestId: string };
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

export type BusinessTabParamList = {
  BusinessHome: undefined;
  DemandBoard: undefined;
  MyOffers: undefined;
  BusinessProfile: undefined;
};
