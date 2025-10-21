import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Heart } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuthContext();
  const { logout } = useAuth();

  const handleAccountClick = () => {
    if (user) {
      // Show user menu or profile
      logout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className={cn('bg-white shadow-sm border-b border-gray-200', className)}>
        {/* Top bar */}
        <div className="bg-red-600 text-white py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <span>Free delivery on orders over ₦50,000</span>
              <div className="flex items-center space-x-4">
                <span>Help</span>
                <span>Track Order</span>
                <span>Sell on Georgy Marketplace</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/logo/georgy-logo.png" 
                  alt="Georgy Marketplace Logo"
                  className="h-16 w-auto cursor-pointer"
                  onClick={() => window.location.href = '/'}
                />
              </div>
            </div>
            
            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products, brands and categories..."
                  icon={Search}
                  iconPosition="left"
                  fullWidth
                  className="pr-12"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                >
                  Search
                </Button>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" icon={User} onClick={handleAccountClick}>
                <span className="hidden sm:inline">
                  {user ? `Hi, ${user.firstName}` : 'Account'}
                </span>
              </Button>
              <Button variant="ghost" size="sm" icon={Heart}>
                <span className="hidden sm:inline">Wishlist</span>
              </Button>
              <Button variant="ghost" size="sm" icon={ShoppingCart} className="relative">
                <span className="hidden sm:inline">Cart</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
              <Button variant="ghost" size="sm" icon={Menu} className="sm:hidden">
                Menu
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export { Header };