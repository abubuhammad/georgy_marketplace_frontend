import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, Search, Settings, Plus, BarChart3, 
  Calendar, Clock, TrendingUp, Zap, Star, Sparkles,
  User, ChevronDown, LogOut, Shield, Crown, Gem, Briefcase, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuthContext } from '@/contexts/AuthContext';

interface DashboardAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

interface EnhancedDashboardHeaderProps {
  title: string;
  subtitle?: string;
  user?: any;
  actions?: DashboardAction[];
  notifications?: number;
  messages?: number;
  showSearch?: boolean;
  stats?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }[];
  className?: string;
}

export const EnhancedDashboardHeader: React.FC<EnhancedDashboardHeaderProps> = ({
  title,
  subtitle,
  user,
  actions = [],
  notifications = 0,
  messages = 0,
  showSearch = true,
  stats = [],
  className = ""
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sparklePositions] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }))
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Role-based styling
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          gradient: 'from-purple-600 via-purple-700 to-indigo-800',
          accentGradient: 'from-purple-400 to-indigo-500',
          icon: Crown,
          badge: 'Admin',
          badgeColor: 'bg-purple-500',
          glowColor: 'purple'
        };
      case 'seller':
        return {
          gradient: 'from-green-600 via-emerald-600 to-teal-700',
          accentGradient: 'from-green-400 to-emerald-500',
          icon: Gem,
          badge: 'Seller',
          badgeColor: 'bg-green-500',
          glowColor: 'green'
        };
      case 'customer':
      case 'buyer':
        return {
          gradient: 'from-blue-600 via-cyan-600 to-blue-700',
          accentGradient: 'from-blue-400 to-cyan-500',
          icon: Star,
          badge: 'Customer',
          badgeColor: 'bg-blue-500',
          glowColor: 'blue'
        };
      case 'employer':
        return {
          gradient: 'from-orange-600 via-amber-600 to-orange-700',
          accentGradient: 'from-orange-400 to-amber-500',
          icon: Briefcase,
          badge: 'Employer',
          badgeColor: 'bg-orange-500',
          glowColor: 'orange'
        };
      case 'job_seeker':
        return {
          gradient: 'from-indigo-600 via-purple-600 to-indigo-700',
          accentGradient: 'from-indigo-400 to-purple-500',
          icon: Target,
          badge: 'Job Seeker',
          badgeColor: 'bg-indigo-500',
          glowColor: 'indigo'
        };
      case 'realtor':
      case 'house_agent':
      case 'house_owner':
        return {
          gradient: 'from-teal-600 via-cyan-600 to-teal-700',
          accentGradient: 'from-teal-400 to-cyan-500',
          icon: Shield,
          badge: role === 'realtor' ? 'Realtor' : role === 'house_agent' ? 'House Agent' : 'House Owner',
          badgeColor: 'bg-teal-500',
          glowColor: 'teal'
        };
      default:
        return {
          gradient: 'from-gray-600 via-gray-700 to-gray-800',
          accentGradient: 'from-gray-400 to-gray-500',
          icon: User,
          badge: 'User',
          badgeColor: 'bg-gray-500',
          glowColor: 'gray'
        };
    }
  };

  const roleConfig = getRoleConfig(user?.role || 'customer');
  const RoleIcon = roleConfig.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {sparklePositions.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400 fill-current drop-shadow-lg" />
          </motion.div>
        ))}
      </div>

      {/* Main header container */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative bg-gradient-to-r ${roleConfig.gradient} text-white shadow-2xl`}
      >
        {/* Animated background overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"
          animate={{
            background: [
              'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
              'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)'
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Geometric decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className={`absolute top-4 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className={`absolute bottom-4 left-16 w-24 h-24 bg-white/5 rounded-full blur-lg`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left section - Title and user info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex-1"
            >
              <div className="flex items-center space-x-4 mb-2">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`p-3 rounded-xl bg-gradient-to-r ${roleConfig.accentGradient} shadow-lg`}
                >
                  <RoleIcon className="w-8 h-8 text-white drop-shadow-md" />
                </motion.div>
                
                <div>
                  <motion.h1 
                    className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-lg"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {title}
                  </motion.h1>
                  
                  {subtitle && (
                    <p className="text-white/90 text-lg font-medium drop-shadow-md">
                      {subtitle}
                    </p>
                  )}
                </div>

                {/* Role badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Badge className={`${roleConfig.badgeColor} text-white px-3 py-1 font-semibold shadow-lg`}>
                    {roleConfig.badge}
                  </Badge>
                </motion.div>
              </div>

              {/* User greeting with time */}
              <div className="flex items-center space-x-4 text-white/90">
                <motion.div
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                </motion.div>
                <div className="hidden md:flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(currentTime)}</span>
                </div>
              </div>

              {/* Quick stats */}
              {stats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center space-x-6 mt-4"
                >
                  {stats.slice(0, 3).map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
                    >
                      <div className="text-xs text-white/70 uppercase tracking-wide">{stat.label}</div>
                      <div className="text-lg font-bold text-white flex items-center space-x-1">
                        <span>{stat.value}</span>
                        {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-300" />}
                        {stat.trend === 'down' && <TrendingUp className="w-3 h-3 text-red-300 rotate-180" />}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Right section - Search and actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              {/* Search bar */}
              {showSearch && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search dashboard..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-white/95 backdrop-blur-sm border-white/30 text-gray-800 placeholder-gray-500 rounded-xl shadow-lg"
                  />
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={action.variant || "secondary"}
                        size="sm"
                        onClick={action.onClick}
                        className={`bg-white/90 hover:bg-white text-gray-800 border-white/50 shadow-lg backdrop-blur-sm ${action.className || ''}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </Button>
                    </motion.div>
                  );
                })}

                {/* Notifications */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white text-gray-800 p-2 shadow-lg backdrop-blur-sm"
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                      >
                        {notifications > 99 ? '99+' : notifications}
                      </motion.div>
                    )}
                  </Button>
                </motion.div>

                {/* Messages */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white text-gray-800 p-2 shadow-lg backdrop-blur-sm"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {messages > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                      >
                        {messages > 99 ? '99+' : messages}
                      </motion.div>
                    )}
                  </Button>
                </motion.div>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="secondary"
                        className="bg-white/90 hover:bg-white text-gray-800 pl-2 pr-3 py-2 shadow-lg backdrop-blur-sm"
                      >
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className={`${roleConfig.badgeColor} text-white text-xs`}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${roleConfig.accentGradient} shadow-lg`} />
      </motion.div>
    </div>
  );
};