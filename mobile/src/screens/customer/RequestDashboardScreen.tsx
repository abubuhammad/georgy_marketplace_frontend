import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

interface ServiceRequest {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  createdAt: string;
  quotesCount: number;
  selectedArtisan?: {
    name: string;
    avatar: string;
  };
  budget: {
    min: number;
    max: number;
  };
}

interface RequestDashboardScreenProps {
  navigation: any;
}

export const RequestDashboardScreen: React.FC<RequestDashboardScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  // Mock data - replace with API call
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockRequests: ServiceRequest[] = [
        {
          id: '1',
          title: 'Fix leaking kitchen faucet',
          category: 'Plumbing',
          status: 'quoted',
          urgency: 'high',
          createdAt: '2024-01-15T10:00:00Z',
          quotesCount: 3,
          budget: { min: 5000, max: 15000 },
        },
        {
          id: '2',
          title: 'Install ceiling fan',
          category: 'Electrical',
          status: 'in_progress',
          urgency: 'medium',
          createdAt: '2024-01-10T14:30:00Z',
          quotesCount: 2,
          selectedArtisan: {
            name: 'John Doe',
            avatar: '',
          },
          budget: { min: 8000, max: 20000 },
        },
        {
          id: '3',
          title: 'Paint living room walls',
          category: 'Painting',
          status: 'completed',
          urgency: 'low',
          createdAt: '2024-01-05T09:15:00Z',
          quotesCount: 5,
          selectedArtisan: {
            name: 'Mary Smith',
            avatar: '',
          },
          budget: { min: 15000, max: 35000 },
        },
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'quoted':
        return '#3B82F6';
      case 'accepted':
        return '#8B5CF6';
      case 'in_progress':
        return '#10B981';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#EF4444';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'quoted':
        return 'Quotes Received';
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getUrgencyColor = (urgency: ServiceRequest['urgency']) => {
    switch (urgency) {
      case 'low':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      case 'emergency':
        return '#DC2626';
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budget: { min: number; max: number }) => {
    return `₦${budget.min.toLocaleString()} - ₦${budget.max.toLocaleString()}`;
  };

  const filteredRequests = requests.filter(request => {
    switch (activeFilter) {
      case 'pending':
        return request.status === 'pending' || request.status === 'quoted';
      case 'active':
        return request.status === 'accepted' || request.status === 'in_progress';
      case 'completed':
        return request.status === 'completed';
      default:
        return true;
    }
  });

  const handleRequestPress = (request: ServiceRequest) => {
    if (request.status === 'quoted') {
      navigation.navigate('QuoteComparison', { requestId: request.id });
    } else if (request.status === 'in_progress' || request.status === 'accepted') {
      navigation.navigate('JobTracking', { requestId: request.id });
    } else if (request.status === 'completed') {
      navigation.navigate('ServiceReview', { requestId: request.id });
    }
  };

  const renderRequestCard = (request: ServiceRequest) => (
    <TouchableOpacity
      key={request.id}
      style={styles.requestCard}
      onPress={() => handleRequestPress(request)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.requestTitle} numberOfLines={1}>
            {request.title}
          </Text>
          <Text style={styles.category}>{request.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(request.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(request.createdAt)}</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(request.urgency) }]} />
            <Text style={styles.infoText}>{request.urgency} priority</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formatBudget(request.budget)}</Text>
          </View>
          {request.quotesCount > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{request.quotesCount} quote{request.quotesCount !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {request.selectedArtisan && (
          <View style={styles.artisanInfo}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.artisanName}>with {request.selectedArtisan.name}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Chat', { artisanId: request.selectedArtisan })}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ServiceCategories')}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRequests} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.requestsList}>
          {filteredRequests.length > 0 ? (
            filteredRequests.map(renderRequestCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No requests found</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'all'
                  ? "You haven't created any service requests yet"
                  : `No ${activeFilter} requests at the moment`}
              </Text>
              <TouchableOpacity
                style={styles.createRequestButton}
                onPress={() => navigation.navigate('ServiceCategories')}
              >
                <Text style={styles.createRequestButtonText}>Create Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  requestsList: {
    padding: 20,
    gap: 16,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  artisanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  artisanName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createRequestButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createRequestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default RequestDashboardScreen;