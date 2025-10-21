import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthScreenProps } from '@navigation/types';
import { theme, spacing, typography } from '@utils/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateToRegister = (userType: 'customer' | 'artisan') => {
    navigation.navigate('Register', { userType });
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3' }}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(220, 38, 38, 0.8)', 'rgba(185, 28, 28, 0.9)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Logo and Title */}
            <View style={styles.header}>
              <Text style={styles.title}>Georgy</Text>
              <Text style={styles.subtitle}>Marketplace</Text>
              <Text style={styles.tagline}>
                Connect with skilled artisans{'\n'}for all your service needs
              </Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
              <FeatureItem
                icon="🔧"
                text="Professional Services"
              />
              <FeatureItem
                icon="💬"
                text="Direct Communication"
              />
              <FeatureItem
                icon="🔒"
                text="Secure Payments"
              />
              <FeatureItem
                icon="⭐"
                text="Verified Reviews"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={() => navigateToRegister('customer')}
                style={[styles.button, styles.primaryButton]}
                labelStyle={styles.primaryButtonText}
              >
                Find Services
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => navigateToRegister('artisan')}
                style={[styles.button, styles.secondaryButton]}
                labelStyle={styles.secondaryButtonText}
              >
                Offer Services
              </Button>

              <Button
                mode="text"
                onPress={navigateToLogin}
                style={styles.textButton}
                labelStyle={styles.textButtonLabel}
              >
                Already have an account? Sign In
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height,
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  title: {
    ...typography.h1,
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  tagline: {
    ...typography.body1,
    color: '#F3F4F6',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    paddingVertical: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    borderRadius: 12,
    paddingVertical: spacing.xs,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    ...typography.body1,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  secondaryButtonText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textButton: {
    marginTop: spacing.md,
  },
  textButtonLabel: {
    ...typography.body2,
    color: '#F3F4F6',
  },
});
