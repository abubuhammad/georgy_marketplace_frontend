import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, Chip, Searchbar, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

// Mock data for service requests
const mockRequests = [
  {
    id: '1',
    title: 'Kitchen Plumbing Repair',
    description: 'Need to fix a leaking faucet and install new sink pipes',
    customer: 'John Doe',
    location: 'Victoria Island, Lagos',
    budget: '₦25,000 - ₦35,000',
    category: 'Plumbing',
    urgency: 'High',
    postedDate: '2 hours ago',
    status: 'new'
  },
  {
    id: '2',
    title: 'Electrical Wiring Installation',
    description: 'Install new electrical outlets and lighting in bedroom',
    customer: 'Jane Smith',
    location: 'Ikeja, Lagos',
    budget: '₦40,000 - ₦60,000',
    category: 'Electrical',
    urgency: 'Medium',
    postedDate: '5 hours ago',
    status: 'quoted'
  },
  {
    id: '3',
    title: 'Carpentry Work - Custom Shelves',
    description: 'Build custom wooden shelves for home office',
    customer: 'Mike Johnson',
    location: 'Lekki, Lagos',
    budget: '₦15,000 - ₦25,000',
    category: 'Carpentry',
    urgency: 'Low',
    postedDate: '1 day ago',
    status: 'new'
  }
];

export const ArtisanRequestsScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.success;
      case 'quoted': return colors.warning;
      case 'accepted': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const renderRequest = ({ item }: { item: any }) => (
    <Card style={styles.requestCard} onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <Text variant="titleMedium" style={styles.requestTitle}>
            {item.title}
          </Text>
          <Chip 
            mode="outlined" 
            textStyle={{ color: getUrgencyColor(item.urgency), fontSize: 12 }}
            style={[styles.urgencyChip, { borderColor: getUrgencyColor(item.urgency) }]}
          >
            {item.urgency}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.requestMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text variant="bodySmall" style={styles.metaText}>{item.customer}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text variant="bodySmall" style={styles.metaText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.requestFooter}>
          <View>
            <Text variant="bodySmall" style={styles.budgetLabel}>Budget</Text>
            <Text variant="titleSmall" style={styles.budget}>{item.budget}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Chip 
              mode="flat" 
              textStyle={{ color: getStatusColor(item.status), fontSize: 11 }}
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            >
              {item.status === 'new' ? 'New Request' : item.status === 'quoted' ? 'Quote Sent' : item.status}
            </Chip>
            <Text variant="bodySmall" style={styles.postedDate}>{item.postedDate}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          {item.status === 'new' && (
            <Button 
              mode="contained" 
              compact
              onPress={() => navigation.navigate('SendQuote', { requestId: item.id })}
              style={styles.actionButton}
            >
              Send Quote
            </Button>
          )}
          {item.status === 'quoted' && (
            <Button 
              mode="outlined" 
              compact
              onPress={() => navigation.navigate('ViewQuote', { requestId: item.id })}
              style={styles.actionButton}
            >
              View Quote
            </Button>
          )}
          <Button 
            mode="text" 
            compact
            onPress={() => navigation.navigate('Chat', { customerId: item.customerId, requestId: item.id })}
            style={styles.actionButton}
          >
            Message
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search requests..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterContainer}>
            {['all', 'new', 'quoted', 'accepted'].map((filter) => (
              <Chip
                key={filter}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
                style={styles.filterChip}
                mode={selectedFilter === filter ? 'flat' : 'outlined'}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={colors.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyTitle}>No Requests Found</Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {selectedFilter === 'all' 
                ? 'No service requests available at the moment'
                : `No ${selectedFilter} requests found`
              }
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="refresh"
        label="Refresh"
        onPress={() => {/* Refresh logic */}}
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  requestCard: {
    marginBottom: 16,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestTitle: {
    flex: 1,
    marginRight: 8,
    color: colors.text,
  },
  urgencyChip: {
    height: 24,
  },
  requestDescription: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  requestMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 6,
    color: colors.textSecondary,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  budgetLabel: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  budget: {
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 20,
    marginBottom: 4,
  },
  postedDate: {
    color: colors.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});