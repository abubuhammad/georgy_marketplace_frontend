import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import CommissionTrackingService from '../services/CommissionTrackingService';

interface CommissionFeeBreakdownProps {
  grossAmount: number;
  commissionRate: number;
  currency?: string;
  showDetailedView?: boolean;
  userType?: 'artisan' | 'seller';
  subscriptionTier?: 'standard' | 'premium' | 'enterprise';
  style?: any;
  onDisputePress?: () => void;
}

export const CommissionFeeBreakdown: React.FC<CommissionFeeBreakdownProps> = ({
  grossAmount,
  commissionRate,
  currency = 'NGN',
  showDetailedView = false,
  userType = 'artisan',
  subscriptionTier = 'standard',
  style,
  onDisputePress,
}) => {
  const [showModal, setShowModal] = useState(false);
  const commissionService = new CommissionTrackingService();
  
  const breakdown = commissionService.getTransparentFeeBreakdown(grossAmount, commissionRate, currency);

  const FeeBreakdownItem = ({ 
    label, 
    amount, 
    type, 
    showPercentage, 
    percentage 
  }: { 
    label: string; 
    amount: number; 
    type: 'positive' | 'negative' | 'total';
    showPercentage?: boolean;
    percentage?: number;
  }) => {
    const getAmountColor = () => {
      switch (type) {
        case 'positive': return '#10B981';
        case 'negative': return '#EF4444';
        case 'total': return colors.primary;
        default: return colors.text;
      }
    };

    const getAmountPrefix = () => {
      if (type === 'negative') return '-';
      if (type === 'positive') return '+';
      return '';
    };

    return (
      <View style={[styles.breakdownItem, type === 'total' && styles.totalItem]}>
        <View style={styles.labelContainer}>
          <Text style={[styles.itemLabel, type === 'total' && styles.totalLabel]}>
            {label}
          </Text>
          {showPercentage && percentage && (
            <Text style={styles.percentageText}>({percentage}%)</Text>
          )}
        </View>
        <Text style={[styles.itemAmount, { color: getAmountColor() }, type === 'total' && styles.totalAmount]}>
          {getAmountPrefix()}{currency === 'NGN' ? '₦' : currency}{Math.abs(amount).toLocaleString()}
        </Text>
      </View>
    );
  };

  const CompactView = () => (
    <TouchableOpacity 
      style={[styles.compactContainer, style]}
      onPress={() => setShowModal(true)}
      activeOpacity={0.7}
    >
      <View style={styles.compactRow}>
        <View style={styles.compactMainInfo}>
          <Text style={styles.compactLabel}>You'll receive</Text>
          <Text style={styles.compactAmount}>{breakdown.netAmount.display}</Text>
        </View>
        <View style={styles.compactFeeInfo}>
          <Text style={styles.compactFeeLabel}>Platform fee</Text>
          <Text style={styles.compactFeeAmount}>{breakdown.platformFee.display}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const DetailedView = () => (
    <View style={[styles.detailedContainer, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Breakdown</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => Alert.alert(
            'Commission Information',
            `As a ${subscriptionTier} ${userType}, you pay ${commissionRate}% commission on completed transactions. This helps us maintain the platform and provide support services.`
          )}
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.breakdownContainer}>
        <FeeBreakdownItem
          label="Total Amount"
          amount={breakdown.grossAmount.amount}
          type="positive"
        />
        <FeeBreakdownItem
          label="Platform Fee"
          amount={breakdown.platformFee.amount}
          type="negative"
          showPercentage={true}
          percentage={commissionRate}
        />
        <View style={styles.divider} />
        <FeeBreakdownItem
          label="You Receive"
          amount={breakdown.netAmount.amount}
          type="total"
        />
      </View>

      {/* Subscription Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Your {subscriptionTier} benefits:</Text>
        <View style={styles.benefitsList}>
          {getBenefitsForTier(subscriptionTier).map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        {subscriptionTier === 'standard' && (
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeText}>Upgrade to reduce fees</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onDisputePress && (
          <TouchableOpacity 
            style={styles.disputeButton}
            onPress={onDisputePress}
          >
            <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.disputeText}>Dispute Commission</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => {/* Navigate to commission history */}}
        >
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.historyText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getBenefitsForTier = (tier: string): string[] => {
    const benefits = {
      standard: [
        '24/7 customer support',
        'Secure payment processing',
        'Basic analytics dashboard',
      ],
      premium: [
        'Priority customer support',
        'Advanced analytics & insights',
        'Promotional listing features',
        'Lower commission rate (8%)',
      ],
      enterprise: [
        'Dedicated account manager',
        'Custom reporting & analytics',
        'Premium listing placement',
        'Lowest commission rate (6%)',
        'Bulk payment processing',
      ],
    };
    return benefits[tier as keyof typeof benefits] || benefits.standard;
  };

  const DetailedModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ScrollView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Commission Breakdown</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <DetailedView />

        {/* Commission Calculation Explanation */}
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>How commission is calculated:</Text>
          <View style={styles.calculationSteps}>
            <View style={styles.calculationStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                Total job amount: {breakdown.grossAmount.display}
              </Text>
            </View>
            <View style={styles.calculationStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                Platform fee ({commissionRate}%): {breakdown.platformFee.display}
              </Text>
            </View>
            <View style={styles.calculationStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Your earnings: {breakdown.netAmount.display}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );

  return (
    <>
      {showDetailedView ? <DetailedView /> : <CompactView />}
      <DetailedModal />
    </>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactMainInfo: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  compactAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  compactFeeInfo: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  compactFeeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  compactFeeAmount: {
    fontSize: 14,
    color: '#EF4444',
  },
  detailedContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoButton: {
    padding: 4,
  },
  breakdownContainer: {
    marginBottom: 24,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  totalItem: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemLabel: {
    fontSize: 16,
    color: colors.text,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  percentageText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  benefitsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.primary + '10',
    gap: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disputeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disputeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  explanationContainer: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  calculationSteps: {
    gap: 12,
  },
  calculationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});

export default CommissionFeeBreakdown;