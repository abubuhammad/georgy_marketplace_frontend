import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { 
  RealEstateProfessional, 
  Property, 
  PropertyViewing, 
  PropertyInquiry, 
  RealtorRegistrationData, 
  PropertyFormData, 
  PropertySearchFilters,
  PropertyImage,
  PropertyDashboard,
  ViewingCalendar,
  OpenHouse,
  MarketingCampaign,
  PropertyComparison,
  PropertyReport,
  BuyerQualification,
  VerificationStatus,
  ViewingStatus,
  PropertyStatus,
  BusinessHours,
  ContactPreferences,
  SocialMedia,
  LocationFeatures,
  PropertyTaxes,
  HOAInformation,
  UtilityCosts,
  ViewingFeedback,
  InquiryResponse,
  DashboardActivity,
  PerformanceMetrics,
  MarketInsights
} from '@/features/realtor/types';

/**
 * Enhanced Real Estate Service - Phase 2 Implementation
 * Comprehensive real estate management with all required features
 */
class RealEstateServiceEnhanced {
  
  // ================================
  // PROFESSIONAL MANAGEMENT
  // ================================
  
  /**
   * Register a new real estate professional
   */
  async registerProfessional(userId: string, data: RealtorRegistrationData): Promise<RealEstateProfessional> {
    try {
      const professional = {
        user_id: userId,
        professional_type: data.professionalType,
        license_number: data.licenseNumber,
        license_state: data.licenseNumber ? 'Lagos' : undefined, // Default to Lagos for Nigeria
        verification_status: 'pending' as VerificationStatus,
        agency_name: data.agencyName,
        agency_address: data.agencyAddress,
        specializations: data.specializations,
        serving_areas: [],
        languages: ['English'],
        years_experience: data.yearsExperience,
        rating: 0,
        review_count: 0,
        total_sales: 0,
        total_listings: 0,
        is_verified: false,
        is_active: true,
        accepting_new_clients: true,
        profile_completeness: this.calculateProfileCompleteness(data),
        contact_preferences: this.getDefaultContactPreferences(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfessional, error } = await supabase
        .from('real_estate_professionals')
        .insert([professional])
        .select()
        .single();

      if (error) throw error;

      // Upload verification documents if provided
      if (data.documents && data.documents.length > 0) {
        await this.uploadVerificationDocuments(newProfessional.id, data.documents);
      }

      return newProfessional;
    } catch (error) {
      console.error('Error registering professional:', error);
      throw error;
    }
  }

  /**
   * Update professional verification status
   */
  async updateVerificationStatus(
    professionalId: string, 
    status: VerificationStatus, 
    rejectionReason?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        verification_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'verified') {
        updateData.is_verified = true;
        updateData.verified_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('real_estate_professionals')
        .update(updateData)
        .eq('id', professionalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  /**
   * Get professional profile with full details
   */
  async getProfessionalProfile(professionalId: string): Promise<RealEstateProfessional | null> {
    try {
      const { data, error } = await supabase
        .from('real_estate_professionals')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('id', professionalId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching professional profile:', error);
      return null;
    }
  }

  /**
   * Update professional profile
   */
  async updateProfessionalProfile(
    professionalId: string, 
    updates: Partial<RealEstateProfessional>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('real_estate_professionals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', professionalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating professional profile:', error);
      throw error;
    }
  }

  /**
   * Get professionals by type with filtering
   */
  async getProfessionalsByType(
    type: string,
    filters?: {
      location?: string;
      specialization?: string;
      verified?: boolean;
      limit?: number;
    }
  ): Promise<RealEstateProfessional[]> {
    try {
      let query = supabase
        .from('real_estate_professionals')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('professional_type', type)
        .eq('is_active', true);

      if (filters?.verified) {
        query = query.eq('is_verified', true);
      }

      if (filters?.specialization) {
        query = query.contains('specializations', [filters.specialization]);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching professionals by type:', error);
      return [];
    }
  }

  // ================================
  // PROPERTY MANAGEMENT
  // ================================

  /**
   * Create a new property listing
   */
  async createProperty(professionalId: string, propertyData: PropertyFormData): Promise<Property> {
    try {
      // Generate unique listing ID
      const listingId = `PROP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const property = {
        listing_id: listingId,
        professional_id: professionalId,
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.propertyType,
        listing_type: propertyData.listingType,
        price: propertyData.price,
        currency: propertyData.currency,
        negotiable: true,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        square_footage: propertyData.squareFootage,
        lot_size: propertyData.lotSize,
        year_built: propertyData.yearBuilt,
        parking_spaces: propertyData.parkingSpaces,
        condition: 'good',
        furnishing_status: propertyData.furnishingStatus || 'unfurnished',
        occupancy_status: 'vacant',
        features: propertyData.features,
        amenities: propertyData.amenities,
        appliances: [],
        utilities: [],
        virtual_tour_url: propertyData.virtualTourUrl,
        address: propertyData.address,
        location_features: this.getDefaultLocationFeatures(),
        status: 'active' as PropertyStatus,
        is_active: true,
        is_featured: false,
        days_on_market: 0,
        view_count: 0,
        inquiry_count: 0,
        viewing_count: 0,
        favorite_count: 0,
        share_count: 0,
        keywords: this.extractKeywords(propertyData),
        target_audience: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString()
      };

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single();

      if (error) throw error;

      // Upload property images
      if (propertyData.images && propertyData.images.length > 0) {
        await this.uploadPropertyImages(newProperty.id, propertyData.images);
      }

      return newProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update property listing
   */
  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_modified_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Get properties by professional with filters
   */
  async getPropertiesByProfessional(
    professionalId: string,
    filters?: {
      status?: PropertyStatus;
      listingType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*),
          professional:real_estate_professionals(*)
        `)
        .eq('professional_id', professionalId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching properties by professional:', error);
      return [];
    }
  }

  /**
   * Search properties with advanced filters
   */
  async searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*),
          professional:real_estate_professionals(*)
        `)
        .eq('is_active', true)
        .eq('status', 'active');

      // Apply filters
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }

      if (filters.priceMin) {
        query = query.gte('price', filters.priceMin);
      }

      if (filters.priceMax) {
        query = query.lte('price', filters.priceMax);
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      if (filters.location) {
        query = query.or(`address->city.ilike.%${filters.location}%,address->state.ilike.%${filters.location}%`);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'date';
      const sortOrder = filters.sortOrder || 'desc';
      
      switch (sortBy) {
        case 'price':
          query = query.order('price', { ascending: sortOrder === 'asc' });
          break;
        case 'size':
          query = query.order('square_footage', { ascending: sortOrder === 'asc' });
          break;
        case 'popularity':
          query = query.order('view_count', { ascending: sortOrder === 'asc' });
          break;
        default:
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }

  /**
   * Get property details with full information
   */
  async getPropertyDetails(propertyId: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*),
          videos:property_videos(*),
          documents:property_documents(*),
          professional:real_estate_professionals(*),
          viewings:property_viewings(*),
          inquiries:property_inquiries(*)
        `)
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      // Increment view count
      await this.incrementPropertyViewCount(propertyId);

      return data;
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }

  // ================================
  // VIEWING MANAGEMENT
  // ================================

  /**
   * Schedule a property viewing
   */
  async scheduleViewing(viewingData: Partial<PropertyViewing>): Promise<PropertyViewing> {
    try {
      const viewing = {
        ...viewingData,
        status: 'scheduled' as ViewingStatus,
        confirmation_required: true,
        reminders_sent: 0,
        viewing_type: 'private',
        attendee_count: 1,
        follow_up_required: true,
        follow_up_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newViewing, error } = await supabase
        .from('property_viewings')
        .insert([viewing])
        .select()
        .single();

      if (error) throw error;

      // Send notification to professional
      await this.notifyProfessionalNewViewing(newViewing);

      return newViewing;
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      throw error;
    }
  }

  /**
   * Update viewing status
   */
  async updateViewingStatus(
    viewingId: string, 
    status: ViewingStatus, 
    feedback?: ViewingFeedback
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        if (feedback) {
          updateData.feedback = feedback;
        }
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('property_viewings')
        .update(updateData)
        .eq('id', viewingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating viewing status:', error);
      throw error;
    }
  }

  /**
   * Get viewing calendar for professional
   */
  async getViewingCalendar(professionalId: string, date: string): Promise<ViewingCalendar> {
    try {
      const { data: viewings, error } = await supabase
        .from('property_viewings')
        .select(`
          *,
          property:properties(*),
          requester:profiles(*)
        `)
        .eq('professional_id', professionalId)
        .gte('scheduled_at', `${date}T00:00:00`)
        .lt('scheduled_at', `${date}T23:59:59`)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      return {
        professionalId,
        date,
        availability: this.generateTimeSlots(date),
        scheduledViewings: viewings || [],
        blockedTimes: []
      };
    } catch (error) {
      console.error('Error fetching viewing calendar:', error);
      return {
        professionalId,
        date,
        availability: [],
        scheduledViewings: [],
        blockedTimes: []
      };
    }
  }

  // ================================
  // INQUIRY MANAGEMENT
  // ================================

  /**
   * Create property inquiry
   */
  async createInquiry(inquiryData: Partial<PropertyInquiry>): Promise<PropertyInquiry> {
    try {
      const inquiry = {
        ...inquiryData,
        inquiry_type: inquiryData.inquiryType || 'general',
        priority: 'medium',
        status: 'new',
        responses: [],
        is_qualified_lead: false,
        lead_score: 0,
        follow_up_required: true,
        follow_up_count: 0,
        source: 'website',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newInquiry, error } = await supabase
        .from('property_inquiries')
        .insert([inquiry])
        .select()
        .single();

      if (error) throw error;

      // Notify professional of new inquiry
      await this.notifyProfessionalNewInquiry(newInquiry);

      return newInquiry;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw error;
    }
  }

  /**
   * Respond to inquiry
   */
  async respondToInquiry(
    inquiryId: string, 
    response: string, 
    responderId: string
  ): Promise<void> {
    try {
      // Get current inquiry
      const { data: inquiry, error: fetchError } = await supabase
        .from('property_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .single();

      if (fetchError) throw fetchError;

      // Create response
      const inquiryResponse: InquiryResponse = {
        id: `resp_${Date.now()}`,
        inquiryId,
        responderId,
        responderType: 'professional',
        message: response,
        isAutoResponse: false,
        timestamp: new Date().toISOString()
      };

      // Update inquiry with response
      const responses = [...(inquiry.responses || []), inquiryResponse];
      
      const { error } = await supabase
        .from('property_inquiries')
        .update({
          status: 'responded',
          responses,
          first_response_at: inquiry.first_response_at || new Date().toISOString(),
          last_response_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      throw error;
    }
  }

  // ================================
  // DASHBOARD & ANALYTICS
  // ================================

  /**
   * Get professional dashboard data
   */
  async getProfessionalDashboard(professionalId: string): Promise<PropertyDashboard> {
    try {
      const [overviewData, activityData, metricsData] = await Promise.all([
        this.getDashboardOverview(professionalId),
        this.getRecentActivity(professionalId),
        this.getPerformanceMetrics(professionalId)
      ]);

      return {
        professionalId,
        overview: overviewData,
        recentActivity: activityData,
        performanceMetrics: metricsData,
        marketInsights: await this.getMarketInsights(professionalId)
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // ================================
  // HELPER METHODS
  // ================================

  private calculateProfileCompleteness(data: RealtorRegistrationData): number {
    let completeness = 0;
    const fields = [
      data.professionalType,
      data.licenseNumber,
      data.specializations?.length > 0,
      data.yearsExperience > 0,
      data.agencyName,
      data.agencyAddress
    ];

    completeness = (fields.filter(Boolean).length / fields.length) * 100;
    return Math.round(completeness);
  }

  private getDefaultContactPreferences(): ContactPreferences {
    return {
      preferredMethod: 'email',
      phoneCallsAllowed: true,
      textMessagesAllowed: true,
      emailAllowed: true,
      maxResponseTime: 24
    };
  }

  private getDefaultLocationFeatures(): LocationFeatures {
    return {
      schools: [],
      hospitals: [],
      shopping: [],
      restaurants: [],
      parks: [],
      transportation: []
    };
  }

  private extractKeywords(propertyData: PropertyFormData): string[] {
    const keywords = [];
    
    keywords.push(propertyData.propertyType);
    keywords.push(propertyData.listingType);
    keywords.push(propertyData.address.city);
    keywords.push(propertyData.address.state);
    
    if (propertyData.bedrooms) {
      keywords.push(`${propertyData.bedrooms} bedroom`);
    }
    
    if (propertyData.bathrooms) {
      keywords.push(`${propertyData.bathrooms} bathroom`);
    }

    keywords.push(...propertyData.features);
    keywords.push(...propertyData.amenities);

    return keywords;
  }

  private generateTimeSlots(date: string): any[] {
    // Generate 30-minute time slots from 9 AM to 6 PM
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : minute + 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          startTime,
          endTime,
          isAvailable: true
        });
      }
    }
    return slots;
  }

  private async uploadVerificationDocuments(professionalId: string, documents: File[]): Promise<void> {
    // Implementation for document upload
    console.log(`Uploading ${documents.length} documents for professional ${professionalId}`);
  }

  private async uploadPropertyImages(propertyId: string, images: File[]): Promise<void> {
    // Implementation for image upload
    console.log(`Uploading ${images.length} images for property ${propertyId}`);
  }

  private async incrementPropertyViewCount(propertyId: string): Promise<void> {
    // Mock implementation - increment view count
    console.log(`Incrementing view count for property: ${propertyId}`);
  }

  private async notifyProfessionalNewViewing(viewing: PropertyViewing): Promise<void> {
    // Implementation for notification
    console.log(`Notifying professional of new viewing: ${viewing.id}`);
  }

  private async notifyProfessionalNewInquiry(inquiry: PropertyInquiry): Promise<void> {
    // Implementation for notification
    console.log(`Notifying professional of new inquiry: ${inquiry.id}`);
  }

  private async getDashboardOverview(professionalId: string): Promise<any> {
    const { data: overview } = await supabase
      .from('properties')
      .select('status, view_count, inquiry_count, viewing_count')
      .eq('professional_id', professionalId);

    return {
      totalListings: overview?.length || 0,
      activeListings: overview?.filter(p => p.status === 'active').length || 0,
      pendingListings: overview?.filter(p => p.status === 'pending').length || 0,
      soldListings: overview?.filter(p => p.status === 'sold').length || 0,
      totalViews: overview?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0,
      totalInquiries: overview?.reduce((sum, p) => sum + (p.inquiry_count || 0), 0) || 0,
      totalViewings: overview?.reduce((sum, p) => sum + (p.viewing_count || 0), 0) || 0,
      avgDaysOnMarket: 30
    };
  }

  private async getRecentActivity(professionalId: string): Promise<DashboardActivity[]> {
    // Mock implementation - would fetch real activity data
    return [];
  }

  private async getPerformanceMetrics(professionalId: string): Promise<PerformanceMetrics> {
    // Mock implementation - would calculate real metrics
    return {
      thisMonth: { listings: 5, views: 150, inquiries: 12, viewings: 8, closedDeals: 2 },
      lastMonth: { listings: 4, views: 120, inquiries: 10, viewings: 6, closedDeals: 1 },
      trends: { listingsChange: 25, viewsChange: 25, inquiriesChange: 20, viewingsChange: 33, closedDealsChange: 100 }
    };
  }

  private async getMarketInsights(professionalId: string): Promise<MarketInsights> {
    // Mock implementation - would fetch real market data
    return {
      averagePriceInArea: 5000000,
      medianDaysOnMarket: 45,
      marketTrend: 'rising',
      competitorCount: 15,
      demandLevel: 'high',
      suggestions: [
        'Consider pricing your properties 5% below market average for faster sales',
        'Add virtual tours to increase viewing requests by 40%',
        'Properties with professional photography sell 32% faster'
      ]
    };
  }
}

export default new RealEstateServiceEnhanced();
