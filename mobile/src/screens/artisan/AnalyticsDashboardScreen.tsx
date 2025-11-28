import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

// Simple chart components for mobile (alternative to Recharts)
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsData {
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    commission: number;
    netEarnings: number;
  };
  performance: {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    averageRating: number;
    completionRate: number;
    responseTime: number; // in hours
  };
  jobStats: {
    pendingQuotes: number;
    activeJobs: number;
    completedThisMonth: number;
    repeatCustomers: number;
  };
  earningsChart: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  jobsByCategory: Array<{
    name: string;
    jobs: number;
    earnings: number;
    color: string;
  }>;
  monthlyTrends: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
}

interface AnalyticsDashboardScreenProps {
  navigation: any;
  route?: any;
}

const CHART_CONFIG = {
  backgroundColor: colors.white,
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: (opacity = 1) => colors.textSecondary,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary,
  },
};

export const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardScreenProps> = ({ navigation, route }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // TODO: Replace with actual API call
      const mockData: AnalyticsData = {
        earnings: {
          today: 12500,
          thisWeek: 67500,
          thisMonth: 234000,
          total: 1750000,
          commission: 23400,
          netEarnings: 210600,
        },
        performance: {
          totalJobs: 156,
          completedJobs: 142,
          cancelledJobs: 8,
          averageRating: 4.7,
          completionRate: 91.0,
          responseTime: 2.3,
        },
        jobStats: {
          pendingQuotes: 5,
          activeJobs: 3,
          completedThisMonth: 18,
          repeatCustomers: 12,
        },
        earningsChart: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              data: [125000, 180000, 210000, 245000, 198000, 234000],
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        },
        jobsByCategory: [
          { name: 'Plumbing', jobs: 45, earnings: 675000, color: '#4F46E5' },
          { name: 'Electrical', jobs: 32, earnings: 480000, color: '#10B981' },
          { name: 'Carpentry', jobs: 28, earnings: 420000, color: '#F59E0B' },
          { name: 'Painting', jobs: 22, earnings: 165000, color: '#EF4444' },
          { name: 'Others', jobs: 15, earnings: 112500, color: '#8B5CF6' },
        ],
        monthlyTrends: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [
            {
              data: [52000, 68000, 61000, 73000],
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            },
          ],
        },
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  const renderEarningsOverview = () => {
    if (!analyticsData) return null;

    const { earnings } = analyticsData;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings Overview</Text>
        
        <View style={styles.earningsGrid}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Today</Text>
            <Text style={styles.earningsValue}>₦{earnings.today.toLocaleString()}</Text>
          </View>
          
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>This Week</Text>
            <Text style={styles.earningsValue}>₦{earnings.thisWeek.toLocaleString()}</Text>
          </View>
          
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>This Month</Text>
            <Text style={styles.earningsValue}>₦{earnings.thisMonth.toLocaleString()}</Text>
          </View>
          
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsValue}>₦{earnings.total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.commissionBreakdown}>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Gross Earnings</Text>
            <Text style={styles.commissionValue}>₦{(earnings.thisMonth + earnings.commission).toLocaleString()}</Text>
          </View>
          <View style={styles.commissionRow}>
            <Text style={styles.commissionLabel}>Platform Commission (10%)</Text>
            <Text style={[styles.commissionValue, { color: '#EF4444' }]}>-₦{earnings.commission.toLocaleString()}</Text>
          </View>
          <View style={[styles.commissionRow, styles.netEarningsRow]}>
            <Text style={styles.netEarningsLabel}>Net Earnings</Text>
            <Text style={styles.netEarningsValue}>₦{earnings.netEarnings.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!analyticsData) return null;

    const { performance } = analyticsData;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.metricValue}>{performance.completedJobs}</Text>
            <Text style={styles.metricLabel}>Completed Jobs</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>{performance.averageRating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Avg Rating</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <Text style={styles.metricValue}>{performance.completionRate.toFixed(0)}%</Text>
            <Text style={styles.metricLabel}>Completion Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="time" size={24} color="#8B5CF6" />
            <Text style={styles.metricValue}>{performance.responseTime}h</Text>
            <Text style={styles.metricLabel}>Response Time</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderJobStats = () => {
    if (!analyticsData) return null;

    const { jobStats } = analyticsData;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Statistics</Text>
        
        <View style={styles.jobStatsContainer}>
          <View style={styles.jobStatItem}>
            <View style={styles.jobStatIconContainer}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.jobStatInfo}>
              <Text style={styles.jobStatValue}>{jobStats.pendingQuotes}</Text>
              <Text style={styles.jobStatLabel}>Pending Quotes</Text>
            </View>
          </View>

          <View style={styles.jobStatItem}>
            <View style={styles.jobStatIconContainer}>
              <Ionicons name="construct" size={20} color="#F59E0B" />
            </View>
            <View style={styles.jobStatInfo}>
              <Text style={styles.jobStatValue}>{jobStats.activeJobs}</Text>
              <Text style={styles.jobStatLabel}>Active Jobs</Text>
            </View>
          </View>

          <View style={styles.jobStatItem}>
            <View style={styles.jobStatIconContainer}>
              <Ionicons name="calendar" size={20} color="#10B981" />
            </View>
            <View style={styles.jobStatInfo}>
              <Text style={styles.jobStatValue}>{jobStats.completedThisMonth}</Text>
              <Text style={styles.jobStatLabel}>Completed This Month</Text>
            </View>
          </View>

          <View style={styles.jobStatItem}>
            <View style={styles.jobStatIconContainer}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.jobStatInfo}>
              <Text style={styles.jobStatValue}>{jobStats.repeatCustomers}</Text>
              <Text style={styles.jobStatLabel}>Repeat Customers</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEarningsChart = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Earnings Trend</Text>
          
          <View style={styles.periodSelector}>
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LineChart
          data={analyticsData.earningsChart}
          width={screenWidth - 40}
          height={220}
          chartConfig={CHART_CONFIG}
          bezier
          style={styles.chart}
          fromZero
        />
      </View>
    );
  };

  const renderJobsByCategory = () => {
    if (!analyticsData) return null;

    const pieData = analyticsData.jobsByCategory.map((category, index) => ({
      name: category.name,
      population: category.jobs,
      color: category.color,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jobs by Category</Text>
        
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={CHART_CONFIG}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 50]}
          absolute
          style={styles.chart}
        />

        <View style={styles.categoryLegend}>
          {analyticsData.jobsByCategory.map((category, index) => (
            <View key={index} style={styles.categoryLegendItem}>
              <View style={[styles.categoryLegendColor, { backgroundColor: category.color }]} />
              <Text style={styles.categoryLegendText}>
                {category.name}: {category.jobs} jobs (₦{category.earnings.toLocaleString()})
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderWeeklyTrend = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Earnings</Text>
        
        <BarChart
          data={analyticsData.monthlyTrends}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            ...CHART_CONFIG,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      </View>
    );
  };

  const renderQuickActions = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Transaction History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Ionicons name="star-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>View Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderEarningsOverview()}
        {renderPerformanceMetrics()}
        {renderJobStats()}
        {renderEarningsChart()}
        {renderJobsByCategory()}
        {renderWeeklyTrend()}
        {renderQuickActions()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Common Section Styles
  section: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },

  // Earnings Overview
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  commissionBreakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    gap: 8,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  commissionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  netEarningsRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  netEarningsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  netEarningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Performance Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Job Stats
  jobStatsContainer: {
    gap: 16,
  },
  jobStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  jobStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobStatInfo: {
    flex: 1,
  },
  jobStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  jobStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Charts
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },

  // Category Legend
  categoryLegend: {
    marginTop: 16,
    gap: 8,
  },
  categoryLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryLegendText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AnalyticsDashboardScreen;