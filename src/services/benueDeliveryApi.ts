import { API_BASE_URL } from '@/config';

// ============== TYPES ==============

export interface BenueZone {
  code: string;
  name: string;
  state: string;
  type: 'polygon' | 'centroid-fallback';
  center: { lat: number; lng: number };
  radius_km?: number;
  headquarters?: string;
  pricing: {
    base_fee_ngn: number;
    per_km_rate_ngn: number;
    min_fee_ngn: number;
    max_fee_ngn: number;
  };
  delivery_types: string[];
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
}

export interface DeliveryQuoteRequest {
  cart_id: string;
  subtotal_ngn: number;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    weight_kg?: number;
    dimensions?: {
      length_cm: number;
      width_cm: number;
      height_cm: number;
    };
    pickup_location_id: string;
    pickup_coords?: { lat: number; lng: number };
  }>;
  payment_method: 'card' | 'bank_transfer' | 'cod' | 'mobile_money';
  pickup_coords?: { lat: number; lng: number };
  delivery_coords: { lat: number; lng: number };
  delivery_type: 'standard' | 'express' | 'same_day' | 'scheduled';
  requested_at?: string;
}

export interface PriceBreakdownItem {
  name: string;
  amount: number;
}

export interface DeliveryOption {
  id: string;
  label: string;
  price_ngn: number;
  price_breakdown: PriceBreakdownItem[];
  estimated_eta_minutes: { min: number; max: number };
  eta_friendly: string;
  applied_rules: string[];
  tags: string[];
  is_available: boolean;
  suspension_reason?: string;
}

export interface DeliveryQuoteResponse {
  cart_id: string;
  currency: string;
  effective_weight_kg: number;
  distance_km: number;
  delivery_options: DeliveryOption[];
  per_shipment_fees?: Array<{
    pickup_location_id: string;
    pickup_zone: string;
    delivery_zone: string;
    distance_km: number;
    fee_breakdown: PriceBreakdownItem[];
    subtotal_ngn: number;
    applied_rules: string[];
  }>;
  grand_total_ngn: number;
  _fallback?: boolean;
  _error?: string;
}

// ============== BENUE LGA DATA ==============

// All Benue LGAs with their coordinates for geocoding
export const BENUE_LGAS: { [key: string]: { lat: number; lng: number; code: string; name: string } } = {
  // Makurdi (capital) - most detailed
  'makurdi': { lat: 7.7333, lng: 8.5333, code: 'BN-MKD', name: 'Makurdi' },
  'wurukum': { lat: 7.7333, lng: 8.5333, code: 'MKD-WK', name: 'Wurukum' },
  'north bank': { lat: 7.7500, lng: 8.5167, code: 'MKD-NB', name: 'North Bank' },
  'high level': { lat: 7.7350, lng: 8.5100, code: 'MKD-HL', name: 'High Level' },
  'modern market': { lat: 7.7250, lng: 8.5250, code: 'MKD-MM', name: 'Modern Market' },
  'wadata': { lat: 7.7400, lng: 8.5200, code: 'MKD-WD', name: 'Wadata' },
  'logo': { lat: 7.7200, lng: 8.5400, code: 'MKD-LG', name: 'Logo' },
  'industrial layout': { lat: 7.7100, lng: 8.5100, code: 'MKD-IL', name: 'Industrial Layout' },
  'uam': { lat: 7.7800, lng: 8.5600, code: 'MKD-UA', name: 'UAM Area' },
  'university of agriculture': { lat: 7.7800, lng: 8.5600, code: 'MKD-UA', name: 'UAM Area' },
  
  // Other LGAs
  'ado': { lat: 7.2500, lng: 7.6500, code: 'BN-ADO', name: 'Ado' },
  'igumale': { lat: 7.2500, lng: 7.6500, code: 'BN-ADO', name: 'Ado' },
  'agatu': { lat: 7.9333, lng: 7.7833, code: 'BN-AGT', name: 'Agatu' },
  'obagaji': { lat: 7.9333, lng: 7.7833, code: 'BN-AGT', name: 'Agatu' },
  'apa': { lat: 7.8833, lng: 7.9167, code: 'BN-APA', name: 'Apa' },
  'ugbokpo': { lat: 7.8833, lng: 7.9167, code: 'BN-APA', name: 'Apa' },
  'buruku': { lat: 7.5000, lng: 9.2333, code: 'BN-BUR', name: 'Buruku' },
  'gboko': { lat: 7.3167, lng: 9.0000, code: 'BN-GBS', name: 'Gboko' },
  'guma': { lat: 7.8500, lng: 8.5500, code: 'BN-GUM', name: 'Guma' },
  'gbajimba': { lat: 7.8500, lng: 8.5500, code: 'BN-GUM', name: 'Guma' },
  'gwer east': { lat: 7.5167, lng: 8.7500, code: 'BN-GWR', name: 'Gwer East' },
  'aliade': { lat: 7.5167, lng: 8.7500, code: 'BN-GWR', name: 'Gwer East' },
  'gwer west': { lat: 7.5500, lng: 8.4500, code: 'BN-GWW', name: 'Gwer West' },
  'naka': { lat: 7.5500, lng: 8.4500, code: 'BN-GWW', name: 'Gwer West' },
  'katsina-ala': { lat: 7.1667, lng: 9.2833, code: 'BN-KTN', name: 'Katsina-Ala' },
  'konshisha': { lat: 7.0833, lng: 9.0667, code: 'BN-KNS', name: 'Konshisha' },
  'kwande': { lat: 6.9000, lng: 9.1667, code: 'BN-KWD', name: 'Kwande' },
  'adikpo': { lat: 6.9000, lng: 9.1667, code: 'BN-KWD', name: 'Kwande' },
  'logo lga': { lat: 7.0333, lng: 9.4500, code: 'BN-LOG', name: 'Logo' },
  'ugba': { lat: 7.0333, lng: 9.4500, code: 'BN-LOG', name: 'Logo' },
  'obi': { lat: 7.4833, lng: 8.3167, code: 'BN-OBI', name: 'Obi' },
  'ogbadibo': { lat: 7.1667, lng: 7.8500, code: 'BN-OGB', name: 'Ogbadibo' },
  'otukpa': { lat: 7.1667, lng: 7.8500, code: 'BN-OGB', name: 'Ogbadibo' },
  'ohimini': { lat: 7.6333, lng: 8.0167, code: 'BN-OHM', name: 'Ohimini' },
  'idekpa': { lat: 7.6333, lng: 8.0167, code: 'BN-OHM', name: 'Ohimini' },
  'oju': { lat: 7.0833, lng: 8.4167, code: 'BN-OJU', name: 'Oju' },
  'okpokwu': { lat: 7.0500, lng: 7.9833, code: 'BN-OKP', name: 'Okpokwu' },
  'okpoga': { lat: 7.0500, lng: 7.9833, code: 'BN-OKP', name: 'Okpokwu' },
  'otukpo': { lat: 7.1833, lng: 8.1333, code: 'BN-OTK', name: 'Otukpo' },
  'tarka': { lat: 7.5167, lng: 8.9333, code: 'BN-TAR', name: 'Tarka' },
  'wannune': { lat: 7.5167, lng: 8.9333, code: 'BN-TAR', name: 'Tarka' },
  'ukum': { lat: 6.9500, lng: 9.3500, code: 'BN-UKM', name: 'Ukum' },
  'sankera': { lat: 6.9500, lng: 9.3500, code: 'BN-UKM', name: 'Ukum' },
  'ushongo': { lat: 7.1833, lng: 9.1500, code: 'BN-USH', name: 'Ushongo' },
  'lessel': { lat: 7.1833, lng: 9.1500, code: 'BN-USH', name: 'Ushongo' },
  'vandeikya': { lat: 6.7833, lng: 9.0833, code: 'BN-VDY', name: 'Vandeikya' },
};

// LGA options for dropdowns (sorted alphabetically)
export const BENUE_LGA_OPTIONS = [
  { value: 'ado', label: 'Ado', code: 'BN-ADO' },
  { value: 'agatu', label: 'Agatu', code: 'BN-AGT' },
  { value: 'apa', label: 'Apa', code: 'BN-APA' },
  { value: 'buruku', label: 'Buruku', code: 'BN-BUR' },
  { value: 'gboko', label: 'Gboko', code: 'BN-GBS' },
  { value: 'guma', label: 'Guma', code: 'BN-GUM' },
  { value: 'gwer east', label: 'Gwer East', code: 'BN-GWR' },
  { value: 'gwer west', label: 'Gwer West', code: 'BN-GWW' },
  { value: 'katsina-ala', label: 'Katsina-Ala', code: 'BN-KTN' },
  { value: 'konshisha', label: 'Konshisha', code: 'BN-KNS' },
  { value: 'kwande', label: 'Kwande', code: 'BN-KWD' },
  { value: 'logo lga', label: 'Logo', code: 'BN-LOG' },
  { value: 'makurdi', label: 'Makurdi', code: 'BN-MKD' },
  { value: 'obi', label: 'Obi', code: 'BN-OBI' },
  { value: 'ogbadibo', label: 'Ogbadibo', code: 'BN-OGB' },
  { value: 'ohimini', label: 'Ohimini', code: 'BN-OHM' },
  { value: 'oju', label: 'Oju', code: 'BN-OJU' },
  { value: 'okpokwu', label: 'Okpokwu', code: 'BN-OKP' },
  { value: 'otukpo', label: 'Otukpo', code: 'BN-OTK' },
  { value: 'tarka', label: 'Tarka', code: 'BN-TAR' },
  { value: 'ukum', label: 'Ukum', code: 'BN-UKM' },
  { value: 'ushongo', label: 'Ushongo', code: 'BN-USH' },
  { value: 'vandeikya', label: 'Vandeikya', code: 'BN-VDY' },
];

// Makurdi area options (sub-zones within Makurdi)
export const MAKURDI_AREA_OPTIONS = [
  { value: 'high level', label: 'High Level / New GRA', code: 'MKD-HL' },
  { value: 'industrial layout', label: 'Industrial Layout', code: 'MKD-IL' },
  { value: 'logo', label: 'Logo / Kanshio', code: 'MKD-LG' },
  { value: 'modern market', label: 'Modern Market Area', code: 'MKD-MM' },
  { value: 'north bank', label: 'North Bank', code: 'MKD-NB' },
  { value: 'uam', label: 'UAM Area', code: 'MKD-UA' },
  { value: 'wadata', label: 'Wadata', code: 'MKD-WD' },
  { value: 'wurukum', label: 'Wurukum (Central)', code: 'MKD-WK' },
];

// ============== API CLASS ==============

class BenueDeliveryApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/delivery-v2`;
  }

  /**
   * Get delivery quote for cart
   */
  async getDeliveryQuote(request: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/delivery-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          requested_at: request.requested_at || new Date().toISOString(),
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting delivery quote:', error);
      // Return fallback response
      return this.getFallbackQuote(request);
    }
  }

  /**
   * Get all delivery zones
   */
  async getZones(includeSuspended: boolean = false): Promise<{ success: boolean; zones: BenueZone[]; count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/zones?include_suspended=${includeSuspended}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting zones:', error);
      return { success: false, zones: [], count: 0 };
    }
  }

  /**
   * Geocode address to coordinates
   */
  geocodeAddress(address: string, city: string, state?: string): { lat: number; lng: number; code: string; name: string } | null {
    const normalizedAddress = address.toLowerCase().trim();
    const normalizedCity = city.toLowerCase().trim();
    const normalizedState = state?.toLowerCase().trim();

    // Only support Benue State
    if (normalizedState && normalizedState !== 'benue') {
      return null;
    }

    // First try exact city/LGA match
    if (BENUE_LGAS[normalizedCity]) {
      return BENUE_LGAS[normalizedCity];
    }

    // Try to find matching area in address
    for (const [areaName, coords] of Object.entries(BENUE_LGAS)) {
      if (normalizedAddress.includes(areaName) || normalizedCity.includes(areaName)) {
        return coords;
      }
    }

    // Default to Makurdi if in Benue but location not found
    if (normalizedState === 'benue' || normalizedCity.includes('benue')) {
      return BENUE_LGAS['makurdi'];
    }

    return null;
  }

  /**
   * Get fallback quote when API is unavailable
   */
  getFallbackQuote(request: DeliveryQuoteRequest): DeliveryQuoteResponse {
    const subtotal = request.subtotal_ngn;
    const isFreeShipping = subtotal > 50000;
    const baseFee = isFreeShipping ? 0 : 2500;

    return {
      cart_id: request.cart_id,
      currency: 'NGN',
      effective_weight_kg: 0,
      distance_km: 0,
      delivery_options: [
        {
          id: request.delivery_type,
          label: `${request.delivery_type.charAt(0).toUpperCase() + request.delivery_type.slice(1).replace('_', ' ')} Delivery`,
          price_ngn: baseFee,
          price_breakdown: [
            { name: isFreeShipping ? 'Free Shipping (Order > ₦50,000)' : 'Flat Rate', amount: baseFee }
          ],
          estimated_eta_minutes: { min: 45, max: 90 },
          eta_friendly: '45-90 mins',
          applied_rules: ['frontend_fallback'],
          tags: isFreeShipping ? ['free_shipping'] : [],
          is_available: true
        }
      ],
      grand_total_ngn: baseFee,
      _fallback: true
    };
  }

  /**
   * Calculate fallback fee (for offline calculation)
   */
  calculateFallbackFee(
    deliveryZone: string,
    packageValue: number,
    deliveryType: 'standard' | 'express' | 'same_day' | 'scheduled' = 'standard'
  ): number {
    // Base fees by zone type
    const isMakurdiZone = deliveryZone.startsWith('MKD-');
    let baseFee = isMakurdiZone ? 350 : 500;

    // Delivery type multiplier
    const multipliers: Record<string, number> = isMakurdiZone
      ? { standard: 1.0, express: 1.3, same_day: 1.5, scheduled: 1.0 }
      : { standard: 1.0, express: 1.5, same_day: 2.0, scheduled: 1.0 };

    baseFee *= multipliers[deliveryType] || 1.0;

    // Insurance for high-value items
    if (packageValue > 50000) {
      baseFee += packageValue * 0.01;
    }

    // Free shipping threshold
    if (packageValue > 50000) {
      return 0;
    }

    return Math.round(baseFee);
  }

  /**
   * Check if location is within Benue coverage
   */
  isWithinCoverage(lat: number, lng: number): boolean {
    // Benue State approximate boundaries
    const bounds = {
      north: 8.0,
      south: 6.5,
      east: 10.0,
      west: 7.5
    };

    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    );
  }
}

export const benueDeliveryApi = new BenueDeliveryApi();
export default benueDeliveryApi;
