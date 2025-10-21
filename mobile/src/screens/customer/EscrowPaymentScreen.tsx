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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import AntiCheatPaymentService, {
  PaymentMethod,
  EscrowDepositResult,
  PaymentVerificationResult,
} from '../../services/AntiCheatPaymentService';
import PaymentGatewayService from '../../services/PaymentGatewayService';

interface EscrowPaymentScreenProps {
  navigation: any;
  route: {
    params: {
      jobId: string;
      amount: number;
      artisanId: string;
      artisanName: string;
      jobTitle: string;
    };
  };
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'card',
    name: 'Debit/Credit Card',
    icon: 'card',
    description: 'Visa, MasterCard, Verve',
    enabled: true,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: 'business',
    description: 'Direct bank transfer',
    enabled: true,
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    icon: 'phone-portrait',
    description: 'MTN, Airtel, 9mobile',
    enabled: true,
  },
  {
    id: 'ussd',
    name: 'USSD',
    icon: 'keypad',
    description: 'Dial *xxx# codes',
    enabled: true,
  },
];

export const EscrowPaymentScreen: React.FC<EscrowPaymentScreenProps> = ({ navigation, route }) => {
  const { jobId, amount, artisanId, artisanName, jobTitle } = route.params;
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(amount);

  // Card payment form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Bank transfer details
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Mobile money details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('mtn');

  useEffect(() => {
    calculateTransactionFee();
  }, [selectedMethod, amount]);

  const calculateTransactionFee = () => {
    if (!selectedMethod) {
      setTransactionFee(0);
      setTotalAmount(amount);
      return;
    }

    const fee = PaymentGatewayService.calculateTransactionFee(amount, selectedMethod);
    setTransactionFee(fee);
    setTotalAmount(amount + fee);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const initiatePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    try {
      setLoading(true);

      // Prepare payment data based on method
      let paymentData: any = {
        amount: totalAmount,
        method: selectedMethod,
        currency: 'NGN',
        reference: `escrow_${jobId}_${Date.now()}`,
      };

      switch (selectedMethod) {
        case 'card':
          if (!cardNumber || !expiryDate || !cvv || !cardName) {
            Alert.alert('Error', 'Please fill in all card details');
            return;
          }
          paymentData = {
            ...paymentData,
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryDate,
            cvv,
            cardholderName: cardName,
          };
          break;

        case 'bank_transfer':
          if (!bankCode || !accountNumber) {
            Alert.alert('Error', 'Please provide bank details');
            return;
          }
          paymentData = {
            ...paymentData,
            bankCode,
            accountNumber,
          };
          break;

        case 'mobile_money':
          if (!phoneNumber || !provider) {
            Alert.alert('Error', 'Please provide mobile money details');
            return;
          }
          paymentData = {
            ...paymentData,
            phoneNumber,
            provider,
          };
          break;

        case 'ussd':
          // USSD doesn't need additional details upfront
          break;
      }

      // Initiate escrow deposit through AntiCheatPaymentService
      const depositResult: EscrowDepositResult = await AntiCheatPaymentService.initiateEscrowDeposit(
        jobId,
        amount,
        selectedMethod,
        paymentData
      );

      if (depositResult.success && depositResult.paymentReference) {
        setPaymentReference(depositResult.paymentReference);
        
        if (selectedMethod === 'ussd') {
          // Show USSD code modal
          Alert.alert(
            'USSD Payment',
            `Dial ${depositResult.ussdCode} on your phone to complete payment`,
            [
              { text: 'I have dialed', onPress: () => startPaymentVerification(depositResult.paymentReference) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else if (selectedMethod === 'bank_transfer') {
          // Show bank details modal
          Alert.alert(
            'Bank Transfer',
            `Transfer ₦${totalAmount.toLocaleString()} to:\nAccount: ${depositResult.accountNumber}\nBank: ${depositResult.bankName}\nReference: ${depositResult.paymentReference}`,
            [
              { text: 'I have transferred', onPress: () => startPaymentVerification(depositResult.paymentReference) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          // For card and mobile money, proceed automatically
          startPaymentVerification(depositResult.paymentReference);
        }
      } else {
        Alert.alert('Payment Failed', depositResult.error || 'Unable to initiate payment');
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startPaymentVerification = async (reference: string) => {
    try {
      setVerifying(true);
      setShowPaymentModal(true);

      // Poll for payment verification
      const maxAttempts = 30; // 5 minutes with 10-second intervals
      let attempts = 0;

      const verifyPayment = async (): Promise<void> => {
        try {
          const verificationResult: PaymentVerificationResult = await AntiCheatPaymentService.verifyPayment(
            jobId,
            reference
          );

          if (verificationResult.verified) {
            setShowPaymentModal(false);
            Alert.alert(
              'Payment Successful!',
              `Your escrow deposit of ₦${amount.toLocaleString()} has been secured. The artisan can now start working on your job.`,
              [
                {
                  text: 'View Job Details',
                  onPress: () => navigation.navigate('JobDetails', { jobId })
                }
              ]
            );
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(verifyPayment, 10000); // Check again in 10 seconds
          } else {
            setShowPaymentModal(false);
            Alert.alert(
              'Payment Verification Timeout',
              'We could not confirm your payment. Please contact support if you have made the payment.',
              [
                { text: 'Contact Support', onPress: () => {} },
                { text: 'Try Again', onPress: () => startPaymentVerification(reference) }
              ]
            );
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(verifyPayment, 10000);
          } else {
            setShowPaymentModal(false);
            Alert.alert('Verification Error', 'Unable to verify payment status');
          }
        }
      };

      verifyPayment();

    } catch (error) {
      setVerifying(false);
      setShowPaymentModal(false);
      Alert.alert('Error', 'Failed to verify payment');
    }
  };

  const renderPaymentMethodCard = (method: PaymentMethodOption) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.methodCard,
        selectedMethod === method.id && styles.methodCardSelected,
        !method.enabled && styles.methodCardDisabled,
      ]}
      onPress={() => method.enabled && handlePaymentMethodSelect(method.id)}
      disabled={!method.enabled}
    >
      <View style={styles.methodIcon}>
        <Ionicons name={method.icon as any} size={24} color={selectedMethod === method.id ? colors.white : colors.primary} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={[
          styles.methodName,
          selectedMethod === method.id && styles.methodNameSelected
        ]}>
          {method.name}
        </Text>
        <Text style={[
          styles.methodDescription,
          selectedMethod === method.id && styles.methodDescriptionSelected
        ]}>
          {method.description}
        </Text>
      </View>
      {selectedMethod === method.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.white} />
      )}
    </TouchableOpacity>
  );

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case 'card':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>Card Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.textInput}
                value={cardName}
                onChangeText={setCardName}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            </View>
          </View>
        );

      case 'bank_transfer':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>Bank Transfer Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank</Text>
              <TextInput
                style={styles.textInput}
                value={bankCode}
                onChangeText={setBankCode}
                placeholder="Select your bank"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={styles.textInput}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="1234567890"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'mobile_money':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>Mobile Money Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Provider</Text>
              <View style={styles.providerButtons}>
                {['mtn', 'airtel', '9mobile'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.providerButton,
                      provider === p && styles.providerButtonSelected
                    ]}
                    onPress={() => setProvider(p)}
                  >
                    <Text style={[
                      styles.providerButtonText,
                      provider === p && styles.providerButtonTextSelected
                    ]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="08012345678"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        );

      case 'ussd':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>USSD Payment</Text>
            <Text style={styles.ussdInfo}>
              You will receive a USSD code to dial on your phone to complete the payment.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Secure Payment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Summary */}
        <View style={styles.jobSummary}>
          <Text style={styles.jobTitle}>{jobTitle}</Text>
          <Text style={styles.artisanName}>with {artisanName}</Text>
          
          <View style={styles.amountBreakdown}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Job Amount</Text>
              <Text style={styles.amountValue}>₦{amount.toLocaleString()}</Text>
            </View>
            {transactionFee > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Transaction Fee</Text>
                <Text style={styles.amountValue}>₦{transactionFee.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₦{totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <View style={styles.securityIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          </View>
          <Text style={styles.securityText}>
            Your payment is held securely in escrow until the job is completed and you're satisfied.
          </Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>
        <View style={styles.paymentMethods}>
          {PAYMENT_METHODS.map(renderPaymentMethodCard)}
        </View>

        {/* Payment Form */}
        {renderPaymentForm()}

        {/* Pay Button */}
        {selectedMethod && (
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={initiatePayment}
            disabled={loading}
          >
            <Text style={styles.payButtonText}>
              {loading ? 'Processing...' : `Pay ₦${totalAmount.toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Payment Verification Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="time" size={48} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Verifying Payment</Text>
            <Text style={styles.modalMessage}>
              Please wait while we confirm your payment...
            </Text>
            <Text style={styles.modalReference}>
              Reference: {paymentReference}
            </Text>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 20,
  },

  // Job Summary
  jobSummary: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  artisanName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  amountBreakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityIcon: {
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },

  // Payment Methods
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  methodCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  methodNameSelected: {
    color: colors.white,
  },
  methodDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  methodDescriptionSelected: {
    color: colors.white + '80',
  },

  // Payment Form
  paymentForm: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  providerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  providerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  providerButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  providerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  providerButtonTextSelected: {
    color: colors.white,
  },
  ussdInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Pay Button
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalReference: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});

export default EscrowPaymentScreen;