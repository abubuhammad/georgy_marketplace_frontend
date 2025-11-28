import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { ImagePicker } from '../../components/ImagePicker';
import { RealTimeStatusIndicator } from '../../components/RealTimeStatusIndicator';
import { getArtisanConnectSocketService } from '../../services/ArtisanConnectSocketService';

interface JobProgressScreenProps {
  navigation: any;
  route: any;
}

interface ProgressUpdate {
  description: string;
  images: string[];
  milestoneReached?: string;
  hoursWorked?: number;
}

export const JobProgressScreen: React.FC<JobProgressScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { jobId, jobTitle } = route.params || {};
  
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
    description: '',
    images: [],
    milestoneReached: '',
    hoursWorked: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const socketService = getArtisanConnectSocketService();

  useEffect(() => {
    // Subscribe to job progress updates for real-time feedback
    if (jobId) {
      const unsubscribe = socketService.subscribeToJobProgress(jobId, (event) => {
        console.log('Job progress update received:', event);
        // Handle incoming progress updates from other sources
      });

      return () => {
        unsubscribe();
      };
    }
  }, [jobId, socketService]);

  const handleImageSelection = (imageUris: string[]) => {
    setProgressUpdate(prev => ({ ...prev, images: imageUris }));
  };

  const handleImageError = (error: string) => {
    Alert.alert('Image Error', error);
  };

  const handleSubmitProgress = async () => {
    if (!progressUpdate.description.trim()) {
      Alert.alert('Error', 'Please enter a progress description');
      return;
    }

    setLoading(true);
    try {
      // Emit real-time progress update via WebSocket
      socketService.emitJobProgress({
        jobId,
        milestone: progressUpdate.milestoneReached,
        description: progressUpdate.description,
        images: progressUpdate.images,
        hoursWorked: progressUpdate.hoursWorked,
        completionPercentage: calculateCompletionPercentage(progressUpdate.milestoneReached || ''),
      });

      // TODO: Also submit to API for persistence
      console.log('Submitting progress update:', {
        jobId,
        ...progressUpdate,
      });
      
      Alert.alert(
        'Progress Updated!', 
        'Your progress update has been sent to the customer in real-time.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit progress update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionPercentage = (milestone: string): number => {
    const milestonePercentages: Record<string, number> = {
      'started': 20,
      'materials': 40,
      'progress': 60,
      'testing': 80,
      'completed': 100,
    };
    return milestonePercentages[milestone] || 0;
  };

  const progressSteps = [
    { id: 'started', label: 'Work Started', icon: 'play-circle-outline' },
    { id: 'materials', label: 'Materials Acquired', icon: 'cube-outline' },
    { id: 'progress', label: 'Work in Progress', icon: 'construct-outline' },
    { id: 'testing', label: 'Testing & Quality Check', icon: 'checkmark-circle-outline' },
    { id: 'completed', label: 'Work Completed', icon: 'trophy-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Update Progress</Text>
          <Text style={styles.jobTitle}>{jobTitle}</Text>
        </View>
        <RealTimeStatusIndicator 
          showText={true}
          size="small"
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Progress Milestones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestone Reached</Text>
            <View style={styles.milestonesContainer}>
              {progressSteps.map((step) => (
                <TouchableOpacity
                  key={step.id}
                  style={[
                    styles.milestoneOption,
                    progressUpdate.milestoneReached === step.id && styles.milestoneOptionSelected
                  ]}
                  onPress={() => setProgressUpdate(prev => ({ 
                    ...prev, 
                    milestoneReached: step.id 
                  }))}
                >
                  <Ionicons 
                    name={step.icon as any} 
                    size={20} 
                    color={progressUpdate.milestoneReached === step.id ? colors.white : colors.primary} 
                  />
                  <Text style={[
                    styles.milestoneText,
                    progressUpdate.milestoneReached === step.id && styles.milestoneTextSelected
                  ]}>
                    {step.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Progress Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress Description *</Text>
            <View style={styles.textAreaContainer}>
              <Text 
                style={styles.textArea}
                onPress={() => {
                  // TODO: Open text input modal or navigate to text editor
                }}
              >
                {progressUpdate.description || 'Describe the work completed and any important details...'}
              </Text>
            </View>
          </View>

          {/* Hours Worked */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours Worked Today</Text>
            <View style={styles.hoursContainer}>
              {[1, 2, 4, 6, 8].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.hoursOption,
                    progressUpdate.hoursWorked === hours && styles.hoursOptionSelected
                  ]}
                  onPress={() => setProgressUpdate(prev => ({ ...prev, hoursWorked: hours }))}
                >
                  <Text style={[
                    styles.hoursText,
                    progressUpdate.hoursWorked === hours && styles.hoursTextSelected
                  ]}>
                    {hours}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Progress Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            <Text style={styles.sectionDescription}>
              Upload photos showing your progress. These help build trust with customers.
            </Text>
            <ImagePicker
              maxImages={10}
              onImagesSelected={handleImageSelection}
              onError={handleImageError}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitProgress}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Updating...</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.white} />
              <Text style={styles.submitButtonText}>Update Progress</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  jobTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  milestonesContainer: {
    gap: 8,
  },
  milestoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  milestoneOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  milestoneText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  milestoneTextSelected: {
    color: colors.white,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    minHeight: 100,
  },
  textArea: {
    padding: 16,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hoursOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  hoursOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hoursText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  hoursTextSelected: {
    color: colors.white,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default JobProgressScreen;