import React, { useEffect, useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHeroImage } from '@/hooks/useHeroImage';
import { SectionType } from '@/config/heroImages';

interface HeroSectionProps {
  currentPlatform?: 'ecommerce' | 'realestate' | 'jobs';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  section?: SectionType;
}

export const HeroSection: React.FC<HeroSectionProps> = memo(({
  currentPlatform,
  searchQuery,
  setSearchQuery,
  onSearch,
  section
}) => {

  // Map old platform prop to new section type for backward compatibility
  const getSectionFromPlatform = (platform?: string): SectionType => {
    switch (platform) {
      case 'ecommerce': return 'marketplace';
      case 'realestate': return 'realestate';
      case 'jobs': return 'jobs';
      default: return section || 'marketplace';
    }
  };

  const currentSection = getSectionFromPlatform(currentPlatform);
  const { 
    config, 
    imageSrc, 
    colorClasses, 
    gradientClass, 
    isLoading, 
    error
  } = useHeroImage(currentSection);

  // Memoize current content
  const currentContent = useMemo(() => config, [config]);

  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-gray-50">
      {/* Background Image - Optimized loading */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${imageSrc}')`,
          }}
        />
        <div className={`absolute inset-0 ${gradientClass}`} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white" />

            {/* Right Content - Search */}
            <div className="lg:pl-12 flex justify-end">
              <form onSubmit={onSearch} className="max-w-sm w-full">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-2 border border-white/20">
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder={config.placeholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-0 bg-transparent text-gray-800 placeholder:text-gray-500 text-base py-3 px-4 focus:ring-0 focus:outline-none"
                    />
                    <Button 
                      type="submit" 
                      className={`${colorClasses.primary.bg} ${colorClasses.primary.bgHover} px-4 py-3 rounded-xl font-semibold text-white shadow-lg`}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
});
