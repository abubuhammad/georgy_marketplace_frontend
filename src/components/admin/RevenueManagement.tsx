import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, DollarSign, Percent, TrendingUp, AlertCircle } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { RevenueShareScheme, TaxRule } from '@/services/api/adminApiService';

export const RevenueManagement: React.FC = () => {
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isTaxDialogOpen, setIsTaxDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueShareScheme | null>(null);
  const [editingTax, setEditingTax] = useState<TaxRule | null>(null);
  
  const {
    loading,
    error,
    revenueSchemes,
    taxRules,
    analytics,
    getRevenueShareSchemes,
    createRevenueShareScheme,
    updateRevenueShareScheme,
    deleteRevenueShareScheme,
    getTaxRules,
    createTaxRule,
    updateTaxRule,
    deleteTaxRule,
    getPaymentAnalytics
  } = useAdmin();

  useEffect(() => {
    Promise.all([
      getRevenueShareSchemes(),
      getTaxRules(),
      getPaymentAnalytics()
    ]).catch(console.error);
  }, [getRevenueShareSchemes, getTaxRules, getPaymentAnalytics]);

  const RevenueSchemeForm: React.FC<{ 
    scheme?: RevenueShareScheme; 
    onSubmit: (data: any) => void; 
    onCancel: () => void;
  }> = ({ scheme, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: scheme?.name || '',
      category: scheme?.category || '',
      platformFeeRate: scheme?.platformFeeRate || 0.025,
      paymentFeeRate: scheme?.paymentFeeRate || 0.015,
      taxRate: scheme?.taxRate || 0.075,
      sellerTier: scheme?.sellerTier || 'standard',
      minimumThreshold: scheme?.minimumThreshold || 0,
      isActive: scheme?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        category: formData.category || null,
        sellerTier: formData.sellerTier || null
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Scheme Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="electronics, services, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seller-tier">Seller Tier</Label>
          <Select value={formData.sellerTier} onValueChange={(value) => setFormData({ ...formData, sellerTier: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform-fee">Platform Fee (%)</Label>
            <Input
              id="platform-fee"
              type="number"
              step="0.001"
              value={formData.platformFeeRate * 100}
              onChange={(e) => setFormData({ ...formData, platformFeeRate: parseFloat(e.target.value) / 100 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-fee">Payment Fee (%)</Label>
            <Input
              id="payment-fee"
              type="number"
              step="0.001"
              value={formData.paymentFeeRate * 100}
              onChange={(e) => setFormData({ ...formData, paymentFeeRate: parseFloat(e.target.value) / 100 })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimum-threshold">Minimum Threshold (₦)</Label>
          <Input
            id="minimum-threshold"
            type="number"
            value={formData.minimumThreshold}
            onChange={(e) => setFormData({ ...formData, minimumThreshold: parseFloat(e.target.value) })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {scheme ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    );
  };

  const TaxRuleForm: React.FC<{ 
    taxRule?: TaxRule; 
    onSubmit: (data: any) => void; 
    onCancel: () => void;
  }> = ({ taxRule, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: taxRule?.name || '',
      type: taxRule?.type || 'vat',
      rate: taxRule?.rate || 0,
      fixedAmount: taxRule?.fixedAmount || 0,
      threshold: taxRule?.threshold || 0,
      description: taxRule?.description || '',
      isActive: taxRule?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax-name">Tax Name</Label>
          <Input
            id="tax-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-type">Tax Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vat">VAT</SelectItem>
              <SelectItem value="service_tax">Service Tax</SelectItem>
              <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
              <SelectItem value="stamp_duty">Stamp Duty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              step="0.001"
              value={formData.rate * 100}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) / 100 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fixed-amount">Fixed Amount (₦)</Label>
            <Input
              id="fixed-amount"
              type="number"
              value={formData.fixedAmount}
              onChange={(e) => setFormData({ ...formData, fixedAmount: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold">Threshold (₦)</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="tax-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="tax-active">Active</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {taxRule ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    );
  };

  const handleRevenueSubmit = async (data: any) => {
    try {
      if (editingRevenue) {
        await updateRevenueShareScheme(editingRevenue.id, data);
      } else {
        await createRevenueShareScheme(data);
      }
      setIsRevenueDialogOpen(false);
      setEditingRevenue(null);
    } catch (error) {
      console.error('Failed to save revenue scheme:', error);
    }
  };

  const handleTaxSubmit = async (data: any) => {
    try {
      if (editingTax) {
        await updateTaxRule(editingTax.id, data);
      } else {
        await createTaxRule(data);
      }
      setIsTaxDialogOpen(false);
      setEditingTax(null);
    } catch (error) {
      console.error('Failed to save tax rule:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Revenue Management</h2>
          <p className="text-muted-foreground">Manage platform revenue sharing and tax rules</p>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{analytics.platformRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTransactions.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="revenue-schemes" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue-schemes">Revenue Schemes</TabsTrigger>
          <TabsTrigger value="tax-rules">Tax Rules</TabsTrigger>
        </TabsList>

        {/* Revenue Schemes Tab */}
        <TabsContent value="revenue-schemes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Revenue Share Schemes</h3>
            <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRevenue(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRevenue ? 'Edit' : 'Create'} Revenue Scheme</DialogTitle>
                  <DialogDescription>
                    Configure platform commission and fee structure
                  </DialogDescription>
                </DialogHeader>
                <RevenueSchemeForm
                  scheme={editingRevenue || undefined}
                  onSubmit={handleRevenueSubmit}
                  onCancel={() => {
                    setIsRevenueDialogOpen(false);
                    setEditingRevenue(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Payment Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueSchemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium">{scheme.name}</TableCell>
                    <TableCell>{scheme.category || 'All'}</TableCell>
                    <TableCell>
                      <Badge variant={scheme.sellerTier === 'enterprise' ? 'default' : 'secondary'}>
                        {scheme.sellerTier || 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell>{(scheme.platformFeeRate * 100).toFixed(2)}%</TableCell>
                    <TableCell>{(scheme.paymentFeeRate * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      <Badge variant={scheme.isActive ? 'default' : 'secondary'}>
                        {scheme.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingRevenue(scheme);
                            setIsRevenueDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRevenueShareScheme(scheme.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tax Rules Tab */}
        <TabsContent value="tax-rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tax Rules</h3>
            <Dialog open={isTaxDialogOpen} onOpenChange={setIsTaxDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingTax(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tax Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingTax ? 'Edit' : 'Create'} Tax Rule</DialogTitle>
                  <DialogDescription>
                    Configure tax rates and thresholds
                  </DialogDescription>
                </DialogHeader>
                <TaxRuleForm
                  taxRule={editingTax || undefined}
                  onSubmit={handleTaxSubmit}
                  onCancel={() => {
                    setIsTaxDialogOpen(false);
                    setEditingTax(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Fixed Amount</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.type.replace('_', ' ').toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{(rule.rate * 100).toFixed(2)}%</TableCell>
                    <TableCell>₦{rule.fixedAmount.toLocaleString()}</TableCell>
                    <TableCell>₦{rule.threshold.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTax(rule);
                            setIsTaxDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTaxRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
