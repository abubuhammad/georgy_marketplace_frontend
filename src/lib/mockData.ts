// Mock data generator for development and testing
export const generateMockData = {
  artisan: () => ({
    id: `artisan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Date.now()}`,
    businessName: 'Sample Artisan Business',
    description: 'Professional services provider',
    categories: ['plumbing', 'electrical'],
    skills: ['Installation', 'Repair', 'Maintenance'],
    experience: 5,
    hourlyRate: 5000,
    location: { lat: 6.5244, lng: 3.3792 }, // Lagos coordinates
    serviceArea: 10,
    workingHours: { start: '08:00', end: '18:00' },
    isActive: true,
    rating: 4.5,
    reviewCount: 25,
    completedJobs: 50,
    responseTime: 30,
    isVerified: true,
    joinedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  serviceRequest: () => ({
    id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerId: `customer_${Date.now()}`,
    title: 'Sample Service Request',
    description: 'Need help with home repair',
    category: 'plumbing',
    urgency: 'medium' as const,
    budget: { min: 10000, max: 50000 },
    location: { lat: 6.5244, lng: 3.3792 },
    address: 'Lagos, Nigeria',
    images: [],
    preferredSchedule: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeSlots: ['morning', 'afternoon']
    },
    status: 'open' as const,
    quotesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  serviceQuote: () => ({
    id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    requestId: `request_${Date.now()}`,
    artisanId: `artisan_${Date.now()}`,
    amount: 25000,
    description: 'Professional service quote',
    estimatedDuration: '2-3 hours',
    materials: ['Pipes', 'Fittings'],
    timeline: 'Available this week',
    status: 'pending' as const,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  serviceCategory: () => ({
    id: `category_${Date.now()}`,
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Plumbing and water system services',
    icon: '🔧',
    isActive: true,
    createdAt: new Date().toISOString()
  }),

  job: () => ({
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Sample Job Posting',
    description: 'Looking for qualified candidate',
    company: 'Sample Company',
    location: 'Lagos, Nigeria',
    type: 'full-time' as const,
    category: 'technology',
    salary: { min: 100000, max: 200000 },
    requirements: ['Experience required'],
    benefits: ['Health insurance'],
    isActive: true,
    employerId: `employer_${Date.now()}`,
    applicationsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }),

  property: () => ({
    id: `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Beautiful Property',
    description: 'Spacious and well-located property',
    type: 'apartment' as const,
    listingType: 'sale' as const,
    price: 5000000,
    location: {
      address: 'Lagos, Nigeria',
      lat: 6.5244,
      lng: 3.3792,
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria'
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      parking: true,
      furnished: false
    },
    images: [],
    amenities: ['Swimming Pool', 'Gym'],
    isActive: true,
    agentId: `agent_${Date.now()}`,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
};

// Mock storage for development
export const mockStorage = {
  artisans: [] as any[],
  serviceRequests: [] as any[],
  serviceQuotes: [] as any[],
  jobs: [] as any[],
  properties: [] as any[],
  products: [] as any[],
  employers: [] as any[],
  employees: [] as any[],
  applications: [] as any[],
  realEstateProfessionals: [] as any[],
  propertyViewings: [] as any[],
  propertyInquiries: [] as any[],
  
  // Initialize with sample data
  init() {
    if (this.artisans.length === 0) {
      // Add sample artisans
      for (let i = 0; i < 5; i++) {
        this.artisans.push(generateMockData.artisan());
      }
    }
    
    if (this.serviceRequests.length === 0) {
      // Add sample service requests
      for (let i = 0; i < 3; i++) {
        this.serviceRequests.push(generateMockData.serviceRequest());
      }
    }
    
    if (this.jobs.length === 0) {
      // Add sample jobs
      for (let i = 0; i < 5; i++) {
        this.jobs.push(generateMockData.job());
      }
    }
    
    if (this.properties.length === 0) {
      // Add detailed 4-bedroom house sample
      this.properties.push({
        id: 'prop_001',
        title: '4-Bedroom Detached House in GRA, Port Harcourt',
        description: 'Luxurious 4-bedroom detached house located in the prestigious Government Reserved Area (GRA) of Port Harcourt. This stunning property features modern architectural design with premium finishes, spacious rooms, and beautiful landscaping. Perfect for families seeking comfort, security, and prestige in one of Port Harcourt\'s most sought-after neighborhoods.',
        type: 'house' as const,
        listingType: 'sale' as const,
        price: 85000000,
        location: {
          address: 'No. 15 Golf Course Road, GRA Phase 2, Port Harcourt',
          lat: 4.8156,
          lng: 7.0498,
          city: 'Port Harcourt',
          state: 'Rivers',
          country: 'Nigeria'
        },
        features: {
          bedrooms: 4,
          bathrooms: 5,
          area: 450,
          parking: true,
          furnished: false
        },
        propertyDetails: {
          propertyType: 'Detached House',
          landSize: '800 sqm',
          builtUpSize: '450 sqm',
          condition: 'Newly Built',
          furnishing: 'Unfurnished',
          utilities: 'Electricity, Water, Gas, Internet Ready'
        },
        images: [
          { id: 'img1', imageUrl: '/api/placeholder/600/400', isPrimary: true, caption: 'Front view' },
          { id: 'img2', imageUrl: '/api/placeholder/600/400', isPrimary: false, caption: 'Living room' },
          { id: 'img3', imageUrl: '/api/placeholder/600/400', isPrimary: false, caption: 'Master bedroom' },
          { id: 'img4', imageUrl: '/api/placeholder/600/400', isPrimary: false, caption: 'Kitchen' }
        ],
        amenities: [
          'Swimming Pool', 'Generator House', 'Fitted Kitchen', 'Walk-in Closet',
          'Study Room', 'Gym Room', 'Guest Toilet', 'Laundry Room',
          'Parking Space', 'Security House', 'Beautiful Garden', 'CCTV',
          'Interlocking Compound', 'Water Heater', 'Air Conditioning',
          'Solar Panel Ready'
        ],
        isActive: true,
        agentId: 'agent_001',
        ownerId: 'owner_001',
        professional: {
          id: 'agent_001',
          name: 'Premium Properties Ltd',
          phone: '+234-803-123-4567',
          email: 'info@premiumproperties.ng',
          agencyName: 'Premium Properties Ltd',
          isVerified: true
        },
        viewCount: 245,
        squareFootage: 4844, // 450 sqm converted to sqft
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Add other sample properties
      for (let i = 0; i < 4; i++) {
        this.properties.push(generateMockData.property());
      }
    }
  }
};

// Initialize mock data
mockStorage.init();

export default { generateMockData, mockStorage };
