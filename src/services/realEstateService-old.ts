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
  PropertyStatus
} from '@/features/realtor/types';

export class RealEstateService {
  // Real Estate Professional Management
  static async registerProfessional(userId: string, data: RealtorRegistrationData): Promise<RealEstateProfessional> {
    const { data: professional, error } = await supabase
      .from('real_estate_professionals')
      .insert([
        {
          user_id: userId,
          professional_type: data.professionalType,
          license_number: data.licenseNumber,
          agency_name: data.agencyName,
          agency_address: data.agencyAddress,
          specializations: data.specializations,
          years_experience: data.yearsExperience,
          rating: 0,
          review_count: 0,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Upload documents if provided
    if (data.documents && data.documents.length > 0) {
      await this.uploadProfessionalDocuments(professional.id, data.documents);
    }

    return professional;
  }

  static async getProfessionalByUserId(userId: string): Promise<RealEstateProfessional | null> {
    const { data, error } = await supabase
      .from('real_estate_professionals')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  static async updateProfessional(professionalId: string, updates: Partial<RealEstateProfessional>): Promise<RealEstateProfessional> {
    const { data, error } = await supabase
      .from('real_estate_professionals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', professionalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadProfessionalDocuments(professionalId: string, documents: File[]): Promise<string[]> {
    const uploadPromises = documents.map(async (file) => {
      const fileName = `${professionalId}/${Date.now()}_${file.name}`;
      // Mock implementation - would use Prisma/cloud storage
      console.log(`Uploading professional document: ${fileName}`);
      return `/uploads/${fileName}`;
    });

    return Promise.all(uploadPromises);
  }

  // Property Management
  static async createProperty(professionalId: string, data: PropertyFormData): Promise<Property> {
    const { data: property, error } = await supabase
      .from('properties')
      .insert([
        {
          professional_id: professionalId,
          title: data.title,
          description: data.description,
          property_type: data.propertyType,
          listing_type: data.listingType,
          price: data.price,
          currency: data.currency,
          address: data.address,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          square_footage: data.squareFootage,
          lot_size: data.lotSize,
          year_built: data.yearBuilt,
          parking_spaces: data.parkingSpaces,
          furnishing_status: data.furnishingStatus,
          features: data.features,
          amenities: data.amenities,
          virtual_tour_url: data.virtualTourUrl,
          status: 'active',
          is_active: true,
          view_count: 0,
          favorite_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Upload property images
    if (data.images && data.images.length > 0) {
      await this.uploadPropertyImages(property.id, data.images);
    }

    return property;
  }

  static async getProperties(filters?: PropertySearchFilters): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select(`
        *,
        professional:real_estate_professionals (
          id,
          professional_type,
          agency_name,
          rating,
          review_count,
          is_verified,
          user:users (
            first_name,
            last_name,
            email,
            phone,
            avatar
          )
        ),
        images:property_images (
          id,
          image_url,
          image_alt,
          sort_order,
          is_primary
        )
      `)
      .eq('is_active', true);

    if (filters) {
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
        query = query.eq('bedrooms', filters.bedrooms);
      }
      if (filters.bathrooms) {
        query = query.eq('bathrooms', filters.bathrooms);
      }
      if (filters.squareFootageMin) {
        query = query.gte('square_footage', filters.squareFootageMin);
      }
      if (filters.squareFootageMax) {
        query = query.lte('square_footage', filters.squareFootageMax);
      }
      if (filters.location) {
        query = query.or(`address->>city.ilike.%${filters.location}%,address->>state.ilike.%${filters.location}%`);
      }
      if (filters.features && filters.features.length > 0) {
        query = query.contains('features', filters.features);
      }
    }

    // Apply sorting
    if (filters?.sortBy) {
      const sortOrder = filters.sortOrder || 'desc';
      switch (filters.sortBy) {
        case 'price':
          query = query.order('price', { ascending: sortOrder === 'asc' });
          break;
        case 'date':
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
          break;
        case 'size':
          query = query.order('square_footage', { ascending: sortOrder === 'asc' });
          break;
        case 'popularity':
          query = query.order('view_count', { ascending: sortOrder === 'asc' });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getPropertyById(propertyId: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        professional:real_estate_professionals (
          id,
          professional_type,
          agency_name,
          rating,
          review_count,
          is_verified,
          user:users (
            first_name,
            last_name,
            email,
            phone,
            avatar
          )
        ),
        images:property_images (
          id,
          image_url,
          image_alt,
          sort_order,
          is_primary
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Increment view count
    await supabase
      .from('properties')
      .update({ view_count: data.view_count + 1 })
      .eq('id', propertyId);

    return data;
  }

  static async getPropertiesByProfessional(professionalId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        images:property_images (
          id,
          image_url,
          image_alt,
          sort_order,
          is_primary
        )
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProperty(propertyId: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
  }

  static async uploadPropertyImages(propertyId: string, images: File[]): Promise<PropertyImage[]> {
    const uploadPromises = images.map(async (file, index) => {
      const fileName = `${propertyId}/${Date.now()}_${file.name}`;
      // Mock implementation - would use Prisma/cloud storage
      console.log(`Uploading property image: ${fileName}`);

      // Save image record to database
      const { data: imageRecord, error: insertError } = await supabase
        .from('property_images')
        .insert([
          {
            property_id: propertyId,
            image_url: publicUrl.publicUrl,
            image_alt: file.name,
            sort_order: index,
            is_primary: index === 0,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      return imageRecord;
    });

    return Promise.all(uploadPromises);
  }

  // Property Viewing Management
  static async scheduleViewing(data: Omit<PropertyViewing, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyViewing> {
    const { data: viewing, error } = await supabase
      .from('property_viewings')
      .insert([
        {
          ...data,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  static async getViewingsByProperty(propertyId: string): Promise<PropertyViewing[]> {
    const { data, error } = await supabase
      .from('property_viewings')
      .select(`
        *,
        property:properties (
          id,
          title,
          address
        ),
        requester:users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('property_id', propertyId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getViewingsByProfessional(professionalId: string): Promise<PropertyViewing[]> {
    const { data, error } = await supabase
      .from('property_viewings')
      .select(`
        *,
        property:properties (
          id,
          title,
          address
        ),
        requester:users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('professional_id', professionalId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updateViewingStatus(viewingId: string, status: PropertyViewing['status'], notes?: string): Promise<PropertyViewing> {
    const { data, error } = await supabase
      .from('property_viewings')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', viewingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Property Inquiry Management
  static async createInquiry(data: Omit<PropertyInquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyInquiry> {
    const { data: inquiry, error } = await supabase
      .from('property_inquiries')
      .insert([
        {
          ...data,
          status: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return inquiry;
  }

  static async getInquiriesByProperty(propertyId: string): Promise<PropertyInquiry[]> {
    const { data, error } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        property:properties (
          id,
          title,
          address
        ),
        inquirer:users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getInquiriesByProfessional(professionalId: string): Promise<PropertyInquiry[]> {
    const { data, error } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        property:properties (
          id,
          title,
          address
        ),
        inquirer:users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async respondToInquiry(inquiryId: string, response: string): Promise<PropertyInquiry> {
    const { data, error } = await supabase
      .from('property_inquiries')
      .update({
        response,
        status: 'responded',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async markInquiryAsRead(inquiryId: string): Promise<PropertyInquiry> {
    const { data, error } = await supabase
      .from('property_inquiries')
      .update({
        status: 'read',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  static async getProfessionalAnalytics(professionalId: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalInquiries: number;
    scheduledViewings: number;
  }> {
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('view_count, is_active')
      .eq('professional_id', professionalId);

    if (propertiesError) throw propertiesError;

    const { count: totalInquiries, error: inquiriesError } = await supabase
      .from('property_inquiries')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId);

    if (inquiriesError) throw inquiriesError;

    const { count: scheduledViewings, error: viewingsError } = await supabase
      .from('property_viewings')
      .select('*', { count: 'exact' })
      .eq('professional_id', professionalId)
      .eq('status', 'scheduled');

    if (viewingsError) throw viewingsError;

    const totalProperties = properties?.length || 0;
    const activeProperties = properties?.filter(p => p.is_active).length || 0;
    const totalViews = properties?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

    return {
      totalProperties,
      activeProperties,
      totalViews,
      totalInquiries: totalInquiries || 0,
      scheduledViewings: scheduledViewings || 0,
    };
  }
}
