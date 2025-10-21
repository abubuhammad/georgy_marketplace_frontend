import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationPanel from './NotificationPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Settings,
  Package,
  BarChart3,
  Truck,
  Home,
  Building,
  Users,
  ShoppingBag,
  Bell,
  Heart,
  UserCircle,
  Store,
  TrendingUp,
  Calendar,
  MapPin,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Role-based navigation items
  const getRoleBasedNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    ];

    switch (user.role) {
      case 'SELLER':
        return [
          ...baseItems,
          { href: '/seller/products', label: 'Products', icon: Package },
          { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
          { href: '/seller/analytics', label: 'Analytics', icon: TrendingUp },
          { href: '/seller/earnings', label: 'Earnings', icon: Target },
          { href: '/seller/settings', label: 'Store Settings', icon: Store },
        ];

      case 'ADMIN':
        return [
          ...baseItems,
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/vendors', label: 'Vendors', icon: Store },
          { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
          { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ];

      case 'DELIVERY_AGENT':
        return [
          ...baseItems,
          { href: '/delivery/shipments', label: 'Shipments', icon: Truck },
          { href: '/delivery/routes', label: 'Routes', icon: MapPin },
          { href: '/delivery/earnings', label: 'Earnings', icon: Target },
          { href: '/delivery/schedule', label: 'Schedule', icon: Calendar },
        ];

      case 'REALTOR':
        return [
          ...baseItems,
          { href: '/realtor/properties', label: 'Properties', icon: Building },
          { href: '/realtor/viewings', label: 'Viewings', icon: Calendar },
          { href: '/realtor/clients', label: 'Clients', icon: Users },
          { href: '/realtor/analytics', label: 'Market Insights', icon: TrendingUp },
        ];

      default:
        return baseItems;
    }
  };

  const roleNavItems = getRoleBasedNavItems();

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      SELLER: 'Seller',
      ADMIN: 'Admin',
      DELIVERY_AGENT: 'Delivery Agent',
      REALTOR: 'Realtor',
      BUYER: 'Buyer',
      USER: 'User',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      SELLER: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-red-100 text-red-800',
      DELIVERY_AGENT: 'bg-green-100 text-green-800',
      REALTOR: 'bg-purple-100 text-purple-800',
      BUYER: 'bg-gray-100 text-gray-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/logo/georgy-logo.png" 
                  alt="Georgy Marketplace Logo"
                  className="h-14 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={cn(
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  isActivePath('/') && location.pathname === '/' && 'border-red-500 text-gray-900'
                )}
              >
                Home
              </Link>
              
              <Link
                to="/marketplace"
                className={cn(
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  isActivePath('/marketplace') && 'border-red-500 text-gray-900'
                )}
              >
                Marketplace
              </Link>

              <Link
                to="/properties"
                className={cn(
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  isActivePath('/properties') && 'border-red-500 text-gray-900'
                )}
              >
                Properties
              </Link>

              {user && roleNavItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-auto',
                        (roleNavItems.some(item => isActivePath(item.href))) && 'border-red-500 text-gray-900'
                      )}
                    >
                      {getRoleDisplayName(user.role)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {roleNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              'flex items-center space-x-2',
                              isActivePath(item.href) && 'bg-red-50 text-red-900'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Search products..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            {/* Cart (for buyers) */}
            {(!user || user.role === 'BUYER' || user.role === 'USER') && (
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  2
                </Badge>
              </Button>
            )}

            {/* Notifications (for authenticated users) */}
            {user && <NotificationPanel />}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge className={cn("w-fit mt-1 text-xs", getRoleColor(user.role))}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Role-specific quick actions */}
                  {user.role !== 'BUYER' && user.role !== 'USER' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {(user.role === 'BUYER' || user.role === 'USER') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/wishlist" className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-red-600 hover:bg-red-700" size="sm">
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Navigate through the marketplace
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <nav className="flex flex-col space-y-2">
                      <Link
                        to="/"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home className="mr-3 h-5 w-5" />
                        Home
                      </Link>
                      <Link
                        to="/marketplace"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingBag className="mr-3 h-5 w-5" />
                        Marketplace
                      </Link>
                      <Link
                        to="/properties"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Building className="mr-3 h-5 w-5" />
                        Properties
                      </Link>

                      {user && roleNavItems.length > 0 && (
                        <>
                          <div className="border-t pt-4 mt-4">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {getRoleDisplayName(user.role)} Menu
                            </h3>
                            <div className="mt-2 space-y-1">
                              {roleNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;