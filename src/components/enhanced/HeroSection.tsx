import React, { memo, useMemo } from 'react';
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
    colorClasses
  } = useHeroImage(currentSection);

  const platformLabels = useMemo(() => ({
    marketplace: { cta: 'Shop Now', browse: 'Browse Products' },
    realestate: { cta: 'Find Property', browse: 'Browse Listings' },
    jobs: { cta: 'Find Jobs', browse: 'Browse Companies' },
    artisan: { cta: 'Find Services', browse: 'Browse Artisans' }
  }), []);

  const labels = platformLabels[currentSection] || platformLabels.marketplace;

  return (
    <div className="relative min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] overflow-hidden bg-gray-900">
      {/* Background Image with dark overlay for better text contrast */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${imageSrc}')` }}
        />
        {/* Dark overlay for better readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Main Content - Mobile First */}
      <div className="relative z-10 min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Content Container - Centered on mobile, split on desktop */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-row lg:justify-between lg:gap-12">
              
              {/* Hero Text Content */}
              <div className="w-full lg:w-1/2 mb-6 sm:mb-8 lg:mb-0">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                  <span className="block">{config.title.main}</span>
                  <span className={`block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent`}>
                    {config.title.accent}
                  </span>
                </h1>
                
                {/* Subtitle - Hidden on very small screens, shorter on mobile */}
                <p className="hidden sm:block text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {config.subtitle}
                </p>

                {/* Features Pills - Horizontal scroll on mobile */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6 sm:mb-8">
                  {config.features.slice(0, 4).map((feature, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs sm:text-sm text-white border border-white/20"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Search & CTA Container */}
              <div className="w-full lg:w-1/2 lg:max-w-md">
                {/* Search Bar */}
                <form onSubmit={onSearch} className="w-full mb-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-1.5 sm:p-2">
                    <div className="flex">
                      <Input
                        type="text"
                        placeholder={config.placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-0 bg-transparent text-gray-800 placeholder:text-gray-400 text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 focus:ring-0 focus:outline-none"
                      />
                      <Button 
                        type="submit" 
                        className={`${colorClasses.primary.bg} ${colorClasses.primary.bgHover} px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white shadow-lg flex-shrink-0`}
                      >
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </div>
                </form>

                {/* CTA Buttons - Stack on mobile, row on larger screens */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button 
                    size="lg"
                    className="w-full sm:flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base rounded-xl shadow-lg"
                    onClick={() => {
                      const paths: Record<string, string> = {
                        marketplace: '/products',
                        realestate: '/properties',
                        jobs: '/jobs',
                        artisan: '/artisan-connect'
                      };
                      window.location.href = paths[currentSection] || '/products';
                    }}
                  >
                    {labels.cta}
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full sm:flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold py-3 sm:py-4 text-sm sm:text-base rounded-xl"
                    onClick={() => {
                      const paths: Record<string, string> = {
                        marketplace: '/products',
                        realestate: '/properties',
                        jobs: '/jobs',
                        artisan: '/artisan-connect'
                      };
                      window.location.href = paths[currentSection] || '/products';
                    }}
                  >
                    {labels.browse}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave - Smaller on mobile */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 sm:h-12 lg:h-16 fill-white">
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
});
