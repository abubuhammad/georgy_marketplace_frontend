import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import AntiCheatPaymentService from '../../services/AntiCheatPaymentService';

interface Transaction {
  id: string;
  type: 'service_fee' | 'escrow_deposit' | 'escrow_release' | 'commission' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  jobTitle: string;
  artisanName?: string;
  description: string;
  reference?: string;
  commission?: number;
  metadata?: {
    jobId?: string;
    escrowId?: string;
    paymentMethod?: string;
  };
}

interface TransactionHistoryScreenProps {
  navigation: any;
  route?: any;
}

const TRANSACTION_TYPES = [
  { key: 'all', label: 'All Transactions' },
  { key: 'service_fee', label: 'Service Fees' },
  { key: 'escrow_deposit', label: 'Escrow Deposits' },
  { key: 'escrow_release', label: 'Payments Released' },
  { key: 'commission', label: 'Commissions' },
  { key: 'refund', label: 'Refunds' },
];

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ navigation, route }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [selectedType]);

  const loadTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // TODO: Replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          type: 'service_fee',
          amount: 2000,
          status: 'completed',
          createdAt: '2024-01-15T10:30:00Z',
          jobTitle: 'Kitchen Plumbing Repair',
          artisanName: 'John Doe',
          description: 'Service fee for contact access',
          reference: 'SF_001_20240115',
          metadata: {
            jobId: 'job_001',
            paymentMethod: 'card',
          },
        },
        {
          id: 'txn_002',
          type: 'escrow_deposit',
          amount: 15000,
          status: 'completed',
          createdAt: '2024-01-15T11:45:00Z',
          jobTitle: 'Kitchen Plumbing Repair',
          artisanName: 'John Doe',
          description: 'Escrow deposit for job security',
          reference: 'ESC_001_20240115',
          metadata: {
            jobId: 'job_001',
            escrowId: 'esc_001',
            paymentMethod: 'card',
          },
        },
        {
          id: 'txn_003',
          type: 'escrow_release',
          amount: 13500,
          status: 'completed',
          createdAt: '2024-01-16T16:20:00Z',
          jobTitle: 'Kitchen Plumbing Repair',
          artisanName: 'John Doe',
          description: 'Payment released to artisan',
          reference: 'REL_001_20240116',
          commission: 1500,
          metadata: {
            jobId: 'job_001',
            escrowId: 'esc_001',
          },
        },
        {
          id: 'txn_004',
          type: 'commission',
          amount: 1500,
          status: 'completed',
          createdAt: '2024-01-16T16:20:00Z',
          jobTitle: 'Kitchen Plumbing Repair',
          artisanName: 'John Doe',
          description: 'Platform commission (10%)',
          reference: 'COM_001_20240116',
          metadata: {
            jobId: 'job_001',
            escrowId: 'esc_001',
          },
        },
        {
          id: 'txn_005',
          type: 'service_fee',
          amount: 2000,
          status: 'pending',
          createdAt: '2024-01-17T09:15:00Z',
          jobTitle: 'Bathroom Cleaning Service',
          artisanName: 'Jane Smith',
          description: 'Service fee payment pending',
          reference: 'SF_002_20240117',
          metadata: {
            jobId: 'job_002',
            paymentMethod: 'mobile_money',
          },
        },
        {
          id: 'txn_006',
          type: 'refund',
          amount: 17000,
          status: 'completed',
          createdAt: '2024-01-12T14:30:00Z',
          jobTitle: 'Electrical Wiring',
          artisanName: 'Mike Johnson',
          description: 'Full refund - job cancelled',
          reference: 'REF_001_20240112',
          metadata: {
            jobId: 'job_003',
            escrowId: 'esc_002',
          },
        },
      ];

      // Filter transactions based on selected type
      const filteredTransactions = selectedType === 'all' 
        ? mockTransactions 
        : mockTransactions.filter(txn => txn.type === selectedType);

      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTransactionIcon = (type: Transaction['type'], status: Transaction['status']) => {
    if (status === 'failed') return { name: 'close-circle', color: '#EF4444' };
    if (status === 'pending') return { name: 'time', color: '#F59E0B' };

    switch (type) {
      case 'service_fee':
        return { name: 'shield-checkmark', color: colors.primary };
      case 'escrow_deposit':
        return { name: 'lock-closed', color: '#8B5CF6' };
      case 'escrow_release':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'commission':
        return { name: 'trending-up', color: '#F59E0B' };
      case 'refund':
        return { name: 'refresh', color: '#6B7280' };
      default:
        return { name: 'receipt', color: colors.textSecondary };
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      default:
        return colors.textSecondary;
    }
  };

  const getAmountDisplay = (transaction: Transaction) => {
    const isDebit = ['service_fee', 'escrow_deposit'].includes(transaction.type);
    const prefix = isDebit ? '-' : '+';
    const color = isDebit ? '#EF4444' : '#10B981';
    
    return {
      text: `${prefix}₦${transaction.amount.toLocaleString()}`,
      color: transaction.status === 'failed' ? colors.textSecondary : color,
    };
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type, item.status);
    const amount = getAmountDisplay(item);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => {
          // Navigate to transaction details if needed
          if (item.metadata?.jobId) {
            navigation.navigate('JobDetails', { jobId: item.metadata.jobId });
          }
        }}
      >
        <View style={styles.transactionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name as any} size={20} color={icon.color} />
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.jobTitle}
            </Text>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            {item.artisanName && (
              <Text style={styles.artisanName} numberOfLines={1}>
                with {item.artisanName}
              </Text>
            )}
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {item.reference && (
                <Text style={styles.referenceText}>#{item.reference}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[styles.amountText, { color: amount.color }]}>
            {amount.text}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          {item.commission && item.commission > 0 && (
            <Text style={styles.commissionText}>
              Commission: ₦{item.commission.toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterTab = (filter: { key: string; label: string }) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterTab,
        selectedType === filter.key && styles.filterTabActive,
      ]}
      onPress={() => setSelectedType(filter.key)}
    >
      <Text
        style={[
          styles.filterTabText,
          selectedType === filter.key && styles.filterTabTextActive,
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const handleRefresh = () => {
    loadTransactions(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <FlatList
        data={TRANSACTION_TYPES}
        renderItem={({ item }) => renderFilterTab(item)}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterList}
      />

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptyMessage}>
              {selectedType === 'all' 
                ? 'You have no transaction history yet.' 
                : `No ${TRANSACTION_TYPES.find(t => t.key === selectedType)?.label.toLowerCase()} found.`}
            </Text>
          </View>
        }
      />
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
  headerRight: {
    width: 24,
  },

  // Filter Tabs
  filterList: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.white,
  },

  // Transaction List
  listContainer: {
    padding: 20,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  transactionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  artisanName: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  referenceText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  commissionText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TransactionHistoryScreen;