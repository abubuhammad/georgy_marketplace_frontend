import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSection } from '@/components/enhanced/HeroSection';
import { SectionType } from '@/config/heroImages';
import { Badge } from '@/components/ui/badge';

/**
 * Demo component to test different hero image sections
 * This component allows you to switch between marketplace, realestate, and jobs
 * to see how the hero images and content change dynamically
 */
const HeroImageDemo: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<SectionType>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // In a real app, this would navigate to search results
  };

  const sections: { key: SectionType; label: string; description: string; color: string }[] = [
    {
      key: 'marketplace',
      label: 'Marketplace',
      description: 'E-commerce section with teal/coral theme',
      color: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    {
      key: 'realestate',
      label: 'Real Estate',
      description: 'Property section with blue/amber theme',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      key: 'jobs',
      label: 'Jobs',
      description: 'Career section with purple/green theme',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hero Image Demo</span>
                <Badge variant="outline" className="text-xs">
                  Current: {currentSection}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Click the buttons below to switch between different marketplace sections and see how 
                the hero images, colors, and content change automatically.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {sections.map((section) => (
                  <Button
                    key={section.key}
                    variant={currentSection === section.key ? "default" : "outline"}
                    onClick={() => setCurrentSection(section.key)}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="font-semibold">{section.label}</span>
                    <span className="text-xs opacity-75 mt-1">{section.description}</span>
                  </Button>
                ))}
              </div>
              
              {/* Current Section Info */}
              <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Current Section Details:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Image:</span>
                    <br />
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      /images/hero-{currentSection}.png
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Theme:</span>
                    <br />
                    <Badge className={sections.find(s => s.key === currentSection)?.color}>
                      {sections.find(s => s.key === currentSection)?.description}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Auto-detection:</span>
                    <br />
                    <span className="text-xs text-gray-600">
                      Normally detects from URL path
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hero Section Demo */}
      <HeroSection
        section={currentSection}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Instructions */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>How to Add Your PNG Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-teal-600">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Marketplace Image</h3>
                  <p className="text-sm text-gray-600">
                    Your current image should be at:<br />
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      public/images/hero-marketplace.png
                    </code>
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Real Estate Image</h3>
                  <p className="text-sm text-gray-600">
                    Add your real estate hero image as:<br />
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      public/images/hero-realestate.png
                    </code>
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Jobs Image</h3>
                  <p className="text-sm text-gray-600">
                    Add your jobs hero image as:<br />
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      public/images/hero-jobs.png
                    </code>
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-yellow-700">
                  Once you add the PNG images, the system will automatically use them when users 
                  navigate to different sections of your marketplace. The colors, text, and 
                  features will also change to match each section's theme.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroImageDemo;