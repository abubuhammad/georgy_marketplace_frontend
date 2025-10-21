import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  storeId?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Fetch user details from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            role: true,
            firstName: true,
            lastName: true,
            email: true,
            seller: {
              select: {
                id: true,
                storeName: true
              }
            }
          }
        });

        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        if (user.seller) {
          socket.storeId = user.seller.id;
        }

        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with role ${socket.userRole}`);
      
      // Store the connection
      this.connectedUsers.set(socket.userId!, socket);

      // Join role-based rooms
      this.joinRoleBasedRooms(socket);

      // Handle user-specific events
      this.setupUserEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId!);
      });
    });
  }

  private joinRoleBasedRooms(socket: AuthenticatedSocket) {
    // Join general user room
    socket.join(`user:${socket.userId}`);

    // Join role-specific rooms
    switch (socket.userRole) {
      case 'ADMIN':
        socket.join('admins');
        socket.join('admin-notifications');
        break;
      
      case 'SELLER':
        socket.join('sellers');
        if (socket.storeId) {
          socket.join(`store:${socket.storeId}`);
        }
        break;
      
      case 'DELIVERY_AGENT':
        socket.join('delivery-agents');
        socket.join('delivery-notifications');
        break;
      
      case 'REALTOR':
        socket.join('realtors');
        socket.join('realtor-notifications');
        break;
      
      case 'BUYER':
      case 'USER':
        socket.join('buyers');
        break;
    }
  }

  private setupUserEvents(socket: AuthenticatedSocket) {
    // Location updates for delivery agents
    if (socket.userRole === 'DELIVERY_AGENT') {
      socket.on('location-update', (data: { lat: number; lng: number; orderId?: string }) => {
        this.handleLocationUpdate(socket, data);
      });

      socket.on('delivery-status-update', (data: { orderId: string; status: string; location?: any }) => {
        this.handleDeliveryStatusUpdate(socket, data);
      });
    }

    // Order updates for sellers and buyers
    socket.on('order-status-update', (data: { orderId: string; status: string; message?: string }) => {
      this.handleOrderStatusUpdate(socket, data);
    });

    // Chat messages
    socket.on('chat-message', (data: { recipientId: string; message: string; orderId?: string }) => {
      this.handleChatMessage(socket, data);
    });

    // Property viewing updates for realtors
    if (socket.userRole === 'REALTOR') {
      socket.on('viewing-update', (data: { viewingId: string; status: string; notes?: string }) => {
        this.handleViewingUpdate(socket, data);
      });
    }

    // Admin notifications
    if (socket.userRole === 'ADMIN') {
      socket.on('admin-action', (data: { action: string; targetId: string; details: any }) => {
        this.handleAdminAction(socket, data);
      });
    }
  }

  // Notification methods
  public async notifyUser(userId: string, notification: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', notification);
    }

    // Store notification in database for offline users
    await this.storeNotification(userId, notification);
  }

  public async notifyRole(role: string, notification: any) {
    const roomName = role.toLowerCase() + 's';
    this.io.to(roomName).emit('notification', notification);
  }

  public async notifyAdmins(notification: any) {
    this.io.to('admins').emit('admin-notification', notification);
  }

  public async notifyStore(storeId: string, notification: any) {
    this.io.to(`store:${storeId}`).emit('store-notification', notification);
  }

  // Event handlers
  private async handleLocationUpdate(socket: AuthenticatedSocket, data: { lat: number; lng: number; orderId?: string }) {
    try {
      // Update delivery agent location in database
      await prisma.deliveryAgent.update({
        where: { userId: socket.userId! },
        data: {
          currentLat: data.lat,
          currentLng: data.lng,
          lastLocationUpdate: new Date()
        }
      });

      // If tracking a specific order, notify relevant parties
      if (data.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: data.orderId },
          include: { 
            buyer: { select: { id: true } },
            orderItems: {
              include: {
                product: {
                  include: {
                    seller: { select: { id: true, userId: true } }
                  }
                }
              }
            }
          }
        });

        if (order) {
          // Notify buyer
          this.notifyUser(order.buyer.id, {
            type: 'delivery-location-update',
            orderId: data.orderId,
            location: { lat: data.lat, lng: data.lng },
            message: 'Your delivery is on the way'
          });

          // Notify sellers
          const sellerIds = [...new Set(order.orderItems.map(item => item.product.seller.userId))];
          sellerIds.forEach(sellerId => {
            this.notifyUser(sellerId, {
              type: 'delivery-location-update',
              orderId: data.orderId,
              location: { lat: data.lat, lng: data.lng },
              message: 'Delivery agent location updated'
            });
          });
        }
      }
    } catch (error) {
      console.error('Error handling location update:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  private async handleDeliveryStatusUpdate(socket: AuthenticatedSocket, data: { orderId: string; status: string; location?: any }) {
    try {
      // Update order status
      const order = await prisma.order.update({
        where: { id: data.orderId },
        data: { status: data.status as any },
        include: { 
          buyer: { select: { id: true, firstName: true, lastName: true } },
          orderItems: {
            include: {
              product: {
                include: {
                  seller: { select: { id: true, userId: true, storeName: true } }
                }
              }
            }
          }
        }
      });

      // Notify buyer
      this.notifyUser(order.buyer.id, {
        type: 'order-status-update',
        orderId: data.orderId,
        status: data.status,
        message: `Order ${data.status.toLowerCase().replace('_', ' ')}`,
        location: data.location
      });

      // Notify sellers
      const sellerIds = [...new Set(order.orderItems.map(item => item.product.seller.userId))];
      sellerIds.forEach(sellerId => {
        this.notifyUser(sellerId, {
          type: 'order-status-update',
          orderId: data.orderId,
          status: data.status,
          message: `Order ${data.status.toLowerCase().replace('_', ' ')} by delivery agent`
        });
      });

      // Notify admins for important status changes
      if (['DELIVERED', 'CANCELLED', 'RETURNED'].includes(data.status)) {
        this.notifyAdmins({
          type: 'order-completion',
          orderId: data.orderId,
          status: data.status,
          deliveryAgentId: socket.userId
        });
      }

    } catch (error) {
      console.error('Error handling delivery status update:', error);
      socket.emit('error', { message: 'Failed to update delivery status' });
    }
  }

  private async handleOrderStatusUpdate(socket: AuthenticatedSocket, data: { orderId: string; status: string; message?: string }) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: { 
          buyer: { select: { id: true } },
          orderItems: {
            include: {
              product: {
                include: {
                  seller: { select: { id: true, userId: true } }
                }
              }
            }
          }
        }
      });

      if (!order) {
        socket.emit('error', { message: 'Order not found' });
        return;
      }

      // Verify authorization
      const isAuthorized = 
        socket.userRole === 'ADMIN' ||
        (socket.userRole === 'SELLER' && order.orderItems.some(item => item.product.seller.userId === socket.userId)) ||
        (socket.userRole === 'BUYER' && order.buyer.id === socket.userId);

      if (!isAuthorized) {
        socket.emit('error', { message: 'Unauthorized to update this order' });
        return;
      }

      // Update order
      await prisma.order.update({
        where: { id: data.orderId },
        data: { status: data.status as any }
      });

      // Notify relevant parties
      const notification = {
        type: 'order-status-update',
        orderId: data.orderId,
        status: data.status,
        message: data.message || `Order status updated to ${data.status.toLowerCase()}`
      };

      // Notify buyer if update is not from buyer
      if (socket.userId !== order.buyer.id) {
        this.notifyUser(order.buyer.id, notification);
      }

      // Notify sellers if update is not from seller
      const sellerIds = [...new Set(order.orderItems.map(item => item.product.seller.userId))];
      sellerIds.forEach(sellerId => {
        if (sellerId !== socket.userId) {
          this.notifyUser(sellerId, notification);
        }
      });

    } catch (error) {
      console.error('Error handling order status update:', error);
      socket.emit('error', { message: 'Failed to update order status' });
    }
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: { recipientId: string; message: string; orderId?: string }) {
    try {
      // Store message in database
      const chatMessage = await prisma.chatMessage.create({
        data: {
          senderId: socket.userId!,
          recipientId: data.recipientId,
          message: data.message,
          orderId: data.orderId,
        },
        include: {
          sender: { select: { firstName: true, lastName: true, email: true } }
        }
      });

      // Send to recipient
      this.notifyUser(data.recipientId, {
        type: 'chat-message',
        messageId: chatMessage.id,
        senderId: socket.userId,
        senderName: `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`,
        message: data.message,
        orderId: data.orderId,
        timestamp: chatMessage.createdAt
      });

      // Confirm to sender
      socket.emit('message-sent', {
        messageId: chatMessage.id,
        timestamp: chatMessage.createdAt
      });

    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleViewingUpdate(socket: AuthenticatedSocket, data: { viewingId: string; status: string; notes?: string }) {
    try {
      const viewing = await prisma.propertyViewing.update({
        where: { id: data.viewingId },
        data: { 
          status: data.status as any,
          notes: data.notes 
        },
        include: {
          property: {
            include: {
              realtor: { select: { userId: true } }
            }
          },
          viewer: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      // Verify authorization
      if (viewing.property.realtor.userId !== socket.userId) {
        socket.emit('error', { message: 'Unauthorized to update this viewing' });
        return;
      }

      // Notify viewer
      this.notifyUser(viewing.viewer.id, {
        type: 'viewing-update',
        viewingId: data.viewingId,
        propertyTitle: viewing.property.title,
        status: data.status,
        notes: data.notes,
        message: `Property viewing ${data.status.toLowerCase()}`
      });

    } catch (error) {
      console.error('Error handling viewing update:', error);
      socket.emit('error', { message: 'Failed to update viewing' });
    }
  }

  private async handleAdminAction(socket: AuthenticatedSocket, data: { action: string; targetId: string; details: any }) {
    if (socket.userRole !== 'ADMIN') {
      socket.emit('error', { message: 'Unauthorized action' });
      return;
    }

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        adminId: socket.userId!,
        action: data.action,
        targetType: data.details.targetType || 'UNKNOWN',
        targetId: data.targetId,
        details: JSON.stringify(data.details),
        ipAddress: socket.handshake.address,
      }
    });

    // Notify affected users based on action
    switch (data.action) {
      case 'USER_SUSPENDED':
      case 'USER_ACTIVATED':
        this.notifyUser(data.targetId, {
          type: 'account-status-change',
          status: data.action.includes('SUSPENDED') ? 'suspended' : 'active',
          message: data.details.reason || 'Account status changed by admin'
        });
        break;

      case 'PRODUCT_APPROVED':
      case 'PRODUCT_REJECTED':
        // Find product owner and notify
        const product = await prisma.product.findUnique({
          where: { id: data.targetId },
          include: { seller: { select: { userId: true } } }
        });
        if (product) {
          this.notifyUser(product.seller.userId, {
            type: 'product-review',
            productId: data.targetId,
            status: data.action.includes('APPROVED') ? 'approved' : 'rejected',
            message: data.details.reason || 'Product reviewed by admin'
          });
        }
        break;
    }
  }

  private async storeNotification(userId: string, notification: any) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.message || 'New Notification',
          message: JSON.stringify(notification),
          isRead: false,
        }
      });
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getConnectedUsers(): Map<string, AuthenticatedSocket> {
    return this.connectedUsers;
  }
}

// Singleton instance
let wsManager: WebSocketManager;

export function initializeWebSocket(server: HttpServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return wsManager;
}