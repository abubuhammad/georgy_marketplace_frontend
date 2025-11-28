import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  artisanId: string;
  jobId: string;
  jobTitle: string;
  rating: number;
  reviewText?: string;
  images?: string[];
  createdAt: string;
  isVerified: boolean;
  isHelpful: boolean;
  helpfulCount: number;
  response?: {
    text: string;
    createdAt: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviews: number;
  responseRate: number;
}

interface ReviewsScreenProps {
  navigation: any;
  route: any;
}

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({ navigation, route }) => {
  const { artisanId, mode = 'view' } = route.params || {};
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // New review state
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadReviews();
    loadReviewStats();
  }, [artisanId, filterRating, sortBy]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockReviews: Review[] = [
        {
          id: '1',
          customerId: 'cust_1',
          customerName: 'Sarah Johnson',
          customerAvatar: '',
          artisanId: artisanId || 'art_1',
          jobId: 'job_1',
          jobTitle: 'Kitchen Faucet Repair',
          rating: 5,
          reviewText: 'Excellent work! John arrived on time, was very professional, and fixed the issue quickly. The faucet works perfectly now. Highly recommend!',
          images: [],
          createdAt: '2024-01-15T10:30:00Z',
          isVerified: true,
          isHelpful: true,
          helpfulCount: 12,
          response: {
            text: 'Thank you for the kind words, Sarah! I\'m glad I could help fix your faucet quickly.',
            createdAt: '2024-01-15T14:00:00Z',
          },
        },
        {
          id: '2',
          customerId: 'cust_2',
          customerName: 'Michael Brown',
          artisanId: artisanId || 'art_1',
          jobId: 'job_2',
          jobTitle: 'Bathroom Pipe Installation',
          rating: 4,
          reviewText: 'Good service overall. The work was completed well, though it took a bit longer than expected. Fair pricing.',
          createdAt: '2024-01-12T16:45:00Z',
          isVerified: true,
          isHelpful: false,
          helpfulCount: 5,
        },
        {
          id: '3',
          customerId: 'cust_3',
          customerName: 'Emma Davis',
          artisanId: artisanId || 'art_1',
          jobId: 'job_3',
          jobTitle: 'Water Heater Maintenance',
          rating: 5,
          reviewText: 'Outstanding service! Very knowledgeable and explained everything clearly. Will definitely hire again.',
          createdAt: '2024-01-10T09:20:00Z',
          isVerified: true,
          isHelpful: true,
          helpfulCount: 8,
        },
        {
          id: '4',
          customerId: 'cust_4',
          customerName: 'David Wilson',
          artisanId: artisanId || 'art_1',
          jobId: 'job_4',
          jobTitle: 'Toilet Repair',
          rating: 3,
          reviewText: 'Average experience. The problem was fixed but communication could have been better.',
          createdAt: '2024-01-08T11:15:00Z',
          isVerified: false,
          isHelpful: false,
          helpfulCount: 2,
        },
      ];

      // Apply filtering and sorting
      let filteredReviews = filterRating 
        ? mockReviews.filter(review => review.rating === filterRating)
        : mockReviews;

      // Sort reviews
      filteredReviews.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'highest':
            return b.rating - a.rating;
          case 'lowest':
            return a.rating - b.rating;
          default:
            return 0;
        }
      });

      setReviews(filteredReviews);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async () => {
    try {
      // TODO: Replace with actual API call
      const mockStats: ReviewStats = {
        averageRating: 4.3,
        totalReviews: 47,
        ratingDistribution: {
          5: 23,
          4: 12,
          3: 8,
          2: 3,
          1: 1,
        },
        verifiedReviews: 42,
        responseRate: 85,
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load review stats:', error);
    }
  };

  const submitReview = async () => {
    if (newRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    try {
      setLoading(true);

      const reviewData = {
        artisanId,
        jobId: route.params?.jobId,
        rating: newRating,
        reviewText: newReviewText.trim() || undefined,
        images: selectedImages,
      };

      // TODO: Submit to API
      console.log('Submitting review:', reviewData);

      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. Your review helps other customers make informed decisions.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCreateModal(false);
              loadReviews();
              loadReviewStats();
            },
          },
        ]
      );

      // Reset form
      setNewRating(0);
      setNewReviewText('');
      setSelectedImages([]);

    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      // TODO: Submit to API
      console.log('Marking review as helpful:', reviewId);
      
      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, isHelpful: !review.isHelpful, helpfulCount: review.isHelpful ? review.helpfulCount - 1 : review.helpfulCount + 1 }
          : review
      ));
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={interactive ? () => setNewRating(star) : undefined}
            disabled={!interactive}
            style={interactive ? styles.interactiveStar : undefined}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? '#F59E0B' : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    const maxCount = Math.max(...Object.values(stats.ratingDistribution));

    return (
      <View style={styles.ratingDistribution}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <TouchableOpacity
              key={rating}
              style={styles.distributionRow}
              onPress={() => setFilterRating(filterRating === rating ? null : rating)}
            >
              <Text style={styles.distributionRating}>{rating}</Text>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <View style={styles.distributionBarContainer}>
                <View 
                  style={[
                    styles.distributionBar, 
                    { width: `${percentage}%` },
                    filterRating === rating && styles.distributionBarActive
                  ]} 
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderReviewItem = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            {review.customerAvatar ? (
              <Image source={{ uri: review.customerAvatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {review.customerName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.reviewerDetails}>
            <View style={styles.reviewerNameRow}>
              <Text style={styles.reviewerName}>{review.customerName}</Text>
              {review.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              )}
            </View>
            <Text style={styles.jobTitle}>{review.jobTitle}</Text>
          </View>
        </View>
        <View style={styles.reviewMeta}>
          {renderStars(review.rating, 14)}
          <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
        </View>
      </View>

      {review.reviewText && (
        <Text style={styles.reviewText}>{review.reviewText}</Text>
      )}

      {review.images && review.images.length > 0 && (
        <ScrollView horizontal style={styles.reviewImages} showsHorizontalScrollIndicator={false}>
          {review.images.map((imageUrl, index) => (
            <Image key={index} source={{ uri: imageUrl }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}

      {review.response && (
        <View style={styles.artisanResponse}>
          <View style={styles.responseHeader}>
            <Ionicons name="person-circle" size={20} color={colors.primary} />
            <Text style={styles.responseLabel}>Artisan Response</Text>
            <Text style={styles.responseDate}>{formatDate(review.response.createdAt)}</Text>
          </View>
          <Text style={styles.responseText}>{review.response.text}</Text>
        </View>
      )}

      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={[styles.helpfulButton, review.isHelpful && styles.helpfulButtonActive]}
          onPress={() => markHelpful(review.id)}
        >
          <Ionicons 
            name={review.isHelpful ? 'thumbs-up' : 'thumbs-up-outline'} 
            size={16} 
            color={review.isHelpful ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.helpfulText,
            review.isHelpful && styles.helpfulTextActive
          ]}>
            Helpful ({review.helpfulCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton}>
          <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.reportText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const CreateReviewModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rate your experience</Text>
              {renderStars(newRating, 32, true)}
              {newRating > 0 && (
                <Text style={styles.ratingDescription}>
                  {newRating === 5 && 'Excellent!'}
                  {newRating === 4 && 'Very Good'}
                  {newRating === 3 && 'Good'}
                  {newRating === 2 && 'Fair'}
                  {newRating === 1 && 'Poor'}
                </Text>
              )}
            </View>

            <View style={styles.reviewTextSection}>
              <Text style={styles.reviewTextLabel}>Write a review (optional)</Text>
              <TextInput
                style={styles.reviewTextInput}
                value={newReviewText}
                onChangeText={setNewReviewText}
                placeholder="Share your experience to help other customers..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {newReviewText.length}/500
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, newRating === 0 && styles.submitButtonDisabled]}
              onPress={submitReview}
              disabled={loading || newRating === 0}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Submitting...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.submitButtonText}>Submit Review</Text>
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
        <Text style={styles.title}>Reviews & Ratings</Text>
        {mode === 'create' && (
          <TouchableOpacity onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsSection}>
            <View style={styles.overallRating}>
              <Text style={styles.averageRating}>{stats.averageRating.toFixed(1)}</Text>
              {renderStars(Math.round(stats.averageRating), 20)}
              <Text style={styles.totalReviews}>
                {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </Text>
            </View>

            {renderRatingDistribution()}

            <View style={styles.additionalStats}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.statText}>
                  {stats.verifiedReviews} verified reviews
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color={colors.primary} />
                <Text style={styles.statText}>
                  {stats.responseRate}% response rate
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Filters and Sort */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <TouchableOpacity
              style={[styles.filterButton, !filterRating && styles.filterButtonActive]}
              onPress={() => setFilterRating(null)}
            >
              <Text style={[styles.filterText, !filterRating && styles.filterTextActive]}>
                All Reviews
              </Text>
            </TouchableOpacity>
            
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.filterButton, filterRating === rating && styles.filterButtonActive]}
                onPress={() => setFilterRating(filterRating === rating ? null : rating)}
              >
                <Ionicons 
                  name="star" 
                  size={14} 
                  color={filterRating === rating ? colors.white : '#F59E0B'} 
                />
                <Text style={[styles.filterText, filterRating === rating && styles.filterTextActive]}>
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          {reviews.length > 0 ? (
            reviews.map(renderReviewItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to share your experience with this artisan
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CreateReviewModal />
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

  // Stats Section
  statsSection: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  interactiveStar: {
    padding: 4,
  },
  totalReviews: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingDistribution: {
    gap: 8,
    marginBottom: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionRating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    width: 12,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  distributionBarActive: {
    backgroundColor: colors.primary,
  },
  distributionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Filters Section
  filtersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersScroll: {
    flex: 1,
    marginRight: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: 8,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Reviews Section
  reviewsSection: {
    paddingVertical: 8,
  },
  reviewItem: {
    backgroundColor: colors.white,
    marginVertical: 4,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  jobTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  artisanResponse: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
    flex: 1,
  },
  responseDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  responseText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  helpfulButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  helpfulText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  helpfulTextActive: {
    color: colors.primary,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reportText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal Styles
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
  ratingSection: {
    alignItems: 'center',
    padding: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 16,
  },
  ratingDescription: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  reviewTextSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reviewTextLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ReviewsScreen;