import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Receipt, 
  Info, 
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { paymentApiService } from '@/services/paymentService-api';
import { PaymentBreakdown as APIPaymentBreakdown, PaymentConfig } from '@/types/payment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaxRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  rate: number;
  min?: number;
  max?: number;
  threshold?: number;
  description: string;
  applies_to: string[];
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'mobile_money' | 'cash' | 'crypto';
  name: string;
  fee_percentage: number;
  fee_fixed: number;
  min_fee?: number;
  max_fee?: number;
  processing_time: string;
  available_currencies: string[];
}

interface PaymentBreakdown {
  subtotal: number;
  taxes: Array<{
    name: string;
    rate: number;
    amount: number;
    type: string;
  }>;
  fees: Array<{
    name: string;
    amount: number;
    type: 'platform' | 'payment' | 'processing';
  }>;
  discounts: Array<{
    name: string;
    amount: number;
    type: 'percentage' | 'fixed';
  }>;
  total: number;
  currency: string;
}

interface PaymentCalculatorProps {
  amount: number;
  currency?: string;
  category?: string;
  location?: string;
  sellerId?: string;
  userType?: string;
  escrow?: boolean;
  onCalculationChange?: (breakdown: APIPaymentBreakdown) => void;
  className?: string;
}

// Nigerian tax rules
const TAX_RULES: TaxRule[] = [
  {
    id: 'vat',
    name: 'Value Added Tax (VAT)',
    type: 'percentage',
    rate: 7.5,
    description: 'Standard VAT rate in Nigeria',
    applies_to: ['products', 'services']
  },
  {
    id: 'service_tax',
    name: 'Service Tax',
    type: 'percentage',
    rate: 5.0,
    threshold: 25000,
    description: 'Tax on professional services above ₦25,000',
    applies_to: ['services', 'freelance']
  },
  {
    id: 'withholding_tax',
    name: 'Withholding Tax',
    type: 'percentage',
    rate: 10.0,
    threshold: 100000,
    description: 'Withholding tax for transactions above ₦100,000',
    applies_to: ['contracts', 'services']
  },
  {
    id: 'stamp_duty',
    name: 'Stamp Duty',
    type: 'fixed',
    rate: 50,
    threshold: 10000,
    description: 'Fixed stamp duty for transactions above ₦10,000',
    applies_to: ['real_estate', 'contracts']
  }
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    fee_percentage: 1.5,
    fee_fixed: 100,
    max_fee: 2000,
    processing_time: 'Instant',
    available_currencies: ['NGN', 'USD']
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    fee_percentage: 0.5,
    fee_fixed: 52.5,
    max_fee: 1000,
    processing_time: '1-3 business days',
    available_currencies: ['NGN']
  },
  {
    id: 'mobile_money',
    type: 'mobile_money',
    name: 'Mobile Money',
    fee_percentage: 1.0,
    fee_fixed: 10,
    min_fee: 50,
    max_fee: 500,
    processing_time: 'Instant',
    available_currencies: ['NGN']
  },
  {
    id: 'cash',
    type: 'cash',
    name: 'Cash on Delivery',
    fee_percentage: 0,
    fee_fixed: 200,
    processing_time: 'On delivery',
    available_currencies: ['NGN']
  }
];

const PLATFORM_FEES = {
  standard: 2.5, // 2.5% platform fee
  premium: 1.5,  // 1.5% for premium sellers
  enterprise: 1.0 // 1.0% for enterprise accounts
};

const CURRENCY_SYMBOLS = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export function PaymentCalculator({
  amount,
  currency = 'NGN',
  category = 'products',
  location = 'Nigeria',
  sellerId,
  userType,
  escrow = false,
  onCalculationChange,
  className
}: PaymentCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [breakdown, setBreakdown] = useState<APIPaymentBreakdown | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('CARD');
  const [includeTaxes, setIncludeTaxes] = useState(true);
  const [couponCode, setCouponCode] = useState('');

  const currencySymbol = '₦'; // For NGN

  // Load payment configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const paymentConfig = await paymentApiService.getPaymentConfig();
        setConfig(paymentConfig);
      } catch (error) {
        console.error('Failed to load payment config:', error);
        // Fallback to basic config
        setConfig({
          taxRules: [],
          revenueShares: [],
          paymentMethods: [
            { method: 'CARD', name: 'Card', description: 'Pay with card', enabled: true, fees: { percentage: 1.5 }, limits: { min: 100, max: 5000000, currency: 'NGN' } }
          ],
          currencies: [{ code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, enabled: true }]
        } as any);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Calculate breakdown when inputs change
  useEffect(() => {
    const calculateBreakdown = async () => {
      if (!amount || amount <= 0 || !config) return;

      try {
        setLoading(true);
        const result = await paymentApiService.calculateBreakdown({
          amount,
          currency,
          sellerId,
          category,
          userType,
          escrow
        });
        setBreakdown(result.breakdown);
        onCalculationChange?.(result.breakdown);
      } catch (error) {
        console.error('Failed to calculate breakdown:', error);
        // Fallback calculation
        const fallbackBreakdown: APIPaymentBreakdown = {
          subtotal: amount,
          taxes: [],
          fees: [{ type: 'platform', name: 'Platform Fee', rate: 2.5, amount: amount * 0.025 }],
          discount: 0,
          total: amount + (amount * 0.025),
          platformCut: amount * 0.025,
          sellerNet: amount * 0.975
        };
        setBreakdown(fallbackBreakdown);
        onCalculationChange?.(fallbackBreakdown);
      } finally {
        setLoading(false);
      }
    };

    calculateBreakdown();
  }, [amount, currency, sellerId, category, userType, escrow, config, onCalculationChange]);

  // Get payment method from config
  const paymentMethod = config?.paymentMethods.find(pm => pm.method === selectedPaymentMethod);

  if (loading) {
    return (
      <Card className={cn('w-full max-w-2xl', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Calculating...</span>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className={cn('w-full max-w-2xl', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Enter an amount to see payment breakdown</p>
        </CardContent>
      </Card>
    );
  }

    // Calculate applicable taxes
    if (includeTaxes) {
      TAX_RULES.forEach(rule => {
        if (!rule.applies_to.includes(category)) return;
        if (rule.threshold && amount < rule.threshold) return;

        let taxAmount = 0;
        if (rule.type === 'percentage') {
          taxAmount = (amount * rule.rate) / 100;
        } else if (rule.type === 'fixed') {
          taxAmount = rule.rate;
        }

        if (taxAmount > 0) {
          result.taxes.push({
            name: rule.name,
            rate: rule.rate,
            amount: taxAmount,
            type: rule.type
          });
        }
      });
    }

    // Platform fee
    const platformFeeRate = PLATFORM_FEES[sellerTier];
    const platformFee = (amount * platformFeeRate) / 100;
    result.fees.push({
      name: `Platform Fee (${sellerTier})`,
      amount: platformFee,
      type: 'platform'
    });

    // Payment processing fee
    if (paymentMethod) {
      let processingFee = (amount * paymentMethod.fee_percentage) / 100 + paymentMethod.fee_fixed;
      
      if (paymentMethod.min_fee && processingFee < paymentMethod.min_fee) {
        processingFee = paymentMethod.min_fee;
      }
      if (paymentMethod.max_fee && processingFee > paymentMethod.max_fee) {
        processingFee = paymentMethod.max_fee;
      }

      result.fees.push({
        name: `${paymentMethod.name} Fee`,
        amount: processingFee,
        type: 'payment'
      });
    }

    // Insurance fee (optional)
    if (includeInsurance) {
      const insuranceFee = Math.max((amount * 0.5) / 100, 100); // 0.5% min ₦100
      result.fees.push({
        name: 'Transaction Insurance',
        amount: insuranceFee,
        type: 'processing'
      });
    }

    // Apply coupon discount
    if (appliedCoupon) {
      let discountAmount = 0;
      if (appliedCoupon.type === 'percentage') {
        discountAmount = (amount * appliedCoupon.discount) / 100;
      } else {
        discountAmount = appliedCoupon.discount;
      }

      result.discounts.push({
        name: `Coupon: ${appliedCoupon.code}`,
        amount: discountAmount,
        type: appliedCoupon.type
      });
    }

    // Calculate total
    const totalTaxes = result.taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const totalFees = result.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalDiscounts = result.discounts.reduce((sum, discount) => sum + discount.amount, 0);

    result.total = amount + totalTaxes + totalFees - totalDiscounts;

    return result;
  }, [amount, currency, category, includeTaxes, includeInsurance, selectedPaymentMethod, sellerTier, appliedCoupon]);

  useEffect(() => {
    onCalculationChange?.(breakdown);
  }, [breakdown, onCalculationChange]);

  const applyCoupon = () => {
    // Mock coupon validation
    const mockCoupons = {
      'SAVE10': { discount: 10, type: 'percentage' as const },
      'FLAT500': { discount: 500, type: 'fixed' as const },
      'WELCOME': { discount: 5, type: 'percentage' as const }
    };

    const coupon = mockCoupons[couponCode as keyof typeof mockCoupons];
    if (coupon) {
      setAppliedCoupon({ code: couponCode, ...coupon });
      setCouponCode('');
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return CreditCard;
      case 'bank_transfer': return Building;
      case 'mobile_money': return Smartphone;
      case 'cash': return Banknote;
      default: return CreditCard;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payment Calculator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Calculate taxes, fees, and total payment amount
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.filter(pm => pm.available_currencies.includes(currency)).map(method => {
                        const Icon = getPaymentMethodIcon(method.type);
                        return (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {method.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {paymentMethod && (
                    <p className="text-xs text-gray-500 mt-1">
                      Processing time: {paymentMethod.processing_time}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Seller Tier</Label>
                  <Select value={sellerTier} onValueChange={(value: any) => setSellerTier(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard ({PLATFORM_FEES.standard}%)</SelectItem>
                      <SelectItem value="premium">Premium ({PLATFORM_FEES.premium}%)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ({PLATFORM_FEES.enterprise}%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={includeTaxes} onCheckedChange={setIncludeTaxes} />
                  <Label>Include Taxes</Label>
                  <Badge variant="outline" className="ml-2">
                    {breakdown.taxes.length} applicable
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch checked={includeInsurance} onCheckedChange={setIncludeInsurance} />
                  <Label>Transaction Insurance</Label>
                  <Badge variant="outline" className="ml-2">
                    0.5% min ₦100
                  </Badge>
                </div>
              </div>

              {/* Coupon Code */}
              <div>
                <Label>Coupon Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={applyCoupon}
                    disabled={!couponCode}
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Coupon "{appliedCoupon.code}" applied successfully
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAppliedCoupon(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{currencySymbol}{amount.toLocaleString()}</span>
                  </div>

                  {breakdown.taxes.map((tax, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{tax.name}:</span>
                      <span>{currencySymbol}{tax.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  {breakdown.fees.map((fee, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{fee.name}:</span>
                      <span>{currencySymbol}{fee.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  {breakdown.discounts.map((discount, index) => (
                    <div key={index} className="flex justify-between text-sm text-green-600">
                      <span>{discount.name}:</span>
                      <span>-{currencySymbol}{discount.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-red-600">{currencySymbol}{breakdown.total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>You save:</span>
                    <span className="text-green-600">
                      {currencySymbol}{breakdown.discounts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              {/* Tax Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Tax Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {breakdown.taxes.length > 0 ? (
                    <div className="space-y-3">
                      {breakdown.taxes.map((tax, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{tax.name}</p>
                            <p className="text-sm text-gray-600">
                              {tax.type === 'percentage' ? `${tax.rate}%` : `Fixed ₦${tax.rate}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{currencySymbol}{tax.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Taxes:</span>
                        <span>{currencySymbol}{breakdown.taxes.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No taxes applicable for this transaction</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fee Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Fee Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {breakdown.fees.map((fee, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{fee.name}</p>
                          <Badge variant="outline" className="mt-1">
                            {fee.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{currencySymbol}{fee.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Fees:</span>
                      <span>{currencySymbol}{breakdown.fees.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Tax Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {TAX_RULES.filter(rule => rule.applies_to.includes(category)).map(rule => (
                      <div key={rule.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge variant={rule.threshold && amount < rule.threshold ? 'secondary' : 'default'}>
                            {rule.type === 'percentage' ? `${rule.rate}%` : `₦${rule.rate}`}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        {rule.threshold && (
                          <p className="text-xs text-gray-500">
                            Applies to transactions above ₦{rule.threshold.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentCalculator;
