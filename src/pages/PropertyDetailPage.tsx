import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2,
  Calendar,
  DollarSign,
  Building,
  Car,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Camera,
  Star,
  CheckCircle,
  Home,
  MapIcon
} from 'lucide-react';
import { Property, PropertyInquiry } from '@/features/realtor/types';
import { RealEstateService } from '@/services/realEstateService';
import { useAuthContext } from '@/contexts/AuthContext';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);
  const [showViewingDialog, setShowViewingDialog] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    subject: '',
    message: ''
  });
  const [viewingData, setViewingData] = useState({
    scheduledAt: '',
    durationMinutes: 60
  });

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await RealEstateService.getPropertyById(id!);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;

    try {
      await RealEstateService.createInquiry({
        propertyId: property.id,
        inquirerId: user.id,
        professionalId: property.professionalId,
        subject: inquiryData.subject,
        message: inquiryData.message,
        status: 'new'
      });
      setShowInquiryDialog(false);
      setInquiryData({ subject: '', message: '' });
      // Show success message
    } catch (error) {
      console.error('Error sending inquiry:', error);
    }
  };

  const handleViewingSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;

    try {
      await RealEstateService.scheduleViewing({
        propertyId: property.id,
        requesterId: user.id,
        professionalId: property.professionalId,
        scheduledAt: viewingData.scheduledAt,
        durationMinutes: viewingData.durationMinutes,
        status: 'scheduled'
      });
      setShowViewingDialog(false);
      setViewingData({ scheduledAt: '', durationMinutes: 60 });
      // Show success message
    } catch (error) {
      console.error('Error scheduling viewing:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'rent': return 'bg-blue-100 text-blue-800';
      case 'lease': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/properties')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/properties')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Properties
      </Button>

      {/* Property Images */}
      <div className="mb-6">
        <div className="relative">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <img
                  src={property.images[currentImageIndex]?.imageUrl}
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {property.images.slice(0, 3).map((image, index) => (
                  <img
                    key={image.id}
                    src={image.imageUrl}
                    alt={image.imageAlt || property.title}
                    className={`w-full h-32 object-cover rounded-lg cursor-pointer ${
                      index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
                {property.images.length > 3 && (
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
                    <div className="text-center">
                      <Camera className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        +{property.images.length - 3} more
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
              <Building className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {property.address.street}, {property.address.city}, {property.address.state} {property.address.postalCode}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {property.viewCount} views
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Listed {new Date(property.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center text-3xl font-bold text-red-600">
                <DollarSign className="h-8 w-8" />
                {formatCurrency(property.price, property.currency)}
              </div>
              <Badge className={getListingTypeColor(property.listingType)}>
                {property.listingType.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {property.propertyType}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Bed className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-semibold">{property.bedrooms || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
              </div>
              <div className="flex items-center">
                <Bath className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-semibold">{property.bathrooms || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center">
                <Square className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-semibold">{property.squareFootage || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
              </div>
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-semibold">{property.parkingSpaces || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              {property.virtualTourUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Virtual Tour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button>
                      <Home className="mr-2 h-4 w-4" />
                      Take Virtual Tour
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Property Type</Label>
                      <p className="capitalize">{property.propertyType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Listing Type</Label>
                      <p className="capitalize">{property.listingType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Year Built</Label>
                      <p>{property.yearBuilt || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Lot Size</Label>
                      <p>{property.lotSize ? `${property.lotSize} sq ft` : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Furnishing</Label>
                      <p className="capitalize">{property.furnishingStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={getListingTypeColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {property.features && property.features.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {property.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {property.amenities && property.amenities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {property.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p>{property.address.street}</p>
                      <p>{property.address.city}, {property.address.state} {property.address.postalCode}</p>
                      <p>{property.address.country}</p>
                    </div>

                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Map view would be here</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Information */}
          {property.professional && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {property.professional.user?.avatar ? (
                        <img 
                          src={property.professional.user.avatar} 
                          alt="Agent"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold">
                          {property.professional.user?.firstName?.[0]}{property.professional.user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {property.professional.user?.firstName} {property.professional.user?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{property.professional.agencyName}</p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{property.professional.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600 ml-1">
                          ({property.professional.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => setShowInquiryDialog(true)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowViewingDialog(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Viewing
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mortgage Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loan-amount">Loan Amount</Label>
                  <Input 
                    id="loan-amount"
                    type="number" 
                    defaultValue={property.price}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="down-payment">Down Payment (%)</Label>
                  <Input 
                    id="down-payment"
                    type="number" 
                    defaultValue={20}
                  />
                </div>
                <div>
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input 
                    id="interest-rate"
                    type="number" 
                    defaultValue={6.5}
                  />
                </div>
                <Button className="w-full">Calculate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Inquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInquiry} className="space-y-4">
            <div>
              <Label htmlFor="inquiry-subject">Subject</Label>
              <Input
                id="inquiry-subject"
                value={inquiryData.subject}
                onChange={(e) => setInquiryData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Property inquiry about..."
                required
              />
            </div>
            <div>
              <Label htmlFor="inquiry-message">Message</Label>
              <Textarea
                id="inquiry-message"
                value={inquiryData.message}
                onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="I'm interested in this property..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowInquiryDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Inquiry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Viewing Dialog */}
      <Dialog open={showViewingDialog} onOpenChange={setShowViewingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Viewing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleViewingSchedule} className="space-y-4">
            <div>
              <Label htmlFor="viewing-date">Date & Time</Label>
              <Input
                id="viewing-date"
                type="datetime-local"
                value={viewingData.scheduledAt}
                onChange={(e) => setViewingData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="viewing-duration">Duration (minutes)</Label>
              <Input
                id="viewing-duration"
                type="number"
                value={viewingData.durationMinutes}
                onChange={(e) => setViewingData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                min={30}
                max={180}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowViewingDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Viewing</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetailPage;
