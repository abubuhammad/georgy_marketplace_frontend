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
    <div className="flex flex-col">
      {/* Hero Image Section - Full image display without cropping */}
      <section className="relative w-full" aria-label="Hero banner">
        <img 
          src={imageSrc}
          alt="Hero"
          className="w-full h-auto object-contain"
        />
      </section>

      {/* Hero Search Section - Below the hero image */}
      <section className="hero-search w-full bg-white py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8" aria-label="Search and navigation">
        <div className="max-w-3xl mx-auto">
          {/* Search Bar */}
          <form onSubmit={onSearch} className="w-full mb-4 sm:mb-6" role="search" aria-label="Search products">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-1.5 sm:p-2">
              <div className="flex">
                <Input
                  type="text"
                  placeholder={config.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-gray-800 placeholder:text-gray-400 text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 focus:ring-0 focus:outline-none"
                  aria-label="Search input"
                />
                <Button 
                  type="submit" 
                  className={`${colorClasses.primary.bg} ${colorClasses.primary.bgHover} px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white shadow-md flex-shrink-0`}
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
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
              className="w-full sm:flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 sm:py-4 text-sm sm:text-base rounded-xl"
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

          {/* Features Pills */}
          <nav className="flex flex-wrap justify-center gap-2 mt-4 sm:mt-6" aria-label="Features">
            {config.features.slice(0, 4).map((feature, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-700"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" aria-hidden="true" />
                {feature}
              </span>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
});
