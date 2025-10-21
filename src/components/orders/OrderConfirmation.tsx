import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, Package, Truck, MapPin, Clock, Phone,
  User, Star, Share2, Download, Calendar, Navigation,
  MessageSquare, AlertCircle, RefreshCw, Eye
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewCount: number;
  vehicleType: string;
  licensePlate: string;
  profileImage?: string;
  estimatedArrival: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface DeliveryAssignment {
  id: string;
  orderId: string;
  sellerId: string;
  sellerName: string;
  agent: DeliveryAgent;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  items: OrderItem[];
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  trackingNumber: string;
  subtotal: number;
  progress: number;
}

interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

interface OrderConfirmationData {
  orderId: string;
  deliveryAssignments: DeliveryAssignment[];
  orderSummary: OrderSummary;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
  };
  orderDate: string;
}

export const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Get order data from navigation state or fetch from API
    if (location.state) {
      const { orderId, deliveryAssignments, orderSummary } = location.state;
      initializeOrderData(orderId, deliveryAssignments, orderSummary);
    } else {
      // If no state, redirect to orders page
      navigate('/orders');
    }
  }, [location.state, navigate]);

  const initializeOrderData = async (orderId: string, assignments: any[], summary: OrderSummary) => {
    setLoading(true);
    try {
      // Fetch complete order details from API
      const orderResponse = await apiClient.get(`/api/orders/${orderId}`);
      
      if (orderResponse.success) {
        const order = orderResponse.data;
        setOrderData({
          orderId,
          deliveryAssignments: assignments.map((assignment, index) => ({
            id: assignment.id || `assignment-${index}`,
            orderId,
            sellerId: assignment.sellerId,
            sellerName: assignment.sellerName,
            agent: {
              id: assignment.agent?.id || 'agent-' + index,
              name: assignment.agent?.name || 'John Delivery',
              phone: assignment.agent?.phone || '+1 (555) 000-' + (1000 + index),
              rating: assignment.agent?.rating || 4.8,
              reviewCount: assignment.agent?.reviewCount || 150,
              vehicleType: assignment.agent?.vehicleType || 'Car',
              licensePlate: assignment.agent?.licensePlate || 'ABC-' + (1000 + index),
              profileImage: assignment.agent?.profileImage,
              estimatedArrival: assignment.estimatedArrival || new Date(Date.now() + 30 * 60000).toISOString(),
              currentLocation: assignment.agent?.currentLocation
            },
            status: assignment.status || 'assigned',
            items: assignment.items || [],
            pickupAddress: assignment.pickupAddress || order.sellerAddress,
            deliveryAddress: assignment.deliveryAddress || order.deliveryAddress,
            estimatedDelivery: assignment.estimatedDelivery || new Date(Date.now() + 45 * 60000).toISOString(),
            trackingNumber: assignment.trackingNumber || `TRK${orderId.slice(-6)}${index}`,
            subtotal: assignment.subtotal || 0,
            progress: assignment.status === 'delivered' ? 100 : assignment.status === 'in_transit' ? 75 : assignment.status === 'picked_up' ? 50 : 25
          })),
          orderSummary: summary,
          customerInfo: {
            name: user?.name || 'Customer',
            email: user?.email || '',
            phone: user?.phone || ''
          },
          deliveryAddress: order.deliveryAddress,
          paymentMethod: order.paymentMethod,
          orderDate: order.createdAt
        });
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const refreshDeliveryStatus = async () => {
    if (!orderData) return;
    
    setRefreshing(true);
    try {
      const response = await apiClient.get(`/api/orders/${orderData.orderId}/delivery-status`);
      if (response.success) {
        setOrderData(prev => prev ? {
          ...prev,
          deliveryAssignments: prev.deliveryAssignments.map(assignment => {
            const updated = response.data.assignments.find((a: any) => a.id === assignment.id);
            return updated ? { ...assignment, ...updated } : assignment;
          })
        } : null);
        toast.success('Delivery status updated');
      }
    } catch (error) {
      console.error('Error refreshing delivery status:', error);
      toast.error('Failed to refresh delivery status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleContactAgent = (agent: DeliveryAgent) => {
    window.open(`tel:${agent.phone}`);
  };

  const handleTrackDelivery = (assignment: DeliveryAssignment) => {
    navigate(`/track/${assignment.trackingNumber}`);
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const shareOrder = async () => {
    if (!orderData) return;
    
    const shareData = {
      title: `Order #${orderData.orderId}`,
      text: `I just placed an order with smart delivery matching!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Order link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing order:', error);
    }
  };

  const downloadReceipt = async () => {
    if (!orderData) return;
    
    try {
      const response = await apiClient.get(`/api/orders/${orderData.orderId}/receipt`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${orderData.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Agent Assigned';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
            <Button onClick={() => navigate('/orders')}>View All Orders</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Your order #{orderData.orderId} has been placed successfully with smart delivery matching
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={shareOrder}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={downloadReceipt}>
              <Download className="w-4 h-4 mr-2" />
              Receipt
            </Button>
            <Button variant="outline" size="sm" onClick={refreshDeliveryStatus} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Assignments */}
            {orderData.deliveryAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {assignment.sellerName}
                      </CardTitle>
                      <Badge className={getStatusColor(assignment.status)}>
                        {getStatusText(assignment.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tracking: {assignment.trackingNumber}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Delivery Progress</span>
                        <span>{assignment.progress}%</span>
                      </div>
                      <Progress value={assignment.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Assigned</span>
                        <span>Picked Up</span>
                        <span>In Transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* Delivery Agent */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Delivery Agent
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {assignment.agent.profileImage ? (
                              <img
                                src={assignment.agent.profileImage}
                                alt={assignment.agent.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{assignment.agent.name}</div>
                            <div className="text-sm text-gray-600">
                              {assignment.agent.vehicleType} • {assignment.agent.licensePlate}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{assignment.agent.rating}</span>
                              <span className="text-gray-500">({assignment.agent.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactAgent(assignment.agent)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackDelivery(assignment)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Track
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Items ({assignment.items.length})</h4>
                      <div className="space-y-2">
                        {assignment.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Pickup Location
                        </h4>
                        <p className="text-sm text-gray-600">{assignment.pickupAddress}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Estimated Delivery
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatTime(assignment.estimatedDelivery)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Order Placed</div>
                      <div className="text-sm text-gray-600">{formatTime(orderData.orderDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Payment Processed</div>
                      <div className="text-sm text-gray-600">Payment confirmed</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Delivery Agents Assigned</div>
                      <div className="text-sm text-gray-600">
                        {orderData.deliveryAssignments.length} delivery assignment(s) created
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${orderData.orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>${orderData.orderSummary.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${orderData.orderSummary.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${orderData.orderSummary.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{orderData.customerInfo.name}</p>
                  <p>{orderData.deliveryAddress.street}</p>
                  <p>{orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} {orderData.deliveryAddress.postalCode}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{orderData.paymentMethod.type.toUpperCase()} •••• {orderData.paymentMethod.last4}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleViewOrders} className="w-full">
                <Package className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
              <Button variant="outline" onClick={handleContinueShopping} className="w-full">
                Continue Shopping
              </Button>
            </div>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Have questions about your order or delivery?
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};