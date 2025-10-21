import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { User as UserType } from '@/types';

interface UserDropdownProps {
  user: UserType;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const getDashboardRoute = (userRole: string) => {
    switch (userRole) {
      case 'seller':
        return '/seller/dashboard';
      case 'admin':
        return '/admin';
      case 'customer':
        return '/customer/dashboard';
      case 'delivery':
        return '/delivery/dashboard';
      case 'realtor':
        return '/realtor/dashboard';
      case 'house_agent':
        return '/house-agent/dashboard';
      case 'house_owner':
        return '/house-owner/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'job_seeker':
        return '/job-seeker/dashboard';
      case 'artisan':
        return '/artisan/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-sm font-medium text-gray-700">
                {user.first_name}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={() => navigate(getDashboardRoute(user.role))}
          className="cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          My Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
