import { useState, useEffect, useMemo } from 'react';
import { 
  getHeroImageConfig, 
  getColorClasses,
  getGradientClass
} from '../utils/heroImageUtils';
import { SectionType, HeroImageConfig, DEFAULT_SECTION } from '../config/heroImages';

export interface UseHeroImageReturn {
  section: SectionType;
  config: HeroImageConfig;
  imageSrc: string;
  colorClasses: ReturnType<typeof getColorClasses>;
  gradientClass: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage hero images and configuration based on section
 * Optimized: Direct image URL without async check for faster loading
 */
export const useHeroImage = (section: SectionType = DEFAULT_SECTION): UseHeroImageReturn => {
  const config = useMemo(() => getHeroImageConfig(section), [section]);
  const colorClasses = useMemo(() => getColorClasses(section), [section]);
  const gradientClass = useMemo(() => getGradientClass(section), [section]);
  
  // Use image directly without async check - faster initial load
  const imageSrc = config.image;

  return {
    section,
    config,
    imageSrc,
    colorClasses,
    gradientClass,
    isLoading: false,
    error: null
  };
};

/**
 * Hook specifically for getting hero configuration without image loading
 * (useful for components that only need text/color configuration)
 */
export const useHeroConfig = (section: SectionType = DEFAULT_SECTION) => {
  // Use the provided section directly
  const config = getHeroImageConfig(section);
  const colorClasses = getColorClasses(section);
  const gradientClass = getGradientClass(section);

  return {
    section,
    config,
    colorClasses,
    gradientClass
  };
};