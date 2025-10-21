export interface HeroImageConfig {
  image: string;
  title: {
    main: string;
    accent: string;
  };
  subtitle: string;
  placeholder: string;
  features: string[];
  bgGradient: string;
  accentColor: string;
  primaryColor: string;
}

export interface MarketplaceSection {
  marketplace: HeroImageConfig;
  realestate: HeroImageConfig;
  jobs: HeroImageConfig;
  artisan: HeroImageConfig;
}

export const HERO_IMAGES: MarketplaceSection = {
  marketplace: {
    image: '/images/hero-marketplace.png',
    title: {
      main: 'Find It.',
      accent: 'Love It'
    },
    subtitle: 'Discover amazing products and connect with trusted sellers in Nigeria\'s premier marketplace',
    placeholder: 'Search for products, brands, or categories...',
    features: ['Trusted Sellers', 'Secure Delivery', 'Great Deals', 'Quality Products'],
    bgGradient: 'from-transparent via-transparent to-transparent',
    accentColor: 'coral',
    primaryColor: 'teal'
  },
  realestate: {
    image: '/images/hero-realestate.png',
    title: {
      main: 'Find Your',
      accent: 'Dream Home'
    },
    subtitle: 'Discover premium properties and connect with certified real estate professionals across Nigeria',
    placeholder: 'Search for houses, apartments, or locations...',
    features: ['Verified Properties', 'Expert Agents', 'Best Locations', 'Fair Prices'],
    bgGradient: 'from-transparent via-transparent to-transparent',
    accentColor: 'amber',
    primaryColor: 'blue'
  },
  jobs: {
    image: '/images/hero-jobs.png',
    title: {
      main: 'Find Your',
      accent: 'Dream Job'
    },
    subtitle: 'Connect with top employers and discover career opportunities that match your skills and ambitions',
    placeholder: 'Search for jobs, companies, or skills...',
    features: ['Top Companies', 'Remote Work', 'Career Growth', 'Fair Salary'],
    bgGradient: 'from-transparent via-transparent to-transparent',
    accentColor: 'green',
    primaryColor: 'purple'
  },
  artisan: {
    image: '/images/hero-artisan.png',
    title: {
      main: 'Get It',
      accent: 'Done Right'
    },
    subtitle: 'Connect with skilled professionals for all your service needs - from repairs to beauty treatments',
    placeholder: 'Search for services, artisans, or skills...',
    features: ['Skilled Artisans', 'Quality Service', 'Real-time Tracking', 'Secure Payments'],
    bgGradient: 'from-transparent via-transparent to-transparent',
    accentColor: 'yellow',
    primaryColor: 'orange'
  }
};

export type SectionType = keyof MarketplaceSection;

export const DEFAULT_SECTION: SectionType = 'marketplace';