import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Search, ArrowRight, TrendingUp, Users, ShieldCheck, Star, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHeroImage } from '@/hooks/useHeroImage';
import { SectionType } from '@/config/heroImages';

interface HeroSectionProps {
  currentPlatform?: 'ecommerce' | 'realestate' | 'jobs';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  section?: SectionType; // New optional prop to override section detection
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentPlatform,
  searchQuery,
  setSearchQuery,
  onSearch,
  section
}) => {
  const controls = useAnimation();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Legacy platform content for backward compatibility
  const platformContent = {
    ecommerce: config,
    realestate: config,
    jobs: config
  };

  const currentContent = currentPlatform ? platformContent[currentPlatform] : config;

  const slides = [
    currentContent.title,
    "Nigeria's #1 Marketplace",
    "Join 50,000+ Happy Users"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls, currentPlatform]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingIcons = [
    { icon: "🛍️", x: "10%", y: "20%", delay: 0 },
    { icon: "🏠", x: "85%", y: "25%", delay: 1 },
    { icon: "💼", x: "15%", y: "70%", delay: 2 },
    { icon: "⭐", x: "80%", y: "75%", delay: 0.5 },
    { icon: "🚀", x: "50%", y: "15%", delay: 1.5 },
    { icon: "💎", x: "20%", y: "45%", delay: 2.5 },
  ];

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-gray-50">
      {/* Background Image with Overlay - Dynamic based on section */}
      <div className="absolute inset-0">
        {!isLoading && !error && imageSrc && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${imageSrc}')`,
            }}
          />
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse" />
        )}
        {error && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}
        <div className={`absolute inset-0 ${gradientClass}`} />
      </div>

      {/* Geometric Shapes - Dynamic based on section */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-32 h-32 ${colorClasses.accent.text}/20 rounded-full blur-xl animate-pulse`} />
        <div className={`absolute bottom-40 right-20 w-48 h-48 ${colorClasses.primary.text}/15 rounded-full blur-2xl animate-pulse delay-1000`} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-300/25 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      {/* Main Content - Minimized overlay */}
      <div className="relative z-10 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Empty space for cleaner look */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-white"
            >
              {/* Empty space - no brand title */}
            </motion.div>

            {/* Right Content - Minimal search only */}
            <motion.div
              variants={itemVariants}
              className="lg:pl-12 flex justify-end"
            >
              {/* Minimal Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <form onSubmit={onSearch} className="max-w-sm">
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
                        className={`${colorClasses.primary.bg} ${colorClasses.primary.bgHover} px-4 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
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
};
