import { io, Socket } from 'socket.io-client';
import { RealTimeEvent, ConnectionStatus } from '../types/realtime';

export class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners = new Map<string, Function[]>();
  private isConnecting = false;

  constructor(private serverUrl: string = 'http://localhost:5000') {}

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        setTimeout(() => {
          if (this.socket?.connected) {
            resolve();
          } else {
            reject(new Error('Connection timeout'));
          }
        }, 5000);
        return;
      }

      this.isConnecting = true;

      this.socket = io(this.serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emitConnectionStatus({
          connected: true,
          connecting: false,
          lastConnected: new Date().toISOString(),
          reconnectAttempts: 0
        });
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error.message);
        this.isConnecting = false;
        this.emitConnectionStatus({
          connected: false,
          connecting: false,
          reconnectAttempts: this.reconnectAttempts
        });
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from WebSocket server:', reason);
        this.emitConnectionStatus({
          connected: false,
          connecting: false,
          reconnectAttempts: this.reconnectAttempts
        });

        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.handleReconnect(token);
        }
      });

      this.setupDefaultEventListeners();
    });
  }

  private setupDefaultEventListeners() {
    if (!this.socket) return;

    this.socket.on('order:status_update', (data) => {
      this.emit('orderUpdate', data);
    });

    this.socket.on('delivery:location_update', (data) => {
      this.emit('deliveryLocationUpdate', data);
    });

    this.socket.on('payment:status_update', (data) => {
      this.emit('paymentUpdate', data);
    });

    this.socket.on('chat:new_message', (data) => {
      this.emit('newMessage', data);
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('userTyping', data);
    });

    this.socket.on('chat:read_receipt', (data) => {
      this.emit('messageRead', data);
    });

    this.socket.on('notification:new', (data) => {
      this.emit('newNotification', data);
    });

    this.socket.on('inventory:stock_update', (data) => {
      this.emit('inventoryUpdate', data);
    });

    this.socket.on('analytics:real_time_update', (data) => {
      this.emit('analyticsUpdate', data);
    });

    this.socket.on('presence:user_status', (data) => {
      this.emit('userPresenceUpdate', data);
    });
  }

  private handleReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔌 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.emitConnectionStatus({
      connected: false,
      connecting: true,
      reconnectAttempts: this.reconnectAttempts
    });

    setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('🔌 Reconnection failed:', error.message);
        this.handleReconnect(token);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.eventListeners.clear();
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  private emitConnectionStatus(status: ConnectionStatus) {
    this.emit('connectionStatus', status);
  }

  joinChatRoom(roomId: string) {
    this.socket?.emit('chat:join_room', roomId);
  }

  leaveChatRoom(roomId: string) {
    this.socket?.emit('chat:leave_room', roomId);
  }

  sendTypingIndicator(roomId: string, isTyping: boolean) {
    this.socket?.emit('chat:typing', { roomId, isTyping });
  }

  trackOrder(orderId: string) {
    this.socket?.emit('order:track', orderId);
  }

  trackDelivery(deliveryId: string) {
    this.socket?.emit('delivery:track', deliveryId);
  }

  updateDeliveryLocation(deliveryId: string, location: { lat: number; lng: number }) {
    this.socket?.emit('delivery:location_update', { deliveryId, location });
  }

  updatePresence(status: 'online' | 'away' | 'busy') {
    this.socket?.emit('presence:update', status);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      lastConnected: this.socket?.connected ? new Date().toISOString() : undefined,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  emitEvent(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event ${event}: Socket not connected`);
    }
  }
}

let socketClient: SocketClient;

export const getSocketClient = (): SocketClient => {
  if (!socketClient) {
    socketClient = new SocketClient();
  }
  return socketClient;
};

export const initializeSocketClient = (serverUrl?: string): SocketClient => {
  socketClient = new SocketClient(serverUrl);
  return socketClient;
};
