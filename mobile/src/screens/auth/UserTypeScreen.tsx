import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/theme';

const userTypes = [
  {
    type: 'customer',
    title: 'Customer',
    description: 'Browse and buy products, book artisan services',
    icon: 'person-outline',
  },
  {
    type: 'seller',
    title: 'Seller',
    description: 'Sell products and manage your inventory',
    icon: 'storefront-outline',
  },
  {
    type: 'artisan',
    title: 'Artisan',
    description: 'Provide professional services to customers',
    icon: 'hammer-outline',
  },
];

export const UserTypeScreen = () => {
  const { updateProfile } = useAuth();

  const selectUserType = async (type: string) => {
    try {
      await updateProfile({ type });
    } catch (error: any) {
      console.error('Failed to update user type:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Choose Your Account Type
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Select how you want to use Georgy Marketplace
      </Text>

      {userTypes.map((userType) => (
        <Card key={userType.type} style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Ionicons
              name={userType.icon as any}
              size={48}
              color={colors.primary}
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                {userType.title}
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                {userType.description}
              </Text>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => selectUserType(userType.type)}
              style={styles.selectButton}
            >
              Select {userType.title}
            </Button>
          </Card.Actions>
        </Card>
      ))}

      <Text variant="bodySmall" style={styles.note}>
        You can change this later in your profile settings
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    color: colors.textSecondary,
  },
  selectButton: {
    marginLeft: 'auto',
  },
  note: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.textSecondary,
  },
});
