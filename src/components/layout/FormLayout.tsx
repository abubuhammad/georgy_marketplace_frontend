import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedNavigation } from '@/components/enhanced/EnhancedNavigation';
import { ModernFooter } from './ModernFooter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface FormLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  backUrl: string;
  backLabel: string;
  onSave?: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  title,
  subtitle,
  backUrl,
  backLabel,
  onSave,
  onPreview,
  isSaving = false,
  canSave = true,
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <EnhancedNavigation />
      
      {/* Form Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left side - Title and Back */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-1">{subtitle}</p>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              {onPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreview}
                  disabled={isSaving || !canSave}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={isSaving || !canSave}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {children}
      </main>
      
      <ModernFooter />
    </div>
  );
};