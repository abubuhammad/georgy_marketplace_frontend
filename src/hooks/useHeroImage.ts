import { useState, useEffect } from 'react';
import { 
  getHeroImageConfig, 
  getImageWithFallback,
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
 */
export const useHeroImage = (section: SectionType = DEFAULT_SECTION): UseHeroImageReturn => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const config = getHeroImageConfig(section);
  const colorClasses = getColorClasses(section);
  const gradientClass = getGradientClass(section);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const imageUrl = await getImageWithFallback(section);
        setImageSrc(imageUrl);
      } catch (err) {
        setError('Failed to load hero image');
        console.error('Hero image loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [section]);

  return {
    section,
    config,
    imageSrc,
    colorClasses,
    gradientClass,
    isLoading,
    error
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