/// <reference path="../types/react-native.d.ts" />

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../src/contexts/AuthContext';
import { RootStackParamList } from '../App';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const features = [
  {
    icon: 'verified-user',
    title: 'Verified Artisans',
    description: 'All professionals are background-checked and verified for your safety.',
    color: '#3B82F6',
  },
  {
    icon: 'schedule',
    title: 'Quick Response',
    description: 'Get quotes within minutes and book services that fit your schedule.',
    color: '#10B981',
  },
  {
    icon: 'security',
    title: 'Secure Payments',
    description: 'Escrow system ensures quality work completion before payment release.',
    color: '#8B5CF6',
  },
  {
    icon: 'chat',
    title: 'Real-time Chat',
    description: 'Communicate directly with artisans through our integrated chat system.',
    color: '#F59E0B',
  },
];

const stats = [
  { number: '50K+', label: 'Verified Artisans' },
  { number: '1M+', label: 'Jobs Completed' },
  { number: '4.8★', label: 'Average Rating' },
  { number: '24/7', label: 'Support' },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Auto-navigate if user is already logged in
    if (user && !loading) {
      if (user.role === 'artisan') {
        navigation.replace('ArtisanTabs');
      } else {
        navigation.replace('CustomerTabs');
      }
    }
  }, [user, loading, navigation]);

  const handleGetStarted = () => {
    navigation.navigate('Register');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Icon name="build" size={80} color="#DC2626" />
          <Text style={styles.loadingText}>ArtisanConnect</Text>
          <Text style={styles.loadingSubtext}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DC2626" barStyle="light-content" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.heroContent}>
              <View style={styles.logoContainer}>
                <Icon name="build" size={60} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>ArtisanConnect</Text>
              <Text style={styles.heroSubtitle}>
                Connect with skilled artisans for all your service needs
              </Text>
              <View style={styles.heroButtons}>
                <Button
                  mode="contained"
                  onPress={handleGetStarted}
                  style={[styles.primaryButton, styles.getStartedButton]}
                  labelStyle={styles.primaryButtonText}
                  contentStyle={styles.buttonContent}
                >
                  Get Started
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleSignIn}
                  style={[styles.secondaryButton, styles.signInButton]}
                  labelStyle={styles.secondaryButtonText}
                  contentStyle={styles.buttonContent}
                >
                  Sign In
                </Button>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose ArtisanConnect?</Text>
          <Text style={styles.sectionSubtitle}>
            The most trusted platform for connecting with skilled professionals
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card key={index} style={styles.featureCard}>
                <Card.Content style={styles.featureContent}>
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                    <Icon name={feature.icon} size={32} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.servicesScroll}
          >
            {[
              { icon: 'plumbing', name: 'Plumbing', emoji: '🔧' },
              { icon: 'electrical-services', name: 'Electrical', emoji: '⚡' },
              { icon: 'carpenter', name: 'Carpentry', emoji: '🪚' },
              { icon: 'format-paint', name: 'Painting', emoji: '🎨' },
              { icon: 'cleaning-services', name: 'Cleaning', emoji: '🧹' },
              { icon: 'face', name: 'Beauty', emoji: '💄' },
              { icon: 'car-repair', name: 'Automotive', emoji: '🚗' },
              { icon: 'handyman', name: 'Handyman', emoji: '🔨' },
            ].map((service, index) => (
              <Card key={index} style={styles.serviceCard}>
                <Card.Content style={styles.serviceContent}>
                  <Text style={styles.serviceEmoji}>{service.emoji}</Text>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of satisfied customers who trust ArtisanConnect
          </Text>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.ctaButton}
            labelStyle={styles.ctaButtonText}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
          <Button
            mode="text"
            onPress={handleSignIn}
            style={styles.ctaSecondaryButton}
            labelStyle={styles.ctaSecondaryButtonText}
          >
            Already have an account? Sign in
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  heroSection: {
    height: height * 0.6,
    minHeight: 400,
  },
  heroBackground: {
    flex: 1,
    backgroundColor: '#DC2626',
    position: 'relative',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FEE2E2',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  heroButtons: {
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  getStartedButton: {
    elevation: 0,
  },
  primaryButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  signInButton: {
    elevation: 0,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  featureContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    backgroundColor: '#1F2937',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: width / 4 - 20,
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  servicesSection: {
    paddingVertical: 40,
    paddingLeft: 24,
  },
  servicesScroll: {
    paddingRight: 24,
  },
  serviceCard: {
    width: 100,
    marginRight: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  serviceContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  serviceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#DC2626',
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaSecondaryButton: {
    width: '100%',
    maxWidth: 300,
  },
  ctaSecondaryButtonText: {
    color: '#DC2626',
    fontSize: 14,
  },
});
