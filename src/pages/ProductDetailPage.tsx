import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, MessageCircle, Phone, MapPin, Star, 
  ShoppingCart, Shield, Eye, Calendar, Package, Truck, RefreshCw,
  ChevronLeft, ChevronRight, ZoomIn, User, Store, Verified,
  Edit, Trash2, BarChart3, Settings, AlertTriangle, Send, X, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import productService from '@/services/productService';
import { Product } from '@/types';

// Helper function to extract image URL from various formats
const getImageUrl = (image: string | { image_url?: string; url?: string } | undefined): string => {
  if (!image) return '/api/placeholder/600/400';
  if (typeof image === 'string') return image;
  return image.image_url || image.url || '/api/placeholder/600/400';
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Contact seller dialog state
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await productService.getProductById(id);
      if (error) {
        console.error('Error loading product:', error);
        navigate('/404');
        return;
      }
      
      if (data) {
        setProduct(data);
        
        // Load similar products
        if (data.category?.id) {
          const { data: similar } = await productService.getSimilarProducts(
            id, 
            data.category.id, 
            4
          );
          if (similar) {
            setSimilarProducts(similar);
          }
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
  };

  const handleToggleFavorite = async () => {
    if (!user || !product) return;
    
    try {
      const { isFavorited: newFavoriteStatus } = await productService.toggleFavorite(
        user.id, 
        product.id
      );
      setIsFavorited(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get seller info from product (handle both product.user and product.seller.user structures)
  const getSellerInfo = () => {
    const seller = product?.seller;
    const sellerUser = seller?.user || (product as any)?.user;
    return {
      name: seller?.businessName || `${sellerUser?.firstName || ''} ${sellerUser?.lastName || ''}`.trim() || 'Seller',
      avatar: sellerUser?.avatar || seller?.logo,
      phone: seller?.businessPhone || sellerUser?.phone,
      email: seller?.businessEmail || sellerUser?.email,
      isVerified: seller?.isVerified || sellerUser?.is_verified || sellerUser?.emailVerified,
      memberSince: seller?.createdAt || sellerUser?.createdAt,
      id: seller?.id || seller?.userId || sellerUser?.id
    };
  };

  // Contact seller handlers
  const handleChatWithSeller = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    // Pre-fill user info if available
    setContactName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    setContactEmail(user.email || '');
    setContactMessage(`Hi, I'm interested in "${product?.title || product?.name}". Is it still available?`);
    setContactDialogOpen(true);
  };

  const handleCallSeller = () => {
    const sellerInfo = getSellerInfo();
    if (sellerInfo.phone) {
      window.location.href = `tel:${sellerInfo.phone}`;
    } else {
      toast({
        title: "Phone not available",
        description: "Seller phone number is not available. Please use the message option instead.",
        variant: "destructive"
      });
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    // Pre-fill user info if available
    setContactName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    setContactEmail(user.email || '');
    setContactMessage(`Hi, I'm interested in "${product?.title || product?.name}". Is it still available?`);
    setContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send to the seller.",
        variant: "destructive"
      });
      return;
    }

    setSendingMessage(true);
    
    try {
      // In a real app, this would send to your backend API
      // For now, we'll simulate sending and show success
      const sellerInfo = getSellerInfo();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the message (in production, this would be an API call)
      console.log('Message sent to seller:', {
        sellerId: sellerInfo.id,
        sellerEmail: sellerInfo.email,
        productId: id,
        productName: product?.title || product?.name,
        senderName: contactName,
        senderEmail: contactEmail,
        senderPhone: contactPhone,
        message: contactMessage
      });

      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${sellerInfo.name}. They will respond to your email soon.`,
      });

      // Reset form and close dialog
      setContactMessage('');
      setContactDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Role-specific helper functions
  const isProductOwner = () => {
    return user && product && user.id === product.user?.id;
  };

  const canEditProduct = () => {
    return user && (
      user.role === 'admin' || 
      (user.role === 'seller' && isProductOwner())
    );
  };

  const canDeleteProduct = () => {
    return user && (
      user.role === 'admin' || 
      (user.role === 'seller' && isProductOwner())
    );
  };

  const canViewAnalytics = () => {
    return user && (
      user.role === 'admin' || 
      (user.role === 'seller' && isProductOwner())
    );
  };

  const canPurchase = () => {
    return user && (
      user.role === 'customer' || 
      user.role === 'buyer' || 
      user.role === 'USER'
    ) && !isProductOwner();
  };

  const canContactSeller = () => {
    return user && !isProductOwner();
  };

  // Role-specific action handlers
  const handleEditProduct = () => {
    navigate(`/seller/products/edit/${product?.id}`);
  };

  const handleDeleteProduct = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Call delete API
      console.log('Deleting product:', product?.id);
      navigate('/products');
    }
  };

  const handleViewAnalytics = () => {
    navigate(`/seller/products/${product?.id}/analytics`);
  };

  const handleReportProduct = () => {
    console.log('Reporting product:', product?.id);
    // Implement report functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Breadcrumb and Actions Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link 
                  to={`/category/${product.category?.slug}`} 
                  className="hover:text-primary"
                >
                  {product.category?.name}
                </Link>
                <span>/</span>
                <span className="text-gray-900 truncate max-w-40">
                  {product.title || product.name}
                </span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Role-specific action buttons */}
              {canEditProduct() && (
                <Button variant="outline" size="sm" onClick={handleEditProduct}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {canViewAnalytics() && (
                <Button variant="outline" size="sm" onClick={handleViewAnalytics}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              )}
              
              {canDeleteProduct() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeleteProduct}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {user && !isProductOwner() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleToggleFavorite}
                  className={isFavorited ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Saved' : 'Save'}
                </Button>
              )}
              
              {/* Report button for non-owners */}
              {user && !isProductOwner() && user.role !== 'admin' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReportProduct}
                  className="text-orange-600 hover:text-orange-700 hover:border-orange-300"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer group">
                    <img
                      src={getImageUrl(product.images?.[selectedImageIndex])}
                      alt={product.title || product.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <Carousel>
                    <CarouselContent>
                      {product.images?.map((image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={getImageUrl(image)}
                            alt={`${product.title || product.name} ${index + 1}`}
                            className="w-full h-auto max-h-[80vh] object-contain"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.title || product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.title || product.name}
                </h1>
                <Badge variant="outline" className="ml-4">
                  <Eye className="w-3 h-3 mr-1" />
                  {product.view_count || 0} views
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  ₦{product.price.toLocaleString()}
                </div>
                {product.original_price && product.original_price > product.price && (
                  <div className="text-lg text-gray-500 line-through">
                    ₦{product.original_price.toLocaleString()}
                  </div>
                )}
                {product.is_negotiable && (
                  <Badge variant="secondary">Negotiable</Badge>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {product.location_city}, {product.location_state}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Posted {formatDate(product.created_at)}
                </div>
                <Badge variant="outline" className="capitalize">
                  {product.condition}
                </Badge>
              </div>

              {product.rating && product.rating > 0 && (
                <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < product.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                {(() => {
                  const sellerInfo = getSellerInfo();
                  return (
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={sellerInfo.avatar || undefined} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {sellerInfo.name}
                          </h3>
                          {sellerInfo.isVerified && (
                            <Verified className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Member since {formatDate(sellerInfo.memberSince)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleChatWithSeller}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCallSeller}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              {/* Quantity selector - only for customers */}
              {canPurchase() && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">Quantity</span>
                </div>
              )}
              
              {/* Role indicator badge */}
              {user && isProductOwner() && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Store className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">This is your product</span>
                </div>
              )}
              
              {user?.role === 'admin' && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Admin View - Full Management Access</span>
                </div>
              )}

              {/* Role-specific action buttons */}
              {canPurchase() ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" onClick={handleAddToCart}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  {canContactSeller() && (
                    <Button variant="outline" size="lg" onClick={handleContactSeller}>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Seller
                    </Button>
                  )}
                </div>
              ) : isProductOwner() ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" onClick={handleEditProduct}>
                    <Edit className="w-5 h-5 mr-2" />
                    Edit Product
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleViewAnalytics}>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Analytics
                  </Button>
                </div>
              ) : user?.role === 'admin' ? (
                <div className="grid grid-cols-3 gap-4">
                  <Button size="lg" onClick={handleEditProduct}>
                    <Settings className="w-5 h-5 mr-2" />
                    Manage
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleViewAnalytics}>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleDeleteProduct}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Please log in to purchase or contact the seller</p>
                  <Button onClick={() => navigate('/login')}>
                    Sign In to Continue
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 pt-4 border-t">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure Payment
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  Fast Delivery
                </div>
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Easy Returns
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{product.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">General</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Brand:</dt>
                          <dd className="font-medium">{product.brand || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Model:</dt>
                          <dd className="font-medium">{product.model || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Condition:</dt>
                          <dd className="font-medium capitalize">{product.condition}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Category:</dt>
                          <dd className="font-medium">{product.category?.name}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Specifications</h4>
                        <dl className="space-y-2">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <dt className="text-gray-600 capitalize">{key}:</dt>
                              <dd className="font-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600">No reviews yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Be the first to review this product
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Card key={similarProduct.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getImageUrl(similarProduct.images?.[0])}
                      alt={similarProduct.title || similarProduct.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Link to={`/product/${similarProduct.id}`}>
                      <CardTitle className="text-lg mb-2 line-clamp-2 hover:text-primary">
                        {similarProduct.title || similarProduct.name}
                      </CardTitle>
                    </Link>
                    <div className="text-xl font-bold text-primary mb-2">
                      ₦{similarProduct.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {similarProduct.location_city}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Seller Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Seller
            </DialogTitle>
            <DialogDescription>
              Send a message to {getSellerInfo().name} about this product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(product?.images?.[0])}
                alt={product?.title || product?.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {product?.title || product?.name}
                </p>
                <p className="text-primary font-bold">
                  ₦{product?.price?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Your Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Your Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="contactMessage">Message</Label>
                <Textarea
                  id="contactMessage"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Write your message to the seller..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
              disabled={sendingMessage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !contactMessage.trim()}
            >
              {sendingMessage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ProductDetailPage;
