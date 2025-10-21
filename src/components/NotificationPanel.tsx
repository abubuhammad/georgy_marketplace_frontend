import React, { useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  X,
  Filter,
  Settings,
  MessageCircle,
  Package,
  Truck,
  Home,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useWebSocket();

  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat-message':
        return MessageCircle;
      case 'order-update':
        return Package;
      case 'delivery-location-update':
      case 'location-update':
        return Truck;
      case 'viewing-update':
        return Home;
      case 'product-review':
        return Eye;
      case 'account-status':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat-message':
        return 'text-blue-500';
      case 'order-update':
        return 'text-green-500';
      case 'delivery-location-update':
      case 'location-update':
        return 'text-orange-500';
      case 'viewing-update':
        return 'text-purple-500';
      case 'product-review':
        return 'text-indigo-500';
      case 'account-status':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) {
      return false;
    }
    if (showOnlyUnread && notification.isRead) {
      return false;
    }
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
  };

  const getUniqueTypes = () => {
    const types = [...new Set(notifications.map(n => n.type))];
    return types.map(type => ({
      value: type,
      label: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {isConnected ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5 text-gray-400" />
          )}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Notifications</h3>
              <Badge variant="secondary" className="text-xs">
                {unreadCount} unread
              </Badge>
              {!isConnected && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {/* Filter Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? 'bg-accent' : ''}
                  >
                    All Notifications
                  </DropdownMenuItem>
                  {getUniqueTypes().map((type) => (
                    <DropdownMenuItem
                      key={type.value}
                      onClick={() => setFilterType(type.value)}
                      className={filterType === type.value ? 'bg-accent' : ''}
                    >
                      {type.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                    className="flex items-center justify-between"
                  >
                    <span>Only Unread</span>
                    {showOnlyUnread ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={markAllNotificationsAsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center space-x-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>Mark All as Read</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={clearNotifications}
                    disabled={notifications.length === 0}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear All</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">
                {notifications.length === 0
                  ? 'No notifications yet'
                  : 'No notifications match your filters'
                }
              </p>
              {filterType !== 'all' || showOnlyUnread ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setFilterType('all');
                    setShowOnlyUnread(false);
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent',
                      !notification.isRead && 'bg-blue-50 border-l-2 border-blue-500'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn('mt-0.5', iconColor)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            notification.isRead ? 'text-gray-600' : 'text-gray-900'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <p className={cn(
                          'text-xs line-clamp-2',
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        )}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Connection Status */}
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center justify-center space-x-2 text-xs">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;