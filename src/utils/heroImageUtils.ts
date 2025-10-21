import { HERO_IMAGES, SectionType, DEFAULT_SECTION, HeroImageConfig } from '../config/heroImages';

/**
 * Get hero image configuration based on section type
 */
export const getHeroImageConfig = (section: SectionType): HeroImageConfig => {
  return HERO_IMAGES[section] || HERO_IMAGES[DEFAULT_SECTION];
};

/**
 * Determine section type from current pathname
 */
export const getSectionFromPath = (pathname: string): SectionType => {
  const path = pathname.toLowerCase();
  
  if (path.includes('/realestate') || path.includes('/real-estate') || path.includes('/properties')) {
    return 'realestate';
  }
  
  if (path.includes('/jobs') || path.includes('/careers') || path.includes('/employment')) {
    return 'jobs';
  }
  
  if (path.includes('/artisan') || path.includes('/services')) {
    return 'artisan';
  }
  
  // Default to marketplace for root, products, shop, etc.
  return 'marketplace';
};

/**
 * Get CSS classes for dynamic colors based on section
 */
export const getColorClasses = (section: SectionType) => {
  const config = getHeroImageConfig(section);
  const { accentColor, primaryColor } = config;
  
  return {
    accent: {
      bg: `bg-${accentColor}-500`,
      bgHover: `hover:bg-${accentColor}-600`,
      text: `text-${accentColor}-400`,
      border: `border-${accentColor}-400`,
    },
    primary: {
      bg: `bg-${primaryColor}-600`,
      bgHover: `hover:bg-${primaryColor}-700`,
      text: `text-${primaryColor}-400`,
      border: `border-${primaryColor}-400`,
    }
  };
};

/**
 * Check if an image exists (for fallback handling)
 */
export const checkImageExists = async (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

/**
 * Get fallback image if the primary image doesn't exist
 */
export const getImageWithFallback = async (section: SectionType): Promise<string> => {
  const config = getHeroImageConfig(section);
  const imageExists = await checkImageExists(config.image);
  
  if (imageExists) {
    return config.image;
  }
  
  // Fallback to marketplace image if the specific section image doesn't exist
  const fallbackConfig = getHeroImageConfig('marketplace');
  return fallbackConfig.image;
};

/**
 * Generate dynamic gradient classes
 */
export const getGradientClass = (section: SectionType): string => {
  const config = getHeroImageConfig(section);
  return `bg-gradient-to-r ${config.bgGradient}`;
};