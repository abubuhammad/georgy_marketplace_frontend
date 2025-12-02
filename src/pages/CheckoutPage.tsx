import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, MapPin, Truck, Shield, CheckCircle,
  Clock, Package, User, Phone, Mail, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProductImageUrl } from '@/utils/imageUtils';
import { PaystackPayment } from '@/features/payment/PaystackPayment';
import { PaystackResponse } from '@/services/paystackService';

const checkoutSchema = z.object({
  // Shipping Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().optional(),
  
  // Payment Information
  paymentMethod: z.enum(['card', 'bank_transfer', 'mobile_money', 'cash_on_delivery']),
  
  // Options
  saveAddress: z.boolean().default(false),
  sameAsBilling: z.boolean().default(true),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { 
    items, 
    itemCount, 
    subtotal, 
    shipping, 
    tax, 
    totalAmount, 
    clearCart 
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaystackPayment, setShowPaystackPayment] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [checkoutData, setCheckoutData] = useState<CheckoutFormData | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      paymentMethod: 'card',
      saveAddress: false,
      sameAsBilling: true,
      agreeToTerms: false,
    },
  });

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with your card via Paystack',
      icon: CreditCard,
      processing: 'Instant',
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Transfer directly from your bank',
      icon: Package,
      processing: '1-2 business days',
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      description: 'Pay with your mobile wallet',
      icon: Phone,
      processing: 'Instant',
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: Truck,
      processing: 'On delivery',
    },
  ];

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ];

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      // Store checkout data for payment
      setCheckoutData(data);

      // Generate order ID
      const newOrderId = 'GMP_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setOrderId(newOrderId);

      // Handle different payment methods
      if (data.paymentMethod === 'cash_on_delivery') {
        // For COD, create order directly and go to success
        await handleCashOnDeliveryOrder(newOrderId, data);
      } else {
        // For online payment methods, show Paystack
        setShowPaystackPayment(true);
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to process checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOnDeliveryOrder = async (orderIdValue: string, data: CheckoutFormData) => {
    // For COD orders, create order without payment
    console.log('Creating COD order:', orderIdValue);
    
    toast({
      title: "Order Placed!",
      description: "Your order has been placed. Pay on delivery.",
    });

    clearCart();
    navigate('/order-success', { 
      state: { 
        orderNumber: orderIdValue,
        total: totalAmount,
        paymentMethod: 'cash_on_delivery',
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
        }
      }
    });
  };

  const handlePaymentSuccess = (response: PaystackResponse & { verified?: boolean }) => {
    console.log('Payment successful:', response);
    
    clearCart();
    navigate('/order-success', { 
      state: { 
        orderNumber: orderId,
        total: totalAmount,
        paymentMethod: checkoutData?.paymentMethod || 'card',
        paymentReference: response.reference,
        transactionId: response.transaction,
        verified: response.verified,
        shippingAddress: checkoutData ? {
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          address: checkoutData.address,
          city: checkoutData.city,
          state: checkoutData.state,
        } : undefined
      }
    });
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setShowPaystackPayment(false);
    toast({
      title: "Payment Failed",
      description: error || "There was an issue processing your payment. Please try again.",
      variant: "destructive"
    });
  };

  const handlePaymentCancel = () => {
    setShowPaystackPayment(false);
    toast({
      title: "Payment Cancelled",
      description: "You can try again or choose a different payment method.",
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some items to proceed with checkout</p>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Show Paystack payment when processing
  if (showPaystackPayment && checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <PaystackPayment
            amount={totalAmount}
            email={checkoutData.email}
            orderId={orderId}
            customerName={`${checkoutData.firstName} ${checkoutData.lastName}`}
            phone={checkoutData.phone}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/cart')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">Secure Checkout</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                <span className={`ml-2 ${
                  currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Shipping'}
                  {step === 2 && 'Payment'}
                  {step === 3 && 'Review'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Shipping Information
                      </CardTitle>
                      <CardDescription>
                        Where should we deliver your order?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {nigerianStates.map(state => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter postal code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="saveAddress"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Save this address for future orders
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="button" onClick={nextStep}>
                          Continue to Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Method
                      </CardTitle>
                      <CardDescription>
                        Choose how you'd like to pay for your order
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {paymentMethods.map((method) => (
                                  <div key={method.id} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50">
                                    <RadioGroupItem value={method.id} id={method.id} />
                                    <method.icon className="w-5 h-5 text-gray-600" />
                                    <div className="flex-1">
                                      <Label htmlFor={method.id} className="font-medium">
                                        {method.name}
                                      </Label>
                                      <p className="text-sm text-gray-600">
                                        {method.description}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {method.processing}
                                    </Badge>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep}>
                          Review Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Order Review */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Review Your Order
                      </CardTitle>
                      <CardDescription>
                        Please review your order before placing it
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3">Items ({itemCount})</h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={getProductImageUrl(item.product.images, '/api/placeholder/50/50')}
                                  alt={item.product.title || item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium text-sm">{item.product.title}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          <p>{form.getValues('firstName')} {form.getValues('lastName')}</p>
                          <p>{form.getValues('address')}</p>
                          <p>{form.getValues('city')}, {form.getValues('state')} {form.getValues('postalCode')}</p>
                          <p>{form.getValues('phone')}</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h4 className="font-semibold mb-2">Payment Method</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          <p className="capitalize">
                            {paymentMethods.find(m => m.id === form.getValues('paymentMethod'))?.name}
                          </p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                I agree to the{' '}
                                <a href="/terms" className="text-primary hover:underline">
                                  Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className="text-primary hover:underline">
                                  Privacy Policy
                                </a>
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isProcessing}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isProcessing ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Place Order - ₦${Math.round(totalAmount).toLocaleString()}`
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax (VAT 7.5%)</span>
                    <span>₦{Math.round(tax).toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₦{Math.round(totalAmount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
