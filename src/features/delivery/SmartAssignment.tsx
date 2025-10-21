import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  MapPin,
  Clock,
  Truck,
  User,
  Star,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  Route,
  Timer,
  Award,
  Activity,
  Eye,
  Phone,
  MessageSquare
} from 'lucide-react';
import { DeliveryAgent, Shipment, VehicleType, ShipmentStatus } from '@/types/delivery';

interface SmartAssignmentProps {
  onAssignmentComplete?: (assignments: DeliveryAssignment[]) => void;
}

interface DeliveryAssignment {
  id: string;
  shipmentId: string;
  agentId: string;
  score: number;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  distance: number;
  confidence: number;
  factors: AssignmentFactor[];
  status: 'pending' | 'accepted' | 'declined' | 'assigned' | 'expired';
  createdAt: string;
  expiresAt: string;
}

interface AssignmentFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

interface AssignmentSettings {
  algorithm: 'distance_first' | 'capacity_first' | 'balanced' | 'priority_first';
  maxAssignmentDistance: number;
  considerTraffic: boolean;
  requireVehicleMatch: boolean;
  prioritizeRating: boolean;
  autoAssign: boolean;
  assignmentTimeout: number; // minutes
  maxSimultaneousOffers: number;
}

interface AgentScore {
  agent: DeliveryAgent;
  score: number;
  distance: number;
  estimatedTime: number;
  capacityMatch: number;
  factors: AssignmentFactor[];
  isRecommended: boolean;
}

export const SmartAssignment: React.FC<SmartAssignmentProps> = ({ 
  onAssignmentComplete 
}) => {
  const [unassignedShipments, setUnassignedShipments] = useState<Shipment[]>([]);
  const [availableAgents, setAvailableAgents] = useState<DeliveryAgent[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [agentScores, setAgentScores] = useState<AgentScore[]>([]);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [settings, setSettings] = useState<AssignmentSettings>({
    algorithm: 'balanced',
    maxAssignmentDistance: 15,
    considerTraffic: true,
    requireVehicleMatch: true,
    prioritizeRating: true,
    autoAssign: false,
    assignmentTimeout: 5,
    maxSimultaneousOffers: 3
  });
  const [loading, setLoading] = useState(false);
  const [assignmentInProgress, setAssignmentInProgress] = useState(false);

  useEffect(() => {
    loadUnassignedShipments();
    loadAvailableAgents();
    loadPendingAssignments();
  }, []);

  const loadUnassignedShipments = async () => {
    try {
      // Mock API call
      const mockShipments: Shipment[] = [
        {
          id: 'ship-001',
          orderId: 'ORD-12345',
          trackingNumber: 'TRK123456',
          status: 'CONFIRMED',
          deliveryType: 'EXPRESS',
          pickupAddress: {
            line1: '123 Electronics Store',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.5244,
            longitude: 3.3792,
            contactName: 'Store Manager',
            contactPhone: '+234-801-111-1111'
          },
          deliveryAddress: {
            line1: '456 Customer Street',
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
          packageValue: 45000,
          description: 'iPhone 15 Pro',
          fee: 2500,
          codAmount: 45000,
          estimatedPickup: new Date(Date.now() + 30*60000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 2*60*60000).toISOString(),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'ship-002',
          orderId: 'ORD-12346',
          trackingNumber: 'TRK123457',
          status: 'CONFIRMED',
          deliveryType: 'STANDARD',
          pickupAddress: {
            line1: '789 Fashion Boutique',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.4698,
            longitude: 3.2829,
            contactName: 'Boutique Staff',
            contactPhone: '+234-803-333-3333'
          },
          deliveryAddress: {
            line1: '321 Home Avenue',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.6018,
            longitude: 3.3515,
            contactName: 'Jane Smith',
            contactPhone: '+234-804-444-4444'
          },
          weight: 1.2,
          fragile: true,
          packageValue: 18000,
          description: 'Designer Dress',
          fee: 1500,
          estimatedPickup: new Date(Date.now() + 45*60000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 4*60*60000).toISOString(),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'ship-003',
          orderId: 'ORD-12347',
          trackingNumber: 'TRK123458',
          status: 'CONFIRMED',
          deliveryType: 'SAME_DAY',
          pickupAddress: {
            line1: '555 Pharmacy Plus',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.5443,
            longitude: 3.3517,
            contactName: 'Pharmacist',
            contactPhone: '+234-805-555-5555'
          },
          deliveryAddress: {
            line1: '777 Hospital Road',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.4589,
            longitude: 3.3895,
            contactName: 'Medical Center',
            contactPhone: '+234-806-666-6666'
          },
          weight: 0.5,
          fragile: true,
          packageValue: 8500,
          description: 'Medical Supplies',
          fee: 3000,
          scheduledAt: new Date(Date.now() + 60*60000).toISOString(),
          estimatedPickup: new Date(Date.now() + 15*60000).toISOString(),
          estimatedDelivery: new Date(Date.now() + 90*60000).toISOString(),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setUnassignedShipments(mockShipments);
    } catch (error) {
      console.error('Error loading unassigned shipments:', error);
    }
  };

  const loadAvailableAgents = async () => {
    try {
      // Mock API call
      const mockAgents: DeliveryAgent[] = [
        {
          id: 'agent-001',
          userId: 'user-001',
          employeeId: 'EMP001',
          firstName: 'Ahmed',
          lastName: 'Ibrahim',
          email: 'ahmed@georgy.com',
          phone: '+234-803-111-1111',
          vehicleType: 'BIKE',
          vehicleModel: 'Honda CB125',
          plateNumber: 'ABC-123-XY',
          capacityKg: 15,
          active: true,
          verified: true,
          currentLocation: {
            latitude: 6.5180,
            longitude: 3.3498,
            accuracy: 10,
            timestamp: new Date().toISOString()
          },
          rating: 4.8,
          totalDeliveries: 234,
          completedDeliveries: 220,
          failedDeliveries: 8,
          availability: {
            isOnline: true,
            workingHours: {},
            currentCapacity: 1,
            maxCapacity: 3
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-002',
          userId: 'user-002',
          employeeId: 'EMP002',
          firstName: 'Fatima',
          lastName: 'Bello',
          email: 'fatima@georgy.com',
          phone: '+234-803-222-2222',
          vehicleType: 'CAR',
          vehicleModel: 'Toyota Corolla',
          plateNumber: 'DEF-456-ZA',
          capacityKg: 50,
          active: true,
          verified: true,
          currentLocation: {
            latitude: 6.4850,
            longitude: 3.3712,
            accuracy: 8,
            timestamp: new Date().toISOString()
          },
          rating: 4.6,
          totalDeliveries: 189,
          completedDeliveries: 175,
          failedDeliveries: 6,
          availability: {
            isOnline: true,
            workingHours: {},
            currentCapacity: 0,
            maxCapacity: 5
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'agent-003',
          userId: 'user-003',
          employeeId: 'EMP003',
          firstName: 'David',
          lastName: 'Okafor',
          email: 'david@georgy.com',
          phone: '+234-803-333-3333',
          vehicleType: 'VAN',
          vehicleModel: 'Ford Transit',
          plateNumber: 'GHI-789-BC',
          capacityKg: 200,
          active: true,
          verified: true,
          currentLocation: {
            latitude: 6.6015,
            longitude: 3.3074,
            accuracy: 12,
            timestamp: new Date().toISOString()
          },
          rating: 4.9,
          totalDeliveries: 156,
          completedDeliveries: 152,
          failedDeliveries: 2,
          availability: {
            isOnline: true,
            workingHours: {},
            currentCapacity: 1,
            maxCapacity: 8
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setAvailableAgents(mockAgents);
    } catch (error) {
      console.error('Error loading available agents:', error);
    }
  };

  const loadPendingAssignments = async () => {
    try {
      // Mock API call for existing assignments
      const mockAssignments: DeliveryAssignment[] = [];
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Error loading pending assignments:', error);
    }
  };

  const calculateAgentScores = async (shipment: Shipment) => {
    setLoading(true);
    try {
      const scores: AgentScore[] = [];

      for (const agent of availableAgents) {
        if (!agent.availability.isOnline || agent.availability.currentCapacity >= agent.availability.maxCapacity) {
          continue;
        }

        // Calculate distance
        const distance = calculateDistance(
          { lat: agent.currentLocation?.latitude || 0, lng: agent.currentLocation?.longitude || 0 },
          { lat: shipment.pickupAddress.latitude || 0, lng: shipment.pickupAddress.longitude || 0 }
        );

        // Skip if too far
        if (distance > settings.maxAssignmentDistance) continue;

        // Calculate various factors
        const factors: AssignmentFactor[] = [];
        let totalScore = 0;

        // Distance factor (0-100, higher is better - closer distance)
        const distanceScore = Math.max(0, 100 - (distance / settings.maxAssignmentDistance) * 100);
        factors.push({
          name: 'Distance',
          score: distanceScore,
          weight: 30,
          description: `${distance.toFixed(1)}km from pickup location`
        });
        totalScore += distanceScore * 0.3;

        // Vehicle capacity factor
        const capacityScore = agent.capacityKg! >= (shipment.weight || 0) ? 100 : 50;
        factors.push({
          name: 'Capacity',
          score: capacityScore,
          weight: 20,
          description: `Vehicle can carry ${agent.capacityKg}kg (required: ${shipment.weight}kg)`
        });
        totalScore += capacityScore * 0.2;

        // Vehicle type match
        const vehicleMatchScore = getVehicleTypeMatch(shipment, agent.vehicleType);
        factors.push({
          name: 'Vehicle Match',
          score: vehicleMatchScore,
          weight: 15,
          description: `${agent.vehicleType} vehicle compatibility`
        });
        totalScore += vehicleMatchScore * 0.15;

        // Agent rating
        const ratingScore = (agent.rating / 5) * 100;
        factors.push({
          name: 'Rating',
          score: ratingScore,
          weight: 15,
          description: `${agent.rating}/5.0 rating (${agent.totalDeliveries} deliveries)`
        });
        totalScore += ratingScore * 0.15;

        // Current workload
        const workloadScore = Math.max(0, 100 - (agent.availability.currentCapacity / agent.availability.maxCapacity) * 100);
        factors.push({
          name: 'Availability',
          score: workloadScore,
          weight: 10,
          description: `${agent.availability.currentCapacity}/${agent.availability.maxCapacity} current assignments`
        });
        totalScore += workloadScore * 0.1;

        // Success rate
        const successRate = agent.completedDeliveries / Math.max(1, agent.totalDeliveries);
        const successScore = successRate * 100;
        factors.push({
          name: 'Success Rate',
          score: successScore,
          weight: 10,
          description: `${(successRate * 100).toFixed(1)}% success rate`
        });
        totalScore += successScore * 0.1;

        scores.push({
          agent,
          score: totalScore,
          distance,
          estimatedTime: distance * 2, // Rough estimate: 2 minutes per km
          capacityMatch: capacityScore,
          factors,
          isRecommended: totalScore >= 75
        });
      }

      // Sort by score (descending)
      scores.sort((a, b) => b.score - a.score);
      setAgentScores(scores);

    } catch (error) {
      console.error('Error calculating agent scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);
    const lat1 = toRad(point1.lat);
    const lat2 = toRad(point2.lat);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  };

  const toRad = (value: number) => value * Math.PI / 180;

  const getVehicleTypeMatch = (shipment: Shipment, vehicleType: VehicleType) => {
    const weight = shipment.weight || 0;
    const isFragile = shipment.fragile;
    
    switch (vehicleType) {
      case 'BIKE':
        if (weight > 15) return 20; // Too heavy
        if (isFragile) return 60; // Risky for fragile
        return 100; // Perfect for small items
        
      case 'CAR':
        if (weight > 50) return 40; // Getting heavy
        if (isFragile) return 90; // Good protection
        return 85; // Good general purpose
        
      case 'VAN':
        if (weight > 200) return 30; // Very heavy
        if (isFragile) return 100; // Best protection
        return weight > 20 ? 100 : 70; // Best for heavy items
        
      case 'TRUCK':
        if (weight < 50) return 60; // Overkill for small items
        return 100; // Perfect for heavy items
        
      default:
        return 50;
    }
  };

  const assignToAgent = async (agentId: string, shipmentId: string, autoAssign = false) => {
    try {
      setAssignmentInProgress(true);
      
      const agent = availableAgents.find(a => a.id === agentId);
      const shipment = unassignedShipments.find(s => s.id === shipmentId);
      const agentScore = agentScores.find(s => s.agent.id === agentId);
      
      if (!agent || !shipment || !agentScore) return;

      const assignment: DeliveryAssignment = {
        id: `assign-${Date.now()}`,
        shipmentId,
        agentId,
        score: agentScore.score,
        estimatedPickupTime: new Date(Date.now() + agentScore.estimatedTime * 60000).toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + (agentScore.estimatedTime + 30) * 60000).toISOString(),
        distance: agentScore.distance,
        confidence: agentScore.score / 100,
        factors: agentScore.factors,
        status: autoAssign ? 'assigned' : 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + settings.assignmentTimeout * 60000).toISOString()
      };

      // Update state
      setAssignments(prev => [...prev, assignment]);
      
      if (autoAssign) {
        // Remove from unassigned list
        setUnassignedShipments(prev => prev.filter(s => s.id !== shipmentId));
        // Update agent capacity
        setAvailableAgents(prev => prev.map(a => 
          a.id === agentId 
            ? { ...a, availability: { ...a.availability, currentCapacity: a.availability.currentCapacity + 1 }}
            : a
        ));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Assignment ${autoAssign ? 'completed' : 'sent'} to agent:`, agent.firstName);

    } catch (error) {
      console.error('Error assigning to agent:', error);
    } finally {
      setAssignmentInProgress(false);
    }
  };

  const handleShipmentSelect = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    calculateAgentScores(shipment);
  };

  const autoAssignShipment = async (shipment: Shipment) => {
    await calculateAgentScores(shipment);
    // Auto-assign to highest scoring agent
    if (agentScores.length > 0) {
      const bestAgent = agentScores[0];
      await assignToAgent(bestAgent.agent.id, shipment.id, true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart Assignment</h1>
          <p className="text-gray-600 mt-1">
            Intelligent delivery assignment with AI-powered agent matching
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button 
            onClick={() => unassignedShipments.forEach(autoAssignShipment)}
            disabled={assignmentInProgress}
          >
            <Brain className="mr-2 h-4 w-4" />
            Auto-assign All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Unassigned</p>
                <p className="text-2xl font-bold">{unassignedShipments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Available Agents</p>
                <p className="text-2xl font-bold">{availableAgents.filter(a => a.availability.isOnline).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Pending Offers</p>
                <p className="text-2xl font-bold">{assignments.filter(a => a.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Shipments */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Shipments</CardTitle>
              <CardDescription>
                {unassignedShipments.length} shipments awaiting assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {unassignedShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedShipment?.id === shipment.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleShipmentSelect(shipment)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{shipment.trackingNumber}</p>
                        <p className="text-xs text-gray-600">{shipment.orderId}</p>
                      </div>
                      <Badge variant="outline">{shipment.deliveryType}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span>{shipment.deliveryAddress.contactName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span>{shipment.weight}kg • {formatCurrency(shipment.packageValue)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>ETA: {new Date(shipment.estimatedDelivery!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {shipment.fragile && (
                      <Badge variant="outline" className="text-yellow-800 bg-yellow-50 mt-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Fragile
                      </Badge>
                    )}
                  </div>
                ))}

                {unassignedShipments.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">All shipments assigned!</h3>
                    <p className="text-gray-600">
                      No unassigned shipments at the moment
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Details */}
        <div className="lg:col-span-2">
          {selectedShipment ? (
            <Tabs defaultValue="agents" className="space-y-4">
              <TabsList>
                <TabsTrigger value="agents">Recommended Agents</TabsTrigger>
                <TabsTrigger value="details">Shipment Details</TabsTrigger>
                <TabsTrigger value="assignments">Assignment History</TabsTrigger>
                <TabsTrigger value="settings">Assignment Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="agents">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Recommendations</CardTitle>
                    <CardDescription>
                      Smart matching for {selectedShipment.trackingNumber}
                      {loading && (
                        <RefreshCw className="inline ml-2 h-4 w-4 animate-spin" />
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <Activity className="mx-auto h-8 w-8 animate-pulse text-blue-600 mb-4" />
                        <p>Calculating optimal assignments...</p>
                      </div>
                    ) : agentScores.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No available agents</h3>
                        <p className="text-gray-600">
                          No agents are currently available for this delivery
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {agentScores.map((agentScore, index) => (
                          <div key={agentScore.agent.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">
                                      {agentScore.agent.firstName} {agentScore.agent.lastName}
                                    </h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <span>{agentScore.agent.vehicleType}</span>
                                      <span>•</span>
                                      <span>{agentScore.distance.toFixed(1)}km away</span>
                                      <span>•</span>
                                      <div className="flex items-center">
                                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                        <span>{agentScore.agent.rating}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold ${getScoreColor(agentScore.score)}`}>
                                      {agentScore.score.toFixed(0)}
                                    </div>
                                    <div className="text-xs text-gray-500">Match Score</div>
                                  </div>
                                </div>

                                {/* Score Breakdown */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                  {agentScore.factors.slice(0, 3).map((factor) => (
                                    <div key={factor.name} className="text-center p-2 bg-gray-50 rounded">
                                      <div className="text-sm font-medium">{factor.score.toFixed(0)}</div>
                                      <div className="text-xs text-gray-600">{factor.name}</div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>~{agentScore.estimatedTime} min pickup</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-1" />
                                    <span>{agentScore.agent.availability.currentCapacity}/{agentScore.agent.availability.maxCapacity} capacity</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2 ml-4">
                                {agentScore.isRecommended && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Award className="h-3 w-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => assignToAgent(agentScore.agent.id, selectedShipment.id)}
                                  disabled={assignmentInProgress}
                                >
                                  {assignmentInProgress ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Assign'
                                  )}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                    <CardDescription>{selectedShipment.trackingNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Pickup Information</h4>
                        <div className="space-y-2 text-sm">
                          <p>{selectedShipment.pickupAddress.line1}</p>
                          <p>{selectedShipment.pickupAddress.city}, {selectedShipment.pickupAddress.state}</p>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.pickupAddress.contactName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.pickupAddress.contactPhone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Delivery Information</h4>
                        <div className="space-y-2 text-sm">
                          <p>{selectedShipment.deliveryAddress.line1}</p>
                          <p>{selectedShipment.deliveryAddress.city}, {selectedShipment.deliveryAddress.state}</p>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.deliveryAddress.contactName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.deliveryAddress.contactPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Weight</p>
                        <p className="text-lg font-semibold">{selectedShipment.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Value</p>
                        <p className="text-lg font-semibold">{formatCurrency(selectedShipment.packageValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Delivery Fee</p>
                        <p className="text-lg font-semibold">{formatCurrency(selectedShipment.fee)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <p className="text-lg font-semibold">{selectedShipment.deliveryType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment History</CardTitle>
                    <CardDescription>Recent assignment attempts for this shipment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignments.filter(a => a.shipmentId === selectedShipment.id).map((assignment) => (
                        <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {availableAgents.find(a => a.id === assignment.agentId)?.firstName} {availableAgents.find(a => a.id === assignment.agentId)?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {assignment.score.toFixed(0)} • {assignment.distance.toFixed(1)}km
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(assignment.status)}
                            <span className="text-sm text-gray-500">
                              {new Date(assignment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}

                      {assignments.filter(a => a.shipmentId === selectedShipment.id).length === 0 && (
                        <div className="text-center py-8">
                          <Timer className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No assignment history</h3>
                          <p className="text-gray-600">
                            This shipment hasn't been assigned to any agent yet
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Settings</CardTitle>
                    <CardDescription>Configure smart assignment preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assignment Algorithm</label>
                      <Select 
                        value={settings.algorithm} 
                        onValueChange={(value) => setSettings(prev => ({ ...prev, algorithm: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="distance_first">Distance First</SelectItem>
                          <SelectItem value="capacity_first">Capacity First</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="priority_first">Priority First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Maximum Assignment Distance (km)</label>
                      <Input
                        type="number"
                        value={settings.maxAssignmentDistance}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxAssignmentDistance: Number(e.target.value) }))}
                        min={1}
                        max={50}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Consider Traffic Conditions</p>
                          <p className="text-xs text-gray-600">Factor in real-time traffic data</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.considerTraffic}
                          onChange={(e) => setSettings(prev => ({ ...prev, considerTraffic: e.target.checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Require Vehicle Match</p>
                          <p className="text-xs text-gray-600">Only assign to suitable vehicle types</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.requireVehicleMatch}
                          onChange={(e) => setSettings(prev => ({ ...prev, requireVehicleMatch: e.target.checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Auto-Assignment</p>
                          <p className="text-xs text-gray-600">Automatically assign to best agent</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.autoAssign}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoAssign: e.target.checked }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assignment Timeout (minutes)</label>
                      <Input
                        type="number"
                        value={settings.assignmentTimeout}
                        onChange={(e) => setSettings(prev => ({ ...prev, assignmentTimeout: Number(e.target.value) }))}
                        min={1}
                        max={30}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No shipment selected</h3>
                <p className="text-gray-600">
                  Select a shipment from the list to view agent recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
