import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2,
  Clock,
  Package,
  DollarSign,
  Truck,
  Settings
} from 'lucide-react';
import { DeliveryZone, DeliveryPartner, DeliveryType, VehicleType } from './types';
import { DeliveryService } from '@/services/deliveryService';

export const DeliveryZones: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneData, setZoneData] = useState({
    name: '',
    description: '',
    partnerId: '',
    baseFee: 1000,
    currency: 'NGN',
    estimatedTime: 60,
    maxWeight: 50,
    maxDistance: 25,
    deliveryTypes: [] as DeliveryType[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zonesData, partnersData] = await Promise.all([
        DeliveryService.getDeliveryZones(),
        DeliveryService.getDeliveryPartners(),
      ]);
      setZones(zonesData);
      setPartners(partnersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    try {
      const newZone = await DeliveryService.createDeliveryZone({
        name: zoneData.name,
        description: zoneData.description,
        polygon: [], // Would be set by map interaction
        isActive: true,
        partnerId: zoneData.partnerId || undefined,
        deliveryTypes: zoneData.deliveryTypes,
        baseFee: zoneData.baseFee,
        currency: zoneData.currency,
        estimatedTime: zoneData.estimatedTime,
        maxWeight: zoneData.maxWeight,
        maxDistance: zoneData.maxDistance,
        workingHours: {
          monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
          saturday: { isWorking: true, startTime: '09:00', endTime: '16:00' },
          sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setZones([...zones, newZone]);
      setShowZoneDialog(false);
      resetZoneData();
    } catch (error) {
      console.error('Error creating zone:', error);
    }
  };

  const resetZoneData = () => {
    setZoneData({
      name: '',
      description: '',
      partnerId: '',
      baseFee: 1000,
      currency: 'NGN',
      estimatedTime: 60,
      maxWeight: 50,
      maxDistance: 25,
      deliveryTypes: [],
    });
    setEditingZone(null);
  };

  const formatCurrency = (amount: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDeliveryTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'express': return 'bg-green-100 text-green-800';
      case 'same_day': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-orange-100 text-orange-800';
      case 'overnight': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading delivery zones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Zones</h1>
          <p className="text-gray-600 mt-1">
            Configure and manage delivery zones and coverage areas
          </p>
        </div>
        <Button onClick={() => setShowZoneDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Zone
        </Button>
      </div>

      {/* Zone Coverage Map */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Coverage Map</CardTitle>
          <CardDescription>
            Visual representation of all delivery zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
              <p className="text-gray-600 mb-4">
                Interactive map showing all delivery zones would be displayed here
              </p>
              <p className="text-sm text-gray-500">
                Features: Zone boundaries, partner coverage, delivery analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zones List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Delivery Zones</CardTitle>
          <CardDescription>
            {zones.length} zones configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No zones configured</h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first delivery zone
              </p>
              <Button onClick={() => setShowZoneDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Zone
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {zones.map((zone) => (
                <Card key={zone.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{zone.name}</h3>
                          <Badge variant={zone.isActive ? "default" : "secondary"}>
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{zone.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Base Fee</p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(zone.baseFee, zone.currency)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Est. Time</p>
                              <p className="text-sm text-gray-600">{zone.estimatedTime} min</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Max Weight</p>
                              <p className="text-sm text-gray-600">{zone.maxWeight} kg</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">Max Distance</p>
                              <p className="text-sm text-gray-600">{zone.maxDistance} km</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Delivery Types</p>
                          <div className="flex flex-wrap gap-2">
                            {zone.deliveryTypes.map((type) => (
                              <Badge key={type} className={getDeliveryTypeColor(type)}>
                                {type.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {zone.partner && (
                          <div className="mb-3">
                            <p className="text-sm font-medium">Partner</p>
                            <p className="text-sm text-gray-600">{zone.partner.name}</p>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Created: {new Date(zone.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingZone(zone);
                            setShowZoneDialog(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zone Creation/Edit Dialog */}
      <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Edit Zone' : 'Create New Zone'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zone-name">Zone Name</Label>
                <Input
                  id="zone-name"
                  value={zoneData.name}
                  onChange={(e) => setZoneData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Downtown Lagos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone-description">Description</Label>
                <Input
                  id="zone-description"
                  value={zoneData.description}
                  onChange={(e) => setZoneData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Central business district and surrounding areas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner">Delivery Partner</Label>
                <Select 
                  value={zoneData.partnerId} 
                  onValueChange={(value) => setZoneData(prev => ({ ...prev, partnerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific partner</SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delivery Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['standard', 'express', 'same_day', 'scheduled', 'overnight'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={zoneData.deliveryTypes.includes(type as DeliveryType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setZoneData(prev => ({
                              ...prev,
                              deliveryTypes: [...prev.deliveryTypes, type as DeliveryType]
                            }));
                          } else {
                            setZoneData(prev => ({
                              ...prev,
                              deliveryTypes: prev.deliveryTypes.filter(t => t !== type)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="coverage" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
                  <Input
                    id="estimated-time"
                    type="number"
                    value={zoneData.estimatedTime}
                    onChange={(e) => setZoneData(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-distance">Max Distance (km)</Label>
                  <Input
                    id="max-distance"
                    type="number"
                    value={zoneData.maxDistance}
                    onChange={(e) => setZoneData(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-weight">Max Package Weight (kg)</Label>
                <Input
                  id="max-weight"
                  type="number"
                  value={zoneData.maxWeight}
                  onChange={(e) => setZoneData(prev => ({ ...prev, maxWeight: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Zone Boundaries</Label>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to define zone boundaries on map
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-fee">Base Delivery Fee</Label>
                  <Input
                    id="base-fee"
                    type="number"
                    value={zoneData.baseFee}
                    onChange={(e) => setZoneData(prev => ({ ...prev, baseFee: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={zoneData.currency} 
                    onValueChange={(value) => setZoneData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pricing Preview</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Standard Delivery</p>
                  <p className="text-lg font-bold">{formatCurrency(zoneData.baseFee, zoneData.currency)}</p>
                  <p className="text-sm text-gray-600">Base fee • Up to {zoneData.maxWeight}kg • {zoneData.estimatedTime} min delivery</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowZoneDialog(false);
                resetZoneData();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateZone}>
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
