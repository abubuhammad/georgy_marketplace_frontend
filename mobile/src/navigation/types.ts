import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { userType?: 'customer' | 'artisan' };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Customer Tab Navigator
export type CustomerTabParamList = {
  Home: undefined;
  Services: undefined;
  Requests: undefined;
  Chat: undefined;
  Profile: undefined;
};

// Artisan Tab Navigator
export type ArtisanTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Calendar: undefined;
  Earnings: undefined;
  Profile: undefined;
};

// Main App Stack
export type AppStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  ArtisanTabs: NavigatorScreenParams<ArtisanTabParamList>;
  
  // Shared screens
  ServiceDetails: { serviceId: string };
  ServiceRequest: { artisanId?: string; categoryId?: string };
  ArtisanProfile: { artisanId: string };
  ChatConversation: { conversationId: string; recipientName: string };
  JobDetails: { jobId: string };
  Payment: { jobId: string; amount: number };
  Review: { jobId: string; targetUserId: string };
  Settings: undefined;
  Notifications: undefined;
  Help: undefined;
  Legal: { type: 'terms' | 'privacy' | 'disclaimer' };
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> = BottomTabScreenProps<
  CustomerTabParamList,
  T
>;

export type ArtisanTabScreenProps<T extends keyof ArtisanTabParamList> = BottomTabScreenProps<
  ArtisanTabParamList,
  T
>;

export type AppScreenProps<T extends keyof AppStackParamList> = StackScreenProps<
  AppStackParamList,
  T
>;

// Navigation Props
export type RootNavigationProp = any; // Will be properly typed with navigation container
