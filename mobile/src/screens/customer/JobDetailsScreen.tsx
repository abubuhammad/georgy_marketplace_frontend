import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { AntiCheatPaymentService } from '../../services/AntiCheatPaymentService';
import { CommissionFeeBreakdown } from '../../components/CommissionFeeBreakdown';
import CommissionTrackingService from '../../services/CommissionTrackingService';

interface JobStatus {
  stage: 'contact_revealed' | 'escrow_pending' | 'job_started' | 'in_progress' | 'pending_completion' | 'completed' | 'disputed';
  canCompleteJob: boolean;
  canRateArtisan: boolean;
  canDepositEscrow: boolean;
  escrowReleased: boolean;
}

interface JobDetailsScreenProps {
  navigation: any;
  route: any;
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { requestId, quoteId, contactInfo, escrowId, jobTitle, jobAmount, artisanName } = route.params;
  const [jobStatus, setJobStatus] = useState<JobStatus>({
    stage: escrowId ? 'job_started' : 'escrow_pending',
    canCompleteJob: false,
    canRateArtisan: false,
    canDepositEscrow: !escrowId,
    escrowReleased: false,
  });
  const [loading, setLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [escrowDetails, setEscrowDetails] = useState<EscrowPayment | null>(null);

  const artisan: ArtisanContactInfo = contactInfo || {
    name: 'John Doe',
    phone: '+234-806-123-4567',
    email: 'john.doe@example.com',
    address: '123 Artisan Street, Lagos, Nigeria',
    isRevealed: true,
    revealedAt: new Date().toISOString(),
  };

  useEffect(() => {
    loadJobDetails();
  }, [requestId, escrowId]);

  const loadJobDetails = async () => {
    try {
      // TODO: Load actual job details from backend
      setJobStatus({
        stage: escrowId ? 'job_started' : 'escrow_pending',
        canCompleteJob: !!escrowId,
        canRateArtisan: false,
        canDepositEscrow: !escrowId,
        escrowReleased: false,
      });

      // Mock escrow details
      const mockEscrow: EscrowPayment = {
        id: escrowId,
        serviceRequestId: requestId,
        customerId: 'current-user-id',
        artisanId: 'art_1',
        totalAmount: 15000,
        platformFee: 1500,
        artisanAmount: 13500,
        serviceFeeId: 'sf_123',
        status: 'escrowed',
        paymentMethod: 'card',
        transactionRef: 'txn_123',
        escrowedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      setEscrowDetails(mockEscrow);
    } catch (error) {
      console.error('Failed to load job details:', error);
    }
  };

  const handleCallArtisan = () => {
    if (artisan.phone) {
      Linking.openURL(`tel:${artisan.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available');
    }
  };

  const handleEmailArtisan = () => {
    if (artisan.email) {
      Linking.openURL(`mailto:${artisan.email}`);
    } else {
      Alert.alert('No Email', 'Email address not available');
    }
  };

  const handleChatWithArtisan = () => {
    navigation.navigate('Chat', {
      chatId: `chat_${escrowDetails?.artisanId}`,
      participantId: escrowDetails?.artisanId,
      participantName: artisan.name,
    });
  };

  const handleEscrowDeposit = () => {
    if (!jobAmount || !artisanName || !jobTitle) {
      Alert.alert('Missing Information', 'Job details are incomplete. Please go back and try again.');
      return;
    }

    navigation.navigate('EscrowPayment', {
      jobId: requestId,
      amount: jobAmount,
      artisanId: escrowDetails?.artisanId || 'art_1',
      artisanName: artisanName,
      jobTitle: jobTitle,
    });
  };

  const handleCompleteJob = () => {
    Alert.alert(
      'Complete Job',
      'Are you satisfied with the work completed? This will release payment to the artisan.',
      [
        {
          text: 'Not Yet',
          style: 'cancel',
        },
        {
          text: 'Yes, Complete',
          onPress: () => setShowCompletionModal(true),
        },
      ]
    );
  };

  const processJobCompletion = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please rate the artisan before completing the job.');
      return;
    }

    try {
      setLoading(true);

      const completionProof = {
        rating,
        review: review.trim() || undefined,
      };

      const result = await AntiCheatPaymentService.releaseEscrowPayment(
        escrowId,
        'current-user-id',
        completionProof
      );

      if (result.status === 'released') {
        setShowCompletionModal(false);
        setJobStatus({
          stage: 'completed',
          canCompleteJob: false,
          canRateArtisan: false,
          escrowReleased: true,
        });

        Alert.alert(
          'Job Completed!',
          `Payment of ₦${result.artisanAmount.toLocaleString()} has been released to ${artisan.name}. Thank you for using ArtisanConnect!`,
          [
            {
              text: 'Done',
              onPress: () => navigation.navigate('RequestDashboard'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (jobStatus.stage) {
      case 'contact_revealed':
        return {
          color: '#3B82F6',
          icon: 'checkmark-circle-outline' as const,
          text: 'Contact Revealed - Ready to Start',
          description: 'You can now contact the artisan to arrange the service.',
        };
      case 'escrow_pending':
        return {
          color: '#F59E0B',
          icon: 'card-outline' as const,
          text: 'Escrow Deposit Required',
          description: 'Secure payment deposit required before work can begin.',
        };
      case 'job_started':
        return {
          color: '#F59E0B',
          icon: 'hammer-outline' as const,
          text: 'Job in Progress',
          description: 'The artisan is working on your request.',
        };
      case 'pending_completion':
        return {
          color: '#8B5CF6',
          icon: 'time-outline' as const,
          text: 'Pending Your Approval',
          description: 'The artisan has marked the job as complete. Please review and confirm.',
        };
      case 'completed':
        return {
          color: '#10B981',
          icon: 'checkmark-circle' as const,
          text: 'Job Completed',
          description: 'Payment has been released to the artisan.',
        };
      case 'disputed':
        return {
          color: '#EF4444',
          icon: 'warning-outline' as const,
          text: 'Dispute in Progress',
          description: 'A dispute has been raised. Our team will help resolve it.',
        };
      default:
        return {
          color: colors.textSecondary,
          icon: 'help-circle-outline' as const,
          text: 'Unknown Status',
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const CompletionModal = () => (
    <Modal
      visible={showCompletionModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCompletionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Complete Job</Text>
            <TouchableOpacity
              onPress={() => setShowCompletionModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.completionInfo}>
              <Text style={styles.completionTitle}>Rate Your Experience</Text>
              <Text style={styles.completionSubtitle}>
                How satisfied are you with {artisan.name}'s work?
              </Text>
            </View>

            <View style={styles.ratingSection}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? '#F59E0B' : colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Write a Review (Optional)</Text>
              <TextInput
                style={styles.reviewInput}
                value={review}
                onChangeText={setReview}
                placeholder="Share your experience with other customers..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {escrowDetails && (
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoTitle}>Payment Release</Text>
                <View style={styles.paymentBreakdown}>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Job Amount:</Text>
                    <Text style={styles.paymentAmount}>₦{escrowDetails.totalAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Platform Fee (10%):</Text>
                    <Text style={styles.paymentAmount}>-₦{escrowDetails.platformFee.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.paymentItem, styles.totalPayment]}>
                    <Text style={styles.totalLabel}>Artisan Receives:</Text>
                    <Text style={styles.totalAmount}>₦{escrowDetails.artisanAmount.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.completeButton, rating === 0 && styles.completeButtonDisabled]}
              onPress={processJobCompletion}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <Text style={styles.completeButtonText}>Processing...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.completeButtonText}>Complete Job & Release Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
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
        <Text style={styles.title}>Job Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon} size={24} color={statusInfo.color} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
            <Text style={styles.statusDescription}>{statusInfo.description}</Text>
          </View>
        </View>

        {/* Artisan Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artisan Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{artisan.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.artisanName}>{artisan.name}</Text>
                {artisan.revealedAt && (
                  <Text style={styles.revealedAt}>
                    Contact revealed on {new Date(artisan.revealedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactAction} onPress={handleCallArtisan}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
                <Text style={styles.contactActionText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactAction} onPress={handleChatWithArtisan}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={styles.contactActionText}>Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactAction} onPress={handleEmailArtisan}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <Text style={styles.contactActionText}>Email</Text>
              </TouchableOpacity>
            </View>

            {artisan.phone && (
              <View style={styles.contactDetail}>
                <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.contactDetailText}>{artisan.phone}</Text>
              </View>
            )}
            
            {artisan.email && (
              <View style={styles.contactDetail}>
                <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.contactDetailText}>{artisan.email}</Text>
              </View>
            )}
            
            {artisan.address && (
              <View style={styles.contactDetail}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.contactDetailText}>{artisan.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Protection Info */}
        <View style={styles.section}>
          <View style={styles.protectionCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.protectionContent}>
              <Text style={styles.protectionTitle}>Your Payment is Protected</Text>
              <Text style={styles.protectionDescription}>
                Your payment is held securely in escrow. It will only be released to the artisan when you mark the job as complete.
              </Text>
            </View>
          </View>
        </View>

        {/* Escrow Details */}
        {escrowDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.escrowCard}>
              <View style={styles.escrowItem}>
                <Text style={styles.escrowLabel}>Total Amount Escrowed:</Text>
                <Text style={styles.escrowValue}>₦{escrowDetails.totalAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.escrowItem}>
                <Text style={styles.escrowLabel}>Platform Fee (10%):</Text>
                <Text style={styles.escrowValue}>₦{escrowDetails.platformFee.toLocaleString()}</Text>
              </View>
              <View style={[styles.escrowItem, styles.escrowTotal]}>
                <Text style={styles.escrowTotalLabel}>Artisan Will Receive:</Text>
                <Text style={styles.escrowTotalValue}>₦{escrowDetails.artisanAmount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {jobStatus.canDepositEscrow && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.escrowButton}
              onPress={handleEscrowDeposit}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.white} />
              <Text style={styles.escrowButtonText}>Deposit Escrow Payment</Text>
            </TouchableOpacity>
            
            <View style={styles.escrowInfo}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.escrowInfoText}>
                Your payment will be held securely until you're satisfied with the work.
              </Text>
            </View>
          </View>
        )}
        
        {jobStatus.canCompleteJob && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.completeJobButton}
              onPress={handleCompleteJob}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
              <Text style={styles.completeJobButtonText}>Mark Job as Complete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.reportButton}>
              <Ionicons name="flag-outline" size={16} color="#EF4444" />
              <Text style={styles.reportButtonText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CompletionModal />
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
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  contactInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  revealedAt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  contactAction: {
    alignItems: 'center',
    gap: 4,
  },
  contactActionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  contactDetailText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  protectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#10B981' + '10',
    borderRadius: 8,
    gap: 12,
  },
  protectionContent: {
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
  escrowCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  escrowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  escrowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  escrowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  escrowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  escrowTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  escrowTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  completeJobButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeJobButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  reportButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#EF4444',
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
  completionInfo: {
    padding: 20,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  reviewSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    height: 80,
  },
  paymentInfo: {
    margin: 20,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentBreakdown: {
    gap: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalPayment: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  completeButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  
  // Escrow Button
  escrowButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  escrowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  escrowInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight + '40',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  escrowInfoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default JobDetailsScreen;