import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { useAuthContext } from './AuthContext';
import benueDeliveryApi, { BENUE_LGAS } from '@/services/benueDeliveryApi';

// Delivery Address Type
export interface DeliveryAddress {
  address: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  zone?: string;
}

// Delivery Quote Info
export interface DeliveryQuoteInfo {
  fee: number;
  estimatedTime: string;
  pickupZone?: string;
  deliveryZone?: string;
  distance?: number;
  breakdown?: {
    baseFee: number;
    distanceFee: number;
    crossZoneFee: number;
    platformFee: number;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  deliveryAddress: DeliveryAddress | null;
  deliveryQuote: DeliveryQuoteInfo | null;
  deliveryType: 'standard' | 'express' | 'same_day' | 'scheduled';
  isCalculatingDelivery: boolean;
  deliveryError: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartKey: () => string;
  isItemInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  setDeliveryType: (type: 'standard' | 'express' | 'same_day' | 'scheduled') => void;
  calculateDeliveryFee: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(null);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuoteInfo | null>(null);
  const [deliveryType, setDeliveryTypeState] = useState<'standard' | 'express' | 'same_day' | 'scheduled'>('standard');
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Generate cart key based on user
  const getCartKey = () => {
    return user ? `cart_${user.id}` : 'cart_guest';
  };

  // Load cart from localStorage on mount and user change
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    
    // Load saved delivery address
    const savedAddress = localStorage.getItem(`${cartKey}_delivery_address`);
    if (savedAddress) {
      try {
        setDeliveryAddressState(JSON.parse(savedAddress));
      } catch (error) {
        console.error('Error loading delivery address:', error);
      }
    }
  }, [user]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, user]);

  const addItem = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: Date.now().toString(),
        productId: product.id,
        product,
        quantity,
        price: product.price,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const isItemInCart = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Set delivery address and trigger fee calculation
  const setDeliveryAddress = useCallback((address: DeliveryAddress) => {
    // Try to geocode the address if coordinates not provided
    if (!address.lat || !address.lng) {
      const geocoded = benueDeliveryApi.geocodeAddress(address.address, address.city, address.state);
      if (geocoded) {
        address.lat = geocoded.lat;
        address.lng = geocoded.lng;
        address.zone = geocoded.code;
      }
    }
    
    setDeliveryAddressState(address);
    setDeliveryQuote(null); // Reset quote when address changes
    setDeliveryError(null);
    
    // Save to localStorage
    const cartKey = getCartKey();
    localStorage.setItem(`${cartKey}_delivery_address`, JSON.stringify(address));
  }, [user]);

  // Set delivery type
  const setDeliveryType = useCallback((type: 'standard' | 'express' | 'same_day' | 'scheduled') => {
    setDeliveryTypeState(type);
    setDeliveryQuote(null); // Reset quote when type changes
  }, []);

  // Calculate delivery fee from API
  const calculateDeliveryFee = useCallback(async () => {
    if (!deliveryAddress) {
      setDeliveryError('Please enter a delivery address');
      return;
    }

    // Check if delivery is within Benue State
    if (deliveryAddress.state?.toLowerCase() !== 'benue') {
      setDeliveryError('Delivery is currently only available within Benue State');
      // Use fallback flat rate for non-Benue addresses
      setDeliveryQuote({
        fee: 2500,
        estimatedTime: '2-5 business days',
      });
      return;
    }

    setIsCalculatingDelivery(true);
    setDeliveryError(null);

    try {
      // Get delivery coordinates
      const deliveryCoords = deliveryAddress.lat && deliveryAddress.lng
        ? { lat: deliveryAddress.lat, lng: deliveryAddress.lng }
        : benueDeliveryApi.geocodeAddress(deliveryAddress.address, deliveryAddress.city, deliveryAddress.state);

      if (!deliveryCoords) {
        throw new Error('Could not determine delivery location');
      }

      // Calculate package value
      const packageValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Build cart items for the API
      const cartItems = items.map((item, index) => ({
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        weight_kg: item.product?.weight || undefined,
        pickup_location_id: item.product?.sellerId || `seller_${index}`,
        pickup_coords: item.product?.locationCity 
          ? benueDeliveryApi.geocodeAddress(item.product.locationCity, item.product.locationCity, 'Benue')
          : { lat: 7.7333, lng: 8.5333 }, // Default to Makurdi center
      }));

      // Call v2 API for quote
      const result = await benueDeliveryApi.getDeliveryQuote({
        cart_id: `cart_${Date.now()}`,
        subtotal_ngn: packageValue,
        items: cartItems,
        payment_method: 'card',
        delivery_coords: { lat: deliveryCoords.lat, lng: deliveryCoords.lng },
        delivery_type: deliveryType,
      });

      // Find the selected delivery option
      const selectedOption = result.delivery_options.find(opt => opt.id === deliveryType) || result.delivery_options[0];

      if (selectedOption) {
        setDeliveryQuote({
          fee: selectedOption.price_ngn,
          estimatedTime: selectedOption.eta_friendly,
          pickupZone: result.per_shipment_fees?.[0]?.pickup_zone,
          deliveryZone: result.per_shipment_fees?.[0]?.delivery_zone,
          distance: result.distance_km,
          breakdown: {
            baseFee: selectedOption.price_breakdown.find(b => b.name.includes('Base'))?.amount || 0,
            distanceFee: selectedOption.price_breakdown.find(b => b.name.includes('Distance'))?.amount || 0,
            crossZoneFee: selectedOption.price_breakdown.find(b => b.name.includes('Cross'))?.amount || 0,
            platformFee: selectedOption.price_breakdown.find(b => b.name.includes('Platform'))?.amount || 0,
          },
        });
        
        if (!selectedOption.is_available && selectedOption.suspension_reason) {
          setDeliveryError(`Note: ${selectedOption.suspension_reason}`);
        }
      } else {
        // Fallback calculation
        const fallbackFee = benueDeliveryApi.calculateFallbackFee(
          deliveryAddress.zone || 'BN-MKD',
          packageValue,
          deliveryType
        );
        setDeliveryQuote({
          fee: fallbackFee,
          estimatedTime: deliveryType === 'express' ? '30-60 mins' : '45-90 mins',
        });
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      setDeliveryError('Could not calculate delivery fee. Using standard rate.');
      // Use fallback
      const packageValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setDeliveryQuote({
        fee: packageValue > 50000 ? 0 : 2500,
        estimatedTime: '45-90 mins',
      });
    } finally {
      setIsCalculatingDelivery(false);
    }
  }, [deliveryAddress, deliveryType, items]);

  // Auto-calculate delivery when address or type changes
  useEffect(() => {
    if (deliveryAddress && items.length > 0) {
      calculateDeliveryFee();
    }
  }, [deliveryAddress, deliveryType, calculateDeliveryFee]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Use dynamic shipping from quote, or fallback to flat rate
  const shipping = deliveryQuote?.fee ?? (subtotal > 50000 ? 0 : 2500);
  
  const tax = subtotal * 0.075; // 7.5% VAT
  const totalAmount = subtotal + shipping + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    itemCount,
    totalAmount,
    subtotal,
    shipping,
    tax,
    deliveryAddress,
    deliveryQuote,
    deliveryType,
    isCalculatingDelivery,
    deliveryError,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartKey,
    isItemInCart,
    getItemQuantity,
    setDeliveryAddress,
    setDeliveryType,
    calculateDeliveryFee,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};