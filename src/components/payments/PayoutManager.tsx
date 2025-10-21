import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Send,
  Eye,
  FileText,
  Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Payout, PayoutItem } from '@/types/payment';
import { paymentApiService } from '@/services/paymentService-api';

interface PayoutManagerProps {
  sellerId?: string;
  className?: string;
}

interface PayoutStats {
  totalPaidOut: number;
  pendingAmount: number;
  scheduledPayouts: number;
  failedPayouts: number;
  averagePayoutTime: number;
  nextScheduledPayout?: Date;
}

interface PayoutConfig {
  autoPayoutEnabled: boolean;
  payoutFrequency: 'daily' | 'weekly' | 'monthly';
  minimumAmount: number;
  maximumAmount: number;
  holdingPeriod: number; // days
}

export function PayoutManager({ sellerId, className }: PayoutManagerProps) {
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [config, setConfig] = useState<PayoutConfig>({
    autoPayoutEnabled: true,
    payoutFrequency: 'weekly',
    minimumAmount: 10000,
    maximumAmount: 5000000,
    holdingPeriod: 7
  });
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Manual payout form
  const [manualPayoutForm, setManualPayoutForm] = useState({
    sellerId: sellerId || '',
    amount: 0,
    description: '',
    payoutMethod: 'bank_transfer',
    scheduledFor: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [sellerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payoutsData, statsData, configData] = await Promise.all([
        paymentApiService.getPayouts({ sellerId, ...filter }),
        paymentApiService.getPayoutStats(sellerId),
        paymentApiService.getPayoutConfig(sellerId)
      ]);
      setPayouts(payoutsData);
      setStats(statsData);
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load payout data:', error);
      // Fallback data
      setPayouts([
        {
          id: '1',
          sellerId: 'seller-123',
          batchId: 'BATCH-001',
          totalAmount: 25000,
          currency: 'NGN',
          status: 'completed',
          scheduledFor: '2024-01-15',
          processedAt: '2024-01-15T10:30:00Z',
          settledAt: '2024-01-15T10:35:00Z',
          items: [
            { id: '1', paymentId: 'pay-1', amount: 15000, fee: 300, netAmount: 14700 },
            { id: '2', paymentId: 'pay-2', amount: 10000, fee: 200, netAmount: 9800 }
          ]
        },
        {
          id: '2',
          sellerId: 'seller-123',
          batchId: 'BATCH-002',
          totalAmount: 50000,
          currency: 'NGN',
          status: 'pending',
          scheduledFor: '2024-01-22',
          items: [
            { id: '3', paymentId: 'pay-3', amount: 50000, fee: 1000, netAmount: 49000 }
          ]
        }
      ]);
      setStats({
        totalPaidOut: 125000,
        pendingAmount: 50000,
        scheduledPayouts: 1,
        failedPayouts: 0,
        averagePayoutTime: 2.5,
        nextScheduledPayout: new Date('2024-01-22')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    if (!confirm('Are you sure you want to process this payout?')) return;

    try {
      setLoading(true);
      await paymentApiService.processPayout(payoutId);
      loadData(); // Reload data
    } catch (error) {
      console.error('Failed to process payout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayout = async (payoutId: string) => {
    if (!confirm('Are you sure you want to cancel this payout?')) return;

    try {
      setLoading(true);
      await paymentApiService.cancelPayout(payoutId);
      loadData(); // Reload data
    } catch (error) {
      console.error('Failed to cancel payout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualPayout = async () => {
    try {
      setLoading(true);
      await paymentApiService.createManualPayout(manualPayoutForm);
      setIsPayoutDialogOpen(false);
      resetManualPayoutForm();
      loadData();
    } catch (error) {
      console.error('Failed to create manual payout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      setLoading(true);
      await paymentApiService.updatePayoutConfig(sellerId, config);
      setIsConfigDialogOpen(false);
    } catch (error) {
      console.error('Failed to update payout config:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetManualPayoutForm = () => {
    setManualPayoutForm({
      sellerId: sellerId || '',
      amount: 0,
      description: '',
      payoutMethod: 'bank_transfer',
      scheduledFor: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge variant="secondary" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPayoutMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return Banknote;
      case 'mobile_money': return CreditCard;
      default: return CreditCard;
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    if (filter.status !== 'all' && payout.status !== filter.status) return false;
    if (filter.search && !payout.batchId.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.dateFrom && new Date(payout.scheduledFor) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(payout.scheduledFor) > new Date(filter.dateTo)) return false;
    return true;
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Paid Out</p>
                  <p className="text-xl font-bold">₦{stats.totalPaidOut.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-xl font-bold">₦{stats.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-xl font-bold">{stats.scheduledPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-xl font-bold">{stats.failedPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg. Time</p>
                  <p className="text-xl font-bold">{stats.averagePayoutTime}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-600">Next Payout</p>
                  <p className="text-sm font-medium">
                    {stats.nextScheduledPayout 
                      ? new Date(stats.nextScheduledPayout).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payout Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Payout Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoPayout">Auto Payout</Label>
                      <Switch
                        id="autoPayout"
                        checked={config.autoPayoutEnabled}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, autoPayoutEnabled: checked })
                        }
                      />
                    </div>

                    <div>
                      <Label>Payout Frequency</Label>
                      <Select 
                        value={config.payoutFrequency} 
                        onValueChange={(value: any) => 
                          setConfig({ ...config, payoutFrequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Amount (₦)</Label>
                        <Input
                          type="number"
                          value={config.minimumAmount}
                          onChange={(e) => 
                            setConfig({ ...config, minimumAmount: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Maximum Amount (₦)</Label>
                        <Input
                          type="number"
                          value={config.maximumAmount}
                          onChange={(e) => 
                            setConfig({ ...config, maximumAmount: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Holding Period (days)</Label>
                      <Input
                        type="number"
                        value={config.holdingPeriod}
                        onChange={(e) => 
                          setConfig({ ...config, holdingPeriod: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateConfig}>
                        Save Configuration
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Manual Payout
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Manual Payout</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!sellerId && (
                      <div>
                        <Label>Seller ID</Label>
                        <Input
                          value={manualPayoutForm.sellerId}
                          onChange={(e) => setManualPayoutForm({ 
                            ...manualPayoutForm, 
                            sellerId: e.target.value 
                          })}
                          placeholder="Enter seller ID"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Amount (₦)</Label>
                      <Input
                        type="number"
                        value={manualPayoutForm.amount}
                        onChange={(e) => setManualPayoutForm({ 
                          ...manualPayoutForm, 
                          amount: parseFloat(e.target.value) 
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={manualPayoutForm.description}
                        onChange={(e) => setManualPayoutForm({ 
                          ...manualPayoutForm, 
                          description: e.target.value 
                        })}
                        placeholder="Payout description..."
                      />
                    </div>

                    <div>
                      <Label>Payout Method</Label>
                      <Select 
                        value={manualPayoutForm.payoutMethod} 
                        onValueChange={(value) => setManualPayoutForm({ 
                          ...manualPayoutForm, 
                          payoutMethod: value 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Scheduled For</Label>
                      <Input
                        type="date"
                        value={manualPayoutForm.scheduledFor}
                        onChange={(e) => setManualPayoutForm({ 
                          ...manualPayoutForm, 
                          scheduledFor: e.target.value 
                        })}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateManualPayout}>
                        Create Payout
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by batch ID..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Select 
              value={filter.status} 
              onValueChange={(value) => setFilter({ ...filter, status: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
              className="w-[140px]"
            />

            <Input
              type="date"
              placeholder="To"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              className="w-[140px]"
            />

            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Payouts Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-sm">
                      {payout.batchId}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₦{payout.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(payout.scheduledFor).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payout.processedAt ? 
                        new Date(payout.processedAt).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payout.items.length} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayout(payout)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {payout.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcessPayout(payout.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelPayout(payout.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayouts.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No payouts found</p>
              <p className="text-sm">Try adjusting your filters or create a manual payout</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Details Dialog */}
      {selectedPayout && (
        <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payout Details - {selectedPayout.batchId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Total Amount</Label>
                  <p className="text-lg font-medium">₦{selectedPayout.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Scheduled For</Label>
                  <p>{new Date(selectedPayout.scheduledFor).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Processed At</Label>
                  <p>{selectedPayout.processedAt ? 
                    new Date(selectedPayout.processedAt).toLocaleString() : 
                    'Not processed'
                  }</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Payout Items</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedPayout.items.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Payment #{item.paymentId}</p>
                        <p className="text-sm text-gray-600">Amount: ₦{item.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₦{item.netAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Fee: ₦{item.fee.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PayoutManager;
