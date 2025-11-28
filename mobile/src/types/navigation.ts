import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  UserType: undefined;
};

// Customer Tab Parameter List
export type CustomerTabParamList = {
  Home: undefined;
  Artisans: undefined;
  Cart: undefined;
  Profile: undefined;
};

// Seller Tab Parameter List
export type SellerTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Profile: undefined;
};

// Artisan Tab Parameter List
export type ArtisanTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Jobs: undefined;
  Profile: undefined;
};

// Main Stack Parameter List
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<CustomerTabParamList | SellerTabParamList | ArtisanTabParamList>;
  ProductDetail: { productId: string };
  ServiceRequest: { artisanId: string };
  Chat: { roomId: string; recipientName: string };
  Notifications: undefined;
};

// Root Stack Parameter List
export type RootStackParamList = AuthStackParamList & MainStackParamList;

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> = BottomTabScreenProps<
  CustomerTabParamList,
  T
>;

export type SellerTabScreenProps<T extends keyof SellerTabParamList> = BottomTabScreenProps<
  SellerTabParamList,
  T
>;

export type ArtisanTabScreenProps<T extends keyof ArtisanTabParamList> = BottomTabScreenProps<
  ArtisanTabParamList,
  T
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Navigation Declaration for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
