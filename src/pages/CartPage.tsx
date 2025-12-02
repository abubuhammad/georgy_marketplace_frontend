import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Minus, Plus, Trash2, ArrowLeft, ArrowRight,
  Heart, Truck, Shield, RotateCcw, MapPin, Clock, Loader2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import makurdiDeliveryApi, { MakurdiZone } from '@/services/makurdiDeliveryApi';
import { getProductImageUrl } from '@/utils/imageUtils';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { 
    items, 
    itemCount, 
    subtotal, 
    shipping, 
    tax, 
    totalAmount,
    updateQuantity, 
    removeItem, 
    clearCart,
    deliveryAddress,
    deliveryQuote,
    deliveryType,
    isCalculatingDelivery,
    deliveryError,
    setDeliveryAddress,
    setDeliveryType
  } = useCart();

  const [zones, setZones] = useState<MakurdiZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [addressInput, setAddressInput] = useState(deliveryAddress?.address || '');

  // Load Makurdi zones
  useEffect(() => {
    const loadZones = async () => {
      const result = await makurdiDeliveryApi.getZones();
      if (result.success) {
        setZones(result.zones);
      }
    };
    loadZones();
  }, []);

  // Handle zone selection
  const handleZoneSelect = (zoneCode: string) => {
    setSelectedZone(zoneCode);
    const zone = zones.find(z => z.code === zoneCode);
    if (zone) {
      setDeliveryAddress({
        address: addressInput || zone.name,
        city: 'Makurdi',
        state: 'Benue',
        lat: zone.center.lat,
        lng: zone.center.lng,
        zone: zoneCode
      });
    }
  };

  // Handle address input change
  const handleAddressChange = (value: string) => {
    setAddressInput(value);
    if (selectedZone) {
      const zone = zones.find(z => z.code === selectedZone);
      if (zone) {
        setDeliveryAddress({
          address: value,
          city: 'Makurdi',
          state: 'Benue',
          lat: zone.center.lat,
          lng: zone.center.lng,
          zone: selectedZone
        });
      }
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login?returnTo=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-2xl font-bold text-primary">
                  Georgy Marketplace
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-xl font-semibold">Shopping Cart</h1>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Heart className="w-5 h-5 mr-2" />
                  View Wishlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-primary">
                Georgy Marketplace
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">
                Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
              </h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Items in your cart
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={getProductImageUrl(item.product.images, '/api/placeholder/120/120')}
                          alt={item.product.title || item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <Link 
                              to={`/product/${item.product.id}`}
                              className="text-lg font-semibold hover:text-primary line-clamp-2"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.product.location_city}, {item.product.location_state}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {item.product.condition}
                              </Badge>
                              {item.product.brand && (
                                <Badge variant="secondary">
                                  {item.product.brand}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(
                                item.productId, 
                                parseInt(e.target.value) || 1
                              )}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₦{item.price.toLocaleString()} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security Features */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-8 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Location Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Delivery Location
                </CardTitle>
                <CardDescription>
                  Select your delivery zone in Makurdi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="zone">Delivery Zone</Label>
                  <Select value={selectedZone} onValueChange={handleZoneSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your area" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.code} value={zone.code}>
                          <div className="flex justify-between items-center w-full">
                            <span>{zone.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              ₦{zone.baseFee}+
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Street Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your street address"
                    value={addressInput}
                    onChange={(e) => handleAddressChange(e.target.value)}
                  />
                </div>

                {/* Delivery Type */}
                <div className="space-y-2">
                  <Label>Delivery Speed</Label>
                  <RadioGroup 
                    value={deliveryType} 
                    onValueChange={(value) => setDeliveryType(value as any)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <span className="font-medium">Standard</span>
                        <span className="text-xs text-gray-500 block">45-90 mins</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <span className="font-medium">Express (+30%)</span>
                        <span className="text-xs text-gray-500 block">30-60 mins</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Delivery Quote Info */}
                {isCalculatingDelivery && (
                  <div className="flex items-center justify-center py-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating delivery fee...
                  </div>
                )}

                {deliveryQuote && !isCalculatingDelivery && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                    <div className="flex items-center text-green-800">
                      <Truck className="w-4 h-4 mr-2" />
                      <span className="font-medium">Delivery: ₦{deliveryQuote.fee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-green-700">
                      <Clock className="w-3 h-3 mr-2" />
                      <span>Est. {deliveryQuote.estimatedTime}</span>
                    </div>
                    {deliveryQuote.deliveryZone && (
                      <p className="text-xs text-green-600">
                        Zone: {zones.find(z => z.code === deliveryQuote.deliveryZone)?.name || deliveryQuote.deliveryZone}
                      </p>
                    )}
                  </div>
                )}

                {deliveryError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <Info className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">{deliveryError}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      Shipping
                      {deliveryQuote?.deliveryZone && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {zones.find(z => z.code === deliveryQuote.deliveryZone)?.name}
                        </Badge>
                      )}
                    </span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {isCalculatingDelivery ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : shipping === 0 ? (
                        'FREE'
                      ) : (
                        `₦${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax (VAT 7.5%)</span>
                    <span>₦{Math.round(tax).toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₦{Math.round(totalAmount).toLocaleString()}</span>
                  </div>
                </div>

                {!selectedZone && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Select your delivery zone above to see accurate shipping cost
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleProceedToCheckout}
                  className="w-full" 
                  size="lg"
                  disabled={!selectedZone}
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>

                {!user && (
                  <p className="text-sm text-gray-600 text-center">
                    Please <Link to="/login" className="text-primary hover:underline">sign in</Link> to continue
                  </p>
                )}

                {/* Accepted Payment Methods */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">We Accept</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <span className="text-xs font-medium">Cards</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <span className="text-xs font-medium">Bank</span>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <span className="text-xs font-medium">Mobile</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for recommended products */}
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Related Product {i + 1}</h4>
                  <p className="text-primary font-bold">₦25,000</p>
                  <Button className="w-full mt-2" size="sm">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
