import { API_BASE_URL } from '@/config';

// Makurdi Zone Info
export interface MakurdiZone {
  code: string;
  name: string;
  areas: string[];
  baseFee: number;
  minFee: number;
  estimatedTime: number;
  center: {
    lat: number;
    lng: number;
  };
}

// Delivery Quote Request
export interface DeliveryQuoteRequest {
  pickupLocation: {
    lat: number;
    lng: number;
    address?: string;
    zone?: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address?: string;
    zone?: string;
  };
  weight?: number;
  packageValue: number;
  deliveryType: 'standard' | 'express' | 'same_day' | 'scheduled';
}

// Delivery Quote Response
export interface DeliveryQuoteResponse {
  success: boolean;
  quote?: {
    pickupZone: string;
    deliveryZone: string;
    distance: number;
    breakdown: {
      baseFee: number;
      distanceFee: number;
      weightFee: number;
      crossZoneFee: number;
      deliveryTypeMultiplier: number;
      insuranceFee: number;
      subtotal: number;
      platformFee: number;
    };
    totalFee: number;
    agentEarning: number;
    estimatedTime: string;
    estimatedArrival: string;
  };
  error?: string;
}

// Coverage Check Response
export interface CoverageCheckResponse {
  success: boolean;
  coverage: {
    isWithinCoverage: boolean;
    zone: {
      code: string;
      name: string;
      baseFee: number;
    } | null;
  };
}

// Delivery Settings
export interface DeliverySettings {
  minDeliveryFee: number;
  maxDeliveryFee: number;
  weightFreeLimit: number;
  weightSurchargePerKg: number;
  operatingHours: {
    start: string;
    end: string;
  };
  deliveryTypes: {
    type: string;
    multiplier: number;
    description: string;
  }[];
}

// Makurdi area coordinates (for geocoding fallback)
export const MAKURDI_AREAS: { [key: string]: { lat: number; lng: number; zone: string } } = {
  // North Bank
  'north bank': { lat: 7.7500, lng: 8.5167, zone: 'MKD-NB' },
  'gyado villa': { lat: 7.7520, lng: 8.5180, zone: 'MKD-NB' },
  'behind cbn': { lat: 7.7480, lng: 8.5150, zone: 'MKD-NB' },
  'welfare quarters': { lat: 7.7510, lng: 8.5200, zone: 'MKD-NB' },
  
  // Wurukum
  'wurukum': { lat: 7.7333, lng: 8.5333, zone: 'MKD-WK' },
  'modern market': { lat: 7.7300, lng: 8.5350, zone: 'MKD-WK' },
  'high level': { lat: 7.7350, lng: 8.5100, zone: 'MKD-WK' },
  'old gra': { lat: 7.7380, lng: 8.5120, zone: 'MKD-WK' },
  
  // Logo/Kanshio
  'logo': { lat: 7.7200, lng: 8.5400, zone: 'MKD-LG' },
  'logo i': { lat: 7.7200, lng: 8.5400, zone: 'MKD-LG' },
  'logo ii': { lat: 7.7180, lng: 8.5420, zone: 'MKD-LG' },
  'kanshio': { lat: 7.7220, lng: 8.5380, zone: 'MKD-LG' },
  'naka road': { lat: 7.7150, lng: 8.5450, zone: 'MKD-LG' },
  'federal housing': { lat: 7.7170, lng: 8.5430, zone: 'MKD-LG' },
  
  // Wadata
  'wadata': { lat: 7.7400, lng: 8.5200, zone: 'MKD-WD' },
  'ankpa quarters': { lat: 7.7420, lng: 8.5220, zone: 'MKD-WD' },
  'judges quarters': { lat: 7.7380, lng: 8.5180, zone: 'MKD-WD' },
  
  // UAM Area
  'university of agriculture': { lat: 7.7800, lng: 8.5600, zone: 'MKD-UA' },
  'uam': { lat: 7.7800, lng: 8.5600, zone: 'MKD-UA' },
  'agbadu': { lat: 7.7750, lng: 8.5550, zone: 'MKD-UA' },
  'single quarters': { lat: 7.7820, lng: 8.5620, zone: 'MKD-UA' },
  'staff quarters': { lat: 7.7780, lng: 8.5580, zone: 'MKD-UA' },
  
  // Industrial Layout
  'industrial layout': { lat: 7.7100, lng: 8.5100, zone: 'MKD-IL' },
  'bipc': { lat: 7.7120, lng: 8.5080, zone: 'MKD-IL' },
  'brewery': { lat: 7.7080, lng: 8.5120, zone: 'MKD-IL' },
  
  // Modern Market Area
  'railway': { lat: 7.7250, lng: 8.5280, zone: 'MKD-MM' },
  'gaadi': { lat: 7.7230, lng: 8.5260, zone: 'MKD-MM' },
  'clerk quarters': { lat: 7.7270, lng: 8.5240, zone: 'MKD-MM' },
  
  // High Level / New GRA
  'new gra': { lat: 7.7360, lng: 8.5090, zone: 'MKD-HL' },
  'government house': { lat: 7.7340, lng: 8.5070, zone: 'MKD-HL' },
  
  // Default Makurdi center
  'makurdi': { lat: 7.7333, lng: 8.5333, zone: 'MKD-WK' },
};

class MakurdiDeliveryApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/makurdi-delivery`;
  }

  /**
   * Get delivery quote based on pickup and delivery locations
   */
  async getDeliveryQuote(request: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery quote:', error);
      return {
        success: false,
        error: 'Failed to get delivery quote. Please try again.',
      };
    }
  }

  /**
   * Get all Makurdi delivery zones
   */
  async getZones(): Promise<{ success: boolean; zones: MakurdiZone[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/zones`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting zones:', error);
      return {
        success: false,
        zones: [],
        error: 'Failed to load delivery zones',
      };
    }
  }

  /**
   * Check if a location is within Makurdi delivery coverage
   */
  async checkCoverage(lat: number, lng: number): Promise<CoverageCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/check-coverage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking coverage:', error);
      return {
        success: false,
        coverage: {
          isWithinCoverage: false,
          zone: null,
        },
      };
    }
  }

  /**
   * Get delivery settings
   */
  async getSettings(): Promise<{ success: boolean; settings?: DeliverySettings; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        success: false,
        error: 'Failed to load delivery settings',
      };
    }
  }

  /**
   * Get coordinates from address (simple geocoding based on known Makurdi areas)
   */
  geocodeAddress(address: string, city: string): { lat: number; lng: number; zone?: string } | null {
    // Normalize the address
    const normalizedAddress = address.toLowerCase().trim();
    const normalizedCity = city.toLowerCase().trim();

    // Check if it's in Makurdi
    if (normalizedCity !== 'makurdi') {
      return null; // Outside Makurdi
    }

    // Try to find matching area
    for (const [areaName, coords] of Object.entries(MAKURDI_AREAS)) {
      if (normalizedAddress.includes(areaName)) {
        return coords;
      }
    }

    // Default to Makurdi center if address is in Makurdi but area not found
    return MAKURDI_AREAS['makurdi'];
  }

  /**
   * Calculate delivery fee (fallback when API is unavailable)
   */
  calculateFallbackFee(
    pickupZone: string,
    deliveryZone: string,
    packageValue: number,
    deliveryType: 'standard' | 'express' | 'same_day' | 'scheduled' = 'standard'
  ): number {
    // Base fees by zone
    const zoneFees: { [key: string]: number } = {
      'MKD-NB': 400,
      'MKD-WK': 350,
      'MKD-LG': 400,
      'MKD-WD': 350,
      'MKD-UA': 500,
      'MKD-IL': 450,
      'MKD-MM': 300,
      'MKD-HL': 350,
    };

    let baseFee = zoneFees[deliveryZone] || 350;

    // Cross-zone fee
    if (pickupZone !== deliveryZone) {
      baseFee += 150;
    }

    // Delivery type multiplier
    switch (deliveryType) {
      case 'express':
        baseFee *= 1.3;
        break;
      case 'same_day':
        baseFee *= 1.5;
        break;
    }

    // Insurance for high-value items
    if (packageValue > 50000) {
      baseFee += packageValue * 0.01;
    }

    return Math.round(baseFee);
  }
}

export const makurdiDeliveryApi = new MakurdiDeliveryApi();
export default makurdiDeliveryApi;
