import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Camera,
  Signature,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Eye,
  Phone,
  MessageSquare,
  Shield,
  Lock,
  FileText,
  Star,
  Calendar,
  Package,
  Navigation,
  Smartphone,
  Fingerprint,
  QrCode,
  Send,
  Save,
  RefreshCw,
  Settings
} from 'lucide-react';
import { ProofOfDelivery as ProofOfDeliveryType, Shipment, DeliveryAgent } from '@/types/delivery';

interface ProofOfDeliveryProps {
  shipment: Shipment;
  agent: DeliveryAgent;
  onComplete: (proof: ProofOfDeliveryType) => void;
  onCancel?: () => void;
}

interface DeliveryAttempt {
  id: string;
  timestamp: string;
  status: 'successful' | 'failed' | 'rescheduled';
  reason?: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  proof?: ProofOfDeliveryType;
}

interface VerificationMethod {
  type: 'sms' | 'call' | 'email' | 'biometric' | 'id_check';
  status: 'pending' | 'verified' | 'failed';
  details?: string;
  timestamp?: string;
}

export const ProofOfDelivery: React.FC<ProofOfDeliveryProps> = ({
  shipment,
  agent,
  onComplete,
  onCancel
}) => {
  const [deliveryStatus, setDeliveryStatus] = useState<'delivered' | 'failed' | 'partial'>('delivered');
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelation, setRecipientRelation] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [customerRating, setCustomerRating] = useState(5);
  const [verificationMethods, setVerificationMethods] = useState<VerificationMethod[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  React.useEffect(() => {
    getCurrentLocation();
    generateVerificationCode();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  };

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' 
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Add timestamp and location overlay
      if (context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, canvas.height - 60, canvas.width, 60);
        context.fillStyle = 'white';
        context.font = '16px Arial';
        
        const timestamp = new Date().toLocaleString();
        const locationText = currentLocation 
          ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`
          : 'Location unavailable';
          
        context.fillText(`${timestamp} | ${locationText}`, 10, canvas.height - 35);
        context.fillText(`Agent: ${agent.firstName} ${agent.lastName} | Order: ${shipment.orderId}`, 10, canvas.height - 15);
      }
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setPhotos(prev => [...prev, photoData]);
      
      // Stop camera
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const startSignature = () => {
    setShowSignaturePad(true);
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (canvas && rect) {
      const context = canvas.getContext('2d');
      if (context) {
        context.beginPath();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        context.moveTo(clientX - rect.left, clientY - rect.top);
      }
    }
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (canvas && rect) {
      const context = canvas.getContext('2d');
      if (context) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        context.lineTo(clientX - rect.left, clientY - rect.top);
        context.stroke();
      }
    }
  };

  const handleSignatureEnd = () => {
    setIsDrawing(false);
  };

  const saveSignature = () => {
    if (signatureCanvasRef.current) {
      const signatureData = signatureCanvasRef.current.toDataURL();
      setSignature(signatureData);
      setShowSignaturePad(false);
    }
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const context = signatureCanvasRef.current.getContext('2d');
      context?.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
    }
  };

  const sendVerificationSMS = async () => {
    try {
      // Mock API call to send SMS
      const smsVerification: VerificationMethod = {
        type: 'sms',
        status: 'pending',
        details: `Verification code sent to ${shipment.deliveryAddress.contactPhone}`,
        timestamp: new Date().toISOString()
      };
      
      setVerificationMethods(prev => [...prev, smsVerification]);
      
      // Simulate SMS delivery
      setTimeout(() => {
        setVerificationMethods(prev => prev.map(v => 
          v.type === 'sms' && v.status === 'pending' 
            ? { ...v, status: 'verified' }
            : v
        ));
      }, 3000);
      
    } catch (error) {
      console.error('Error sending verification SMS:', error);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!recipientName.trim()) {
      errors.push('Recipient name is required');
    }
    
    if (!recipientRelation) {
      errors.push('Recipient relationship is required');
    }
    
    if (deliveryStatus === 'delivered') {
      if (!signature) {
        errors.push('Digital signature is required for successful delivery');
      }
      
      if (photos.length === 0) {
        errors.push('At least one photo is required as proof of delivery');
      }
    }
    
    if (!currentLocation) {
      errors.push('GPS location is required for delivery verification');
    }
    
    return errors;
  };

  const submitProofOfDelivery = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please complete all required fields:\n' + errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const proof: ProofOfDeliveryType = {
        deliveredTo: recipientName,
        deliveredAt: new Date().toISOString(),
        signature: signature || undefined,
        photo: photos[0] || undefined,
        notes: notes || undefined,
        verificationCode: verificationCode
      };

      // Add additional metadata
      const detailedProof = {
        ...proof,
        recipientRelation,
        recipientId,
        photos: photos,
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          timestamp: new Date().toISOString()
        } : undefined,
        agent: {
          id: agent.id,
          name: `${agent.firstName} ${agent.lastName}`,
          employeeId: agent.employeeId
        },
        verificationMethods,
        customerRating,
        deliveryStatus
      };

      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onComplete(proof);
      
    } catch (error) {
      console.error('Error submitting proof of delivery:', error);
      alert('Failed to submit proof of delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Proof of Delivery</CardTitle>
              <CardDescription>
                Complete delivery verification for {shipment.trackingNumber}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Order ID</p>
              <p className="font-semibold">{shipment.orderId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Customer</p>
              <p className="font-semibold">{shipment.deliveryAddress.contactName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Address</p>
              <p className="text-sm">{shipment.deliveryAddress.line1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Status */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={deliveryStatus} onValueChange={(value: any) => setDeliveryStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivered">Successfully Delivered</SelectItem>
              <SelectItem value="failed">Delivery Failed</SelectItem>
              <SelectItem value="partial">Partial Delivery</SelectItem>
            </SelectContent>
          </Select>

          {deliveryStatus === 'failed' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">Please provide reason for failed delivery:</p>
              <Textarea
                placeholder="Explain why delivery could not be completed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Recipient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Recipient Name *</label>
              <Input
                placeholder="Who received the package?"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Relationship to Customer *</label>
              <Select value={recipientRelation} onValueChange={setRecipientRelation}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Customer (Self)</SelectItem>
                  <SelectItem value="family">Family Member</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="neighbor">Neighbor</SelectItem>
                  <SelectItem value="security">Security Guard</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Recipient ID (Optional)</label>
            <Input
              placeholder="ID number or other identifier"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Delivery Notes</label>
            <Textarea
              placeholder="Any additional notes about the delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Evidence */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Evidence</CardTitle>
          <CardDescription>
            {deliveryStatus === 'delivered' ? 'Required: ' : ''}Take photos as proof of delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={startCamera} disabled={showCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </div>

          {showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md rounded-lg"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-2">
                  <Button onClick={capturePhoto}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                  <Button variant="outline" onClick={() => setShowCamera(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Delivery proof ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removePhoto(index)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Signature</CardTitle>
          <CardDescription>
            {deliveryStatus === 'delivered' ? 'Required: ' : ''}Get recipient's signature
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={startSignature} disabled={showSignaturePad}>
              <Signature className="mr-2 h-4 w-4" />
              Get Signature
            </Button>
            {signature && (
              <Button variant="outline" onClick={() => setSignature(null)}>
                Clear Signature
              </Button>
            )}
          </div>

          {showSignaturePad && (
            <div className="space-y-4">
              <div className="border border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Ask the recipient to sign below:
                </p>
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={200}
                  className="border border-gray-200 cursor-crosshair w-full"
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onTouchStart={handleSignatureStart}
                  onTouchMove={handleSignatureMove}
                  onTouchEnd={handleSignatureEnd}
                  style={{ touchAction: 'none' }}
                />
                <div className="flex space-x-2 mt-2">
                  <Button onClick={saveSignature}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Signature
                  </Button>
                  <Button variant="outline" onClick={clearSignature}>
                    Clear
                  </Button>
                  <Button variant="outline" onClick={() => setShowSignaturePad(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {signature && (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Signature Captured</span>
              </div>
              <img src={signature} alt="Recipient signature" className="border rounded max-h-32" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Location Verification</CardTitle>
          <CardDescription>GPS coordinates for delivery confirmation</CardDescription>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Location Verified</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Latitude: {currentLocation.coords.latitude.toFixed(6)}</p>
                <p>Longitude: {currentLocation.coords.longitude.toFixed(6)}</p>
                <p>Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m</p>
                <p>Timestamp: {new Date(currentLocation.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Location Not Available</p>
                <Button size="sm" variant="outline" onClick={getCurrentLocation} className="mt-2">
                  <Navigation className="mr-2 h-4 w-4" />
                  Retry Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Verification</CardTitle>
          <CardDescription>Additional verification methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Verification Code</label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={verificationCode}
                  readOnly
                  className="font-mono"
                />
                <Button size="sm" variant="outline" onClick={generateVerificationCode}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Send to Customer</label>
              <div className="flex space-x-2 mt-1">
                <Button size="sm" onClick={sendVerificationSMS}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              </div>
            </div>
          </div>

          {verificationMethods.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Verification Status:</p>
              {verificationMethods.map((method, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Badge className={
                    method.status === 'verified' ? 'bg-green-100 text-green-800' :
                    method.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {method.status}
                  </Badge>
                  <span className="text-sm">{method.type.toUpperCase()}</span>
                  {method.details && <span className="text-sm text-gray-600">- {method.details}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Feedback */}
      {deliveryStatus === 'delivered' && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Feedback</CardTitle>
            <CardDescription>Quick delivery experience rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Rate this delivery experience</label>
                <div className="flex space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCustomerRating(star)}
                      className={`p-1 ${star <= customerRating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="h-4 w-4" />
                <span>All data is encrypted and securely stored</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Timestamp and GPS coordinates are automatically recorded</span>
              </div>
            </div>
            
            <Button 
              onClick={submitProofOfDelivery}
              disabled={isSubmitting}
              className="min-w-[160px]"
            >
              {isSubmitting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Complete Delivery'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
