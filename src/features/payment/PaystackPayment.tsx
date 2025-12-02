import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, CreditCard, Smartphone, Building, Banknote, 
  CheckCircle, XCircle, Shield, Lock, ArrowLeft 
} from 'lucide-react';
import { paystackService, PaystackResponse } from '@/services/paystackService';
import { useToast } from '@/hooks/use-toast';

interface PaystackPaymentProps {
  amount: number; // in Naira
  email: string;
  orderId: string;
  customerName?: string;
  phone?: string;
  onSuccess: (response: PaystackResponse & { verified?: boolean }) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  email,
  orderId,
  customerName,
  phone,
  onSuccess,
  onError,
  onCancel
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      await paystackService.payWithPopup({
        email,
        amount,
        orderId,
        firstName: customerName?.split(' ')[0],
        lastName: customerName?.split(' ').slice(1).join(' '),
        phone,
        onSuccess: async (response) => {
          console.log('Payment successful:', response);
          setIsVerifying(true);
          
          // Verify payment on backend
          try {
            const verification = await paystackService.verifyPayment(response.reference);
            
            if (verification.success) {
              setPaymentStatus('success');
              toast({
                title: "Payment Successful!",
                description: `Your payment of ₦${amount.toLocaleString()} has been confirmed.`,
              });
              onSuccess({ ...response, verified: true });
            } else {
              setPaymentStatus('failed');
              toast({
                title: "Verification Failed",
                description: "Payment was made but verification failed. Please contact support.",
                variant: "destructive"
              });
              onError('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            // Payment was successful but verification failed - still notify success
            // The webhook should handle this case
            setPaymentStatus('success');
            toast({
              title: "Payment Received",
              description: "Your payment is being processed. You'll receive confirmation shortly.",
            });
            onSuccess({ ...response, verified: false });
          } finally {
            setIsVerifying(false);
          }
        },
        onCancel: () => {
          setPaymentStatus('idle');
          setIsLoading(false);
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment. You can try again when ready.",
          });
          onCancel();
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsLoading(false);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive"
      });
      onError(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Secure payment powered by Paystack
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{email}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-primary">₦{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">Accepted Payment Methods</p>
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center text-xs text-gray-500">
              <CreditCard className="w-6 h-6 mb-1" />
              <span>Card</span>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-500">
              <Building className="w-6 h-6 mb-1" />
              <span>Bank</span>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-500">
              <Smartphone className="w-6 h-6 mb-1" />
              <span>USSD</span>
            </div>
            <div className="flex flex-col items-center text-xs text-gray-500">
              <Banknote className="w-6 h-6 mb-1" />
              <span>Transfer</span>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {paymentStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus === 'failed' && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Payment failed. Please try again or use a different payment method.
            </AlertDescription>
          </Alert>
        )}

        {isVerifying && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-blue-800">
              Verifying your payment...
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={isLoading || isVerifying || paymentStatus === 'success'}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading || isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isVerifying ? 'Verifying...' : 'Processing...'}
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Payment Complete
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay ₦{amount.toLocaleString()}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isVerifying}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel Payment
          </Button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 border-t">
          <Shield className="w-4 h-4" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>

        {/* Paystack Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            Powered by Paystack
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaystackPayment;
