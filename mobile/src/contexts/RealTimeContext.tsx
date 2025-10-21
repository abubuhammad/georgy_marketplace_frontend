import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getSocketClient } from '../lib/socketClient';
import { useAuth } from './AuthContext';
import {
  ConnectionStatus,
  Notification,
  ChatMessage,
  UserPresence,
  RealTimeAnalytics,
  LocationUpdate
} from '../types/realtime';

interface RealTimeContextType {
  // Connection
  connectionStatus: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Chat
  onlineUsers: Record<string, UserPresence>;
  joinChatRoom: (roomId: string) => void;
  leaveChatRoom: (roomId: string) => void;
  sendTypingIndicator: (roomId: string, isTyping: boolean) => void;

  // Order & Delivery Tracking
  trackOrder: (orderId: string) => void;
  trackDelivery: (deliveryId: string) => void;
  updateLocation: (deliveryId: string, location: { lat: number; lng: number }) => void;

  // Analytics (for admin)
  analyticsData: RealTimeAnalytics | null;

  // Event listeners
  onOrderUpdate: (callback: (data: any) => void) => () => void;
  onDeliveryUpdate: (callback: (data: any) => void) => () => void;
  onPaymentUpdate: (callback: (data: any) => void) => () => void;
  onNewMessage: (callback: (data: any) => void) => () => void;
  onUserTyping: (callback: (data: any) => void) => () => void;
  onNotification: (callback: (notification: Notification) => void) => () => void;
  onInventoryUpdate: (callback: (data: any) => void) => () => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const socketClient = getSocketClient();

  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    reconnectAttempts: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserPresence>>({});
  const [analyticsData, setAnalyticsData] = useState<RealTimeAnalytics | null>(null);

  // Connection management
  const connect = useCallback(async () => {
    if (!token || connectionStatus.connected) return;

    try {
      await socketClient.connect(token);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [token, connectionStatus.connected, socketClient]);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, [socketClient]);

  // Setup event listeners
  useEffect(() => {
    if (!socketClient) return;

    const unsubscribeConnection = socketClient.on('connectionStatus', (status: ConnectionStatus) => {
      setConnectionStatus(status);
    });

    const unsubscribeNotification = socketClient.on('newNotification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    const unsubscribePresence = socketClient.on('userPresenceUpdate', (data: { userId: string; status: string; timestamp: string }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: {
          userId: data.userId,
          status: data.status as any,
          lastSeen: data.timestamp
        }
      }));
    });

    const unsubscribeAnalytics = socketClient.on('analyticsUpdate', (data: RealTimeAnalytics) => {
      if (user?.role === 'admin') {
        setAnalyticsData(data);
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeNotification();
      unsubscribePresence();
      unsubscribeAnalytics();
    };
  }, [socketClient, user?.role]);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && token && !connectionStatus.connected && !connectionStatus.connecting) {
      connect();
    }
  }, [user, token, connect, connectionStatus]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user && connectionStatus.connected) {
      disconnect();
    }
  }, [user, disconnect, connectionStatus.connected]);

  // Notification management
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Chat methods
  const joinChatRoom = useCallback((roomId: string) => {
    socketClient.joinChatRoom(roomId);
  }, [socketClient]);

  const leaveChatRoom = useCallback((roomId: string) => {
    socketClient.leaveChatRoom(roomId);
  }, [socketClient]);

  const sendTypingIndicator = useCallback((roomId: string, isTyping: boolean) => {
    socketClient.sendTypingIndicator(roomId, isTyping);
  }, [socketClient]);

  // Tracking methods
  const trackOrder = useCallback((orderId: string) => {
    socketClient.trackOrder(orderId);
  }, [socketClient]);

  const trackDelivery = useCallback((deliveryId: string) => {
    socketClient.trackDelivery(deliveryId);
  }, [socketClient]);

  const updateLocation = useCallback((deliveryId: string, location: { lat: number; lng: number }) => {
    socketClient.updateDeliveryLocation(deliveryId, location);
  }, [socketClient]);

  // Event listener methods
  const onOrderUpdate = useCallback((callback: (data: any) => void) => {
    return socketClient.on('orderUpdate', callback);
  }, [socketClient]);

  const onDeliveryUpdate = useCallback((callback: (data: any) => void) => {
    return socketClient.on('deliveryLocationUpdate', callback);
  }, [socketClient]);

  const onPaymentUpdate = useCallback((callback: (data: any) => void) => {
    return socketClient.on('paymentUpdate', callback);
  }, [socketClient]);

  const onNewMessage = useCallback((callback: (data: any) => void) => {
    return socketClient.on('newMessage', callback);
  }, [socketClient]);

  const onUserTyping = useCallback((callback: (data: any) => void) => {
    return socketClient.on('userTyping', callback);
  }, [socketClient]);

  const onNotification = useCallback((callback: (notification: Notification) => void) => {
    return socketClient.on('newNotification', callback);
  }, [socketClient]);

  const onInventoryUpdate = useCallback((callback: (data: any) => void) => {
    return socketClient.on('inventoryUpdate', callback);
  }, [socketClient]);

  const value: RealTimeContextType = {
    connectionStatus,
    connect,
    disconnect,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    onlineUsers,
    joinChatRoom,
    leaveChatRoom,
    sendTypingIndicator,
    trackOrder,
    trackDelivery,
    updateLocation,
    analyticsData,
    onOrderUpdate,
    onDeliveryUpdate,
    onPaymentUpdate,
    onNewMessage,
    onUserTyping,
    onNotification,
    onInventoryUpdate
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

// Custom hooks for specific features
export const useNotifications = () => {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, onNotification } = useRealTime();
  return {
    notifications,
    unreadCount,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    onNewNotification: onNotification
  };
};

export const useChat = () => {
  const { 
    onlineUsers, 
    joinChatRoom, 
    leaveChatRoom, 
    sendTypingIndicator, 
    onNewMessage, 
    onUserTyping 
  } = useRealTime();
  
  return {
    onlineUsers,
    joinRoom: joinChatRoom,
    leaveRoom: leaveChatRoom,
    sendTyping: sendTypingIndicator,
    onMessage: onNewMessage,
    onTyping: onUserTyping
  };
};

export const useOrderTracking = () => {
  const { trackOrder, onOrderUpdate } = useRealTime();
  return {
    trackOrder,
    onUpdate: onOrderUpdate
  };
};

export const useDeliveryTracking = () => {
  const { trackDelivery, updateLocation, onDeliveryUpdate } = useRealTime();
  return {
    trackDelivery,
    updateLocation,
    onUpdate: onDeliveryUpdate
  };
};

export const useRealTimeAnalytics = () => {
  const { analyticsData } = useRealTime();
  return { analyticsData };
};
