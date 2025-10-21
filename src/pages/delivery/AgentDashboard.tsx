import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  Navigation,
  Camera,
  Edit,
  RefreshCw,
  AlertCircle,
  User,
  Star
} from 'lucide-react';
import { deliveryApiService } from '@/services/deliveryService-api';
import { Shipment, ShipmentStatus, DeliveryAgent } from '@/types/delivery';
import { cn } from '@/lib/utils';

export function AgentDashboard() {
  const [agent, setAgent] = useState<DeliveryAgent | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [locationTracking, setLocationTracking] = useState<any>(null);
  const { toast } = useToast();

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const [agentResult, shipmentsResult] = await Promise.all([
        deliveryApiService.getAgentProfile(),
        deliveryApiService.getAgentDeliveries()
      ]);

      if (agentResult.success && agentResult.agent) {
        setAgent(agentResult.agent);
        setIsOnline((agentResult.agent.availability as any)?.isOnline || false);
      }

      if (shipmentsResult.success && shipmentsResult.shipments) {
        setShipments(shipmentsResult.shipments);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load agent data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, []);

  // Toggle online/offline status
  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await deliveryApiService.toggleAgentAvailability(newStatus);
      setIsOnline(newStatus);

      // Start/stop location tracking
      if (newStatus) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }

      toast({
        title: "Status Updated",
        description: `You are now ${newStatus ? 'online' : 'offline'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  // Start location tracking
  const startLocationTracking = () => {
    if (locationTracking) return;

    try {
      const tracking = deliveryApiService.startLocationTracking({
        interval: 30000, // 30 seconds
        enableHighAccuracy: true
      });

      tracking.start();
      setLocationTracking(tracking);

      toast({
        title: "Location Tracking Started",
        description: "Your location will be updated every 30 seconds",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to start location tracking",
        variant: "destructive"
      });
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationTracking) {
      locationTracking.stop();
      setLocationTracking(null);
    }
  };

  // Update shipment status
  const updateShipmentStatus = async (
    shipmentId: string,
    status: ShipmentStatus,
    data?: any
  ) => {
    try {
      await deliveryApiService.updateShipmentStatus(shipmentId, {
        status,
        ...data
      });

      toast({
        title: "Status Updated",
        description: "Shipment status has been updated successfully",
      });

      // Reload shipments
      loadAgentData();
      setUpdateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shipment status",
        variant: "destructive"
      });
    }
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    return `${address.line1}, ${address.city}, ${address.state}`;
  };

  const getStatusColor = (status: ShipmentStatus) => {
    const statusInfo = deliveryApiService.formatDeliveryStatus(status);
    return statusInfo.color;
  };

  const activeShipments = shipments.filter(s => 
    [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT, ShipmentStatus.OUT_FOR_DELIVERY].includes(s.status)
  );
  const pendingShipments = shipments.filter(s => 
    [ShipmentStatus.PENDING, ShipmentStatus.CONFIRMED].includes(s.status)
  );
  const completedShipments = shipments.filter(s => 
    [ShipmentStatus.DELIVERED, ShipmentStatus.FAILED, ShipmentStatus.RETURNED].includes(s.status)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Not Registered</h2>
        <p className="text-muted-foreground mb-4">
          You need to register as a delivery agent to access this dashboard.
        </p>
        <Button onClick={() => window.location.href = '/delivery/register'}>
          Register as Agent
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {agent.firstName} {agent.lastName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="online-status">Online</Label>
            <Switch
              id="online-status"
              checked={isOnline}
              onCheckedChange={toggleOnlineStatus}
            />
          </div>
          {isOnline && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Online
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeShipments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingShipments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{agent.completedDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{agent.rating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeShipments.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingShipments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedShipments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeShipments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
                <p className="text-muted-foreground">
                  All caught up! No active deliveries at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            activeShipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                onUpdateStatus={(status, data) => updateShipmentStatus(shipment.id, status, data)}
                showActions={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingShipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              onUpdateStatus={(status, data) => updateShipmentStatus(shipment.id, status, data)}
              showActions={true}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedShipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              onUpdateStatus={() => {}}
              showActions={false}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ShipmentCardProps {
  shipment: Shipment;
  onUpdateStatus: (status: ShipmentStatus, data?: any) => void;
  showActions: boolean;
}

function ShipmentCard({ shipment, onUpdateStatus, showActions }: ShipmentCardProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>(shipment.status);
  const [notes, setNotes] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [deliveredTo, setDeliveredTo] = useState('');
  const [codCollected, setCodCollected] = useState<string>('');

  const statusInfo = deliveryApiService.formatDeliveryStatus(shipment.status);

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    return `${address.line1}, ${address.city}, ${address.state}`;
  };

  const handleQuickAction = (status: ShipmentStatus) => {
    if (status === ShipmentStatus.DELIVERED || status === ShipmentStatus.FAILED) {
      setNewStatus(status);
      setUpdateDialogOpen(true);
    } else {
      onUpdateStatus(status);
    }
  };

  const handleDetailedUpdate = () => {
    const updateData: any = {
      status: newStatus,
      notes
    };

    if (newStatus === ShipmentStatus.FAILED) {
      updateData.failedReason = failedReason;
    }

    if (newStatus === ShipmentStatus.DELIVERED) {
      updateData.proofOfDelivery = {
        deliveredTo,
        deliveredAt: new Date().toISOString(),
        notes
      };
      
      if (codCollected && shipment.codAmount) {
        updateData.codCollected = parseFloat(codCollected);
      }
    }

    onUpdateStatus(newStatus, updateData);
    setUpdateDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {shipment.trackingNumber}
              <Badge variant="outline" className={cn(
                statusInfo.color === 'green' && "border-green-500 text-green-700",
                statusInfo.color === 'blue' && "border-blue-500 text-blue-700",
                statusInfo.color === 'orange' && "border-orange-500 text-orange-700",
                statusInfo.color === 'red' && "border-red-500 text-red-700"
              )}>
                {statusInfo.label}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {shipment.description}
            </p>
          </div>
          {showActions && (
            <div className="flex gap-2">
              {shipment.status === ShipmentStatus.CONFIRMED && (
                <Button
                  size="sm"
                  onClick={() => handleQuickAction(ShipmentStatus.PICKED_UP)}
                >
                  Pick Up
                </Button>
              )}
              {shipment.status === ShipmentStatus.PICKED_UP && (
                <Button
                  size="sm"
                  onClick={() => handleQuickAction(ShipmentStatus.IN_TRANSIT)}
                >
                  In Transit
                </Button>
              )}
              {shipment.status === ShipmentStatus.IN_TRANSIT && (
                <Button
                  size="sm"
                  onClick={() => handleQuickAction(ShipmentStatus.OUT_FOR_DELIVERY)}
                >
                  Out for Delivery
                </Button>
              )}
              {shipment.status === ShipmentStatus.OUT_FOR_DELIVERY && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAction(ShipmentStatus.DELIVERED)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Delivered
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction(ShipmentStatus.FAILED)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Failed
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              PICKUP FROM
            </h4>
            <p className="text-sm">{formatAddress(shipment.pickupAddress)}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              DELIVER TO
            </h4>
            <p className="text-sm">{formatAddress(shipment.deliveryAddress)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>Value: ₦{shipment.packageValue.toLocaleString()}</span>
            {shipment.codAmount && (
              <span className="font-medium text-orange-600">
                COD: ₦{shipment.codAmount.toLocaleString()}
              </span>
            )}
          </div>
          {shipment.estimatedDelivery && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Due: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {shipment.instructions && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">
              INSTRUCTIONS
            </h4>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {shipment.instructions}
            </p>
          </div>
        )}
      </CardContent>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(value: ShipmentStatus) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ShipmentStatus.DELIVERED}>Delivered</SelectItem>
                  <SelectItem value={ShipmentStatus.FAILED}>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === ShipmentStatus.DELIVERED && (
              <>
                <div>
                  <Label htmlFor="delivered-to">Delivered To</Label>
                  <Input
                    id="delivered-to"
                    value={deliveredTo}
                    onChange={(e) => setDeliveredTo(e.target.value)}
                    placeholder="Recipient name"
                  />
                </div>
                
                {shipment.codAmount && (
                  <div>
                    <Label htmlFor="cod-collected">COD Amount Collected (₦)</Label>
                    <Input
                      id="cod-collected"
                      type="number"
                      value={codCollected}
                      onChange={(e) => setCodCollected(e.target.value)}
                      placeholder={shipment.codAmount?.toString()}
                    />
                  </div>
                )}
              </>
            )}

            {newStatus === ShipmentStatus.FAILED && (
              <div>
                <Label htmlFor="failed-reason">Reason for Failure</Label>
                <Select value={failedReason} onValueChange={setFailedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recipient_not_available">Recipient not available</SelectItem>
                    <SelectItem value="wrong_address">Wrong address</SelectItem>
                    <SelectItem value="refused_package">Package refused</SelectItem>
                    <SelectItem value="damaged_package">Package damaged</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDetailedUpdate}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
