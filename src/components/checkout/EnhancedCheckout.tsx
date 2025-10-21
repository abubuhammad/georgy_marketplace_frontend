import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DeliveryMatchingService } from '@/services/DeliveryMatchingService';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ShoppingCart, MapPin, Truck, CreditCard, Clock, 
  Star, CheckCircle, AlertCircle, User, Phone,
  Package, Navigation, Shield, Calendar, DollarSign
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  fragile: boolean;
  perishable: boolean;
  sellerId: string;
  sellerName: string;
  image?: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  cost: number;
  priority: 'standard' | 'express' | 'urgent';
  available: boolean;
  agentCount: number;
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  totalWeight: number;
  hasFragileItems: boolean;
  hasPerishableItems: boolean;
  subtotal: number;
}

export const EnhancedCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const deliveryService = DeliveryMatchingService.getInstance();

  // Checkout state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Form data
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    instructions: ''
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Delivery options
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>('');
  const [sellerGroups, setSellerGroups] = useState<SellerGroup[]>([]);
  const [deliveryEstimates, setDeliveryEstimates] = useState<Map<string, any>>(new Map());

  // Order summary
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0
  });

  const steps = [
    { id: 'address', title: 'Delivery Address', icon: MapPin },
    { id: 'delivery', title: 'Delivery Options', icon: Truck },
    { id: 'payment', title: 'Payment Method', icon: CreditCard },
    { id: 'review', title: 'Review Order', icon: CheckCircle }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    initializeCheckout();
  }, [user, cartItems, navigate]);

  const initializeCheckout = async () => {
    // Group items by seller
    const groups = groupItemsBySeller(cartItems);
    setSellerGroups(groups);

    // Load user's saved addresses and payment methods
    await Promise.all([
      loadUserAddresses(),
      loadPaymentMethods()
    ]);

    // Calculate initial order summary
    calculateOrderSummary(groups);
  };

  const groupItemsBySeller = (items: CartItem[]): SellerGroup[] => {
    const groups: { [sellerId: string]: SellerGroup } = {};

    items.forEach(item => {
      if (!groups[item.sellerId]) {
        groups[item.sellerId] = {
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          items: [],
          pickupLocation: {
            // This would come from seller data in real implementation
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Business St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001'
          },
          totalWeight: 0,
          hasFragileItems: false,
          hasPerishableItems: false,
          subtotal: 0
        };
      }

      groups[item.sellerId].items.push(item);
      groups[item.sellerId].totalWeight += item.weight * item.quantity;
      groups[item.sellerId].hasFragileItems = groups[item.sellerId].hasFragileItems || item.fragile;
      groups[item.sellerId].hasPerishableItems = groups[item.sellerId].hasPerishableItems || item.perishable;
      groups[item.sellerId].subtotal += item.price * item.quantity;
    });

    return Object.values(groups);
  };

  const loadUserAddresses = async () => {
    try {
      const response = await apiClient.get('/api/user/addresses');
      if (response.data && response.data.length > 0) {
        const defaultAddress = response.data.find((addr: any) => addr.isDefault) || response.data[0];
        setDeliveryAddress({
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          country: defaultAddress.country,
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude,
          instructions: ''
        });
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/api/user/payment-methods');
      if (response.data) {
        setPaymentMethods(response.data);
        const defaultMethod = response.data.find((method: any) => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const calculateOrderSummary = (groups: SellerGroup[], deliveryFee: number = 0) => {
    const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + deliveryFee + tax;

    setOrderSummary({
      subtotal,
      deliveryFee,
      tax,
      total
    });
  };

  const generateDeliveryOptions = async () => {
    if (!deliveryAddress.latitude || !deliveryAddress.longitude) {
      // Geocode address if coordinates not available
      await geocodeAddress();
    }

    const options: DeliveryOption[] = [];
    let totalDeliveryFee = 0;

    try {
      // Get delivery estimates for each seller group
      for (const group of sellerGroups) {
        const items = group.items.map(item => ({
          id: item.id,
          name: item.name,
          weight: item.weight * item.quantity,
          dimensions: item.dimensions,
          fragile: item.fragile,
          perishable: item.perishable
        }));

        const pickupLocation = {
          latitude: group.pickupLocation.latitude,
          longitude: group.pickupLocation.longitude,
          address: group.pickupLocation.address,
          city: group.pickupLocation.city,
          state: group.pickupLocation.state,
          postalCode: group.pickupLocation.postalCode
        };

        const deliveryLocation = {
          latitude: deliveryAddress.latitude!,
          longitude: deliveryAddress.longitude!,
          address: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode
        };

        // Get estimates for different priority levels
        const priorities: Array<'standard' | 'express' | 'urgent'> = ['standard', 'express', 'urgent'];
        
        for (const priority of priorities) {
          try {
            const estimate = await deliveryService.getDeliveryEstimate(
              pickupLocation,
              deliveryLocation,
              items,
              priority
            );

            deliveryEstimates.set(`${group.sellerId}-${priority}`, estimate);
            totalDeliveryFee += estimate.estimatedCost;
          } catch (error) {
            console.error(`Error getting ${priority} estimate for ${group.sellerName}:`, error);
          }
        }
      }

      // Create delivery options based on aggregated estimates
      const standardEstimate = Array.from(deliveryEstimates.entries())
        .filter(([key]) => key.includes('standard'))
        .reduce((sum, [, estimate]) => sum + estimate.estimatedCost, 0);

      const expressEstimate = Array.from(deliveryEstimates.entries())
        .filter(([key]) => key.includes('express'))
        .reduce((sum, [, estimate]) => sum + estimate.estimatedCost, 0);

      const urgentEstimate = Array.from(deliveryEstimates.entries())
        .filter(([key]) => key.includes('urgent'))
        .reduce((sum, [, estimate]) => sum + estimate.estimatedCost, 0);

      const maxStandardTime = Math.max(
        ...Array.from(deliveryEstimates.entries())
          .filter(([key]) => key.includes('standard'))
          .map(([, estimate]) => estimate.estimatedTime)
      ) || 60;

      const maxExpressTime = Math.max(
        ...Array.from(deliveryEstimates.entries())
          .filter(([key]) => key.includes('express'))
          .map(([, estimate]) => estimate.estimatedTime)
      ) || 30;

      const maxUrgentTime = Math.max(
        ...Array.from(deliveryEstimates.entries())
          .filter(([key]) => key.includes('urgent'))
          .map(([, estimate]) => estimate.estimatedTime)
      ) || 15;

      options.push(
        {
          id: 'standard',
          name: 'Standard Delivery',
          description: 'Regular delivery within business hours',
          estimatedTime: maxStandardTime,
          cost: standardEstimate,
          priority: 'standard',
          available: standardEstimate > 0,
          agentCount: Array.from(deliveryEstimates.entries())
            .filter(([key]) => key.includes('standard'))
            .reduce((sum, [, estimate]) => sum + estimate.availableAgents, 0)
        },
        {
          id: 'express',
          name: 'Express Delivery',
          description: 'Faster delivery with priority handling',
          estimatedTime: maxExpressTime,
          cost: expressEstimate,
          priority: 'express',
          available: expressEstimate > 0,
          agentCount: Array.from(deliveryEstimates.entries())
            .filter(([key]) => key.includes('express'))
            .reduce((sum, [, estimate]) => sum + estimate.availableAgents, 0)
        },
        {
          id: 'urgent',
          name: 'Urgent Delivery',
          description: 'Fastest delivery available',
          estimatedTime: maxUrgentTime,
          cost: urgentEstimate,
          priority: 'urgent',
          available: urgentEstimate > 0,
          agentCount: Array.from(deliveryEstimates.entries())
            .filter(([key]) => key.includes('urgent'))
            .reduce((sum, [, estimate]) => sum + estimate.availableAgents, 0)
        }
      );

      setDeliveryOptions(options.filter(opt => opt.available));
      
      // Select standard delivery by default
      if (!selectedDeliveryOption && options.some(opt => opt.available)) {
        const standardOption = options.find(opt => opt.id === 'standard' && opt.available);
        if (standardOption) {
          setSelectedDeliveryOption('standard');
          calculateOrderSummary(sellerGroups, standardOption.cost);
        }
      }

    } catch (error) {
      console.error('Error generating delivery options:', error);
      toast.error('Unable to load delivery options. Please try again.');
    }
  };

  const geocodeAddress = async () => {
    // In real implementation, use Google Maps Geocoding API or similar
    // For now, using mock coordinates
    setDeliveryAddress(prev => ({
      ...prev,
      latitude: 40.7589,
      longitude: -73.9851
    }));
  };

  const handleAddressSubmit = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setLoading(true);
    try {
      await generateDeliveryOptions();
      setCurrentStep(1);
    } catch (error) {
      toast.error('Error loading delivery options');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryOptionChange = (optionId: string) => {
    setSelectedDeliveryOption(optionId);
    const option = deliveryOptions.find(opt => opt.id === optionId);
    if (option) {
      calculateOrderSummary(sellerGroups, option.cost);
    }
  };

  const handlePlaceOrder = async () => {
    setProcessingPayment(true);
    
    try {
      // Create delivery requests for each seller group
      const deliveryRequests = sellerGroups.map(group => ({
        orderId: `order-${Date.now()}-${group.sellerId}`,
        customerId: user.id,
        sellerId: group.sellerId,
        pickupLocation: group.pickupLocation,
        deliveryLocation: {
          latitude: deliveryAddress.latitude!,
          longitude: deliveryAddress.longitude!,
          address: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode
        },
        items: group.items.map(item => ({
          id: item.id,
          name: item.name,
          weight: item.weight * item.quantity,
          dimensions: item.dimensions,
          fragile: item.fragile,
          perishable: item.perishable
        })),
        priority: deliveryOptions.find(opt => opt.id === selectedDeliveryOption)?.priority || 'standard',
        specialInstructions: deliveryAddress.instructions,
        totalValue: group.subtotal,
        paymentMethod: selectedPaymentMethod
      }));

      // Process payment first
      const paymentResponse = await apiClient.post('/api/payment/process', {
        amount: orderSummary.total,
        currency: 'USD',
        paymentMethodId: selectedPaymentMethod,
        orderId: `order-${Date.now()}`
      });

      if (!paymentResponse.success) {
        throw new Error('Payment processing failed');
      }

      // Create order
      const orderResponse = await apiClient.post('/api/orders/create', {
        items: cartItems,
        deliveryAddress,
        paymentMethodId: selectedPaymentMethod,
        deliveryOption: selectedDeliveryOption,
        total: orderSummary.total,
        paymentId: paymentResponse.data.paymentId
      });

      if (!orderResponse.success) {
        throw new Error('Order creation failed');
      }

      // Assign deliveries
      const deliveryAssignments = await Promise.all(
        deliveryRequests.map(async (request) => {
          try {
            return await deliveryService.assignDelivery(request);
          } catch (error) {
            console.error('Delivery assignment failed:', error);
            return { success: false, error: 'Delivery assignment failed' };
          }
        })
      );

      const successfulAssignments = deliveryAssignments.filter(assignment => assignment.success);
      
      if (successfulAssignments.length === 0) {
        toast.error('Order placed but delivery assignment failed. Support will contact you.');
      } else if (successfulAssignments.length < deliveryAssignments.length) {
        toast.warning('Some deliveries could not be assigned automatically. Support will help resolve this.');
      }

      // Clear cart and navigate to success
      clearCart();
      toast.success('Order placed successfully!');
      
      navigate('/order-confirmation', {
        state: {
          orderId: orderResponse.data.orderId,
          deliveryAssignments: successfulAssignments,
          orderSummary
        }
      });

    } catch (error) {
      console.error('Order processing error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const renderAddressStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            value={deliveryAddress.street}
            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
            placeholder="123 Main Street"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={deliveryAddress.city}
            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
            placeholder="New York"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={deliveryAddress.state}
            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
            placeholder="NY"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            value={deliveryAddress.postalCode}
            onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postalCode: e.target.value }))}
            placeholder="10001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select
            value={deliveryAddress.country}
            onValueChange={(value) => setDeliveryAddress(prev => ({ ...prev, country: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={deliveryAddress.instructions}
          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
          placeholder="Special delivery instructions..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderDeliveryStep = () => (
    <div className="space-y-6">
      {deliveryOptions.length === 0 ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="font-semibold text-yellow-800 mb-2">No delivery options available</h3>
            <p className="text-yellow-700">
              We couldn't find any delivery agents for your location. Please contact support.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveryOptions.map((option) => (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all ${
                selectedDeliveryOption === option.id
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleDeliveryOptionChange(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          ~{option.estimatedTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {option.agentCount} agents available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${option.cost.toFixed(2)}</div>
                    {option.priority === 'express' && (
                      <Badge className="mt-1">50% Faster</Badge>
                    )}
                    {option.priority === 'urgent' && (
                      <Badge className="mt-1 bg-red-100 text-red-800">Priority</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {paymentMethods.length === 0 ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-800 mb-2">Add Payment Method</h3>
            <p className="text-blue-700 mb-4">
              You need to add a payment method to complete your order.
            </p>
            <Button>Add Payment Method</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedPaymentMethod === method.id
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPaymentMethod(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {method.brand?.toUpperCase()} •••• {method.last4}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sellerGroups.map((group) => (
            <div key={group.sellerId} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5" />
                <h3 className="font-semibold">{group.sellerName}</h3>
                <Badge variant="outline">{group.items.length} items</Badge>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${group.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Details */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Delivery Address</Label>
              <p className="text-sm text-gray-600">
                {deliveryAddress.street}<br />
                {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postalCode}
              </p>
            </div>
            
            {selectedDeliveryOption && (
              <div>
                <Label>Delivery Option</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm">
                    {deliveryOptions.find(opt => opt.id === selectedDeliveryOption)?.name}
                  </span>
                </div>
              </div>
            )}
            
            {deliveryAddress.instructions && (
              <div>
                <Label>Special Instructions</Label>
                <p className="text-sm text-gray-600">{deliveryAddress.instructions}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order with smart delivery matching</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step Navigation */}
            <div className="flex justify-between mb-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4" />}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
                  {steps[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 0 && renderAddressStep()}
                    {currentStep === 1 && renderDeliveryStep()}
                    {currentStep === 2 && renderPaymentStep()}
                    {currentStep === 3 && renderReviewStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={processingPayment || !selectedPaymentMethod}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingPayment ? 'Processing...' : `Place Order - $${orderSummary.total.toFixed(2)}`}
                </Button>
              ) : currentStep === 0 ? (
                <Button onClick={handleAddressSubmit} disabled={loading}>
                  {loading ? 'Loading...' : 'Next'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                  disabled={
                    (currentStep === 1 && !selectedDeliveryOption) ||
                    (currentStep === 2 && !selectedPaymentMethod)
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                
                {orderSummary.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>${orderSummary.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
                </div>

                {currentStep >= 1 && selectedDeliveryOption && (
                  <div className="p-4 bg-blue-50 rounded-lg mt-4">
                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                      <Truck className="w-4 h-4" />
                      Delivery Estimate
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {deliveryOptions.find(opt => opt.id === selectedDeliveryOption)?.estimatedTime} minutes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};