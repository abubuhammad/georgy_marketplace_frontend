import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, DollarSign, Settings, RefreshCw, Save, 
  Loader2, AlertTriangle, CheckCircle, XCircle, Pause, Play,
  Calculator, Download, Upload, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface DeliveryZone {
  code: string;
  name: string;
  type: 'lga' | 'area';
  base_fee_ngn: number;
  per_km_rate_ngn: number;
  free_distance_km: number;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  centroid: { lat: number; lng: number };
  rider_availability?: string;
}

interface DeliverySettings {
  base_fee_ngn: number;
  per_km_rate_ngn: number;
  free_distance_km: number;
  platform_commission_percent: number;
  weight_surcharge_per_kg: number;
  volumetric_divisor: number;
  insurance_rate_percent: number;
  min_insurance_threshold: number;
  delivery_type_multipliers: {
    standard: number;
    express: number;
    same_day: number;
  };
}

interface FeePreview {
  distance_km: number;
  weight_kg: number;
  base_fee: number;
  distance_fee: number;
  weight_surcharge: number;
  platform_fee: number;
  total_fee: number;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  base_fee_ngn: 300,
  per_km_rate_ngn: 50,
  free_distance_km: 0,
  platform_commission_percent: 15,
  weight_surcharge_per_kg: 100,
  volumetric_divisor: 5000,
  insurance_rate_percent: 1,
  min_insurance_threshold: 50000,
  delivery_type_multipliers: {
    standard: 1.0,
    express: 1.3,
    same_day: 1.5
  }
};

const DeliverySettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_SETTINGS);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDistance, setPreviewDistance] = useState(10);
  const [previewWeight, setPreviewWeight] = useState(2);
  const [previewDeliveryType, setPreviewDeliveryType] = useState<'standard' | 'express' | 'same_day'>('standard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load delivery settings
      const settingsResp = await apiClient.get<any>('/delivery-v2/admin/settings');
      if (settingsResp?.success && settingsResp.data) {
        setSettings(settingsResp.data);
      }

      // Load zones
      const zonesResp = await apiClient.get<any>('/delivery-v2/zones');
      if (zonesResp?.success && zonesResp.data?.zones) {
        setZones(zonesResp.data.zones);
      } else {
        // Use local zone data if API not available
        loadLocalZones();
      }
    } catch (error) {
      console.error('Error loading delivery settings:', error);
      loadLocalZones();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalZones = () => {
    // Fallback to local zone definitions
    const localZones: DeliveryZone[] = [
      // Makurdi Areas
      { code: 'MKD-HLM', name: 'High Level / Modern Market', type: 'area', base_fee_ngn: 300, per_km_rate_ngn: 50, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7333, lng: 8.5333 } },
      { code: 'MKD-WDT', name: 'Wadata / Wurukum', type: 'area', base_fee_ngn: 300, per_km_rate_ngn: 50, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7275, lng: 8.5167 } },
      { code: 'MKD-NRB', name: 'North Bank', type: 'area', base_fee_ngn: 350, per_km_rate_ngn: 55, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7500, lng: 8.5500 } },
      { code: 'MKD-NAK', name: 'Naka Road / Industrial', type: 'area', base_fee_ngn: 350, per_km_rate_ngn: 55, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7400, lng: 8.5800 } },
      { code: 'MKD-BSU', name: 'BSU / Gyado Villa', type: 'area', base_fee_ngn: 400, per_km_rate_ngn: 60, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7100, lng: 8.5600 } },
      { code: 'MKD-APR', name: 'Apir / Kanshio', type: 'area', base_fee_ngn: 400, per_km_rate_ngn: 60, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.6900, lng: 8.5700 } },
      { code: 'MKD-LGT', name: 'Logo / Ter', type: 'area', base_fee_ngn: 450, per_km_rate_ngn: 65, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7600, lng: 8.4900 } },
      { code: 'MKD-FDR', name: 'Federal Housing', type: 'area', base_fee_ngn: 350, per_km_rate_ngn: 55, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.7200, lng: 8.4800 } },
      // Other LGAs
      { code: 'BN-GBK', name: 'Gboko', type: 'lga', base_fee_ngn: 500, per_km_rate_ngn: 60, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.3167, lng: 9.0000 } },
      { code: 'BN-OTK', name: 'Otukpo', type: 'lga', base_fee_ngn: 500, per_km_rate_ngn: 60, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.1904, lng: 8.1300 } },
      { code: 'BN-KTS', name: 'Katsina-Ala', type: 'lga', base_fee_ngn: 550, per_km_rate_ngn: 65, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.1667, lng: 9.2833 } },
      { code: 'BN-VDY', name: 'Vandeikya', type: 'lga', base_fee_ngn: 550, per_km_rate_ngn: 65, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.0833, lng: 9.0667 } },
      { code: 'BN-ADO', name: 'Ado', type: 'lga', base_fee_ngn: 600, per_km_rate_ngn: 70, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.6167, lng: 8.0833 } },
      { code: 'BN-AGT', name: 'Agatu', type: 'lga', base_fee_ngn: 600, per_km_rate_ngn: 70, free_distance_km: 0, is_active: true, is_suspended: false, centroid: { lat: 7.9333, lng: 7.9500 } },
    ];
    setZones(localZones);
  };

  const handleSettingsChange = (key: keyof DeliverySettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiplierChange = (type: 'standard' | 'express' | 'same_day', value: number) => {
    setSettings(prev => ({
      ...prev,
      delivery_type_multipliers: {
        ...prev.delivery_type_multipliers,
        [type]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const resp = await apiClient.put<any>('/delivery-v2/admin/settings', settings);
      if (resp?.success) {
        toast({
          title: 'Settings Saved',
          description: 'Delivery fee settings have been updated successfully'
        });
      } else {
        throw new Error(resp?.error || 'Failed to save settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendZone = async () => {
    if (!selectedZone) return;
    
    try {
      const resp = await apiClient.post<any>(`/delivery-v2/admin/zones/${selectedZone.code}/suspend`, {
        reason: suspendReason
      });
      
      if (resp?.success) {
        setZones(prev => prev.map(z => 
          z.code === selectedZone.code 
            ? { ...z, is_suspended: true, suspension_reason: suspendReason }
            : z
        ));
        toast({
          title: 'Zone Suspended',
          description: `${selectedZone.name} has been suspended`
        });
      }
    } catch (error: any) {
      // Update local state even if API fails
      setZones(prev => prev.map(z => 
        z.code === selectedZone.code 
          ? { ...z, is_suspended: true, suspension_reason: suspendReason }
          : z
      ));
      toast({
        title: 'Zone Suspended (Local)',
        description: `${selectedZone.name} suspended locally. API sync pending.`
      });
    }
    
    setSuspendDialogOpen(false);
    setSuspendReason('');
    setSelectedZone(null);
  };

  const handleResumeZone = async (zone: DeliveryZone) => {
    try {
      const resp = await apiClient.post<any>(`/delivery-v2/admin/zones/${zone.code}/resume`, {});
      
      if (resp?.success) {
        setZones(prev => prev.map(z => 
          z.code === zone.code 
            ? { ...z, is_suspended: false, suspension_reason: undefined }
            : z
        ));
        toast({
          title: 'Zone Resumed',
          description: `${zone.name} is now active`
        });
      }
    } catch (error) {
      // Update local state
      setZones(prev => prev.map(z => 
        z.code === zone.code 
          ? { ...z, is_suspended: false, suspension_reason: undefined }
          : z
      ));
      toast({
        title: 'Zone Resumed (Local)',
        description: `${zone.name} resumed locally. API sync pending.`
      });
    }
  };

  const handleUpdateZoneFee = async (zone: DeliveryZone, field: string, value: number) => {
    try {
      const resp = await apiClient.put<any>(`/delivery-v2/admin/zones/${zone.code}`, {
        [field]: value
      });
      
      setZones(prev => prev.map(z => 
        z.code === zone.code ? { ...z, [field]: value } : z
      ));
      
      toast({
        title: 'Zone Updated',
        description: `${zone.name} ${field.replace(/_/g, ' ')} updated to ₦${value}`
      });
    } catch (error) {
      // Update local state
      setZones(prev => prev.map(z => 
        z.code === zone.code ? { ...z, [field]: value } : z
      ));
    }
  };

  const calculatePreviewFee = (): FeePreview => {
    const baseFee = settings.base_fee_ngn;
    const distanceFee = Math.max(0, previewDistance - settings.free_distance_km) * settings.per_km_rate_ngn;
    const weightSurcharge = Math.max(0, previewWeight - 5) * settings.weight_surcharge_per_kg;
    const subtotal = baseFee + distanceFee + weightSurcharge;
    const multiplier = settings.delivery_type_multipliers[previewDeliveryType];
    const adjustedSubtotal = subtotal * multiplier;
    const platformFee = adjustedSubtotal * (settings.platform_commission_percent / 100);
    const totalFee = adjustedSubtotal + platformFee;

    return {
      distance_km: previewDistance,
      weight_kg: previewWeight,
      base_fee: baseFee,
      distance_fee: distanceFee * multiplier,
      weight_surcharge: weightSurcharge * multiplier,
      platform_fee: platformFee,
      total_fee: Math.round(totalFee)
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading delivery settings...</p>
        </div>
      </div>
    );
  }

  const makurdiZones = zones.filter(z => z.code.startsWith('MKD-'));
  const otherZones = zones.filter(z => !z.code.startsWith('MKD-'));
  const preview = calculatePreviewFee();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage delivery fees, zones, and pricing rules for Benue State
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Fee Calculator
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Zones</p>
                <p className="text-2xl font-bold text-green-600">
                  {zones.filter(z => !z.is_suspended).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended Zones</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {zones.filter(z => z.is_suspended).length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Base Fee</p>
                <p className="text-2xl font-bold">
                  ₦{Math.round(zones.reduce((acc, z) => acc + z.base_fee_ngn, 0) / zones.length || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fee</p>
                <p className="text-2xl font-bold">{settings.platform_commission_percent}%</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing Rules
          </TabsTrigger>
          <TabsTrigger value="makurdi">
            <MapPin className="h-4 w-4 mr-2" />
            Makurdi Areas ({makurdiZones.length})
          </TabsTrigger>
          <TabsTrigger value="lgas">
            <Truck className="h-4 w-4 mr-2" />
            Other LGAs ({otherZones.length})
          </TabsTrigger>
        </TabsList>

        {/* Pricing Rules Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Fee Settings</CardTitle>
              <CardDescription>
                These settings apply as defaults for all delivery calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="base_fee">Base Fee (₦)</Label>
                  <Input
                    id="base_fee"
                    type="number"
                    value={settings.base_fee_ngn}
                    onChange={(e) => handleSettingsChange('base_fee_ngn', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Starting fee for all deliveries</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="per_km">Per KM Rate (₦)</Label>
                  <Input
                    id="per_km"
                    type="number"
                    value={settings.per_km_rate_ngn}
                    onChange={(e) => handleSettingsChange('per_km_rate_ngn', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Charge per kilometer traveled</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free_distance">Free Distance (KM)</Label>
                  <Input
                    id="free_distance"
                    type="number"
                    value={settings.free_distance_km}
                    onChange={(e) => handleSettingsChange('free_distance_km', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Distance before per-km billing starts</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform_fee">Platform Commission (%)</Label>
                  <Input
                    id="platform_fee"
                    type="number"
                    value={settings.platform_commission_percent}
                    onChange={(e) => handleSettingsChange('platform_commission_percent', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Platform fee added to delivery cost</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_surcharge">Weight Surcharge (₦/kg)</Label>
                  <Input
                    id="weight_surcharge"
                    type="number"
                    value={settings.weight_surcharge_per_kg}
                    onChange={(e) => handleSettingsChange('weight_surcharge_per_kg', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Extra charge per kg over 5kg</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volumetric">Volumetric Divisor</Label>
                  <Input
                    id="volumetric"
                    type="number"
                    value={settings.volumetric_divisor}
                    onChange={(e) => handleSettingsChange('volumetric_divisor', Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">LxWxH / divisor = volumetric weight</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Delivery Type Multipliers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Standard (x{settings.delivery_type_multipliers.standard})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.delivery_type_multipliers.standard}
                      onChange={(e) => handleMultiplierChange('standard', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">1-3 days delivery</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Express (x{settings.delivery_type_multipliers.express})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.delivery_type_multipliers.express}
                      onChange={(e) => handleMultiplierChange('express', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Next-day delivery</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Same-Day (x{settings.delivery_type_multipliers.same_day})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.delivery_type_multipliers.same_day}
                      onChange={(e) => handleMultiplierChange('same_day', Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Same-day delivery (Makurdi only)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Fee Calculation Formula:</strong> Total = (Base Fee + Distance Fee + Weight Surcharge) × Type Multiplier + Platform Commission
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Makurdi Areas Tab */}
        <TabsContent value="makurdi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Makurdi Delivery Areas</CardTitle>
              <CardDescription>
                Same-day delivery available. Manage area-specific fees and availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Base Fee (₦)</TableHead>
                    <TableHead>Per KM (₦)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {makurdiZones.map((zone) => (
                    <TableRow key={zone.code} className={zone.is_suspended ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{zone.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={zone.base_fee_ngn}
                          onChange={(e) => handleUpdateZoneFee(zone, 'base_fee_ngn', Number(e.target.value))}
                          disabled={zone.is_suspended}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={zone.per_km_rate_ngn}
                          onChange={(e) => handleUpdateZoneFee(zone, 'per_km_rate_ngn', Number(e.target.value))}
                          disabled={zone.is_suspended}
                        />
                      </TableCell>
                      <TableCell>
                        {zone.is_suspended ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {zone.is_suspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResumeZone(zone)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedZone(zone);
                              setSuspendDialogOpen(true);
                            }}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other LGAs Tab */}
        <TabsContent value="lgas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Other Benue LGAs</CardTitle>
              <CardDescription>
                Standard and express delivery options. Same-day not available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LGA</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Base Fee (₦)</TableHead>
                    <TableHead>Per KM (₦)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherZones.map((zone) => (
                    <TableRow key={zone.code} className={zone.is_suspended ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{zone.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={zone.base_fee_ngn}
                          onChange={(e) => handleUpdateZoneFee(zone, 'base_fee_ngn', Number(e.target.value))}
                          disabled={zone.is_suspended}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24"
                          value={zone.per_km_rate_ngn}
                          onChange={(e) => handleUpdateZoneFee(zone, 'per_km_rate_ngn', Number(e.target.value))}
                          disabled={zone.is_suspended}
                        />
                      </TableCell>
                      <TableCell>
                        {zone.is_suspended ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {zone.is_suspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResumeZone(zone)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedZone(zone);
                              setSuspendDialogOpen(true);
                            }}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend Zone Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Delivery Zone</DialogTitle>
            <DialogDescription>
              This will temporarily disable deliveries to {selectedZone?.name}. Customers will not be able to select this zone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="font-medium">{selectedZone?.name}</p>
              <p className="text-sm text-gray-600">Code: {selectedZone?.code}</p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Suspension</Label>
              <Input
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g., No riders available, Road conditions..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSuspendDialogOpen(false);
              setSuspendReason('');
              setSelectedZone(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendZone}>
              <Pause className="h-4 w-4 mr-2" />
              Suspend Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Calculator Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delivery Fee Calculator</DialogTitle>
            <DialogDescription>
              Preview delivery fees based on current settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  value={previewDistance}
                  onChange={(e) => setPreviewDistance(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={previewWeight}
                  onChange={(e) => setPreviewWeight(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Delivery Type</Label>
              <Select value={previewDeliveryType} onValueChange={(v) => setPreviewDeliveryType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (1-3 days)</SelectItem>
                  <SelectItem value="express">Express (Next day)</SelectItem>
                  <SelectItem value="same_day">Same-Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Base Fee</span>
                <span>₦{preview.base_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Distance Fee ({previewDistance}km)</span>
                <span>₦{preview.distance_fee.toLocaleString()}</span>
              </div>
              {preview.weight_surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Weight Surcharge</span>
                  <span>₦{preview.weight_surcharge.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Platform Fee ({settings.platform_commission_percent}%)</span>
                <span>₦{preview.platform_fee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600">₦{preview.total_fee.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliverySettings;
