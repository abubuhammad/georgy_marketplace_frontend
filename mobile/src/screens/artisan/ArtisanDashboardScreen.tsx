import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { RealTimeStatusIndicator, RealtimeActivityFeed } from '../../components/RealTimeStatusIndicator';
import { getArtisanConnectSocketService } from '../../services/ArtisanConnectSocketService';
import { CommissionFeeBreakdown } from '../../components/CommissionFeeBreakdown';
import CommissionTrackingService from '../../services/CommissionTrackingService';

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  completedJobs: number;
  activeJobs: number;
  pendingRequests: number;
  rating: number;
  reviewCount: number;
}

interface RecentActivity {
  id: string;
  type: 'job_completed' | 'new_request' | 'payment_received' | 'review_received';
  title: string;
  subtitle: string;
  amount?: number;
  timestamp: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface ArtisanDashboardScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const ArtisanDashboardScreen: React.FC<ArtisanDashboardScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    completedJobs: 0,
    activeJobs: 0,
    pendingRequests: 0,
    rating: 0,
    reviewCount: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const socketService = getArtisanConnectSocketService();
  const commissionService = new CommissionTrackingService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Subscribe to real-time service requests for this artisan
    const artisanId = 'current-artisan-id'; // TODO: Get from auth context
    
    const unsubscribeRequests = socketService.subscribeToServiceRequests(artisanId, (event) => {
      console.log('New service request event:', event);
      // Update dashboard stats and activity feed in real-time
      if (event.type === 'service_request_created') {
        setStats(prev => ({
          ...prev,
          pendingRequests: prev.pendingRequests + 1,
        }));
        
        // Add to recent activity
        const newActivity: RecentActivity = {
          id: event.data.requestId,
          type: 'new_request',
          title: 'New Service Request',
          subtitle: event.data.title,
          timestamp: event.data.timestamp,
          icon: 'mail-outline',
          color: '#3B82F6',
        };
        setRecentActivity(prev => [newActivity, ...prev.slice(0, 3)]);
      }
    });

    const unsubscribeStatus = socketService.subscribeToArtisanStatus(artisanId, (data) => {
      console.log('Artisan status update:', data);
      // Update availability status if needed
    });

    return () => {
      unsubscribeRequests();
      unsubscribeStatus();
    };
  }, [socketService]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      const mockStats: DashboardStats = {
        totalEarnings: 275000,
        monthlyEarnings: 85000,
        completedJobs: 34,
        activeJobs: 3,
        pendingRequests: 7,
        rating: 4.8,
        reviewCount: 28,
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'payment_received',
          title: 'Payment Received',
          subtitle: 'Kitchen faucet repair completed',
          amount: 12000,
          timestamp: '2024-01-15T14:30:00Z',
          icon: 'card-outline',
          color: '#10B981',
        },
        {
          id: '2',
          type: 'new_request',
          title: 'New Service Request',
          subtitle: 'Ceiling fan installation',
          timestamp: '2024-01-15T10:15:00Z',
          icon: 'mail-outline',
          color: '#3B82F6',
        },
        {
          id: '3',
          type: 'review_received',
          title: 'New Review',
          subtitle: '5 stars from Sarah Johnson',
          timestamp: '2024-01-14T16:45:00Z',
          icon: 'star-outline',
          color: '#F59E0B',
        },
        {
          id: '4',
          type: 'job_completed',
          title: 'Job Completed',
          subtitle: 'Living room painting',
          amount: 25000,
          timestamp: '2024-01-14T12:00:00Z',
          icon: 'checkmark-circle-outline',
          color: '#8B5CF6',
        },
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const StatCard = ({ title, value, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
        <Ionicons name={activity.icon} size={20} color={activity.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
      </View>
      <View style={styles.activityRight}>
        {activity.amount && (
          <Text style={styles.activityAmount}>
            {formatCurrency(activity.amount)}
          </Text>
        )}
        <Text style={styles.activityTime}>
          {formatTimestamp(activity.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.name}>Welcome back</Text>
          </View>
          <View style={styles.headerActions}>
            <RealTimeStatusIndicator 
              showText={true}
              size="small"
              onPress={() => {
                // Show connection details modal
              }}
            />
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{stats.pendingRequests}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Overview</Text>
          <View style={styles.earningsCard}>
            <View style={styles.earningsHeader}>
              <Text style={styles.earningsTitle}>Total Earnings</Text>
              <Text style={styles.earningsAmount}>
                {formatCurrency(stats.totalEarnings)}
              </Text>
            </View>
            <View style={styles.earningsSubtitle}>
              <Text style={styles.monthlyEarnings}>
                {formatCurrency(stats.monthlyEarnings)} this month
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AnalyticsDashboard')}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Commission Breakdown */}
          <View style={styles.commissionSection}>
            <CommissionFeeBreakdown
              grossAmount={stats.monthlyEarnings * 1.11} // Calculate gross amount from net
              commissionRate={10}
              userType="artisan"
              subscriptionTier="standard"
              style={styles.commissionBreakdown}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs}
              subtitle="In progress"
              icon="hammer-outline"
              color="#10B981"
              onPress={() => navigation.navigate('ActiveJobs')}
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              subtitle="Awaiting response"
              icon="mail-outline"
              color="#F59E0B"
              onPress={() => navigation.navigate('RequestInbox')}
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs}
              subtitle="Total completed"
              icon="checkmark-circle-outline"
              color="#8B5CF6"
              onPress={() => navigation.navigate('JobHistory')}
            />
            <StatCard
              title="Rating"
              value={`${stats.rating}/5.0`}
              subtitle={`${stats.reviewCount} reviews`}
              icon="star-outline"
              color="#F59E0B"
              onPress={() => navigation.navigate('Reviews')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('RequestInbox')}
            >
              <Ionicons name="mail-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>View Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => navigation.navigate('ActiveJobs')}
            >
              <Ionicons name="hammer-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Active Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => navigation.navigate('AnalyticsDashboard')}
            >
              <Ionicons name="analytics-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => navigation.navigate('JobProgress', {
                jobId: 'demo-job-123',
                jobTitle: 'Plumbing Repair at John\'s House'
              })}
            >
              <Ionicons name="camera-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Real-time Activity Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Activity</Text>
            <RealTimeStatusIndicator size="small" />
          </View>
          <RealtimeActivityFeed maxItems={4} />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActivityHistory')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityContainer}>
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
              <Text style={styles.insightText}>
                Your earnings are up 15% compared to last week
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="people-outline" size={20} color="#3B82F6" />
              <Text style={styles.insightText}>
                You received 3 new positive reviews
              </Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commissionSection: {
    marginTop: 16,
  },
  commissionBreakdown: {
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  earningsCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  earningsHeader: {
    marginBottom: 8,
  },
  earningsTitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  earningsSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthlyEarnings: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 52) / 2, // 20px padding on each side + 12px gap
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  activityContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  insightsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default ArtisanDashboardScreen;