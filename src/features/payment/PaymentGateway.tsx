import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone, Building, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { PaymentMethod, PaymentIntent, PaymentResult } from './types';
import { advancedPaymentService } from '@/services/advancedPaymentService';
import { toast } from 'sonner';

interface PaymentGatewayProps {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  currency,
  orderId,
  customerId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  // Mobile money state
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  
  // Bank transfer state
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    initializePayment();
  }, [amount, currency, orderId, customerId]);

  const initializePayment = async () => {
    try {
      const availableMethods = await advancedPaymentService.getAvailablePaymentMethods();
      setPaymentMethods(availableMethods);
      
      const intent = await advancedPaymentService.createPaymentIntent({
        amount,
        currency,
        orderId,
        customerId,
        paymentMethod: selectedMethod
      });
      
      setPaymentIntent(intent);
    } catch (error) {
      onError('Failed to initialize payment');
    }
  };

  const handlePayment = async () => {
    if (!paymentIntent) return;

    setIsProcessing(true);
    
    try {
      let paymentData;
      
      switch (selectedMethod) {
        case 'card':
          paymentData = {
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryDate,
            cvv,
            cardholderName
          };
          break;
        case 'mobile_money':
          paymentData = {
            mobileNumber,
            provider: mobileProvider
          };
          break;
        case 'bank_transfer':
          paymentData = {
            bankCode,
            accountNumber
          };
          break;
        case 'cod':
          paymentData = {};
          break;
        default:
          throw new Error('Invalid payment method');
      }

      const result = await advancedPaymentService.processPayment(paymentIntent.id, paymentData);
      
      if (result.success) {
        toast.success('Payment successful!');
        onSuccess(result);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast.error(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'mobile_money':
        return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer':
        return <Building className="w-5 h-5" />;
      case 'cod':
        return <DollarSign className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  const isFormValid = () => {
    switch (selectedMethod) {
      case 'card':
        return cardNumber.length >= 16 && expiryDate.length === 5 && cvv.length >= 3 && cardholderName.length > 0;
      case 'mobile_money':
        return mobileNumber.length > 0 && mobileProvider.length > 0;
      case 'bank_transfer':
        return bankCode.length > 0 && accountNumber.length > 0;
      case 'cod':
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Payment Gateway
        </CardTitle>
        <CardDescription>
          Complete your payment of {currency} {amount.toFixed(2)} for order #{orderId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select Payment Method</Label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <Button
                key={method}
                variant={selectedMethod === method ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => setSelectedMethod(method)}
              >
                <div className="flex items-center gap-3">
                  {getMethodIcon(method)}
                  <span>{getMethodLabel(method)}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Forms */}
        <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
          <TabsContent value="card" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mobile_money" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobileProvider">Provider</Label>
                <Select value={mobileProvider} onValueChange={setMobileProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="airtel">Airtel Money</SelectItem>
                    <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                    <SelectItem value="tigo">Tigo Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  placeholder="233501234567"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bank_transfer" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankCode">Bank</Label>
                <Select value={bankCode} onValueChange={setBankCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcb">GCB Bank</SelectItem>
                    <SelectItem value="ecobank">Ecobank</SelectItem>
                    <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                    <SelectItem value="zenith">Zenith Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cod" className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You will pay {currency} {amount.toFixed(2)} in cash when your order is delivered.
                Please ensure you have the exact amount ready.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Payment Status */}
        {paymentIntent && (
          <div className="flex items-center gap-2">
            <Label>Payment Status:</Label>
            <Badge variant={paymentIntent.status === 'succeeded' ? 'default' : 'secondary'}>
              {paymentIntent.status}
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handlePayment}
            disabled={!isFormValid() || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${currency} ${amount.toFixed(2)}`
            )}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
