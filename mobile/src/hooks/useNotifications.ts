import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      addNotificationToList(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

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
        
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your Expo project ID
        });
        
        setExpoPushToken(token.data);
        return token.data;
      } else {
        console.log('Must use physical device for Push Notifications');
        return null;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  };

  const addNotificationToList = (notification: Notifications.Notification) => {
    const notificationData: NotificationData = {
      id: notification.request.identifier,
      title: notification.request.content.title || 'No Title',
      body: notification.request.content.body || 'No Body',
      data: notification.request.content.data,
      categoryId: notification.request.content.categoryIdentifier,
    };

    setNotifications(prev => [notificationData, ...prev]);
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Handle different types of notifications
    if (data?.type === 'service_request') {
      // Navigate to service requests screen
      console.log('Navigate to service request:', data.requestId);
    } else if (data?.type === 'message') {
      // Navigate to chat screen
      console.log('Navigate to chat:', data.chatId);
    } else if (data?.type === 'quote') {
      // Navigate to quotes screen
      console.log('Navigate to quote:', data.quoteId);
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    triggerDate?: Date
  ) => {
    try {
      setLoading(true);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: triggerDate ? { date: triggerDate } : null,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelNotification = async (identifier: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  const clearBadge = async () => {
    await setBadgeCount(0);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    clearBadge();
  };

  // Notification templates for different scenarios
  const notifyServiceRequest = async (artisanName: string, requestId: string) => {
    return scheduleLocalNotification(
      'New Service Request',
      `${artisanName} has received your service request`,
      { type: 'service_request', requestId }
    );
  };

  const notifyQuoteReceived = async (artisanName: string, quoteId: string) => {
    return scheduleLocalNotification(
      'Quote Received',
      `${artisanName} has sent you a quote`,
      { type: 'quote', quoteId }
    );
  };

  const notifyJobUpdate = async (status: string, jobId: string) => {
    return scheduleLocalNotification(
      'Job Update',
      `Your job status has been updated to: ${status}`,
      { type: 'job_update', jobId }
    );
  };

  const notifyNewMessage = async (senderName: string, chatId: string) => {
    return scheduleLocalNotification(
      'New Message',
      `${senderName} sent you a message`,
      { type: 'message', chatId }
    );
  };

  return {
    expoPushToken,
    notification,
    notifications,
    loading,
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    clearBadge,
    markNotificationAsRead,
    removeNotification,
    clearAllNotifications,
    notifyServiceRequest,
    notifyQuoteReceived,
    notifyJobUpdate,
    notifyNewMessage,
  };
};
