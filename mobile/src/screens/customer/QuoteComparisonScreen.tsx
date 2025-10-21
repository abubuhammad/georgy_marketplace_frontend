import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import AntiCheatPaymentService, { PaymentFlowState } from '../../services/AntiCheatPaymentService';

interface Quote {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanRating: number;
  artisanReviews: number;
  amount: number;
  estimatedDuration: string;
  description: string;
  materials: string[];
  warranty: string;
  availability: string;
  submittedAt: string;
  isRecommended?: boolean;
}

interface QuoteComparisonScreenProps {
  navigation: any;
  route: any;
}

export const QuoteComparisonScreen: React.FC<QuoteComparisonScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { requestId } = route.params;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowState | null>(null);

  useEffect(() => {
    loadQuotes();
  }, [requestId]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockQuotes: Quote[] = [
        {
          id: '1',
          artisanId: 'art_1',
          artisanName: 'John Doe',
          artisanRating: 4.9,
          artisanReviews: 127,
          amount: 15000,
          estimatedDuration: '2-3 hours',
          description: 'I will fix your kitchen faucet with high-quality parts and provide a 6-month warranty.',
          materials: ['New faucet cartridge', 'Plumber\'s tape', 'O-rings'],
          warranty: '6 months',
          availability: 'Available tomorrow',
          submittedAt: '2024-01-15T10:30:00Z',
          isRecommended: true,
        },
        {
          id: '2',
          artisanId: 'art_2',
          artisanName: 'Sarah Wilson',
          artisanRating: 4.7,
          artisanReviews: 85,
          amount: 12000,
          estimatedDuration: '1-2 hours',
          description: 'Quick and efficient faucet repair service. I bring all necessary tools and materials.',
          materials: ['Replacement parts', 'Sealants', 'Tools'],
          warranty: '3 months',
          availability: 'Available this evening',
          submittedAt: '2024-01-15T11:15:00Z',
        },
        {
          id: '3',
          artisanId: 'art_3',
          artisanName: 'Mike Johnson',
          artisanRating: 4.8,
          artisanReviews: 63,
          amount: 18000,
          estimatedDuration: '3-4 hours',
          description: 'Premium service with thorough inspection of entire plumbing system and preventive maintenance.',
          materials: ['Premium faucet', 'Advanced sealants', 'System inspection'],
          warranty: '1 year',
          availability: 'Available next week',
          submittedAt: '2024-01-15T09:45:00Z',
        },
      ];
      
      setQuotes(mockQuotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = async (quote: Quote) => {
    try {
      setSelectedQuote(quote);
      
      // Calculate total costs
      const costBreakdown = AntiCheatPaymentService.calculateTotalCost(quote.amount);
      
      // Show payment confirmation
      Alert.alert(
        'Quote Selected',
        `You've selected ${quote.artisanName}'s quote for ₦${quote.amount.toLocaleString()}.\n\nTotal Payment Breakdown:\n• Service Fee: ₦${costBreakdown.serviceFee.toLocaleString()}\n• Job Amount: ₦${costBreakdown.subtotal.toLocaleString()}\n• Total: ₦${costBreakdown.totalCustomerPayment.toLocaleString()}\n\nThe artisan will receive ₦${costBreakdown.artisanEarnings.toLocaleString()} after our 10% platform fee.\n\nProceed with secure payment?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Proceed to Payment',
            onPress: () => initiatePaymentFlow(quote),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process quote selection');
    }
  };

  const initiatePaymentFlow = async (quote: Quote) => {
    try {
      setLoading(true);
      
      // Initialize anti-cheat payment flow
      const flow = await AntiCheatPaymentService.initiatePaymentFlow(
        requestId,
        'current-user-id', // TODO: Get from auth context
        quote.artisanId,
        quote.amount
      );
      
      setPaymentFlow(flow);
      setShowPaymentModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment flow');
    } finally {
      setLoading(false);
    }
  };

  const processServiceFeePayment = async () => {
    if (!paymentFlow?.payments.serviceFee) return;

    try {
      setLoading(true);
      
      // TODO: Show payment method selection modal
      const paymentMethod = 'card'; // User selected method
      const paymentDetails = {
        requestId,
        customerId: 'current-user-id',
        artisanId: selectedQuote?.artisanId,
      };

      const result = await AntiCheatPaymentService.processServiceFeePayment(
        paymentFlow.payments.serviceFee.id,
        paymentMethod,
        paymentDetails
      );

      if (result.status === 'paid') {
        Alert.alert(
          'Service Fee Paid!',
          'Your ₦2,000 service fee has been processed. Now please pay the escrow amount to secure the job.',
          [
            {
              text: 'Continue',
              onPress: () => processEscrowPayment(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const processEscrowPayment = async () => {
    if (!paymentFlow?.payments.escrow) return;

    try {
      setLoading(true);

      const paymentMethod = 'card'; // User selected method
      const paymentDetails = {
        requestId,
        customerId: 'current-user-id',
        artisanId: selectedQuote?.artisanId,
      };

      const result = await AntiCheatPaymentService.processEscrowDeposit(
        paymentFlow.payments.escrow.id,
        paymentMethod,
        paymentDetails
      );

      if (result.status === 'escrowed') {
        // Reveal artisan contact information
        const contactInfo = await AntiCheatPaymentService.revealArtisanContact(
          paymentFlow.payments.serviceFee!.id,
          result.id,
          selectedQuote!.artisanId
        );

        setShowPaymentModal(false);
        
        Alert.alert(
          'Payment Complete!',
          'Your payments have been processed successfully. The artisan\'s contact information has been revealed.',
          [
            {
              text: 'View Contact & Start Job',
              onPress: () => navigation.navigate('JobDetails', {
                requestId,
                quoteId: selectedQuote?.id,
                contactInfo,
                escrowId: result.id,
              }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'Escrow payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderQuoteCard = (quote: Quote) => (
    <View key={quote.id} style={styles.quoteCard}>
      {quote.isRecommended && (
        <View style={styles.recommendedBadge}>
          <Ionicons name="star" size={16} color={colors.white} />
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}

      <View style={styles.quoteHeader}>
        <View style={styles.artisanInfo}>
          <Text style={styles.artisanName}>{quote.artisanName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{quote.artisanRating}</Text>
            <Text style={styles.reviewsText}>({quote.artisanReviews} reviews)</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>₦{quote.amount.toLocaleString()}</Text>
          <Text style={styles.duration}>{quote.estimatedDuration}</Text>
        </View>
      </View>

      <Text style={styles.description}>{quote.description}</Text>

      <View style={styles.detailsSection}>
        <View style={styles.detailItem}>
          <Ionicons name="construct-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailLabel}>Materials:</Text>
          <Text style={styles.detailValue}>{quote.materials.join(', ')}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="shield-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailLabel}>Warranty:</Text>
          <Text style={styles.detailValue}>{quote.warranty}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailLabel}>Availability:</Text>
          <Text style={styles.detailValue}>{quote.availability}</Text>
        </View>
      </View>

      <View style={styles.quoteFooter}>
        <Text style={styles.submittedAt}>
          Submitted {formatDateTime(quote.submittedAt)}
        </Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => handleSelectQuote(quote)}
          disabled={loading}
        >
          <Text style={styles.selectButtonText}>Select Quote</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const PaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Secure Payment Process</Text>
            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedQuote && paymentFlow && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.selectedQuoteInfo}>
                <Text style={styles.selectedQuoteTitle}>Selected Quote</Text>
                <Text style={styles.selectedArtisan}>{selectedQuote.artisanName}</Text>
                <Text style={styles.selectedAmount}>₦{selectedQuote.amount.toLocaleString()}</Text>
              </View>

              <View style={styles.paymentBreakdown}>
                <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
                
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>1. Service Fee (Upfront)</Text>
                  <Text style={styles.breakdownAmount}>₦2,000</Text>
                </View>
                <Text style={styles.breakdownNote}>
                  Non-refundable booking fee to secure artisan services
                </Text>

                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>2. Job Amount (Escrow)</Text>
                  <Text style={styles.breakdownAmount}>₦{selectedQuote.amount.toLocaleString()}</Text>
                </View>
                <Text style={styles.breakdownNote}>
                  Held securely until job completion
                </Text>

                <View style={[styles.breakdownItem, styles.totalItem]}>
                  <Text style={styles.totalLabel}>Total Payment</Text>
                  <Text style={styles.totalAmount}>
                    ₦{(2000 + selectedQuote.amount).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.protectionInfo}>
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                <View style={styles.protectionText}>
                  <Text style={styles.protectionTitle}>Anti-Cheat Protection</Text>
                  <Text style={styles.protectionDescription}>
                    Contact information is revealed only after payment. This prevents off-platform settlements and ensures secure transactions.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.payButton}
                onPress={processServiceFeePayment}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.payButtonText}>Processing...</Text>
                ) : (
                  <>
                    <Ionicons name="card-outline" size={20} color={colors.white} />
                    <Text style={styles.payButtonText}>Start Secure Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Compare Quotes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.quotesContainer}>
          <Text style={styles.sectionTitle}>
            {quotes.length} Quote{quotes.length !== 1 ? 's' : ''} Received
          </Text>
          
          {quotes.map(renderQuoteCard)}
        </View>
      </ScrollView>

      <PaymentModal />
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
  scrollView: {
    flex: 1,
  },
  quotesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  quoteCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  },
  artisanInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  reviewsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsSection: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  submittedAt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  selectedQuoteInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  selectedQuoteTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  selectedArtisan: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentBreakdown: {
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.text,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  breakdownNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    marginLeft: 16,
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  protectionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#10B981' + '10',
    marginHorizontal: 20,
    borderRadius: 8,
    gap: 12,
  },
  protectionText: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  protectionDescription: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  payButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default QuoteComparisonScreen;