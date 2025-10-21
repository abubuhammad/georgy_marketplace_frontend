import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  ShoppingCart,
  Menu,
  X,
  Search,
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Home,
  Package,
  Building,
  Briefcase,
  Heart,
  History,
  Wrench,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface EnhancedNavigationProps {
  className?: string;
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPlatform, setPlatform } = useAppContext();
  const { user, logout } = useAuthContext();
  const { itemCount } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const [messages] = useState(2); // Mock message count
  const [sparklePositions] = useState(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2
    }))
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const platforms = [
    { 
      key: 'ecommerce', 
      label: 'Marketplace',
      icon: Package,
      color: 'from-primary to-accent'
    },
    { 
      key: 'realestate', 
      label: 'Real Estate',
      icon: Building,
      color: 'from-blue-600 to-blue-500'
    },
    { 
      key: 'jobs', 
      label: 'Jobs',
      icon: Briefcase,
      color: 'from-purple-600 to-purple-500'
    },
    { 
      key: 'artisan', 
      label: 'ArtisanConnect',
      icon: Wrench,
      color: 'from-orange-600 to-orange-500'
    }
  ];

  const currentPlatformData = platforms.find(p => p.key === currentPlatform);

  const quickLinks = [
    { 
      label: 'Home', 
      path: '/', 
      icon: Home,
      isActive: location.pathname === '/'
    },
    { 
      label: 'Search', 
      path: '/search', 
      icon: Search,
      isActive: location.pathname.startsWith('/search')
    },
    { 
      label: 'Favorites', 
      path: '/favorites', 
      icon: Heart,
      isActive: location.pathname === '/favorites'
    },
    { 
      label: 'Orders', 
      path: '/orders', 
      icon: History,
      isActive: location.pathname.startsWith('/order')
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardRoute = (userRole: string) => {
    const roleRoutes: Record<string, string> = {
      'seller': '/seller/dashboard',
      'admin': '/admin/dashboard',
      'customer': '/customer/dashboard',
      'delivery': '/delivery/dashboard',
      'realtor': '/realtor/dashboard',
      'house_agent': '/house-agent/dashboard',
      'house_owner': '/house-owner/dashboard',
      'employer': '/employer/dashboard',
      'job_seeker': '/job-seeker/dashboard',
      'artisan': '/artisan/dashboard',
    };
    
    return roleRoutes[userRole] || '/customer/dashboard';
  };

  const mobileMenuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Floating sparkles background */}
      <div className="fixed top-0 left-0 w-full h-20 pointer-events-none z-40 overflow-hidden">
        {sparklePositions.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Star className="w-2 h-2 text-yellow-400 fill-current" />
          </motion.div>
        ))}
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-500 relative overflow-hidden ${
          isScrolled 
            ? 'bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-xl shadow-2xl border-b border-gradient-to-r from-transparent via-gray-200 to-transparent' 
            : 'bg-gradient-to-r from-white/95 via-gray-50/90 to-white/95 backdrop-blur-lg shadow-xl border-b border-gradient-to-r from-transparent via-gray-100 to-transparent'
        } ${className}`}
      >
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"
          animate={{
            background: [
              'linear-gradient(90deg, rgba(220, 38, 38, 0.03) 0%, transparent 50%, rgba(185, 28, 28, 0.03) 100%)',
              'linear-gradient(90deg, rgba(185, 28, 28, 0.03) 0%, transparent 50%, rgba(220, 38, 38, 0.03) 100%)',
              'linear-gradient(90deg, rgba(220, 38, 38, 0.03) 0%, transparent 50%, rgba(185, 28, 28, 0.03) 100%)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-18">
            {/* Logo and Platform Switcher */}
            <div className="flex items-center space-x-6">
              {/* Enhanced Logo */}
              <motion.div
                whileHover={{ 
                  scale: 1.08,
                  rotate: [0, -2, 2, 0],
                  filter: "drop-shadow(0 0 20px rgba(220, 38, 38, 0.3))"
                }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center cursor-pointer group"
                onClick={() => navigate('/')}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Magical glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                <div className="relative flex items-center space-x-3">
                  <motion.img 
                    src="/logo/georgy-logo.png" 
                    alt="Georgy Marketplace Logo"
                    className="h-14 w-auto relative z-10 filter drop-shadow-lg"
                    whileHover={{ filter: "brightness(1.1) contrast(1.1)" }}
                  />
                  
                  {/* Sparkle effect on hover */}
                  <motion.div
                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: 0 }}
                    whileHover={{ 
                      scale: 1, 
                      rotate: 360,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Enhanced Platform Switcher - Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                {platforms.map((platform, index) => {
                  const Icon = platform.icon;
                  const isActive = currentPlatform === platform.key;
                  return (
                    <motion.div 
                      key={platform.key}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ 
                        scale: 1.08,
                        y: -2,
                        transition: { type: "spring", stiffness: 400 }
                      }} 
                      whileTap={{ scale: 0.95 }}
                      className="relative group"
                    >
                      {/* Glassmorphism background */}
                      {isActive && (
                        <motion.div
                          layoutId="platformHighlight"
                          className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 rounded-xl shadow-lg backdrop-blur-sm"
                          style={{
                            background: `linear-gradient(135deg, ${platform.color.replace('from-', 'rgba(').replace(' to-', ', 0.9) 0%, rgba(').replace('-600', '').replace('-500', '')}, 0.8) 100%)`
                          }}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPlatform(platform.key as any)}
                        className={`relative z-10 group px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm border ${
                          isActive 
                            ? 'text-white border-white/20 shadow-lg' 
                            : 'text-gray-700 border-transparent hover:border-gray-200/50 hover:bg-white/60 hover:backdrop-blur-md hover:shadow-md'
                        }`}
                      >
                        <motion.div 
                          className="flex items-center space-x-2"
                          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className={`w-4 h-4 transition-all duration-300 ${
                            isActive 
                              ? 'text-white drop-shadow-md' 
                              : 'text-gray-600 group-hover:text-primary group-hover:scale-110'
                          }`} />
                          <span className={`font-medium transition-all duration-300 ${
                            isActive 
                              ? 'text-white drop-shadow-md' 
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {platform.label}
                          </span>
                        </motion.div>
                        
                        {/* Lightning bolt effect for active platform */}
                        {isActive && (
                          <motion.div
                            className="absolute -top-1 -right-1 opacity-80"
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              repeatType: "reverse" 
                            }}
                          >
                            <Zap className="w-3 h-3 text-yellow-300 fill-current drop-shadow-md" />
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-5">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Enhanced Role-based Add Buttons */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.08,
                      y: -2,
                      filter: "drop-shadow(0 8px 25px rgba(220, 38, 38, 0.25))"
                    }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    {user.role === 'seller' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/seller/products/add')} 
                        className="group relative bg-gradient-to-r from-white to-gray-50 border-2 border-primary/20 hover:border-primary/40 hover:from-primary/5 hover:to-accent/5 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                      >
                        <motion.div
                          className="flex items-center space-x-2"
                          whileHover={{ x: 2 }}
                        >
                          <Plus className="w-4 h-4 text-primary transition-transform group-hover:rotate-90 group-hover:scale-110" />
                          <span className="font-medium text-gray-700 group-hover:text-gray-900">Add Product</span>
                        </motion.div>
                        
                        {/* Subtle glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Button>
                    ) : (user.role === 'realtor' || user.role === 'house_agent' || user.role === 'house_owner') ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/properties/add')} 
                        className="group relative bg-gradient-to-r from-white to-gray-50 border-2 border-primary/20 hover:border-primary/40 hover:from-primary/5 hover:to-accent/5 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                      >
                        <motion.div
                          className="flex items-center space-x-2"
                          whileHover={{ x: 2 }}
                        >
                          <Plus className="w-4 h-4 text-primary transition-transform group-hover:rotate-90 group-hover:scale-110" />
                          <span className="font-medium text-gray-700 group-hover:text-gray-900">Add Property</span>
                        </motion.div>
                        
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/register?type=seller')} 
                        className="group relative bg-gradient-to-r from-white to-gray-50 border-2 border-primary/20 hover:border-primary/40 hover:from-primary/5 hover:to-accent/5 rounded-xl px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                      >
                        <motion.div
                          className="flex items-center space-x-2"
                          whileHover={{ x: 2 }}
                        >
                          <Plus className="w-4 h-4 text-primary transition-transform group-hover:rotate-90 group-hover:scale-110" />
                          <span className="font-medium text-gray-700 group-hover:text-gray-900">Start Selling</span>
                        </motion.div>
                        
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Button>
                    )}
                  </motion.div>

                  {/* Enhanced Notifications */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.15,
                      y: -3,
                      filter: "drop-shadow(0 8px 25px rgba(239, 68, 68, 0.3))"
                    }} 
                    whileTap={{ scale: 0.9 }}
                    className="relative group"
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 border border-transparent hover:border-red-200/50 hover:shadow-lg backdrop-blur-sm"
                      onClick={() => navigate('/notifications')}
                    >
                      <motion.div
                        animate={notifications > 0 ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Bell className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
                      </motion.div>
                      
                      {notifications > 0 && (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ 
                              scale: 1,
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                              scale: { type: "spring", stiffness: 300 },
                              rotate: { duration: 2, repeat: Infinity }
                            }}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                          >
                            {notifications}
                          </motion.div>
                          
                          {/* Pulsing ring effect */}
                          <motion.div
                            className="absolute -top-1 -right-1 h-5 w-5 border-2 border-red-400 rounded-full"
                            animate={{
                              scale: [1, 1.4, 1],
                              opacity: [1, 0, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Enhanced Messages */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.15,
                      y: -3,
                      filter: "drop-shadow(0 8px 25px rgba(59, 130, 246, 0.3))"
                    }} 
                    whileTap={{ scale: 0.9 }}
                    className="relative group"
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-transparent hover:border-blue-200/50 hover:shadow-lg backdrop-blur-sm"
                      onClick={() => navigate('/messages')}
                    >
                      <motion.div
                        animate={messages > 0 ? { 
                          x: [0, -2, 2, 0],
                          rotate: [0, -5, 5, 0] 
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
                      >
                        <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                      </motion.div>
                      
                      {messages > 0 && (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ 
                              scale: 1,
                              y: [0, -2, 0]
                            }}
                            transition={{
                              scale: { type: "spring", stiffness: 300 },
                              y: { duration: 1.5, repeat: Infinity }
                            }}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                          >
                            {messages}
                          </motion.div>
                          
                          <motion.div
                            className="absolute -top-1 -right-1 h-5 w-5 border-2 border-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.8, 0.2, 0.8]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Enhanced Cart */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.15,
                      y: -3,
                      filter: "drop-shadow(0 8px 25px rgba(220, 38, 38, 0.3))"
                    }} 
                    whileTap={{ scale: 0.9 }}
                    className="relative group"
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 border border-transparent hover:border-primary/30 hover:shadow-lg backdrop-blur-sm" 
                      onClick={() => navigate('/cart')}
                    >
                      <motion.div
                        animate={itemCount > 0 ? {
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors duration-300" />
                      </motion.div>
                      
                      {itemCount > 0 && (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ 
                              scale: 1,
                              rotate: [0, -15, 15, 0]
                            }}
                            transition={{
                              scale: { type: "spring", stiffness: 400 },
                              rotate: { duration: 3, repeat: Infinity }
                            }}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-primary to-accent text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white"
                          >
                            {itemCount}
                          </motion.div>
                          
                          {/* Premium glow effect */}
                          <motion.div
                            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full"
                            animate={{
                              scale: [1, 1.6, 1],
                              opacity: [0.6, 0, 0.6]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Enhanced User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div 
                        whileHover={{ 
                          scale: 1.1,
                          y: -2,
                          filter: "drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))"
                        }} 
                        whileTap={{ scale: 0.95 }}
                        className="relative group"
                      >
                        <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-300">
                          {/* Magical ring effect */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity }
                            }}
                          />
                          
                          <Avatar className="h-10 w-10 relative z-10 ring-2 ring-white shadow-lg">
                            <AvatarImage 
                              src={user.avatar_url || undefined} 
                              alt={`${user.first_name} ${user.last_name}`}
                              className="object-cover" 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-accent text-white font-bold text-lg shadow-inner">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Online status indicator */}
                          <motion.div
                            className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.8, 1, 0.8]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(getDashboardRoute(user.role || 'customer'))}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Enhanced Sign In Button */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.08,
                      y: -2,
                      filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.1))"
                    }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/login')}
                      className="relative px-6 py-2 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-transparent hover:border-gray-200/50 transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                    >
                      <motion.span
                        whileHover={{ x: 2 }}
                        className="flex items-center"
                      >
                        Sign In
                      </motion.span>
                    </Button>
                  </motion.div>
                  
                  {/* Enhanced Post Ad Button */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.08,
                      y: -3,
                      filter: "drop-shadow(0 12px 30px rgba(220, 38, 38, 0.4))"
                    }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    {/* Magical glow background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl opacity-75 blur-sm"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.75, 0.9, 0.75]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/register?type=seller')} 
                      className="relative z-10 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 border-0 shadow-lg rounded-xl px-6 py-2 font-semibold text-white transition-all duration-300"
                    >
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ x: 2 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 90, 180, 270, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.div>
                        <span>Start Selling</span>
                      </motion.div>
                      
                      {/* Sparkle effects */}
                      <motion.div
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-yellow-300 fill-current" />
                      </motion.div>
                      
                      <motion.div
                        className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [360, 180, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1
                        }}
                      >
                        <Star className="w-2 h-2 text-yellow-200 fill-current" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 space-y-6">
                {/* User Section */}
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (user.role === 'seller') navigate('/seller/products/add');
                          else if (['realtor', 'house_agent', 'house_owner'].includes(user.role || '')) navigate('/properties/add');
                          else if (user.role === 'employer') navigate('/jobs/post');
                          else navigate('/register?type=seller');
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {user.role === 'seller' ? 'Add Product' : 
                         ['realtor', 'house_agent', 'house_owner'].includes(user.role || '') ? 'Add Property' :
                         user.role === 'employer' ? 'Post Job' : 'Start Selling'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/cart')}
                        className="w-full relative"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart
                        {itemCount > 0 && (
                          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {itemCount}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent" 
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                      Create Account
                    </Button>
                  </div>
                )}

                {/* Platform Switcher */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-600">Platforms</h3>
                  <div className="space-y-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <Button
                          key={platform.key}
                          variant={currentPlatform === platform.key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPlatform(platform.key as any)}
                          className={`w-full justify-start ${
                            currentPlatform === platform.key 
                              ? `bg-gradient-to-r ${platform.color} text-white border-0` 
                              : ''
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {platform.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-600">Quick Links</h3>
                  <div className="space-y-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Button
                          key={link.path}
                          variant={link.isActive ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => navigate(link.path)}
                          className="w-full justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {link.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* User Actions */}
                {user && (
                  <div className="space-y-3 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(getDashboardRoute(user.role || 'customer'))}
                      className="w-full justify-start"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/profile')}
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
