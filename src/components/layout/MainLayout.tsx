import React from 'react';
import { EnhancedNavigation } from '@/components/enhanced/EnhancedNavigation';
import { ModernFooter } from './ModernFooter';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <EnhancedNavigation />
      <main className="flex-1">{children}</main>
      <ModernFooter />
    </div>
  );
};