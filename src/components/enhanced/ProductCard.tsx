import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  MapPin, 
  ShoppingCart, 
  Eye, 
  Share2,
  Bookmark,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface EnhancedProductCardProps {
  product: Product;
  className?: string;
  showActions?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

export const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  className,
  showActions = true,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart and place orders.',
        variant: 'destructive',
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
            className="border-white text-white hover:bg-white hover:text-red-600"
          >
            Sign In
          </Button>
        ),
      });
      return;
    }
    
    addItem(product, 1);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href + `product/${product.id}`,
      });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    hover: { 
      y: -8,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  } as const;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn("group cursor-pointer", className)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <Card className={cn(
        "overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300",
        "bg-gradient-to-br from-white to-gray-50/50",
        variant === 'featured' && "ring-2 ring-primary/20",
        variant === 'compact' && "h-full"
      )}>
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              variants={imageVariants}
              initial="hidden"
              animate={imageLoaded ? "visible" : "hidden"}
              src={(() => {
                try {
                  const images = typeof product.images === 'string' 
                    ? JSON.parse(product.images) 
                    : product.images;
                  return Array.isArray(images) && images.length > 0 
                    ? images[0] 
                    : '/api/placeholder/300/200';
                } catch {
                  return '/api/placeholder/300/200';
                }
              })()} 
              alt={product.name}
              className={cn(
                "w-full object-cover transition-transform duration-500",
                variant === 'compact' ? "h-40" : "h-48"
              )}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Badges (optional - removed unsupported fields in base Product) */}
            <div className="absolute top-3 left-3 flex flex-col gap-2"></div>

            {/* Quick Actions Overlay */}
            {showActions && (
              <AnimatePresence>
                <motion.div
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className={cn(
                      "h-9 w-9 p-0 rounded-full backdrop-blur-sm bg-white/80 hover:bg-white border-0 shadow-sm",
                      isLiked && "bg-red-50 text-red-500 hover:bg-red-100"
                    )}
                    onClick={handleLike}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className={cn(
                      "h-9 w-9 p-0 rounded-full backdrop-blur-sm bg-white/80 hover:bg-white border-0 shadow-sm",
                      isBookmarked && "bg-blue-50 text-blue-500 hover:bg-blue-100"
                    )}
                    onClick={handleBookmark}
                  >
                    <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 rounded-full backdrop-blur-sm bg-white/80 hover:bg-white border-0 shadow-sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </div>

        {/* Content Section */}
        <CardContent className={cn("p-4", variant === 'compact' && "p-3")}>
          {/* Title */}
          <h3 className={cn(
            "font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors",
            variant === 'compact' ? "text-sm" : "text-lg"
          )}>
            {product.name}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between mb-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col"
            >
              <span className={cn(
                "font-bold text-primary",
                variant === 'compact' ? "text-lg" : "text-xl"
              )}>
                ₦{product.price.toLocaleString()}
              </span>
              {(product as any).isNegotiable && (
                <span className="text-xs text-muted-foreground">Negotiable</span>
              )}
            </motion.div>
            
            <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm ml-1">{Number(product.rating) || 4.5}</span>
            </div>
              {product.seller?.isVerified && (
                <BadgeCheck className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{
              product.seller?.businessAddress ? 
                `${product.seller.businessAddress.city}, ${product.seller.businessAddress.state}` :
                'Location not specified'
            }</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {((product as any)?.viewCount ?? 0)} views
            </span>
            <span>{new Date(product.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>

          {/* Action Button */}
          {showActions && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-0"
                onClick={handleAddToCart}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent to-primary"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
