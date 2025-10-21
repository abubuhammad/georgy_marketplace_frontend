import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  type: 'new_request' | 'quote_received' | 'job_update' | 'message_received' | 'payment_completed';
  title: string;
  body: string;
  data?: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Setup listeners
      this.setupNotificationListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  private async setupAndroidChannels() {
    await Notifications.setNotificationChannelAsync('artisan-connect', {
      name: 'ArtisanConnect',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('job-updates', {
      name: 'Job Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  private setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listen for user tapping on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    const { type } = notification.request.content.data as any;
    
    // Handle different notification types
    switch (type) {
      case 'new_request':
        // Update request count badge
        this.setBadgeCount(1);
        break;
      case 'message_received':
        // Could trigger chat list refresh
        break;
      case 'job_update':
        // Could refresh job status
        break;
      default:
        break;
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { type, chatId, requestId, artisanId } = response.notification.request.content.data as any;
    
    // Navigate based on notification type
    switch (type) {
      case 'message_received':
        // Navigate to chat screen
        if (chatId) {
          // This would need to be handled by the navigation system
          console.log('Navigate to chat:', chatId);
        }
        break;
      case 'new_request':
      case 'quote_received':
        // Navigate to request dashboard
        console.log('Navigate to requests');
        break;
      case 'job_update':
        // Navigate to job details
        if (requestId) {
          console.log('Navigate to job:', requestId);
        }
        break;
      default:
        break;
    }
  }

  async scheduleLocalNotification(notification: PushNotificationData) {
    try {
      const channelId = this.getChannelId(notification.type);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  private getChannelId(type: PushNotificationData['type']): string {
    switch (type) {
      case 'message_received':
        return 'messages';
      case 'job_update':
      case 'quote_received':
        return 'job-updates';
      default:
        return 'artisan-connect';
    }
  }

  async setBadgeCount(count: number) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge() {
    await this.setBadgeCount(0);
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Send push token to server
  async registerPushToken(userId: string): Promise<boolean> {
    try {
      if (!this.expoPushToken) {
        console.warn('No push token available');
        return false;
      }

      // TODO: Send to your backend API
      const response = await fetch('/api/push-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: this.expoPushToken,
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        console.log('Push token registered successfully');
        return true;
      } else {
        console.error('Failed to register push token');
        return false;
      }
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  // Create preset notification templates
  static createNotificationTemplates() {
    return {
      newServiceRequest: (artisanName: string, service: string): PushNotificationData => ({
        type: 'new_request',
        title: 'New Service Request',
        body: `${artisanName} needs help with ${service}`,
        data: { type: 'new_request' },
      }),

      quoteReceived: (artisanName: string, amount: number): PushNotificationData => ({
        type: 'quote_received',
        title: 'Quote Received',
        body: `${artisanName} sent you a quote for ₦${amount.toLocaleString()}`,
        data: { type: 'quote_received' },
      }),

      messageReceived: (senderName: string, preview: string): PushNotificationData => ({
        type: 'message_received',
        title: `Message from ${senderName}`,
        body: preview,
        data: { type: 'message_received' },
      }),

      jobStatusUpdate: (status: string, jobTitle: string): PushNotificationData => ({
        type: 'job_update',
        title: 'Job Update',
        body: `Your ${jobTitle} is now ${status}`,
        data: { type: 'job_update' },
      }),

      paymentCompleted: (amount: number, jobTitle: string): PushNotificationData => ({
        type: 'payment_completed',
        title: 'Payment Completed',
        body: `Payment of ₦${amount.toLocaleString()} for ${jobTitle} has been processed`,
        data: { type: 'payment_completed' },
      }),
    };
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }
}

export default new PushNotificationService();