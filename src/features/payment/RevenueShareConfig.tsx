import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Percent, 
  DollarSign, 
  Users, 
  Building, 
  TrendingUp, 
  Save, 
  Plus,
  Trash2,
  Edit,
  Eye,
  AlertCircle
} from 'lucide-react';
import { RevenueShareRule, PayoutSchedule, RevenueShareConfig as RevenueConfig } from './types';
import { advancedPaymentService } from '@/services/advancedPaymentService';
import { toast } from 'sonner';

interface RevenueShareConfigProps {
  onConfigUpdate?: (config: RevenueConfig) => void;
}

export const RevenueShareConfig: React.FC<RevenueShareConfigProps> = ({ onConfigUpdate }) => {
  const [config, setConfig] = useState<RevenueConfig>({
    defaultPlatformFee: 5,
    defaultSellerShare: 95,
    rules: [],
    payoutSchedule: 'weekly',
    minimumPayout: 10,
    autoPayoutEnabled: true,
    taxHandling: 'platform'
  });

  const [newRule, setNewRule] = useState<Partial<RevenueShareRule>>({
    category: '',
    condition: 'category',
    value: '',
    platformFee: 0,
    sellerShare: 0,
    deliveryFee: 0,
    isActive: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRevenueConfig();
  }, []);

  const loadRevenueConfig = async () => {
    try {
      setLoading(true);
      const configData = await advancedPaymentService.getRevenueShareConfig();
      setConfig(configData);
    } catch (error) {
      toast.error('Failed to load revenue configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveRevenueConfig = async () => {
    try {
      setLoading(true);
      await advancedPaymentService.updateRevenueShareConfig(config);
      toast.success('Revenue configuration saved successfully');
      onConfigUpdate?.(config);
    } catch (error) {
      toast.error('Failed to save revenue configuration');
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    if (!newRule.category || !newRule.value || !newRule.platformFee || !newRule.sellerShare) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newRule.platformFee! + newRule.sellerShare! !== 100) {
      toast.error('Platform fee and seller share must total 100%');
      return;
    }

    const rule: RevenueShareRule = {
      id: Date.now().toString(),
      category: newRule.category!,
      condition: newRule.condition!,
      value: newRule.value!,
      platformFee: newRule.platformFee!,
      sellerShare: newRule.sellerShare!,
      deliveryFee: newRule.deliveryFee || 0,
      isActive: newRule.isActive!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, rule]
    }));

    setNewRule({
      category: '',
      condition: 'category',
      value: '',
      platformFee: 0,
      sellerShare: 0,
      deliveryFee: 0,
      isActive: true
    });
  };

  const updateRule = (ruleId: string, updates: Partial<RevenueShareRule>) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule
      )
    }));
  };

  const removeRule = (ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const toggleRuleStatus = (ruleId: string) => {
    updateRule(ruleId, { isActive: !config.rules.find(r => r.id === ruleId)?.isActive });
  };

  const getConditionOptions = () => [
    { value: 'category', label: 'Product Category' },
    { value: 'seller_type', label: 'Seller Type' },
    { value: 'order_value', label: 'Order Value' },
    { value: 'seller_rating', label: 'Seller Rating' },
    { value: 'product_type', label: 'Product Type' }
  ];

  const getPayoutScheduleOptions = () => [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const validatePercentages = (platformFee: number, sellerShare: number) => {
    return platformFee + sellerShare === 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Revenue Share Configuration
          </CardTitle>
          <CardDescription>
            Configure platform fees, seller shares, and revenue distribution rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="defaultPlatformFee">Default Platform Fee (%)</Label>
                    <Input
                      id="defaultPlatformFee"
                      type="number"
                      min="0"
                      max="100"
                      value={config.defaultPlatformFee}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        defaultPlatformFee: Number(e.target.value),
                        defaultSellerShare: 100 - Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultSellerShare">Default Seller Share (%)</Label>
                    <Input
                      id="defaultSellerShare"
                      type="number"
                      min="0"
                      max="100"
                      value={config.defaultSellerShare}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        defaultSellerShare: Number(e.target.value),
                        defaultPlatformFee: 100 - Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minimumPayout">Minimum Payout Amount</Label>
                    <Input
                      id="minimumPayout"
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.minimumPayout}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        minimumPayout: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxHandling">Tax Handling</Label>
                    <Select 
                      value={config.taxHandling} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, taxHandling: value as 'platform' | 'seller' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">Platform handles tax</SelectItem>
                        <SelectItem value="seller">Seller handles tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {!validatePercentages(config.defaultPlatformFee, config.defaultSellerShare) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Platform fee and seller share must total 100%
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Rule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ruleCondition">Condition</Label>
                      <Select 
                        value={newRule.condition} 
                        onValueChange={(value) => setNewRule(prev => ({ ...prev, condition: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getConditionOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ruleValue">Value</Label>
                      <Input
                        id="ruleValue"
                        placeholder="e.g., Electronics, Premium, >100"
                        value={newRule.value}
                        onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ruleCategory">Category</Label>
                      <Input
                        id="ruleCategory"
                        placeholder="e.g., Electronics"
                        value={newRule.category}
                        onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rulePlatformFee">Platform Fee (%)</Label>
                      <Input
                        id="rulePlatformFee"
                        type="number"
                        min="0"
                        max="100"
                        value={newRule.platformFee}
                        onChange={(e) => setNewRule(prev => ({ 
                          ...prev, 
                          platformFee: Number(e.target.value),
                          sellerShare: 100 - Number(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ruleSellerShare">Seller Share (%)</Label>
                      <Input
                        id="ruleSellerShare"
                        type="number"
                        min="0"
                        max="100"
                        value={newRule.sellerShare}
                        onChange={(e) => setNewRule(prev => ({ 
                          ...prev, 
                          sellerShare: Number(e.target.value),
                          platformFee: 100 - Number(e.target.value)
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ruleDeliveryFee">Delivery Fee</Label>
                      <Input
                        id="ruleDeliveryFee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newRule.deliveryFee}
                        onChange={(e) => setNewRule(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={addRule} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Existing Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Seller Share</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.category}</TableCell>
                          <TableCell>{rule.condition}</TableCell>
                          <TableCell>{rule.value}</TableCell>
                          <TableCell>{rule.platformFee}%</TableCell>
                          <TableCell>{rule.sellerShare}%</TableCell>
                          <TableCell>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleRuleStatus(rule.id)}
                              >
                                {rule.isActive ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeRule(rule.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payout Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="payoutSchedule">Schedule</Label>
                      <Select 
                        value={config.payoutSchedule} 
                        onValueChange={(value) => setConfig(prev => ({ ...prev, payoutSchedule: value as PayoutSchedule }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getPayoutScheduleOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoPayoutEnabled"
                        checked={config.autoPayoutEnabled}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoPayoutEnabled: checked }))}
                      />
                      <Label htmlFor="autoPayoutEnabled">Enable automatic payouts</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payout Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="holdingPeriod">Holding Period (days)</Label>
                      <Input
                        id="holdingPeriod"
                        type="number"
                        min="0"
                        value={config.holdingPeriod || 7}
                        onChange={(e) => setConfig(prev => ({ ...prev, holdingPeriod: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="payoutDescription">Payout Description</Label>
                      <Textarea
                        id="payoutDescription"
                        placeholder="Additional payout terms and conditions"
                        value={config.payoutDescription || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, payoutDescription: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-sm text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Percent className="w-5 h-5" />
                      Platform Fees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$2,261.59</div>
                    <p className="text-sm text-muted-foreground">5% average fee</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Seller Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$42,970.30</div>
                    <p className="text-sm text-muted-foreground">95% to sellers</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button onClick={saveRevenueConfig} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
