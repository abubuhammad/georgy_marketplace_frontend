import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { useAuthContext } from './AuthContext';
import makurdiDeliveryApi, { DeliveryQuoteResponse, MAKURDI_AREAS } from '@/services/makurdiDeliveryApi';

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
      const geocoded = makurdiDeliveryApi.geocodeAddress(address.address, address.city);
      if (geocoded) {
        address.lat = geocoded.lat;
        address.lng = geocoded.lng;
        address.zone = geocoded.zone;
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

    // Check if delivery is within Makurdi
    if (deliveryAddress.city?.toLowerCase() !== 'makurdi' && deliveryAddress.state?.toLowerCase() !== 'benue') {
      setDeliveryError('Delivery is currently only available within Makurdi, Benue State');
      // Use fallback flat rate for non-Makurdi addresses
      setDeliveryQuote({
        fee: 2500,
        estimatedTime: '2-5 business days',
      });
      return;
    }

    setIsCalculatingDelivery(true);
    setDeliveryError(null);

    try {
      // Get seller's location from first item (simplified - in production, handle multiple sellers)
      const firstItem = items[0];
      const sellerLocation = firstItem?.product?.locationCity?.toLowerCase() === 'makurdi'
        ? makurdiDeliveryApi.geocodeAddress(firstItem.product.locationCity || 'Makurdi', 'Makurdi')
        : { lat: 7.7333, lng: 8.5333, zone: 'MKD-WK' }; // Default to Wurukum (central Makurdi)

      // Get delivery coordinates
      const deliveryCoords = deliveryAddress.lat && deliveryAddress.lng
        ? { lat: deliveryAddress.lat, lng: deliveryAddress.lng }
        : makurdiDeliveryApi.geocodeAddress(deliveryAddress.address, deliveryAddress.city);

      if (!deliveryCoords) {
        throw new Error('Could not determine delivery location');
      }

      // Calculate package value
      const packageValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Call API for quote
      const result = await makurdiDeliveryApi.getDeliveryQuote({
        pickupLocation: {
          lat: sellerLocation?.lat || 7.7333,
          lng: sellerLocation?.lng || 8.5333,
          zone: sellerLocation?.zone,
        },
        deliveryLocation: {
          lat: deliveryCoords.lat,
          lng: deliveryCoords.lng,
          zone: deliveryAddress.zone,
        },
        packageValue,
        deliveryType,
      });

      if (result.success && result.quote) {
        setDeliveryQuote({
          fee: result.quote.totalFee,
          estimatedTime: result.quote.estimatedTime,
          pickupZone: result.quote.pickupZone,
          deliveryZone: result.quote.deliveryZone,
          distance: result.quote.distance,
          breakdown: {
            baseFee: result.quote.breakdown.baseFee,
            distanceFee: result.quote.breakdown.distanceFee,
            crossZoneFee: result.quote.breakdown.crossZoneFee,
            platformFee: result.quote.breakdown.platformFee,
          },
        });
      } else {
        // Fallback calculation
        const fallbackFee = makurdiDeliveryApi.calculateFallbackFee(
          sellerLocation?.zone || 'MKD-WK',
          deliveryAddress.zone || 'MKD-WK',
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
      setDeliveryQuote({
        fee: 2500,
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