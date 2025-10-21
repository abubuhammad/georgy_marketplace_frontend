import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Percent, Settings, TrendingUp, Users,
  Edit, Save, X, Plus, Trash2, Calculator
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RevenueSharingRule {
  id: string;
  category: string;
  user_type: string;
  platform_percentage: number;
  seller_percentage: number;
  min_amount?: number;
  max_amount?: number;
  effective_date: string;
  is_active: boolean;
}

interface PayoutRecord {
  id: string;
  seller_id: string;
  seller_name: string;
  amount: number;
  commission: number;
  net_payout: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

const RevenueSharing: React.FC = () => {
  const [rules, setRules] = useState<RevenueSharingRule[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<RevenueSharingRule | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 245680.50,
    platformCommission: 36852.08,
    sellerPayouts: 208828.42,
    pendingPayouts: 15420.30
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API calls
      // Mock data for now
      const mockRules: RevenueSharingRule[] = [
        {
          id: '1',
          category: 'Electronics',
          user_type: 'seller',
          platform_percentage: 15,
          seller_percentage: 85,
          effective_date: '2024-01-01',
          is_active: true
        },
        {
          id: '2',
          category: 'Real Estate',
          user_type: 'realtor',
          platform_percentage: 5,
          seller_percentage: 95,
          min_amount: 10000,
          effective_date: '2024-01-01',
          is_active: true
        },
        {
          id: '3',
          category: 'Fashion',
          user_type: 'seller',
          platform_percentage: 12,
          seller_percentage: 88,
          effective_date: '2024-01-01',
          is_active: true
        }
      ];

      const mockPayouts: PayoutRecord[] = [
        {
          id: '1',
          seller_id: 'seller_1',
          seller_name: 'John Electronics Store',
          amount: 25000,
          commission: 3750,
          net_payout: 21250,
          status: 'completed',
          created_at: '2024-01-20T10:30:00Z'
        },
        {
          id: '2',
          seller_id: 'seller_2',
          seller_name: 'Jane Fashion Boutique',
          amount: 18000,
          commission: 2160,
          net_payout: 15840,
          status: 'pending',
          created_at: '2024-01-19T14:20:00Z'
        }
      ];

      setRules(mockRules);
      setPayouts(mockPayouts);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async (rule: RevenueSharingRule) => {
    try {
      if (rule.id) {
        // Update existing rule
        setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      } else {
        // Add new rule
        const newRule = { ...rule, id: Date.now().toString() };
        setRules(prev => [...prev, newRule]);
      }
      setEditingRule(null);
      setIsAddingRule(false);
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const processPayout = async (payoutId: string) => {
    try {
      setPayouts(prev => prev.map(p => 
        p.id === payoutId ? { ...p, status: 'processing' } : p
      ));
      // TODO: Implement actual payout processing
    } catch (error) {
      console.error('Error processing payout:', error);
    }
  };

  const calculateCommission = (amount: number, category: string, userType: string) => {
    const rule = rules.find(r => 
      r.category === category && 
      r.user_type === userType && 
      r.is_active &&
      (!r.min_amount || amount >= r.min_amount) &&
      (!r.max_amount || amount <= r.max_amount)
    );

    if (!rule) return { commission: 0, percentage: 0 };

    return {
      commission: (amount * rule.platform_percentage) / 100,
      percentage: rule.platform_percentage
    };
  };

  const RuleEditForm: React.FC<{ 
    rule: RevenueSharingRule | null, 
    onSave: (rule: RevenueSharingRule) => void,
    onCancel: () => void 
  }> = ({ rule, onSave, onCancel }) => {
    const [formData, setFormData] = useState<RevenueSharingRule>(
      rule || {
        id: '',
        category: '',
        user_type: '',
        platform_percentage: 10,
        seller_percentage: 90,
        effective_date: new Date().toISOString().split('T')[0],
        is_active: true
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="Jobs">Jobs</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="user_type">User Type</Label>
            <Select 
              value={formData.user_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="realtor">Realtor</SelectItem>
                <SelectItem value="house_agent">House Agent</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="platform_percentage">Platform Commission (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.platform_percentage}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setFormData(prev => ({ 
                  ...prev, 
                  platform_percentage: value,
                  seller_percentage: 100 - value
                }));
              }}
            />
          </div>

          <div>
            <Label htmlFor="seller_percentage">Seller Percentage (%)</Label>
            <Input
              type="number"
              value={formData.seller_percentage}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_amount">Minimum Amount (₦)</Label>
            <Input
              type="number"
              min="0"
              value={formData.min_amount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                min_amount: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="max_amount">Maximum Amount (₦)</Label>
            <Input
              type="number"
              min="0"
              value={formData.max_amount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                max_amount: e.target.value ? parseFloat(e.target.value) : undefined 
              }))}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="effective_date">Effective Date</Label>
          <Input
            type="date"
            value={formData.effective_date}
            onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Rule
          </Button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue Sharing</h1>
        <p className="text-gray-600 mt-2">Manage commission rates and seller payouts</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₦{revenueStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                <p className="text-2xl font-bold">₦{revenueStats.platformCommission.toLocaleString()}</p>
              </div>
              <Percent className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Seller Payouts</p>
                <p className="text-2xl font-bold">₦{revenueStats.sellerPayouts.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold">₦{revenueStats.pendingPayouts.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Commission Rules</CardTitle>
              <CardDescription>Configure revenue sharing percentages by category and user type</CardDescription>
            </div>
            <Button onClick={() => setIsAddingRule(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Platform %</TableHead>
                  <TableHead>Seller %</TableHead>
                  <TableHead>Amount Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.category}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.user_type}</Badge>
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">{rule.platform_percentage}%</TableCell>
                    <TableCell className="text-green-600 font-medium">{rule.seller_percentage}%</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {rule.min_amount || rule.max_amount ? (
                        `₦${rule.min_amount?.toLocaleString() || '0'} - ₦${rule.max_amount?.toLocaleString() || '∞'}`
                      ) : (
                        'All amounts'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingRule(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Track seller payments and commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.seller_name}</TableCell>
                    <TableCell>₦{payout.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">₦{payout.commission.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">₦{payout.net_payout.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        payout.status === 'completed' ? 'default' :
                        payout.status === 'processing' ? 'secondary' :
                        payout.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status === 'pending' && (
                        <Button 
                          size="sm"
                          onClick={() => processPayout(payout.id)}
                        >
                          Process
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Rule Dialog */}
      {(editingRule || isAddingRule) && (
        <Dialog open={true} onOpenChange={() => {
          setEditingRule(null);
          setIsAddingRule(false);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Commission Rule' : 'Add Commission Rule'}
              </DialogTitle>
              <DialogDescription>
                Configure revenue sharing percentages for this category and user type.
              </DialogDescription>
            </DialogHeader>
            <RuleEditForm
              rule={editingRule}
              onSave={saveRule}
              onCancel={() => {
                setEditingRule(null);
                setIsAddingRule(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RevenueSharing;
