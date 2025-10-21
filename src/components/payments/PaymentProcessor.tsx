import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, DollarSign, ShieldCheck } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { PaymentCalculation } from '@/services/api/paymentApiService';

interface PaymentProcessorProps {
  amount: number;
  currency?: string;
  category?: string;
  orderId?: string;
  serviceRequestId?: string;
  payeeId?: string;
  isEscrow?: boolean;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  currency = 'NGN',
  category,
  orderId,
  serviceRequestId,
  payeeId,
  isEscrow = false,
  onSuccess,
  onError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [provider, setProvider] = useState<string>('paystack');
  const [calculation, setCalculation] = useState<PaymentCalculation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    loading, 
    error, 
    calculatePayment, 
    initiatePayment 
  } = usePayment();

  // Calculate payment breakdown when amount changes
  useEffect(() => {
    if (amount > 0) {
      calculatePayment({
        amount,
        category,
        currency
      }).then(setCalculation).catch(console.error);
    }
  }, [amount, category, currency, calculatePayment]);

  const handlePaymentSubmit = async () => {
    if (!calculation) {
      onError('Payment calculation not available');
      return;
    }

    try {
      setIsProcessing(true);
      
      const result = await initiatePayment({
        amount,
        currency,
        paymentMethod,
        provider,
        payeeId,
        orderId,
        serviceRequestId,
        type: isEscrow ? 'escrow' : 'purchase',
        description: `Payment for ${orderId ? 'order' : 'service request'} ${orderId || serviceRequestId}`,
        metadata: {
          category,
          breakdown: calculation.breakdown
        }
      });

      // Handle provider response - redirect to payment page
      if (result.providerResponse?.data?.authorization_url) {
        window.location.href = result.providerResponse.data.authorization_url;
      } else if (result.providerResponse?.data?.link) {
        window.location.href = result.providerResponse.data.link;
      } else {
        onSuccess(result.payment);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Choose your preferred payment method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card Payment</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Payment Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isEscrow && (
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                This payment will be held in escrow and released after service completion.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(calculation.amount)}</span>
            </div>
            
            {calculation.breakdown.vat > 0 && (
              <div className="flex justify-between text-sm">
                <span>VAT (7.5%)</span>
                <span>{formatCurrency(calculation.breakdown.vat)}</span>
              </div>
            )}
            
            {calculation.breakdown.serviceTax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Service Tax</span>
                <span>{formatCurrency(calculation.breakdown.serviceTax)}</span>
              </div>
            )}
            
            {calculation.breakdown.stampDuty > 0 && (
              <div className="flex justify-between text-sm">
                <span>Stamp Duty</span>
                <span>{formatCurrency(calculation.breakdown.stampDuty)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Platform Fee</span>
              <span>{formatCurrency(calculation.platformFee)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Processing Fee</span>
              <span>{formatCurrency(calculation.fees)}</span>
            </div>
            
            <hr />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(calculation.amount + calculation.taxes + calculation.fees)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Seller receives</span>
              <span>{formatCurrency(calculation.sellerAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Process Payment Button */}
      <Button 
        onClick={handlePaymentSubmit}
        disabled={loading || isProcessing || !calculation}
        className="w-full"
        size="lg"
      >
        {(loading || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isProcessing ? 'Processing...' : 
         isEscrow ? 'Pay to Escrow' : 'Process Payment'}
        {calculation && ` - ${formatCurrency(calculation.amount + calculation.taxes + calculation.fees)}`}
      </Button>
    </div>
  );
};
