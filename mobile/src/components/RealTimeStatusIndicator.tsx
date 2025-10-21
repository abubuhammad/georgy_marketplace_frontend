import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTime } from '../contexts/RealTimeContext';
import { colors } from '../theme/theme';

interface RealTimeStatusIndicatorProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  onPress?: () => void;
}

export const RealTimeStatusIndicator: React.FC<RealTimeStatusIndicatorProps> = ({
  showText = false,
  size = 'medium',
  position = 'inline',
  onPress,
}) => {
  const { connectionStatus } = useRealTime();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [lastActivity, setLastActivity] = useState<string>('');

  // Pulse animation for connecting state
  useEffect(() => {
    if (connectionStatus.connecting) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (connectionStatus.connecting) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectionStatus.connecting, pulseAnim]);

  const getStatusInfo = () => {
    if (connectionStatus.connecting) {
      return {
        icon: 'radio-outline' as const,
        color: colors.warning,
        text: 'Connecting...',
        backgroundColor: colors.warning + '20',
      };
    }
    
    if (connectionStatus.connected) {
      return {
        icon: 'radio' as const,
        color: '#10B981',
        text: 'Live',
        backgroundColor: '#10B981' + '20',
      };
    }

    return {
      icon: 'radio-outline' as const,
      color: '#EF4444',
      text: 'Offline',
      backgroundColor: '#EF4444' + '20',
    };
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { padding: 6 },
          icon: 12,
          text: { fontSize: 10 },
        };
      case 'large':
        return {
          container: { padding: 12 },
          icon: 20,
          text: { fontSize: 16 },
        };
      default: // medium
        return {
          container: { padding: 8 },
          icon: 16,
          text: { fontSize: 12 },
        };
    }
  };

  const getPositionStyles = () => {
    const basePositionStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'top-right':
        return { ...basePositionStyles, top: 10, right: 10 };
      case 'top-left':
        return { ...basePositionStyles, top: 10, left: 10 };
      case 'bottom-right':
        return { ...basePositionStyles, bottom: 10, right: 10 };
      case 'bottom-left':
        return { ...basePositionStyles, bottom: 10, left: 10 };
      default:
        return {};
    }
  };

  const statusInfo = getStatusInfo();
  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const content = (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: statusInfo.backgroundColor },
        positionStyles,
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: connectionStatus.connecting ? pulseAnim : 1,
          },
        ]}
      >
        <Ionicons
          name={statusInfo.icon}
          size={sizeStyles.icon}
          color={statusInfo.color}
        />
      </Animated.View>
      
      {showText && (
        <Text
          style={[
            styles.statusText,
            sizeStyles.text,
            { color: statusInfo.color },
          ]}
        >
          {statusInfo.text}
        </Text>
      )}

      {connectionStatus.reconnectAttempts > 0 && (
        <View style={styles.reconnectBadge}>
          <Text style={styles.reconnectText}>
            {connectionStatus.reconnectAttempts}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// Connection Quality Indicator
interface ConnectionQualityProps {
  style?: any;
}

export const ConnectionQualityIndicator: React.FC<ConnectionQualityProps> = ({ style }) => {
  const { connectionStatus } = useRealTime();
  const [signalStrength, setSignalStrength] = useState(3);

  useEffect(() => {
    // Mock signal strength based on connection status
    if (connectionStatus.connected) {
      setSignalStrength(Math.floor(Math.random() * 2) + 3); // 3-4 bars when connected
    } else if (connectionStatus.connecting) {
      setSignalStrength(2);
    } else {
      setSignalStrength(0);
    }
  }, [connectionStatus]);

  return (
    <View style={[styles.signalContainer, style]}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={[
            styles.signalBar,
            {
              height: bar * 3 + 4,
              backgroundColor: bar <= signalStrength ? '#10B981' : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Activity Feed Component
interface ActivityFeedProps {
  maxItems?: number;
}

export const RealtimeActivityFeed: React.FC<ActivityFeedProps> = ({ maxItems = 5 }) => {
  const { notifications } = useRealTime();
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }>>([]);

  useEffect(() => {
    // Convert notifications to activity feed items
    const recentActivities = notifications
      .slice(0, maxItems)
      .map(notification => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        timestamp: notification.createdAt,
        icon: getIconForNotificationType(notification.type),
        color: getColorForNotificationType(notification.type),
      }));
    
    setActivities(recentActivities);
  }, [notifications, maxItems]);

  const getIconForNotificationType = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'order': return 'bag-outline';
      case 'delivery': return 'car-outline';
      case 'payment': return 'card-outline';
      case 'chat': return 'chatbubble-outline';
      case 'artisan': return 'hammer-outline';
      default: return 'notifications-outline';
    }
  };

  const getColorForNotificationType = (type: string): string => {
    switch (type) {
      case 'order': return '#3B82F6';
      case 'delivery': return '#10B981';
      case 'payment': return '#F59E0B';
      case 'chat': return '#8B5CF6';
      case 'artisan': return '#EF4444';
      default: return colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (activities.length === 0) {
    return (
      <View style={styles.emptyActivity}>
        <Ionicons name="pulse-outline" size={24} color={colors.textSecondary} />
        <Text style={styles.emptyActivityText}>No recent activity</Text>
      </View>
    );
  }

  return (
    <View style={styles.activityFeed}>
      {activities.map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
            <Ionicons name={activity.icon} size={14} color={activity.color} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityMessage} numberOfLines={2}>
              {activity.message}
            </Text>
            <Text style={styles.activityTime}>
              {formatTimestamp(activity.timestamp)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  reconnectBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reconnectText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
  },
  activityFeed: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  emptyActivityText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default RealTimeStatusIndicator;