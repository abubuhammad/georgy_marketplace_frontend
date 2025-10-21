import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User,
  Navigation
} from 'lucide-react';
import { deliveryApiService } from '@/services/deliveryService-api';
import { Shipment, TrackingEvent } from '@/types/delivery';
import { cn } from '@/lib/utils';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  trackingNumber?: string;
  shipmentId?: string;
}

export function OrderTrackingModal({
  isOpen,
  onClose,
  orderId,
  trackingNumber,
  shipmentId
}: OrderTrackingModalProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrackingData = async () => {
    if (!shipmentId && !trackingNumber) return;

    try {
      setLoading(true);
      setError(null);

      let result;
      if (trackingNumber) {
        result = await deliveryApiService.trackByNumber(trackingNumber);
      } else if (shipmentId) {
        result = await deliveryApiService.getShipmentTracking(shipmentId);
      }

      if (result?.success && result.shipment) {
        setShipment(result.shipment);
      } else {
        setError(result?.error || 'Failed to load tracking information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrackingData();
    }
  }, [isOpen, shipmentId, trackingNumber]);

  const statusInfo = shipment ? deliveryApiService.formatDeliveryStatus(shipment.status) : null;
  const progress = shipment ? deliveryApiService.getDeliveryProgress(shipment.status) : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    return `${address.line1}, ${address.city}, ${address.state}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Tracking
            {shipment?.trackingNumber && (
              <Badge variant="outline" className="font-mono">
                {shipment.trackingNumber}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading tracking information...
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to track shipment</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadTrackingData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : shipment ? (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Delivery Status</span>
                  <Button
                    onClick={loadTrackingData}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      statusInfo?.color === 'green' && "bg-green-500",
                      statusInfo?.color === 'blue' && "bg-blue-500",
                      statusInfo?.color === 'orange' && "bg-orange-500",
                      statusInfo?.color === 'red' && "bg-red-500",
                      statusInfo?.color === 'gray' && "bg-gray-500"
                    )} />
                    <div>
                      <h3 className="font-semibold">{statusInfo?.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {statusInfo?.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{shipment.deliveryType}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>

                {shipment.estimatedDelivery && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      Expected delivery: {formatDate(shipment.estimatedDelivery)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      PICKUP FROM
                    </h4>
                    <p className="text-sm">{formatAddress(shipment.pickupAddress)}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      DELIVER TO
                    </h4>
                    <p className="text-sm">{formatAddress(shipment.deliveryAddress)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Agent & Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Delivery Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {shipment.agent && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        DELIVERY AGENT
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>{shipment.agent.name}</span>
                        <Badge variant="outline">{shipment.agent.vehicleType}</Badge>
                      </div>
                      {shipment.agent.phone && (
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Phone className="h-4 w-4" />
                          <span>{shipment.agent.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {shipment.partner && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        DELIVERY PARTNER
                      </h4>
                      <p className="text-sm">{shipment.partner.name}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Package Value:</span>
                      <span>₦{shipment.packageValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee:</span>
                      <span>₦{shipment.fee.toLocaleString()}</span>
                    </div>
                    {shipment.codAmount && (
                      <div className="flex justify-between text-sm font-medium">
                        <span>COD Amount:</span>
                        <span>₦{shipment.codAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Location */}
            {shipment.currentLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    Last updated: {formatDate(shipment.currentLocation.timestamp)}
                  </div>
                  {/* TODO: Add map component showing current location */}
                  <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>Live tracking map</p>
                      <p className="text-xs">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tracking Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tracking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.events?.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2",
                          index === 0 
                            ? "bg-blue-500 border-blue-500" 
                            : "bg-gray-200 border-gray-300"
                        )} />
                        {index < shipment.events.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{event.description}</h4>
                          <time className="text-xs text-muted-foreground">
                            {formatDate(event.recordedAt)}
                          </time>
                        </div>
                        {event.city && event.state && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.city}, {event.state}
                          </p>
                        )}
                        {event.agentName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {event.agentName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proof of Delivery */}
            {shipment.proofOfDelivery && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Proof of Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      DELIVERED TO
                    </h4>
                    <p className="text-sm">{shipment.proofOfDelivery.deliveredTo}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      DELIVERY TIME
                    </h4>
                    <p className="text-sm">{formatDate(shipment.proofOfDelivery.deliveredAt)}</p>
                  </div>
                  {shipment.proofOfDelivery.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">
                        NOTES
                      </h4>
                      <p className="text-sm">{shipment.proofOfDelivery.notes}</p>
                    </div>
                  )}
                  {shipment.proofOfDelivery.signature && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        SIGNATURE
                      </h4>
                      <img
                        src={shipment.proofOfDelivery.signature}
                        alt="Delivery signature"
                        className="max-w-xs border rounded"
                      />
                    </div>
                  )}
                  {shipment.proofOfDelivery.photo && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        DELIVERY PHOTO
                      </h4>
                      <img
                        src={shipment.proofOfDelivery.photo}
                        alt="Delivery photo"
                        className="max-w-xs border rounded"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tracking information</h3>
            <p className="text-muted-foreground">
              Unable to find shipment details for this order.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
