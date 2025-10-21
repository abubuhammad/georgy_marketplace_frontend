import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3,
  Minus,
  Boxes,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { InventoryItem, StockAlert } from './types';
import { sellerService } from '@/services/sellerService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProductManagement: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    reason: '',
    type: 'add' as 'add' | 'subtract' | 'set'
  });

  useEffect(() => {
    if (user?.id) {
      loadInventoryData();
    }
  }, [user?.id]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [inventoryData, alertsData] = await Promise.all([
        sellerService.getInventory(user!.id),
        sellerService.getStockAlerts(user!.id)
      ]);
      
      setInventory(inventoryData);
      setStockAlerts(alertsData);
    } catch (error) {
      toast.error('Failed to load inventory data');
      console.error('Inventory loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;

    try {
      let newQuantity = selectedProduct.quantity;
      
      switch (stockAdjustment.type) {
        case 'add':
          newQuantity += stockAdjustment.quantity;
          break;
        case 'subtract':
          newQuantity -= stockAdjustment.quantity;
          break;
        case 'set':
          newQuantity = stockAdjustment.quantity;
          break;
      }

      if (newQuantity < 0) {
        toast.error('Stock quantity cannot be negative');
        return;
      }

      await sellerService.updateStock(
        selectedProduct.productId, 
        newQuantity, 
        stockAdjustment.reason
      );

      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === selectedProduct.id 
          ? { ...item, quantity: newQuantity, availableQuantity: newQuantity - item.reservedQuantity }
          : item
      ));

      setShowStockDialog(false);
      setStockAdjustment({ quantity: 0, reason: '', type: 'add' });
      setSelectedProduct(null);
      toast.success('Stock updated successfully');
    } catch (error) {
      toast.error('Failed to update stock');
      console.error('Stock update error:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { status: 'Out of Stock', color: 'destructive' as const };
    } else if (item.quantity <= item.reorderLevel) {
      return { status: 'Low Stock', color: 'secondary' as const };
    } else {
      return { status: 'In Stock', color: 'default' as const };
    }
  };

  const getStockIcon = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else if (item.quantity <= item.reorderLevel) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'in_stock' && item.quantity > item.reorderLevel) ||
                         (filterStatus === 'low_stock' && item.quantity <= item.reorderLevel && item.quantity > 0) ||
                         (filterStatus === 'out_of_stock' && item.quantity === 0);
    
    return matchesSearch && matchesFilter;
  });

  const inventoryStats = {
    total: inventory.length,
    inStock: inventory.filter(item => item.quantity > item.reorderLevel).length,
    lowStock: inventory.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0).length,
    outOfStock: inventory.filter(item => item.quantity === 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product & Inventory Management</h1>
              <p className="text-gray-600">Manage your product catalog and stock levels</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => navigate('/seller/products/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{inventoryStats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold">{inventoryStats.inStock}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold">{inventoryStats.lowStock}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold">{inventoryStats.outOfStock}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">₦{inventoryStats.totalValue.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="alerts">Stock Alerts ({stockAlerts.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage your product stock levels and details</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Inventory Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="text-gray-500">
                            <Boxes className="w-8 h-8 mx-auto mb-2" />
                            No products found
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => {
                        const stockStatus = getStockStatus(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.product.images[0]?.image_url || '/api/placeholder/40/40'}
                                  alt={item.product.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium">{item.product.title}</p>
                                  <p className="text-sm text-gray-500">₦{item.product.price.toLocaleString()}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                            <TableCell>{item.product.category}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStockIcon(item)}
                                <span className="font-medium">{item.quantity}</span>
                              </div>
                            </TableCell>
                            <TableCell>{item.availableQuantity}</TableCell>
                            <TableCell>{item.reorderLevel}</TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.color}>
                                {stockStatus.status}
                              </Badge>
                            </TableCell>
                            <TableCell>₦{item.cost.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setShowStockDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Stock Alerts
                </CardTitle>
                <CardDescription>Products that need your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-500">No stock alerts at the moment</p>
                    </div>
                  ) : (
                    stockAlerts.map((alert) => (
                      <Alert key={alert.id}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{alert.productName}</p>
                              <p className="text-sm">
                                Current stock: {alert.currentStock} (Reorder at: {alert.reorderLevel})
                              </p>
                            </div>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                              {alert.severity.replace('_', ' ')}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movements</CardTitle>
                  <CardDescription>Recent inventory changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    Stock movement analytics will be implemented here
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Top and underperforming products</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">
                    Product performance metrics will be implemented here
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update stock level for {selectedProduct?.product.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock: {selectedProduct?.quantity}</Label>
            </div>
            
            <div>
              <Label htmlFor="adjustment-type">Adjustment Type</Label>
              <Select 
                value={stockAdjustment.type} 
                onValueChange={(value) => setStockAdjustment(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add to Stock</SelectItem>
                  <SelectItem value="subtract">Remove from Stock</SelectItem>
                  <SelectItem value="set">Set Exact Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for adjustment"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleStockUpdate} className="flex-1">
                Update Stock
              </Button>
              <Button variant="outline" onClick={() => setShowStockDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
