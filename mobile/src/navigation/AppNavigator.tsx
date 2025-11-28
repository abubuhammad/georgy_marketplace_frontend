import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/theme';

// Auth Screens (existing)
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { UserTypeScreen } from '../screens/auth/UserTypeScreen';

// Customer Screens (existing)
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { CustomerProfileScreen } from '../screens/customer/CustomerProfileScreen';
import { ArtisanDiscoveryScreen } from '../screens/customer/ArtisanDiscoveryScreen';
import { ServiceRequestScreen } from '../screens/customer/ServiceRequestScreen';
import { ServiceRequestFormScreen } from '../screens/customer/ServiceRequestFormScreen';
import { RequestDashboardScreen } from '../screens/customer/RequestDashboardScreen';
import QuoteComparisonScreen from '../screens/customer/QuoteComparisonScreen';
import JobDetailsScreen from '../screens/customer/JobDetailsScreen';
import EscrowPaymentScreen from '../screens/customer/EscrowPaymentScreen';

// ArtisanConnect Screens
import ArtisanConnectScreen from '../screens/ArtisanConnectScreen';
import ServiceCategoriesScreen from '../screens/artisan/ServiceCategoriesScreen';

// Artisan Screens
import { ArtisanDashboardScreen } from '../screens/artisan/ArtisanDashboardScreen';
import { ArtisanProfileScreen } from '../screens/artisan/ArtisanProfileScreen';
import { ArtisanRequestsScreen } from '../screens/artisan/ArtisanRequestsScreen';
import { ArtisanJobsScreen } from '../screens/artisan/ArtisanJobsScreen';
import { AnalyticsDashboardScreen } from '../screens/artisan/AnalyticsDashboardScreen';
import { JobProgressScreen } from '../screens/artisan/JobProgressScreen';

// Shared Screens
import ChatScreen from '../screens/shared/ChatScreen';
import ReviewsScreen from '../screens/shared/ReviewsScreen';
import TransactionHistoryScreen from '../screens/shared/TransactionHistoryScreen';

// Placeholder Components for missing screens
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Ionicons name="construct-outline" size={64} color={colors.primary} style={styles.placeholderIcon} />
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
    <Text style={styles.placeholderDescription}>
      We're working hard to bring you this feature. Stay tuned!
    </Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'ArtisanConnect') {
          iconName = focused ? 'construct' : 'construct-outline';
        } else if (route.name === 'Requests') {
          iconName = focused ? 'clipboard' : 'clipboard-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'ellipse-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
    })}
  >
    <Tab.Screen name="Home" component={CustomerHomeScreen} />
    <Tab.Screen 
      name="ArtisanConnect" 
      component={ArtisanConnectScreen}
      options={{ title: 'Services' }}
    />
    <Tab.Screen 
      name="Requests"
      component={RequestDashboardScreen}
      options={{ title: 'My Requests' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={CustomerProfileScreen}
      options={{ title: 'My Profile' }}
    />
  </Tab.Navigator>
);

// SellerTabNavigator removed - focusing only on Customer and Artisan roles

const ArtisanTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'analytics' : 'analytics-outline';
        } else if (route.name === 'Requests') {
          iconName = focused ? 'mail' : 'mail-outline';
        } else if (route.name === 'Jobs') {
          iconName = focused ? 'hammer' : 'hammer-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'ellipse-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={ArtisanDashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen 
      name="Requests" 
      component={ArtisanRequestsScreen}
      options={{ title: 'Service Requests' }}
    />
    <Tab.Screen 
      name="Jobs" 
      component={ArtisanJobsScreen}
      options={{ title: 'Active Jobs' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ArtisanProfileScreen}
      options={{ title: 'My Profile' }}
    />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ title: 'Welcome to Georgy' }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{ title: 'Create Account' }}
    />
    <Stack.Screen 
      name="UserType" 
      component={UserTypeScreen} 
      options={{ title: 'Choose Account Type' }}
    />
  </Stack.Navigator>
);

const MainStack = ({ userType }: { userType: string }) => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      options={{ headerShown: false }}
    >
      {() => {
        switch (userType) {
          case 'artisan':
            return <ArtisanTabNavigator />;
          case 'customer':
          default:
            return <CustomerTabNavigator />;
        }
      }}
    </Stack.Screen>
    
    {/* ArtisanConnect Modal Screens */}
    <Stack.Screen 
      name="ServiceCategories" 
      component={ServiceCategoriesScreen}
      options={{ title: 'Service Categories' }}
    />
    <Stack.Screen 
      name="ServiceRequestForm" 
      component={ServiceRequestFormScreen}
      options={{ title: 'Request Service' }}
    />
    <Stack.Screen 
      name="RequestDashboard" 
      component={RequestDashboardScreen}
      options={{ title: 'My Requests' }}
    />
    <Stack.Screen 
      name="ArtisanDiscovery" 
      component={ArtisanDiscoveryScreen}
      options={{ title: 'Find Artisans' }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={({ route }: any) => ({ title: route.params?.participantName || 'Chat' })}
    />
    <Stack.Screen 
      name="QuoteComparison" 
      component={QuoteComparisonScreen}
      options={{ title: 'Compare Quotes' }}
    />
    <Stack.Screen 
      name="JobDetails" 
      component={JobDetailsScreen}
      options={{ title: 'Job Details' }}
    />
    <Stack.Screen 
      name="Reviews" 
      component={ReviewsScreen}
      options={{ title: 'Reviews & Ratings' }}
    />
    <Stack.Screen 
      name="EscrowPayment" 
      component={EscrowPaymentScreen}
      options={{ title: 'Secure Payment' }}
    />
    <Stack.Screen 
      name="TransactionHistory" 
      component={TransactionHistoryScreen}
      options={{ title: 'Transaction History' }}
    />
    <Stack.Screen 
      name="AnalyticsDashboard" 
      component={AnalyticsDashboardScreen}
      options={{ title: 'Analytics Dashboard' }}
    />
    <Stack.Screen 
      name="JobProgress" 
      component={JobProgressScreen}
      options={{ title: 'Update Job Progress' }}
    />
    
    {/* Legacy screens */}
    <Stack.Screen 
      name="ServiceRequest" 
      component={ServiceRequestScreen}
      options={{ title: 'Request Service' }}
    />
    <Stack.Screen name="Notifications">
      {() => <PlaceholderScreen title="Notifications" />}
    </Stack.Screen>
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export const AppNavigator = () => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <AuthStack />;
  }

  return <MainStack userType={user.role} />;
};
