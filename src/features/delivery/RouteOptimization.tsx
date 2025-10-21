import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Route,
  Navigation,
  MapPin,
  Clock,
  Truck,
  Zap,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { DeliveryAgent, Shipment, RouteOptimizationRequest, RouteOptimizationResponse, RouteStop } from '@/types/delivery';

interface RouteOptimizationProps {
  agent?: DeliveryAgent;
  onRouteSelect?: (route: RouteOptimizationResponse) => void;
}

interface RouteMetrics {
  totalDistance: number;
  totalTime: number;
  fuelCost: number;
  efficiency: number;
  co2Savings: number;
}

interface OptimizationSettings {
  algorithm: 'shortest_distance' | 'fastest_time' | 'balanced' | 'eco_friendly';
  avoidToll: boolean;
  avoidTraffic: boolean;
  maxStops: number;
  preferExpressDeliveries: boolean;
  timeWindows: boolean;
}

export const RouteOptimization: React.FC<RouteOptimizationProps> = ({ 
  agent, 
  onRouteSelect 
}) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteOptimizationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<OptimizationSettings>({
    algorithm: 'balanced',
    avoidToll: false,
    avoidTraffic: true,
    maxStops: 10,
    preferExpressDeliveries: true,
    timeWindows: true
  });
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics>({
    totalDistance: 0,
    totalTime: 0,
    fuelCost: 0,
    efficiency: 0,
    co2Savings: 0
  });

  useEffect(() => {
    loadPendingShipments();
  }, [agent]);

  const loadPendingShipments = async () => {
    // Mock data for pending shipments
    const mockShipments: Shipment[] = [
      {
        id: 'ship-001',
        orderId: 'ORD-001',
        trackingNumber: 'TRK123456',
        status: 'CONFIRMED',
        deliveryType: 'EXPRESS',
        pickupAddress: {
          line1: '123 Warehouse St',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          latitude: 6.5244,
          longitude: 3.3792,
          contactName: 'Warehouse Manager',
          contactPhone: '+234-801-111-1111'
        },
        deliveryAddress: {
          line1: '456 Customer Ave',
          city: 'Lagos',
          state: 'Lagos', 
          country: 'Nigeria',
          latitude: 6.5355,
          longitude: 3.3947,
          contactName: 'John Doe',
          contactPhone: '+234-802-222-2222'
        },
        weight: 2.5,
        fragile: false,
        packageValue: 25000,
        description: 'Electronics package',
        fee: 1500,
        estimatedPickup: new Date(Date.now() + 30*60000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 2*60*60000).toISOString(),
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ship-002', 
        orderId: 'ORD-002',
        trackingNumber: 'TRK123457',
        status: 'PICKED_UP',
        deliveryType: 'STANDARD',
        pickupAddress: {
          line1: '789 Store Rd',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria', 
          latitude: 6.4698,
          longitude: 3.2829,
          contactName: 'Store Owner',
          contactPhone: '+234-803-333-3333'
        },
        deliveryAddress: {
          line1: '321 Home St',
          city: 'Lagos', 
          state: 'Lagos',
          country: 'Nigeria',
          latitude: 6.6018,
          longitude: 3.3515,
          contactName: 'Jane Smith',
          contactPhone: '+234-804-444-4444'
        },
        weight: 1.8,
        fragile: true,
        packageValue: 15000,
        description: 'Fashion items',
        fee: 1200,
        estimatedPickup: new Date(Date.now() - 15*60000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 90*60000).toISOString(),
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setShipments(mockShipments);
  };

  const optimizeRoute = async () => {
    if (selectedShipments.length === 0) return;

    setLoading(true);
    try {
      // Simulate route optimization API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedShipmentData = shipments.filter(s => selectedShipments.includes(s.id));
      
      const optimizedStops: RouteStop[] = selectedShipmentData.map((shipment, index) => ({
        shipmentId: shipment.id,
        address: shipment.deliveryAddress,
        type: 'delivery',
        estimatedArrival: new Date(Date.now() + (index + 1) * 45 * 60000).toISOString(),
        estimatedDuration: 15,
        sequence: index + 1
      }));

      const mockOptimizedRoute: RouteOptimizationResponse = {
        success: true,
        route: {
          stops: optimizedStops,
          totalDistance: 12.5,
          totalTime: 75,
          efficiency: 85
        }
      };

      setOptimizedRoute(mockOptimizedRoute);
      
      // Calculate metrics
      const metrics: RouteMetrics = {
        totalDistance: mockOptimizedRoute.route!.totalDistance,
        totalTime: mockOptimizedRoute.route!.totalTime,
        fuelCost: mockOptimizedRoute.route!.totalDistance * 0.15 * 500, // ₦500 per liter, 0.15L per km
        efficiency: mockOptimizedRoute.route!.efficiency,
        co2Savings: (mockOptimizedRoute.route!.totalDistance * 0.05) // kg of CO2 saved
      };

      setRouteMetrics(metrics);
    } catch (error) {
      console.error('Route optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentSelect = (shipmentId: string) => {
    setSelectedShipments(prev => 
      prev.includes(shipmentId)
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAlgorithmDescription = (algorithm: string) => {
    switch (algorithm) {
      case 'shortest_distance':
        return 'Minimize total distance traveled';
      case 'fastest_time':
        return 'Minimize total travel time';
      case 'balanced':
        return 'Balance distance and time optimization';
      case 'eco_friendly':
        return 'Minimize fuel consumption and emissions';
      default:
        return 'Balanced optimization';
    }
  };

  const getDeliveryTypeBadge = (type: string) => {
    switch (type) {
      case 'EXPRESS':
        return <Badge className="bg-red-100 text-red-800">Express</Badge>;
      case 'SAME_DAY':
        return <Badge className="bg-orange-100 text-orange-800">Same Day</Badge>;
      case 'STANDARD':
        return <Badge className="bg-blue-100 text-blue-800">Standard</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Route Optimization</h1>
          <p className="text-gray-600 mt-1">
            Optimize delivery routes for maximum efficiency
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button 
            onClick={optimizeRoute}
            disabled={selectedShipments.length === 0 || loading}
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Optimize Route
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {optimizedRoute && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Route className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Distance</p>
                  <p className="text-lg font-bold">{routeMetrics.totalDistance} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total Time</p>
                  <p className="text-lg font-bold">{formatTime(routeMetrics.totalTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Fuel Cost</p>
                  <p className="text-lg font-bold">{formatCurrency(routeMetrics.fuelCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Efficiency</p>
                  <p className="text-lg font-bold">{routeMetrics.efficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="shipments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shipments">Available Shipments</TabsTrigger>
          <TabsTrigger value="route">Optimized Route</TabsTrigger>
          <TabsTrigger value="settings">Optimization Settings</TabsTrigger>
          <TabsTrigger value="analytics">Route Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Shipments for Route</CardTitle>
              <CardDescription>
                Choose deliveries to include in route optimization ({selectedShipments.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div 
                    key={shipment.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedShipments.includes(shipment.id) 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleShipmentSelect(shipment.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedShipments.includes(shipment.id)}
                            onChange={() => handleShipmentSelect(shipment.id)}
                            className="mr-2"
                          />
                          <span className="font-semibold">{shipment.trackingNumber}</span>
                          {getDeliveryTypeBadge(shipment.deliveryType)}
                          {shipment.fragile && (
                            <Badge variant="outline" className="text-yellow-800 bg-yellow-50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Fragile
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pickup</p>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm">{shipment.pickupAddress.line1}</p>
                                <p className="text-xs text-gray-600">
                                  {shipment.pickupAddress.contactName}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-600">Delivery</p>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm">{shipment.deliveryAddress.line1}</p>
                                <p className="text-xs text-gray-600">
                                  {shipment.deliveryAddress.contactName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>ETA: {new Date(shipment.estimatedDelivery!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-1" />
                            <span>{shipment.weight}kg</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{formatCurrency(shipment.fee)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {shipments.length === 0 && (
                  <div className="text-center py-8">
                    <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No shipments available</h3>
                    <p className="text-gray-600">
                      No pending shipments found for route optimization
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="route" className="space-y-4">
          {optimizedRoute ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Optimized Route</CardTitle>
                  <CardDescription>
                    {optimizedRoute.route!.stops.length} stops • {optimizedRoute.route!.totalDistance} km • {formatTime(optimizedRoute.route!.totalTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Route Visualization */}
                  <div className="h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Interactive route map would be here</p>
                      <p className="text-sm text-gray-500">
                        Shows optimized route with turn-by-turn directions
                      </p>
                    </div>
                  </div>

                  {/* Route Steps */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Route Steps</h4>
                    {optimizedRoute.route!.stops.map((stop, index) => {
                      const shipment = shipments.find(s => s.id === stop.shipmentId);
                      return (
                        <div key={stop.shipmentId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {stop.sequence}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium">{shipment?.trackingNumber}</p>
                              {shipment && getDeliveryTypeBadge(shipment.deliveryType)}
                            </div>
                            <p className="text-sm text-gray-600">{stop.address.line1}</p>
                            <p className="text-xs text-gray-500">
                              ETA: {new Date(stop.estimatedArrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • 
                              {stop.estimatedDuration} min stop
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {index < optimizedRoute.route!.stops.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline">
                      <Navigation className="mr-2 h-4 w-4" />
                      Start Navigation
                    </Button>
                    <Button onClick={() => onRouteSelect?.(optimizedRoute)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Route className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No optimized route</h3>
                <p className="text-gray-600 mb-4">
                  Select shipments and run optimization to see the route
                </p>
                <Button 
                  onClick={optimizeRoute}
                  disabled={selectedShipments.length === 0}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Optimize Route
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>
                Configure route optimization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Optimization Algorithm</label>
                <Select 
                  value={settings.algorithm} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, algorithm: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shortest_distance">Shortest Distance</SelectItem>
                    <SelectItem value="fastest_time">Fastest Time</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="eco_friendly">Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600">{getAlgorithmDescription(settings.algorithm)}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Avoid Toll Roads</p>
                    <p className="text-xs text-gray-600">Route around toll roads when possible</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.avoidToll}
                    onChange={(e) => setSettings(prev => ({ ...prev, avoidToll: e.target.checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Avoid Heavy Traffic</p>
                    <p className="text-xs text-gray-600">Consider real-time traffic conditions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.avoidTraffic}
                    onChange={(e) => setSettings(prev => ({ ...prev, avoidTraffic: e.target.checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Prioritize Express Deliveries</p>
                    <p className="text-xs text-gray-600">Give higher priority to express shipments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.preferExpressDeliveries}
                    onChange={(e) => setSettings(prev => ({ ...prev, preferExpressDeliveries: e.target.checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Consider Time Windows</p>
                    <p className="text-xs text-gray-600">Respect delivery time windows</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.timeWindows}
                    onChange={(e) => setSettings(prev => ({ ...prev, timeWindows: e.target.checked }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Stops per Route</label>
                <Input
                  type="number"
                  value={settings.maxStops}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxStops: Number(e.target.value) }))}
                  min={1}
                  max={20}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Route Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Efficiency Score</span>
                      <span>{routeMetrics.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${routeMetrics.efficiency}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Distance Saved</span>
                      <span className="text-green-600">2.3 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Saved</span>
                      <span className="text-green-600">18 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Saved</span>
                      <span className="text-green-600">{formatCurrency(350)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">CO2 Reduced</p>
                      <p className="text-xs text-gray-600">{routeMetrics.co2Savings.toFixed(1)} kg</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    Optimization resulted in 15% reduction in emissions compared to unoptimized routes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
