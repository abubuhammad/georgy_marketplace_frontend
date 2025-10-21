import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealTime } from '@/contexts/RealTimeContext';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className, 
  showLabel = false 
}) => {
  const { connectionStatus, connect } = useRealTime();
  const { connected, connecting, reconnectAttempts } = connectionStatus;

  const getStatusIcon = () => {
    if (connecting) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }
    if (connected) {
      return <Wifi className="h-3 w-3" />;
    }
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusColor = () => {
    if (connecting) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (connected) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = () => {
    if (connecting) {
      return reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts})` : 'Connecting...';
    }
    if (connected) {
      return 'Connected';
    }
    return 'Disconnected';
  };

  const handleRetryConnection = () => {
    if (!connected && !connecting) {
      connect();
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 cursor-pointer transition-colors",
        getStatusColor(),
        className
      )}
      onClick={handleRetryConnection}
      title={`Real-time connection: ${getStatusText()}`}
    >
      {getStatusIcon()}
      {showLabel && (
        <span className="text-xs font-medium">
          {getStatusText()}
        </span>
      )}
    </Badge>
  );
};

export default ConnectionStatus;
