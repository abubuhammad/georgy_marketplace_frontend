import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  sendMessage: (recipientId: string, message: string, orderId?: string) => void;
  updateLocation: (lat: number, lng: number, orderId?: string) => void;
  updateOrderStatus: (orderId: string, status: string, message?: string) => void;
  updateDeliveryStatus: (orderId: string, status: string, location?: any) => void;
  updateViewingStatus: (viewingId: string, status: string, notes?: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      // Handle notifications
      newSocket.on('notification', (data) => {
        handleNotification(data);
      });

      newSocket.on('admin-notification', (data) => {
        if (user.role === 'ADMIN') {
          handleNotification({ ...data, isAdmin: true });
        }
      });

      newSocket.on('store-notification', (data) => {
        if (user.role === 'SELLER') {
          handleNotification({ ...data, isStore: true });
        }
      });

      // Handle chat messages
      newSocket.on('chat-message', (data) => {
        handleChatMessage(data);
      });

      // Handle real-time updates
      newSocket.on('order-status-update', (data) => {
        handleOrderUpdate(data);
      });

      newSocket.on('delivery-location-update', (data) => {
        handleLocationUpdate(data);
      });

      newSocket.on('viewing-update', (data) => {
        if (user.role === 'BUYER' || user.role === 'USER') {
          handleViewingUpdate(data);
        }
      });

      newSocket.on('product-review', (data) => {
        if (user.role === 'SELLER') {
          handleProductReview(data);
        }
      });

      newSocket.on('account-status-change', (data) => {
        handleAccountStatusChange(data);
      });

      // Handle errors
      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        toast.error(error.message || 'WebSocket error occurred');
      });

      setSocket(newSocket);

      // Load existing notifications
      loadNotifications();

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token]);

  const handleNotification = (data: any) => {
    const notification: Notification = {
      id: data.id || Date.now().toString(),
      type: data.type,
      title: data.title || data.message || 'New Notification',
      message: data.message,
      timestamp: new Date(data.timestamp || Date.now()),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    // Show toast notification
    toast.info(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  };

  const handleChatMessage = (data: any) => {
    const notification: Notification = {
      id: data.messageId,
      type: 'chat-message',
      title: `New message from ${data.senderName}`,
      message: data.message,
      timestamp: new Date(data.timestamp),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    toast.info(`Message from ${data.senderName}`, {
      description: data.message,
      duration: 5000,
    });
  };

  const handleOrderUpdate = (data: any) => {
    const notification: Notification = {
      id: `order-${data.orderId}-${Date.now()}`,
      type: 'order-update',
      title: 'Order Status Update',
      message: data.message,
      timestamp: new Date(),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    toast.success(notification.title, {
      description: data.message,
      duration: 5000,
    });
  };

  const handleLocationUpdate = (data: any) => {
    const notification: Notification = {
      id: `location-${data.orderId}-${Date.now()}`,
      type: 'location-update',
      title: 'Delivery Update',
      message: data.message,
      timestamp: new Date(),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    toast.info(notification.title, {
      description: data.message,
      duration: 3000,
    });
  };

  const handleViewingUpdate = (data: any) => {
    const notification: Notification = {
      id: `viewing-${data.viewingId}-${Date.now()}`,
      type: 'viewing-update',
      title: 'Property Viewing Update',
      message: data.message,
      timestamp: new Date(),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    toast.info(notification.title, {
      description: data.message,
      duration: 4000,
    });
  };

  const handleProductReview = (data: any) => {
    const notification: Notification = {
      id: `product-${data.productId}-${Date.now()}`,
      type: 'product-review',
      title: `Product ${data.status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: data.message,
      timestamp: new Date(),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    const toastType = data.status === 'approved' ? 'success' : 'error';
    toast[toastType](notification.title, {
      description: data.message,
      duration: 5000,
    });
  };

  const handleAccountStatusChange = (data: any) => {
    const notification: Notification = {
      id: `account-${Date.now()}`,
      type: 'account-status',
      title: `Account ${data.status === 'suspended' ? 'Suspended' : 'Activated'}`,
      message: data.message,
      timestamp: new Date(),
      isRead: false,
      data: data
    };

    setNotifications(prev => [notification, ...prev]);

    const toastType = data.status === 'suspended' ? 'error' : 'success';
    toast[toastType](notification.title, {
      description: data.message,
      duration: 10000,
    });
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.createdAt),
          data: JSON.parse(n.message)
        })));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const sendMessage = useCallback((recipientId: string, message: string, orderId?: string) => {
    if (socket && isConnected) {
      socket.emit('chat-message', { recipientId, message, orderId });
    }
  }, [socket, isConnected]);

  const updateLocation = useCallback((lat: number, lng: number, orderId?: string) => {
    if (socket && isConnected && user?.role === 'DELIVERY_AGENT') {
      socket.emit('location-update', { lat, lng, orderId });
    }
  }, [socket, isConnected, user]);

  const updateOrderStatus = useCallback((orderId: string, status: string, message?: string) => {
    if (socket && isConnected) {
      socket.emit('order-status-update', { orderId, status, message });
    }
  }, [socket, isConnected]);

  const updateDeliveryStatus = useCallback((orderId: string, status: string, location?: any) => {
    if (socket && isConnected && user?.role === 'DELIVERY_AGENT') {
      socket.emit('delivery-status-update', { orderId, status, location });
    }
  }, [socket, isConnected, user]);

  const updateViewingStatus = useCallback((viewingId: string, status: string, notes?: string) => {
    if (socket && isConnected && user?.role === 'REALTOR') {
      socket.emit('viewing-update', { viewingId, status, notes });
    }
  }, [socket, isConnected, user]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    sendMessage,
    updateLocation,
    updateOrderStatus,
    updateDeliveryStatus,
    updateViewingStatus,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};