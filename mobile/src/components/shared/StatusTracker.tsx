import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

interface StatusStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  icon: string;
  timestamp?: string;
}

interface StatusTrackerProps {
  steps: StatusStep[];
  currentStep: number;
  type?: 'job' | 'order' | 'request';
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  steps,
  currentStep,
  type = 'job'
}) => {
  const getStepColor = (step: StatusStep) => {
    if (step.completed) return colors.success;
    if (step.current) return colors.primary;
    return colors.textSecondary;
  };

  const getStepIcon = (step: StatusStep) => {
    if (step.completed) return 'checkmark-circle';
    if (step.current) return step.icon;
    return 'ellipse-outline';
  };

  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          {type === 'job' ? 'Job' : type === 'order' ? 'Order' : 'Request'} Progress
        </Text>
        <Text variant="bodySmall" style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <ProgressBar
        progress={progress / 100}
        color={colors.primary}
        style={styles.progressBar}
      />

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIcon, { backgroundColor: getStepColor(step) }]}>
                <Ionicons
                  name={getStepIcon(step) as any}
                  size={20}
                  color={colors.white}
                />
              </View>
              
              <View style={styles.stepContent}>
                <Text
                  variant="titleSmall"
                  style={[
                    styles.stepTitle,
                    { color: step.current ? colors.primary : colors.text }
                  ]}
                >
                  {step.title}
                </Text>
                <Text variant="bodySmall" style={styles.stepDescription}>
                  {step.description}
                </Text>
                {step.timestamp && (
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {step.timestamp}
                  </Text>
                )}
              </View>
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: step.completed
                      ? colors.success
                      : colors.border
                  }
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontWeight: 'bold',
  },
  progressText: {
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    marginBottom: 24,
    backgroundColor: colors.border,
  },
  stepsContainer: {
    paddingLeft: 8,
  },
  stepContainer: {
    position: 'relative',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    marginBottom: 4,
    fontWeight: '500',
  },
  stepDescription: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  timestamp: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  connector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 16,
  },
});
