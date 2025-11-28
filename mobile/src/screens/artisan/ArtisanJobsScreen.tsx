import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, Chip, ProgressBar, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

// Mock data for active jobs
const mockJobs = [
  {
    id: '1',
    title: 'Kitchen Plumbing Repair',
    customer: 'John Doe',
    customerAvatar: null,
    location: 'Victoria Island, Lagos',
    amount: '₦30,000',
    startDate: '2024-01-15',
    expectedEndDate: '2024-01-18',
    status: 'in_progress',
    progress: 0.6,
    category: 'Plumbing',
    description: 'Fix leaking faucet and install new sink pipes',
    milestones: ['Assessment Complete', 'Materials Purchased', 'Installation Started', 'Testing & Cleanup']
  },
  {
    id: '2',
    title: 'Electrical Wiring Installation',
    customer: 'Jane Smith',
    customerAvatar: null,
    location: 'Ikeja, Lagos',
    amount: '₦55,000',
    startDate: '2024-01-20',
    expectedEndDate: '2024-01-25',
    status: 'scheduled',
    progress: 0,
    category: 'Electrical',
    description: 'Install new electrical outlets and lighting in bedroom',
    milestones: ['Site Survey', 'Material Planning', 'Installation', 'Testing']
  },
  {
    id: '3',
    title: 'Custom Wooden Shelves',
    customer: 'Mike Johnson',
    customerAvatar: null,
    location: 'Lekki, Lagos',
    amount: '₦20,000',
    startDate: '2024-01-10',
    expectedEndDate: '2024-01-16',
    status: 'completed',
    progress: 1.0,
    category: 'Carpentry',
    description: 'Build custom wooden shelves for home office',
    milestones: ['Design Approval', 'Material Cutting', 'Assembly', 'Installation']
  },
  {
    id: '4',
    title: 'Bathroom Renovation',
    customer: 'Sarah Wilson',
    customerAvatar: null,
    location: 'Surulere, Lagos',
    amount: '₦85,000',
    startDate: '2024-01-12',
    expectedEndDate: '2024-01-22',
    status: 'paused',
    progress: 0.3,
    category: 'Plumbing',
    description: 'Complete bathroom renovation with new fixtures',
    milestones: ['Demolition', 'Plumbing Installation', 'Tiling', 'Fixture Installation']
  }
];

export const ArtisanJobsScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return colors.primary;
      case 'in_progress': return colors.warning;
      case 'completed': return colors.success;
      case 'paused': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  const renderJob = ({ item }: { item: any }) => (
    <Card style={styles.jobCard} onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}>
      <Card.Content>
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.jobInfo}>
            <Text variant="titleMedium" style={styles.jobTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.category}>
              {item.category}
            </Text>
          </View>
          <Chip 
            mode="flat"
            textStyle={{ color: getStatusColor(item.status), fontSize: 11 }}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <Avatar.Text 
            size={32} 
            label={item.customer.split(' ').map((n: string) => n[0]).join('')}
            style={styles.customerAvatar}
          />
          <View style={styles.customerDetails}>
            <Text variant="bodyMedium" style={styles.customerName}>{item.customer}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text variant="bodySmall" style={styles.location}>{item.location}</Text>
            </View>
          </View>
          <Text variant="titleMedium" style={styles.amount}>{item.amount}</Text>
        </View>

        {/* Progress Section */}
        {item.status !== 'scheduled' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text variant="bodySmall" style={styles.progressLabel}>Progress</Text>
              <Text variant="bodySmall" style={styles.progressPercent}>
                {Math.round(item.progress * 100)}%
              </Text>
            </View>
            <ProgressBar 
              progress={item.progress} 
              color={getStatusColor(item.status)}
              style={styles.progressBar}
            />
          </View>
        )}

        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <Ionicons name="play-outline" size={14} color={colors.textSecondary} />
            <Text variant="bodySmall" style={styles.timelineText}>
              Started: {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.timelineItem}>
            <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
            <Text variant="bodySmall" style={styles.timelineText}>
              Due: {new Date(item.expectedEndDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {item.status === 'scheduled' && (
            <>
              <Button 
                mode="contained" 
                compact
                onPress={() => navigation.navigate('JobProgress', { jobId: item.id })}
                style={styles.actionButton}
              >
                Start Job
              </Button>
              <Button 
                mode="text" 
                compact
                onPress={() => navigation.navigate('Chat', { customerId: item.customerId, jobId: item.id })}
                style={styles.actionButton}
              >
                Message
              </Button>
            </>
          )}
          
          {item.status === 'in_progress' && (
            <>
              <Button 
                mode="contained" 
                compact
                onPress={() => navigation.navigate('JobProgress', { jobId: item.id })}
                style={styles.actionButton}
              >
                Update Progress
              </Button>
              <Button 
                mode="outlined" 
                compact
                onPress={() => navigation.navigate('Chat', { customerId: item.customerId, jobId: item.id })}
                style={styles.actionButton}
              >
                Chat
              </Button>
            </>
          )}
          
          {item.status === 'paused' && (
            <>
              <Button 
                mode="contained" 
                compact
                onPress={() => navigation.navigate('JobProgress', { jobId: item.id })}
                style={styles.actionButton}
              >
                Resume Job
              </Button>
              <Button 
                mode="text" 
                compact
                onPress={() => navigation.navigate('Chat', { customerId: item.customerId, jobId: item.id })}
                style={styles.actionButton}
              >
                Contact
              </Button>
            </>
          )}
          
          {item.status === 'completed' && (
            <>
              <Button 
                mode="outlined" 
                compact
                onPress={() => navigation.navigate('Reviews', { jobId: item.id })}
                style={styles.actionButton}
              >
                View Reviews
              </Button>
              <Button 
                mode="text" 
                compact
                onPress={() => navigation.navigate('TransactionHistory', { jobId: item.id })}
                style={styles.actionButton}
              >
                Payment
              </Button>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const filteredJobs = mockJobs.filter(job => {
    if (selectedFilter === 'all') return true;
    return job.status === selectedFilter;
  });

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContainer}>
          {['all', 'scheduled', 'in_progress', 'paused', 'completed'].map((filter) => (
            <Chip
              key={filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
              style={styles.filterChip}
              mode={selectedFilter === filter ? 'flat' : 'outlined'}
            >
              {filter === 'all' ? 'All Jobs' : getStatusText(filter)}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="hammer-outline" size={64} color={colors.textSecondary} />
            <Text variant="titleMedium" style={styles.emptyTitle}>No Jobs Found</Text>
            <Text variant="bodyMedium" style={styles.emptyDescription}>
              {selectedFilter === 'all' 
                ? 'No active jobs at the moment'
                : `No ${getStatusText(selectedFilter).toLowerCase()} jobs found`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterScroll: {
    flexGrow: 0,
    backgroundColor: colors.surface,
    elevation: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  jobCard: {
    marginBottom: 16,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    color: colors.primary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statusChip: {
    height: 24,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    backgroundColor: colors.primary,
  },
  customerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    color: colors.text,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    color: colors.textSecondary,
  },
  amount: {
    color: colors.success,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: colors.textSecondary,
  },
  progressPercent: {
    color: colors.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  timeline: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineText: {
    marginLeft: 8,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 90,
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
});