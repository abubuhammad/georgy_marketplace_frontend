import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Avatar, Divider, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/theme';

export const CustomerProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleSave = () => {
    updateUser({
      firstName: editData.firstName,
      lastName: editData.lastName,
    });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={`${user?.firstName?.charAt(0) || 'U'}${user?.lastName?.charAt(0) || 'U'}`}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="headlineSmall" style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {user?.email}
            </Text>
            <Text variant="bodySmall" style={styles.userType}>
              Customer
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Profile Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Personal Information
            </Text>
            <Button
              mode={isEditing ? "contained" : "outlined"}
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              compact
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodySmall" style={styles.fieldLabel}>First Name</Text>
            {isEditing ? (
              <TextInput
                value={editData.firstName}
                onChangeText={(text) => setEditData({...editData, firstName: text})}
                mode="outlined"
                dense
                style={styles.input}
              />
            ) : (
              <Text variant="bodyMedium" style={styles.fieldValue}>
                {user?.firstName || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodySmall" style={styles.fieldLabel}>Last Name</Text>
            {isEditing ? (
              <TextInput
                value={editData.lastName}
                onChangeText={(text) => setEditData({...editData, lastName: text})}
                mode="outlined"
                dense
                style={styles.input}
              />
            ) : (
              <Text variant="bodyMedium" style={styles.fieldValue}>
                {user?.lastName || 'Not provided'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodySmall" style={styles.fieldLabel}>Email</Text>
            <Text variant="bodyMedium" style={styles.fieldValue}>
              {user?.email}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text variant="bodySmall" style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                value={editData.phone}
                onChangeText={(text) => setEditData({...editData, phone: text})}
                mode="outlined"
                dense
                placeholder="Enter phone number"
                style={styles.input}
              />
            ) : (
              <Text variant="bodyMedium" style={styles.fieldValue}>
                {editData.phone || 'Not provided'}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <List.Item
            title="My Service Requests"
            description="View and manage your service requests"
            left={(props) => <List.Icon {...props} icon="clipboard-list" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('RequestDashboard')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Transaction History"
            description="View your payment history"
            left={(props) => <List.Icon {...props} icon="credit-card" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('TransactionHistory')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Reviews & Ratings"
            description="Manage your reviews"
            left={(props) => <List.Icon {...props} icon="star" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Reviews')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Account Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Settings
          </Text>

          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Notifications')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Help & Support"
            description="Get help or contact support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Support', 'Contact support at support@georgy.com')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={(props) => <List.Icon {...props} icon="logout" color={colors.error} />}
            titleStyle={{ color: colors.error }}
            onPress={handleLogout}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userType: {
    color: colors.primary,
    fontWeight: '600',
  },
  detailsCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldValue: {
    color: colors.text,
  },
  input: {
    backgroundColor: 'transparent',
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  settingsCard: {
    margin: 16,
    marginVertical: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  bottomSpacer: {
    height: 32,
  },
});