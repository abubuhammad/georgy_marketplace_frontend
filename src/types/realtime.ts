export interface SocketUser {
  id: string;
  email: string;
  role: string;
  socketId: string;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'delivery' | 'payment' | 'chat' | 'artisan' | 'admin' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  categories: {
    orders: boolean;
    delivery: boolean;
    payments: boolean;
    chat: boolean;
    artisan: boolean;
    marketing: boolean;
    system: boolean;
  };
}

// Chat Types
export interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | 'support';
  name?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
  };
  readBy: string[];
  createdAt: string;
}

// Real-time Event Types
export interface OrderUpdateEvent {
  type: 'order:status_update';
  data: {
    orderId: string;
    status: string;
    message: string;
    timestamp: string;
    estimatedDelivery?: string;
  };
}

export interface DeliveryTrackingEvent {
  type: 'delivery:location_update';
  data: {
    deliveryId: string;
    location: {
      lat: number;
      lng: number;
    };
    estimatedArrival: string;
    status: string;
  };
}

export interface PaymentEvent {
  type: 'payment:status_update';
  data: {
    paymentId: string;
    orderId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount: number;
    message: string;
  };
}

export interface ChatEvent {
  type: 'chat:new_message' | 'chat:typing' | 'chat:read_receipt';
  data: {
    roomId: string;
    message?: ChatMessage;
    userId?: string;
    isTyping?: boolean;
    messageIds?: string[];
  };
}

export interface ArtisanEvent {
  type: 'artisan:request_update' | 'artisan:appointment_reminder' | 'artisan:payment_released';
  data: {
    requestId?: string;
    appointmentId?: string;
    paymentId?: string;
    status?: string;
    message: string;
    scheduledTime?: string;
  };
}

export interface InventoryEvent {
  type: 'inventory:stock_update' | 'inventory:low_stock_alert';
  data: {
    productId: string;
    currentStock: number;
    threshold?: number;
    sellerId: string;
  };
}

export interface AnalyticsEvent {
  type: 'analytics:real_time_update';
  data: {
    metric: string;
    value: number;
    change?: number;
    timestamp: string;
  };
}

// Socket Room Types
export type SocketRoom = 
  | `user:${string}`           // Individual user notifications
  | `order:${string}`          // Order-specific updates
  | `delivery:${string}`       // Delivery tracking
  | `chat:${string}`          // Chat messages
  | `seller:${string}`        // Seller-specific notifications
  | `artisan:${string}`       // Artisan service updates
  | `admin:analytics`         // Admin dashboard updates
  | `admin:monitoring`        // Admin system monitoring
  | `inventory:${string}`;    // Inventory updates for specific seller

// WebSocket Event Union Type
export type RealTimeEvent = 
  | OrderUpdateEvent
  | DeliveryTrackingEvent
  | PaymentEvent
  | ChatEvent
  | ArtisanEvent
  | InventoryEvent
  | AnalyticsEvent;

// Connection Status
export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  lastConnected?: string;
  reconnectAttempts: number;
}

// Typing Indicator
export interface TypingIndicator {
  roomId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

// Presence Status
export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  socketId?: string;
}

// Push Notification Types
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    type: string;
    id: string;
    [key: string]: any;
  };
  badge?: number;
  sound?: string;
  priority?: 'default' | 'high';
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Real-time Analytics Data
export interface RealTimeAnalytics {
  activeUsers: number;
  concurrentConnections: number;
  ordersToday: number;
  revenueToday: number;
  deliveriesInProgress: number;
  chatMessagesLastHour: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
  };
}

// Location Tracking
export interface LocationUpdate {
  userId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: string;
}
