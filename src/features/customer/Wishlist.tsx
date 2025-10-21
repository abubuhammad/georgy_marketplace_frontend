import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import productService from '@/services/productService';
import { Product } from '@/types';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const { user } = useAuthContext();
  const { addItem } = useCart();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await productService.getUserFavorites(user.id);
      if (data) {
        setFavoriteProducts(data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!user) return;
    
    try {
      await productService.toggleFavorite(user.id, productId);
      setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Wishlist</h2>
          <p className="text-gray-600">Your saved items</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Wishlist</h2>
          <p className="text-gray-600">
            {favoriteProducts.length} item(s) saved for later
          </p>
        </div>
        
        {favoriteProducts.length > 0 && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                favoriteProducts.forEach(product => addItem(product));
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>
          </div>
        )}
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow group relative">
              <div className="relative">
                <img
                  src={product.images?.[0]?.image_url || '/api/placeholder/300/200'}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveFavorite(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                {product.original_price && product.original_price > product.price && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary">
                    {product.title}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₦{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {product.condition}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {product.location_city}, {product.location_state}
                </p>
                
                <div className="flex space-x-2">
                  <Link to={`/product/${product.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveFavorite(product.id)}
                >
                  <Heart className="w-4 h-4 mr-1 fill-current" />
                  Remove from Wishlist
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4">
              Save items you're interested in to view them later
            </p>
            <Link to="/products">
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Wishlist;
