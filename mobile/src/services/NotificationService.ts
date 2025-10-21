import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService';

class NotificationServiceClass {
  private readonly PUSH_TOKEN_KEY = 'expo_push_token';

  async initialize(): Promise<void> {
    try {
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Listen for notifications
      this.setupNotificationListeners();
      
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        
        // Store token locally
        await AsyncStorage.setItem(this.PUSH_TOKEN_KEY, token);
        
        // Send token to server
        await this.sendTokenToServer(token);
        
      } catch (error) {
        console.error('Failed to get push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DC2626',
      });
    }

    return token;
  }

  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived);

    // Handle notification tap
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
  }

  private handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
    
    // You can customize the behavior here
    // For example, update Redux store, show custom UI, etc.
  };

  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification tapped:', response);
    
    const { data } = response.notification.request.content;
    
    // Handle navigation based on notification type
    this.handleNotificationNavigation(data);
  };

  private handleNotificationNavigation(data: any): void {
    // This would typically use your navigation service
    // to navigate to the appropriate screen based on notification type
    console.log('Navigation data:', data);
    
    // Example navigation logic:
    // if (data.type === 'new_request') {
    //   NavigationService.navigate('ServiceRequest', { requestId: data.requestId });
    // } else if (data.type === 'job_update') {
    //   NavigationService.navigate('JobDetails', { jobId: data.jobId });
    // }
  }

  async sendTokenToServer(token: string): Promise<void> {
    try {
      await ApiService.post('/notifications/register-device', {
        pushToken: token,
        platform: Platform.OS,
        deviceType: Device.deviceType,
      });
    } catch (error) {
      console.error('Failed to send push token to server:', error);
    }
  }

  async schedulePushNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null means immediate
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // Local notification helpers for different types
  async notifyNewServiceRequest(requestData: any): Promise<void> {
    await this.schedulePushNotification(
      'New Service Request',
      `You have a new ${requestData.category} request nearby`,
      {
        type: 'new_request',
        requestId: requestData.id,
      }
    );
  }

  async notifyQuoteReceived(quoteData: any): Promise<void> {
    await this.schedulePushNotification(
      'Quote Received',
      `You received a quote of $${quoteData.amount} for your request`,
      {
        type: 'quote_received',
        quoteId: quoteData.id,
        requestId: quoteData.requestId,
      }
    );
  }

  async notifyJobUpdate(jobData: any): Promise<void> {
    await this.schedulePushNotification(
      'Job Update',
      jobData.message,
      {
        type: 'job_update',
        jobId: jobData.jobId,
      }
    );
  }

  async notifyNewMessage(messageData: any): Promise<void> {
    await this.schedulePushNotification(
      `Message from ${messageData.senderName}`,
      messageData.content,
      {
        type: 'new_message',
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
      }
    );
  }

  async notifyPaymentUpdate(paymentData: any): Promise<void> {
    await this.schedulePushNotification(
      'Payment Update',
      `Your payment of $${paymentData.amount} has been ${paymentData.status}`,
      {
        type: 'payment_update',
        paymentId: paymentData.id,
        jobId: paymentData.jobId,
      }
    );
  }
}

export const NotificationService = new NotificationServiceClass();
