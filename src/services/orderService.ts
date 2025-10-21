import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import apiClient from './apiClient';

export interface CreateOrderData {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  shippingAddress: any;
  billingAddress: any;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product?: {
    id: string;
    title: string;
    images: { image_url: string }[];
  };
}

class OrderService {
  // Create new order
  async createOrder(userId: string, orderData: CreateOrderData) {
    if (isDevMode) {
      // Mock order creation for development
      const orderNumber = 'ORD-' + Date.now();
      const mockOrder = {
        id: `order-${Date.now()}`,
        orderNumber,
        userId,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        totalAmount: orderData.total,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.shippingAddress,
        items: orderData.items.map(item => ({
          id: `item-${Date.now()}-${Math.random()}`,
          orderId: `order-${Date.now()}`,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { data: mockOrder, error: null };
    }

    try {
      const orderNumber = 'ORD-' + Date.now();
      
      // Create order record
      const order = await prisma.order.create({
        data: {
          orderNumber,
          buyerId: userId,
          totalAmount: orderData.total,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: orderData.paymentMethod,
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.shippingAddress, // Same as shipping for now
          items: {
            create: orderData.items.map(item => ({
              listingId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.price,
              totalPrice: item.price * item.quantity,
            }))
          }
        },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      });

      return { data: { ...order, orderNumber }, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get user's orders
  async getUserOrders(userId: string) {
    if (isDevMode) {
      // Return mock orders for development
      return { data: [], error: null };
    }

    try {
      const orders = await prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { data: orders, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get order by ID
  async getOrderById(orderId: string) {
    if (isDevMode) {
      // Return mock order for development
      return { data: null, error: 'Order not found' };
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  images: true,
                  user: true
                }
              }
            }
          }
        }
      });

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status,
          updatedAt: new Date()
        }
      });

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: string, paymentReference?: string) {
    try {
      const updateData: any = { 
        paymentStatus,
        updatedAt: new Date()
      };

      if (paymentReference) {
        updateData.paymentReference = paymentReference;
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData
      });

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'cancelled',
          notes: reason,
          updatedAt: new Date()
        }
      });

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get order statistics for admin/seller
  async getOrderStats(sellerId?: string) {
    try {
      const whereClause: any = {};
      if (sellerId) {
        whereClause.sellerId = sellerId;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
        select: {
          status: true,
          totalAmount: true,
          createdAt: true
        }
      });

      // Calculate statistics
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Track order (simulate tracking)
  async trackOrder(orderNumber: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber }
      });

      if (!order) {
        return { data: null, error: 'Order not found' };
      }

      // Simulate tracking information
      const trackingInfo = {
        orderNumber,
        status: order.status,
        trackingNumber: `TRK-${orderNumber.replace('ORD-', '')}`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'Order Placed',
            date: order.createdAt.toISOString(),
            completed: true,
            description: 'Your order has been placed and confirmed'
          },
          {
            status: 'Processing',
            date: order.status === 'processing' ? new Date().toISOString() : null,
            completed: ['processing', 'shipped', 'delivered'].includes(order.status),
            description: 'Your order is being prepared for shipment'
          },
          {
            status: 'Shipped',
            date: order.status === 'shipped' ? new Date().toISOString() : null,
            completed: ['shipped', 'delivered'].includes(order.status),
            description: 'Your order has been shipped and is on its way'
          },
          {
            status: 'Delivered',
            date: order.status === 'delivered' ? new Date().toISOString() : null,
            completed: order.status === 'delivered',
            description: 'Your order has been delivered'
          }
        ]
      };

      return { data: trackingInfo, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Process refund
  async processRefund(orderId: string, amount?: number, reason?: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: 'refunded',
          status: 'cancelled',
          notes: reason,
          updatedAt: new Date()
        }
      });

      // TODO: Integrate with payment provider for actual refund processing

      return { data: order, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }
}

export default new OrderService();
