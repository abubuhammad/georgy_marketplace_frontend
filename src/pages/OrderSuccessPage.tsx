import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Package, Truck, Calendar, Download, 
  ArrowRight, Home, Mail, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderState {
  orderNumber: string;
  total: number;
  paymentMethod: string;
}

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as OrderState;

  useEffect(() => {
    // If no order data, redirect to home
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  const getDeliveryEstimate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // 3 days from now
    
    return deliveryDate.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              Georgy Marketplace
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Order Confirmed
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
          <p className="text-sm text-gray-500">
            Order confirmation has been sent to your email address.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Number</h4>
                <p className="text-lg font-mono text-primary">{orderData.orderNumber}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                <p className="text-gray-600">{getPaymentMethodLabel(orderData.paymentMethod)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Total Amount</h4>
                <p className="text-lg font-bold text-primary">
                  ₦{orderData.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status & Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Order Status & Delivery
            </CardTitle>
            <CardDescription>
              Track your order progress and delivery information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Order Confirmed</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Processing</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Shipped</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Delivered</span>
                </div>
              </div>

              <Separator />

              {/* Delivery Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Estimated Delivery
                  </h4>
                  <p className="text-gray-600">{getDeliveryEstimate()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll send you tracking information once your order ships.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Method</h4>
                  <p className="text-gray-600">Standard Delivery</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Delivered to your doorstep in 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Order Processing</h4>
                  <p className="text-sm text-gray-600">
                    We'll verify your payment and prepare your items for shipment.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Shipping Notification</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive an email with tracking information once your order ships.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered to the address you provided.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              <Package className="w-4 h-4 mr-2" />
              View Order History
            </Button>
          </Link>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Link to="/products">
            <Button className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our customer support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">Email Support</h4>
                <p className="text-sm text-gray-600 mb-2">Get help via email</p>
                <a href="mailto:support@georgy.com" className="text-sm text-primary hover:underline">
                  support@georgy.com
                </a>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-1">Phone Support</h4>
                <p className="text-sm text-gray-600 mb-2">Speak to our team</p>
                <a href="tel:+234800123456" className="text-sm text-primary hover:underline">
                  +234 800 123 456
                </a>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Home className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium mb-1">Help Center</h4>
                <p className="text-sm text-gray-600 mb-2">Find answers online</p>
                <Link to="/help" className="text-sm text-primary hover:underline">
                  Visit Help Center
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Link to="/">
            <Button variant="outline" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
