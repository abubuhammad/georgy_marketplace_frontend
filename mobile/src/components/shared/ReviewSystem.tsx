import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  user_avatar?: string;
}

interface ReviewSystemProps {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  canReview?: boolean;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
  canReview = false,
  onSubmitReview
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let iconName: string;
      let color: string;

      if (i <= fullStars) {
        iconName = 'star';
        color = colors.warning;
      } else if (i === fullStars + 1 && hasHalfStar) {
        iconName = 'star-half';
        color = colors.warning;
      } else {
        iconName = 'star-outline';
        color = colors.textSecondary;
      }

      stars.push(
        <Ionicons
          key={i}
          name={iconName as any}
          size={size}
          color={color}
          style={interactive ? styles.interactiveStar : undefined}
          onPress={interactive ? () => setRating(i) : undefined}
        />
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    setLoading(true);
    try {
      if (onSubmitReview) {
        await onSubmitReview(rating, comment);
        setShowReviewForm(false);
        setComment('');
        setRating(5);
        Alert.alert('Success', 'Your review has been submitted');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Overall Rating Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <View style={styles.ratingDisplay}>
              <Text variant="headlineLarge" style={styles.averageRating}>
                {averageRating.toFixed(1)}
              </Text>
              {renderStars(averageRating, 20)}
            </View>
            <Text variant="bodyMedium" style={styles.totalReviews}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Add Review Button */}
      {canReview && !showReviewForm && (
        <Button
          mode="outlined"
          icon="star"
          onPress={() => setShowReviewForm(true)}
          style={styles.addReviewButton}
        >
          Write a Review
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <Card style={styles.reviewForm}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.formTitle}>
              Write Your Review
            </Text>

            <View style={styles.ratingSection}>
              <Text variant="bodyMedium" style={styles.ratingLabel}>
                Rating: {rating} star{rating !== 1 ? 's' : ''}
              </Text>
              {renderStars(rating, 24, true)}
            </View>

            <TextInput
              label="Your Review"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Share your experience..."
              style={styles.commentInput}
            />

            <View style={styles.formActions}>
              <Button
                mode="outlined"
                onPress={() => setShowReviewForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmitReview}
                loading={loading}
                style={styles.submitButton}
              >
                Submit Review
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Reviews List */}
      <Text variant="titleMedium" style={styles.reviewsTitle}>
        Customer Reviews ({reviews.length})
      </Text>

      {reviews.length === 0 ? (
        <Card style={styles.noReviewsCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.noReviewsText}>
              No reviews yet. Be the first to review!
            </Text>
          </Card.Content>
        </Card>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Text variant="titleSmall" style={styles.reviewerName}>
                    {review.user_name}
                  </Text>
                  {renderStars(review.rating)}
                </View>
                <Text variant="bodySmall" style={styles.reviewDate}>
                  {formatDate(review.created_at)}
                </Text>
              </View>
              
              <Text variant="bodyMedium" style={styles.reviewComment}>
                {review.comment}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  summaryHeader: {
    alignItems: 'center',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginBottom: 8,
  },
  averageRating: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactiveStar: {
    padding: 4,
  },
  totalReviews: {
    color: colors.textSecondary,
  },
  addReviewButton: {
    marginBottom: 16,
  },
  reviewForm: {
    marginBottom: 16,
    elevation: 2,
  },
  formTitle: {
    color: colors.text,
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    color: colors.text,
    marginBottom: 8,
  },
  commentInput: {
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  reviewsTitle: {
    color: colors.text,
    marginBottom: 16,
  },
  noReviewsCard: {
    marginBottom: 16,
  },
  noReviewsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewCard: {
    marginBottom: 12,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  reviewDate: {
    color: colors.textSecondary,
  },
  reviewComment: {
    color: colors.text,
    lineHeight: 20,
  },
});
